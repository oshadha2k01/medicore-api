const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');

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
router.route('/').get(getAllAppointments).post(createAppointment);

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
router.route('/:id').get(getAppointmentById).put(updateAppointment).delete(deleteAppointment);

module.exports = router;
