const express = require('express');
const Joi = require('joi');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const idSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

const doctorCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  specialization: Joi.string().trim().min(2).max(120).required(),
  phone: Joi.string().trim().pattern(/^[0-9+\-()\s]{7,20}$/).required(),
  email: Joi.string().trim().email().required(),
  available: Joi.boolean().optional(),
});

const doctorUpdateSchema = doctorCreateSchema.fork(
  ['name', 'specialization', 'phone', 'email', 'available'],
  (field) => field.optional()
).min(1);

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 *   post:
 *     summary: Add a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, specialization, phone, email]
 *             properties:
 *               name: { type: string, example: "Dr. Kamal Fernando" }
 *               specialization: { type: string, example: "Cardiology" }
 *               phone: { type: string, example: "0112345678" }
 *               email: { type: string, example: "kamal@hospital.com" }
 *               available: { type: boolean, example: true }
 *     responses:
 *       201:
 *         description: Doctor added
 */
router.route('/')
  .get(authenticate, authorize('ADMIN', 'STAFF'), getAllDoctors)
  .post(authenticate, authorize('ADMIN'), validate(doctorCreateSchema), createDoctor);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor found
 *       404:
 *         description: Doctor not found
 *   put:
 *     summary: Update doctor
 *     tags: [Doctors]
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
 *         description: Doctor updated
 *   delete:
 *     summary: Remove doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor removed
 */
router.route('/:id')
  .get(authenticate, authorize('ADMIN', 'STAFF'), validate(idSchema, 'params'), getDoctorById)
  .put(authenticate, authorize('ADMIN'), validate(idSchema, 'params'), validate(doctorUpdateSchema), updateDoctor)
  .delete(authenticate, authorize('ADMIN'), validate(idSchema, 'params'), deleteDoctor);

module.exports = router;
