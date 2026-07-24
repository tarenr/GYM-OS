import { Router } from 'express';
import {
  createBodyMeasurement,
  deleteBodyMeasurement,
  getBodyMeasurement,
  listBodyMeasurements,
  updateBodyMeasurement
} from '../controllers/bodyMeasurementController.js';

export const bodyMeasurementRoutes = Router();

bodyMeasurementRoutes.get('/', listBodyMeasurements);
bodyMeasurementRoutes.get('/:id', getBodyMeasurement);
bodyMeasurementRoutes.post('/', createBodyMeasurement);
bodyMeasurementRoutes.put('/:id', updateBodyMeasurement);
bodyMeasurementRoutes.delete('/:id', deleteBodyMeasurement);
