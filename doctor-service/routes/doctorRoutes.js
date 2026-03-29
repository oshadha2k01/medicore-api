const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');

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
router.route('/').get(getAllDoctors).post(createDoctor);

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
router.route('/:id').get(getDoctorById).put(updateDoctor).delete(deleteDoctor);

module.exports = router;
