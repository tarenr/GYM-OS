import crypto from 'node:crypto';
import { getDatabase, withTransaction } from './client.js';

// Núcleo compartilhado pelos adaptadores em ./adapters/*.js. Implementa só o
// subconjunto do "contrato" Mongoose que o código do GYM-OS realmente usa
// (levantado em docs/plano-migracao-sqlite-fase1.md). Qualquer operação fora
// desse conjunto lança UnsupportedQueryError em vez de falhar silenciosamente
// ou devolver um resultado errado.

export class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class UnsupportedQueryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedQueryError';
  }
}

export function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function nowIso() {
  return new Date().toISOString();
}

function serializeValue(value, columnDef) {
  if (value === undefined || value === null) {
    return null;
  }

  switch (columnDef.type) {
    case 'json':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 1 : 0;
    case 'date':
      return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
    default:
      return value;
  }
}

function deserializeValue(raw, columnDef) {
  if (raw === null || raw === undefined) {
    return columnDef.type === 'json' ? undefined : null;
  }

  switch (columnDef.type) {
    case 'json':
      return JSON.parse(raw);
    case 'boolean':
      return Boolean(raw);
    case 'date':
      return new Date(raw);
    default:
      return raw;
  }
}

// Regex no formato exato usado no código real (ex.: fix-single-dumbbell-load-modes.js):
// new RegExp(`^${escaped}$`, 'i') — match exato, case-insensitive, de um literal.
// Qualquer outro padrão de regex é rejeitado explicitamente (não tentamos
// interpretar regex arbitrária em SQL).
function extractExactLiteralFromRegex(regex) {
  if (!(regex instanceof RegExp)) {
    return null;
  }

  const match = regex.source.match(/^\^(.*)\$$/);

  if (!match || !regex.flags.includes('i')) {
    return null;
  }

  const literal = match[1].replace(/\\(.)/g, '$1');

  return literal;
}

function rowToDocument(row, config) {
  const doc = { _id: row.id, id: row.id };

  for (const [jsField, columnDef] of Object.entries(config.columns)) {
    doc[jsField] = deserializeValue(row[columnDef.column], columnDef);
  }

  if (config.timestamps) {
    doc.createdAt = new Date(row.created_at);
    doc.updatedAt = new Date(row.updated_at);
  }

  return doc;
}

function applyProjection(doc, projection) {
  if (!projection) {
    return doc;
  }

  const keys = Object.keys(projection).filter((key) => !key.endsWith('.$'));
  const result = { _id: doc._id, id: doc.id };

  for (const key of keys) {
    result[key] = doc[key];
  }

  return result;
}

function buildFieldCondition(column, columnDef, value, params) {
  if (value instanceof RegExp) {
    const literal = extractExactLiteralFromRegex(value);

    if (literal === null) {
      throw new UnsupportedQueryError(`Regex not supported for column "${column}": ${value}`);
    }

    params.push(literal);

    return `${column} COLLATE NOCASE = ?`;
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const clauses = [];

    for (const [op, operand] of Object.entries(value)) {
      if (op === '$gte') {
        params.push(serializeValue(operand, columnDef));
        clauses.push(`${column} >= ?`);
      } else if (op === '$gt') {
        params.push(serializeValue(operand, columnDef));
        clauses.push(`${column} > ?`);
      } else if (op === '$lte') {
        params.push(serializeValue(operand, columnDef));
        clauses.push(`${column} <= ?`);
      } else if (op === '$lt') {
        params.push(serializeValue(operand, columnDef));
        clauses.push(`${column} < ?`);
      } else if (op === '$exists') {
        clauses.push(operand ? `${column} IS NOT NULL` : `${column} IS NULL`);
      } else if (op === '$in') {
        clauses.push(buildInCondition(column, operand, params));
      } else {
        throw new UnsupportedQueryError(`Operator "${op}" not supported for column "${column}".`);
      }
    }

    return clauses.join(' AND ');
  }

  params.push(serializeValue(value, columnDef));

  return `${column} = ?`;
}

function buildInCondition(column, values, params) {
  const literals = [];
  const plain = [];

  for (const item of values) {
    const literal = extractExactLiteralFromRegex(item);

    if (literal !== null) {
      literals.push(literal);
    } else if (item instanceof RegExp) {
      throw new UnsupportedQueryError(`Regex not supported inside $in for column "${column}": ${item}`);
    } else {
      plain.push(item);
    }
  }

  if (literals.length > 0) {
    const all = [...plain, ...literals];

    params.push(...all);

    return `${column} COLLATE NOCASE IN (${all.map(() => '?').join(', ')})`;
  }

  params.push(...plain);

  return `${column} IN (${plain.map(() => '?').join(', ')})`;
}

// Retorna { sql, params, jsonPredicates } onde jsonPredicates é uma lista de
// { arrayField, matches(item) } usada pra projeção posicional ('arrayField.$': 1)
// re-aplicada em JS sobre as linhas já filtradas pelo SQL.
function translateFilter(filter, config, tableAlias = 't') {
  const params = [];
  const jsonPredicates = [];

  function walk(node) {
    const clauses = [];

    for (const [key, value] of Object.entries(node || {})) {
      if (key === '$or') {
        const subClauses = value.map((sub) => `(${walk(sub)})`);

        clauses.push(`(${subClauses.join(' OR ')})`);
        continue;
      }

      if (key === 'id' || key === '_id') {
        clauses.push(buildFieldCondition(`${tableAlias}.id`, { type: 'text' }, value, params));
        continue;
      }

      if (key.includes('.')) {
        const [arrayField, subField] = key.split('.');
        const columnDef = config.columns[arrayField];

        if (!columnDef || columnDef.type !== 'json' || !config.jsonArrayFields?.includes(arrayField)) {
          throw new UnsupportedQueryError(`Dot-path filter not supported for "${key}".`);
        }

        const jeParams = [];
        const cond = buildFieldCondition(
          `json_extract(je.value, '$.${subField}')`,
          { type: 'text' },
          value,
          jeParams
        );

        params.push(...jeParams);
        clauses.push(
          `EXISTS (SELECT 1 FROM json_each(${tableAlias}.${columnDef.column}) AS je WHERE ${cond})`
        );

        jsonPredicates.push({
          arrayField,
          subField,
          matches: (item) => matchesPredicateValue(item?.[subField], value)
        });
        continue;
      }

      const columnDef = config.columns[key];

      if (!columnDef) {
        throw new UnsupportedQueryError(`Field "${key}" is not mapped in this adapter's config.`);
      }

      clauses.push(buildFieldCondition(`${tableAlias}.${columnDef.column}`, columnDef, value, params));
    }

    return clauses.join(' AND ') || '1=1';
  }

  const sql = walk(filter);

  return { sql, params, jsonPredicates };
}

function matchesPredicateValue(actual, expected) {
  if (expected instanceof RegExp) {
    return expected.test(String(actual ?? ''));
  }

  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    if ('$in' in expected) {
      return expected.$in.some((candidate) => matchesPredicateValue(actual, candidate));
    }

    throw new UnsupportedQueryError('Unsupported operator while re-matching JSON array predicate in JS.');
  }

  return actual === expected || (actual != null && expected != null && String(actual) === String(expected));
}

// Usado só pra semear um documento novo num upsert: pega os campos de
// igualdade simples do filtro (ignora $or, dot-path e operadores como
// $gte/$in, que não definem um valor único).
function extractEqualityFields(filter, config) {
  const fields = {};

  for (const [key, value] of Object.entries(filter || {})) {
    if (key === '$or' || key === 'id' || key === '_id' || key.includes('.')) continue;
    if (value && typeof value === 'object' && !(value instanceof RegExp)) continue;
    if (config.columns[key]) {
      fields[key] = value;
    }
  }

  return fields;
}

function applyDefaultsAndValidate(payload, config, { partial = false } = {}) {
  const errors = [];
  const result = { ...payload };

  for (const [jsField, columnDef] of Object.entries(config.columns)) {
    if (result[jsField] === undefined) {
      if (!partial && columnDef.default !== undefined) {
        result[jsField] = typeof columnDef.default === 'function' ? columnDef.default() : columnDef.default;
      } else if (!partial && columnDef.required) {
        errors.push(`Field "${jsField}" is required.`);
      } else {
        continue;
      }
    }

    if (result[jsField] !== undefined && columnDef.enum && !columnDef.enum.includes(result[jsField])) {
      errors.push(`Field "${jsField}" must be one of: ${columnDef.enum.join(', ')}.`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed.', errors);
  }

  return result;
}

function insertRow(db, config, doc) {
  const columns = ['id'];
  const placeholders = ['?'];
  const values = [doc._id];

  for (const [jsField, columnDef] of Object.entries(config.columns)) {
    columns.push(columnDef.column);
    placeholders.push('?');
    values.push(serializeValue(doc[jsField], columnDef));
  }

  if (config.timestamps) {
    columns.push('created_at', 'updated_at');
    placeholders.push('?', '?');
    values.push(doc.createdAt.toISOString(), doc.updatedAt.toISOString());
  }

  const sql = `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

  db.prepare(sql).run(...values);
}

function resolveSortColumn(jsField, config) {
  if (jsField === 'createdAt') return 'created_at';
  if (jsField === 'updatedAt') return 'updated_at';

  const columnDef = config.columns[jsField];

  return columnDef ? columnDef.column : jsField;
}

function selectRows(config, whereSql, params, { sort, limit } = {}) {
  const db = getDatabase();
  let sql = `SELECT * FROM ${config.table} AS t WHERE ${whereSql}`;

  if (sort) {
    const parts = Object.entries(sort).map(([jsField, direction]) => {
      const column = resolveSortColumn(jsField, config);

      return `${column} ${Number(direction) < 0 ? 'DESC' : 'ASC'}`;
    });

    sql += ` ORDER BY ${parts.join(', ')}`;
  }

  if (limit) {
    sql += ` LIMIT ${Number(limit)}`;
  }

  const rows = db.prepare(sql).all(...params);

  return rows.map((row) => rowToDocument(row, config));
}

function attachInstanceMethods(doc, config) {
  Object.defineProperty(doc, 'save', {
    enumerable: false,
    value: async function save() {
      const db = getDatabase();
      const columns = [];
      const values = [];

      for (const [jsField, columnDef] of Object.entries(config.columns)) {
        columns.push(`${columnDef.column} = ?`);
        values.push(serializeValue(this[jsField], columnDef));
      }

      if (config.timestamps) {
        this.updatedAt = new Date();
        columns.push('updated_at = ?');
        values.push(this.updatedAt.toISOString());
      }

      values.push(this._id);
      db.prepare(`UPDATE ${config.table} SET ${columns.join(', ')} WHERE id = ?`).run(...values);

      return this;
    }
  });

  Object.defineProperty(doc, 'toObject', {
    enumerable: false,
    value: function toObject() {
      const { save, toObject, toJSON, ...plain } = this;

      return { ...plain };
    }
  });

  Object.defineProperty(doc, 'toJSON', {
    enumerable: false,
    value: function toJSON() {
      return this.toObject();
    }
  });

  if (config.virtuals) {
    for (const [name, getter] of Object.entries(config.virtuals)) {
      Object.defineProperty(doc, name, { enumerable: false, get: () => getter(doc) });
    }
  }

  return doc;
}

class Cursor {
  constructor(config, filter, { single = false } = {}) {
    this.config = config;
    this.filter = filter;
    this.single = single;
    this._sort = null;
    this._limit = single ? 1 : null;
    this._lean = false;
    this._projection = null;
  }

  sort(spec) {
    this._sort = spec;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  lean() {
    this._lean = true;
    return this;
  }

  select(spec) {
    if (typeof spec === 'string') {
      this._projection = Object.fromEntries(spec.split(/\s+/).filter(Boolean).map((f) => [f, 1]));
    } else {
      this._projection = spec;
    }

    return this;
  }

  _run() {
    const { sql, params, jsonPredicates } = translateFilter(this.filter, this.config);
    let docs = selectRows(this.config, sql, params, { sort: this._sort, limit: this._limit });

    if (this._projection) {
      const positional = Object.keys(this._projection).find((key) => key.endsWith('.$'));

      docs = docs.map((doc) => {
        const projected = applyProjection(doc, this._projection);

        if (positional) {
          const arrayField = positional.replace('.$', '');
          const predicate = jsonPredicates.find((p) => p.arrayField === arrayField);
          const match = predicate ? (doc[arrayField] || []).find((item) => predicate.matches(item)) : undefined;

          projected[arrayField] = match ? [match] : [];
        }

        return projected;
      });
    }

    if (!this._lean) {
      docs = docs.map((doc) => attachInstanceMethods(doc, this.config));
    }

    return docs;
  }

  then(resolve, reject) {
    try {
      const docs = this._run();

      resolve(this.single ? docs[0] ?? null : docs);
    } catch (error) {
      reject(error);
    }
  }
}

export function createModel(config) {
  return {
    find(filter = {}, projection) {
      const cursor = new Cursor(config, filter);

      if (projection) cursor.select(projection);

      return cursor;
    },

    findOne(filter = {}, projection) {
      const cursor = new Cursor(config, filter, { single: true });

      if (projection) cursor.select(projection);

      return cursor;
    },

    findById(id) {
      return new Cursor(config, { id }, { single: true });
    },

    async create(payload) {
      const withDefaults = applyDefaultsAndValidate(payload, config);
      const doc = {
        _id: generateId(),
        ...withDefaults
      };

      if (config.timestamps) {
        doc.createdAt = new Date();
        doc.updatedAt = new Date();
      }

      const db = getDatabase();

      insertRow(db, config, doc);

      return attachInstanceMethods({ ...doc, id: doc._id }, config);
    },

    async findOneAndUpdate(filter, update, options = {}) {
      return this._updateOne(filter, update, options);
    },

    async findByIdAndUpdate(id, update, options = {}) {
      return this._updateOne({ id }, update, options);
    },

    async _updateOne(filter, update, options = {}) {
      const db = getDatabase();
      const { sql, params } = translateFilter(filter, config);
      const existing = db.prepare(`SELECT * FROM ${config.table} AS t WHERE ${sql} LIMIT 1`).all(...params);

      if (existing.length === 0) {
        if (!options.upsert) {
          return null;
        }

        const seed = extractEqualityFields(filter, config);
        const insertFields = { ...seed, ...(update.$set || {}), ...(update.$setOnInsert || {}) };
        const withDefaults = applyDefaultsAndValidate(insertFields, config);
        const doc = { _id: generateId(), ...withDefaults };

        if (config.timestamps) {
          doc.createdAt = new Date();
          doc.updatedAt = new Date();
        }

        insertRow(db, config, doc);

        return options.new === false ? null : attachInstanceMethods({ ...doc, id: doc._id }, config);
      }

      const previous = rowToDocument(existing[0], config);
      const fields = update.$set ? update.$set : update;
      const merged = { ...previous, ...fields };

      if (options.runValidators) {
        applyDefaultsAndValidate(merged, config, { partial: true });
      }

      const setClauses = [];
      const values = [];

      for (const jsField of Object.keys(fields)) {
        const columnDef = config.columns[jsField];

        if (!columnDef) continue;

        setClauses.push(`${columnDef.column} = ?`);
        values.push(serializeValue(merged[jsField], columnDef));
      }

      if (config.timestamps) {
        merged.updatedAt = new Date();
        setClauses.push('updated_at = ?');
        values.push(merged.updatedAt.toISOString());
      }

      values.push(previous._id);
      db.prepare(`UPDATE ${config.table} SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

      const finalDoc = options.new ? merged : previous;

      return attachInstanceMethods(finalDoc, config);
    },

    async findByIdAndDelete(id) {
      const db = getDatabase();
      const rows = db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).all(id);

      if (rows.length === 0) {
        return null;
      }

      db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).run(id);

      return attachInstanceMethods(rowToDocument(rows[0], config), config);
    },

    async deleteMany(filter = {}) {
      const db = getDatabase();
      const { sql, params } = translateFilter(filter, config);
      const countRow = db.prepare(`SELECT COUNT(*) AS n FROM ${config.table} AS t WHERE ${sql}`).get(...params);

      db.exec(`DELETE FROM ${config.table} WHERE id IN (SELECT t.id FROM ${config.table} AS t WHERE ${sql})`);
      // node:sqlite não reaproveita parâmetros entre exec/prepare; refazemos com prepare:
      const ids = db.prepare(`SELECT t.id FROM ${config.table} AS t WHERE ${sql}`).all(...params);

      for (const row of ids) {
        db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).run(row.id);
      }

      return { deletedCount: countRow.n };
    },

    async updateMany(filter = {}, update, options = {}) {
      if (!update.$set) {
        throw new UnsupportedQueryError('updateMany only supports $set in this adapter.');
      }

      const positionalUpdates = [];
      const directUpdates = [];

      for (const [key, value] of Object.entries(update.$set)) {
        if (key.includes('.$[')) {
          const match = key.match(/^([a-zA-Z0-9_]+)\.\$\[([a-zA-Z0-9_]+)\]\.([a-zA-Z0-9_]+)$/);
          if (!match) {
            throw new UnsupportedQueryError(`Unsupported positional syntax in updateMany: "${key}".`);
          }
          positionalUpdates.push({
            arrayField: match[1],
            identifier: match[2],
            subField: match[3],
            value
          });
        } else if (key.includes('.')) {
          throw new UnsupportedQueryError(`Dot-path syntax without array filter is not supported in updateMany: "${key}".`);
        } else {
          directUpdates.push({ jsField: key, value });
        }
      }

      const db = getDatabase();
      const { sql, params } = translateFilter(filter, config);
      const rows = db.prepare(`SELECT * FROM ${config.table} AS t WHERE ${sql}`).all(...params);

      if (positionalUpdates.length === 0) {
        const setClauses = [];
        const setValues = [];

        for (const { jsField, value } of directUpdates) {
          const columnDef = config.columns[jsField];

          if (!columnDef) {
            throw new UnsupportedQueryError(`updateMany $set: field "${jsField}" not mapped.`);
          }

          setClauses.push(`${columnDef.column} = ?`);
          setValues.push(serializeValue(value, columnDef));
        }

        if (config.timestamps) {
          setClauses.push('updated_at = ?');
          setValues.push(nowIso());
        }

        for (const row of rows) {
          db.prepare(`UPDATE ${config.table} SET ${setClauses.join(', ')} WHERE id = ?`).run(...setValues, row.id);
        }

        return { matchedCount: rows.length, modifiedCount: rows.length };
      }

      if (!options.arrayFilters || !Array.isArray(options.arrayFilters) || options.arrayFilters.length !== 1) {
        throw new UnsupportedQueryError('Positional update in updateMany requires options.arrayFilters with exactly one filter object.');
      }

      const targetIdentifier = positionalUpdates[0].identifier;
      const targetArrayField = positionalUpdates[0].arrayField;

      for (const p of positionalUpdates) {
        if (p.identifier !== targetIdentifier) {
          throw new UnsupportedQueryError('Multiple identifiers in arrayFilters are not supported in updateMany.');
        }
        if (p.arrayField !== targetArrayField) {
          throw new UnsupportedQueryError('Positional updates across multiple array fields are not supported in updateMany.');
        }
      }

      const arrayColDef = config.columns[targetArrayField];
      if (!arrayColDef || arrayColDef.type !== 'json') {
        throw new UnsupportedQueryError(`Target field "${targetArrayField}" must be a mapped JSON array column.`);
      }

      const filterObj = options.arrayFilters[0];
      if (!filterObj || typeof filterObj !== 'object' || Array.isArray(filterObj)) {
        throw new UnsupportedQueryError('arrayFilters element must be a filter object.');
      }

      const filterEntries = Object.entries(filterObj);
      if (filterEntries.length === 0) {
        throw new UnsupportedQueryError('arrayFilters element cannot be empty.');
      }

      const filterConditions = [];
      for (const [afKey, afVal] of filterEntries) {
        const parts = afKey.split('.');
        if (parts.length !== 2 || parts[0] !== targetIdentifier) {
          throw new UnsupportedQueryError(`arrayFilter key "${afKey}" must match the identifier "${targetIdentifier}.<subfield>".`);
        }
        filterConditions.push({ subField: parts[1], expected: afVal });
      }

      let modifiedCount = 0;

      for (const row of rows) {
        withTransaction((database) => {
          const rawArray = row[arrayColDef.column];
          const arrayValue = rawArray ? JSON.parse(rawArray) : [];

          if (!Array.isArray(arrayValue)) {
            throw new UnsupportedQueryError(`Target field "${targetArrayField}" is not a JSON array in row "${row.id}".`);
          }

          let anyModified = false;
          for (const item of arrayValue) {
            if (!item || typeof item !== 'object') continue;
            const matches = filterConditions.every((cond) =>
              matchesPredicateValue(item[cond.subField], cond.expected)
            );

            if (matches) {
              anyModified = true;
              for (const update of positionalUpdates) {
                item[update.subField] = update.value;
              }
            }
          }

          const setClauses = [`${arrayColDef.column} = ?`];
          const setValues = [JSON.stringify(arrayValue)];

          for (const { jsField, value } of directUpdates) {
            const columnDef = config.columns[jsField];
            if (!columnDef) {
              throw new UnsupportedQueryError(`updateMany $set: field "${jsField}" not mapped.`);
            }
            setClauses.push(`${columnDef.column} = ?`);
            setValues.push(serializeValue(value, columnDef));
          }

          if (config.timestamps) {
            setClauses.push('updated_at = ?');
            setValues.push(nowIso());
          }

          setValues.push(row.id);
          database.prepare(`UPDATE ${config.table} SET ${setClauses.join(', ')} WHERE id = ?`).run(...setValues);

          if (anyModified) {
            modifiedCount += 1;
          }
        });
      }

      return { matchedCount: rows.length, modifiedCount };
    },

    async bulkWrite(operations) {
      let matchedCount = 0;
      let modifiedCount = 0;
      let upsertedCount = 0;

      for (const op of operations) {
        if (!op.updateOne) {
          throw new UnsupportedQueryError('bulkWrite only supports updateOne operations in this adapter.');
        }

        const { filter, update, upsert } = op.updateOne;
        const db = getDatabase();
        const { sql, params } = translateFilter(filter, config);
        const existedBefore = db.prepare(`SELECT 1 AS x FROM ${config.table} AS t WHERE ${sql} LIMIT 1`).all(...params).length > 0;

        await this._updateOne(filter, update, { upsert, new: false });

        if (existedBefore) {
          matchedCount += 1;
          modifiedCount += 1;
        } else if (upsert) {
          upsertedCount += 1;
        }
      }

      return { matchedCount, modifiedCount, upsertedCount };
    },

    async distinct(jsField, filter = {}) {
      const db = getDatabase();
      const columnDef = config.columns[jsField];

      if (!columnDef) {
        throw new UnsupportedQueryError(`distinct: field "${jsField}" not mapped.`);
      }

      const { sql, params } = translateFilter(filter, config);
      const rows = db
        .prepare(`SELECT DISTINCT t.${columnDef.column} AS value FROM ${config.table} AS t WHERE ${sql}`)
        .all(...params);

      return rows.map((row) => deserializeValue(row.value, columnDef));
    }
  };
}
