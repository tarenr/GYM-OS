import mongoose from 'mongoose';
import { BodyMeasurement } from '../models/BodyMeasurement.js';

const measurementFields = [
  'chest',
  'rightArm',
  'leftArm',
  'waist',
  'abdomen',
  'hips',
  'rightThigh',
  'leftThigh',
  'rightCalf',
  'leftCalf'
];

function normalizeNumber(value) {
  const number = Number(value || 0);

  return Number.isFinite(number) ? number : 0;
}

function normalizeBodyMeasurementPayload(payload) {
  const measurements = payload.measurementsCm || {};

  return {
    measuredAt: payload.measuredAt || payload.date,
    weightKg: normalizeNumber(payload.weightKg),
    measurementsCm: measurementFields.reduce((result, field) => ({
      ...result,
      [field]: normalizeNumber(measurements[field] ?? payload[field])
    }), {}),
    notes: String(payload.notes || '').trim()
  };
}

function validateBodyMeasurementPayload(payload) {
  const errors = [];

  if (!payload.measuredAt) {
    errors.push('A data da medicao e obrigatoria.');
  }

  if (Number(payload.weightKg || 0) < 0) {
    errors.push('O peso nao pode ser negativo.');
  }

  measurementFields.forEach((field) => {
    if (Number(payload.measurementsCm?.[field] || 0) < 0) {
      errors.push(`A medida ${field} nao pode ser negativa.`);
    }
  });

  if (String(payload.notes || '').length > 500) {
    errors.push('As observacoes devem ter no maximo 500 caracteres.');
  }

  return errors;
}

function notFoundResponse(response) {
  return response.status(404).json({ message: 'Medicao corporal nao encontrada.' });
}

export async function listBodyMeasurements(request, response, next) {
  try {
    const measurements = await BodyMeasurement.find().sort({ measuredAt: -1, createdAt: -1 });

    response.json(measurements);
  } catch (error) {
    next(error);
  }
}

export async function getBodyMeasurement(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const measurement = await BodyMeasurement.findById(request.params.id);

    if (!measurement) {
      return notFoundResponse(response);
    }

    response.json(measurement);
  } catch (error) {
    next(error);
  }
}

export async function createBodyMeasurement(request, response, next) {
  try {
    const payload = normalizeBodyMeasurementPayload(request.body);
    const errors = validateBodyMeasurementPayload(payload);

    if (errors.length) {
      return response.status(422).json({ message: errors.join(' ') });
    }

    const measurement = await BodyMeasurement.create(payload);

    response.status(201).json(measurement);
  } catch (error) {
    next(error);
  }
}

export async function updateBodyMeasurement(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const payload = normalizeBodyMeasurementPayload(request.body);
    const errors = validateBodyMeasurementPayload(payload);

    if (errors.length) {
      return response.status(422).json({ message: errors.join(' ') });
    }

    const measurement = await BodyMeasurement.findByIdAndUpdate(request.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!measurement) {
      return notFoundResponse(response);
    }

    response.json(measurement);
  } catch (error) {
    next(error);
  }
}

export async function deleteBodyMeasurement(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const measurement = await BodyMeasurement.findByIdAndDelete(request.params.id);

    if (!measurement) {
      return notFoundResponse(response);
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
