const HEX_24_PATTERN = /^[0-9a-fA-F]{24}$/;

// Substitui mongoose.isValidObjectId(...) nos controllers: os ids gerados
// pelo adaptador (generateId() em queryEngine.js) e os ObjectId originais
// migrados do Atlas são sempre uma string hex de 24 caracteres.
export function isValidId(value) {
  return typeof value === 'string' && HEX_24_PATTERN.test(value);
}
