const express = require('express');
const Joi = require('joi');
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const idSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

const appointmentCreateSchema = Joi.object({
  patientId: Joi.string().length(24).hex().required(),
  doctorId: Joi.string().length(24).hex().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  reason: Joi.string().trim().min(3).max(500).required(),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),
});

const appointmentUpdateSchema = appointmentCreateSchema.fork(
  ['patientId', 'doctorId', 'date', 'time', 'reason', 'status'],
  (field) => field.optional()
).min(1);

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of appointments
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, doctorId, date, time, reason]
 *             properties:
 *               patientId: { type: string, example: "664a1f2e3b4c5d6e7f8a9b0c" }
 *               doctorId: { type: string, example: "664a1f2e3b4c5d6e7f8a9b0d" }
 *               date: { type: string, example: "2026-04-10" }
 *               time: { type: string, example: "09:00" }
 *               reason: { type: string, example: "Chest pain follow-up" }
 *     responses:
 *       201:
 *         description: Appointment booked
 */
router.route('/')
  .get(authenticate, authorize('ADMIN', 'STAFF'), getAllAppointments)
  .post(authenticate, authorize('ADMIN', 'STAFF'), validate(appointmentCreateSchema), createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Appointment found
 *       404:
 *         description: Appointment not found
 *   put:
 *     summary: Update or reschedule appointment
 *     tags: [Appointments]
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
 *         description: Appointment updated
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Appointment cancelled
 */
router.route('/:id')
  .get(authenticate, authorize('ADMIN', 'STAFF'), validate(idSchema, 'params'), getAppointmentById)
  .put(authenticate, authorize('ADMIN', 'STAFF'), validate(idSchema, 'params'), validate(appointmentUpdateSchema), updateAppointment)
  .delete(authenticate, authorize('ADMIN'), validate(idSchema, 'params'), deleteAppointment);

module.exports = router;
