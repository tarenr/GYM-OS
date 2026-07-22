import { Router } from 'express';
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate
} from '../controllers/templateController.js';

export const templateRoutes = Router();

templateRoutes.get('/', listTemplates);
templateRoutes.get('/:id', getTemplate);
templateRoutes.post('/', createTemplate);
templateRoutes.put('/:id', updateTemplate);
templateRoutes.delete('/:id', deleteTemplate);
