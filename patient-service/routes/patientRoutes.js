const express = require('express');
const Joi = require('joi');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const idSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

const patientCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  age: Joi.number().integer().min(0).max(120).required(),
  bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
  phone: Joi.string().trim().pattern(/^[0-9+\-()\s]{7,20}$/).required(),
  email: Joi.string().trim().email().required(),
});

const patientUpdateSchema = patientCreateSchema.fork(
  ['name', 'age', 'bloodType', 'phone', 'email'],
  (field) => field.optional()
).min(1);

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: List of patients
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, age, bloodType, phone, email]
 *             properties:
 *               name: { type: string, example: "John Silva" }
 *               age: { type: integer, example: 35 }
 *               bloodType: { type: string, example: "A+" }
 *               phone: { type: string, example: "0771234567" }
 *               email: { type: string, example: "john@email.com" }
 *     responses:
 *       201:
 *         description: Patient registered
 */
router.route('/')
  .get(authenticate, authorize('ADMIN', 'STAFF'), getAllPatients)
  .post(authenticate, authorize('ADMIN'), validate(patientCreateSchema), createPatient);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Patient found
 *       404:
 *         description: Patient not found
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Patient updated
 *   delete:
 *     summary: Delete patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Patient deleted
 */
router.route('/:id')
  .get(authenticate, authorize('ADMIN', 'STAFF'), validate(idSchema, 'params'), getPatientById)
  .put(authenticate, authorize('ADMIN'), validate(idSchema, 'params'), validate(patientUpdateSchema), updatePatient)
  .delete(authenticate, authorize('ADMIN'), validate(idSchema, 'params'), deletePatient);

module.exports = router;
