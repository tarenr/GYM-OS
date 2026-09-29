import { createModel } from '../queryEngine.js';

export const BodyMeasurementSqlite = createModel({
  table: 'body_measurements',
  timestamps: true,
  columns: {
    measuredAt: { column: 'measured_at', type: 'date', required: true, default: () => new Date() },
    weightKg: { column: 'weight_kg', type: 'real', default: 0 },
    measurementsCm: { column: 'measurements_cm', type: 'json', default: () => ({}) },
    notes: { column: 'notes', type: 'text', default: '' }
  }
});
