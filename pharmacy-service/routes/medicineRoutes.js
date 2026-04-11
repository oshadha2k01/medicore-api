const express = require('express');
const Joi = require('joi');
const router = express.Router();
const {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const idSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

const medicineCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  category: Joi.string().trim().min(2).max(100).required(),
  stock: Joi.number().integer().min(0).required(),
  price: Joi.number().min(0).required(),
  supplier: Joi.string().trim().min(2).max(200).required(),
});

const medicineUpdateSchema = medicineCreateSchema.fork(
  ['name', 'category', 'stock', 'price', 'supplier'],
  (field) => field.optional()
).min(1);

/**
 * @swagger
 * tags:
 *   name: Pharmacy
 *   description: Pharmacy / medicine management
 */

/**
 * @swagger
 * /medicines:
 *   get:
 *     summary: Get all medicines
 *     tags: [Pharmacy]
 *     responses:
 *       200:
 *         description: List of medicines
 *   post:
 *     summary: Add a new medicine
 *     tags: [Pharmacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, stock, price, supplier]
 *             properties:
 *               name: { type: string, example: "Paracetamol 500mg" }
 *               category: { type: string, example: "Analgesic" }
 *               stock: { type: integer, example: 500 }
 *               price: { type: number, example: 5.50 }
 *               supplier: { type: string, example: "MedCo Ltd" }
 *     responses:
 *       201:
 *         description: Medicine added
 */
router.route('/')
  .get(authenticate, authorize('ADMIN', 'STAFF'), getAllMedicines)
  .post(authenticate, authorize('ADMIN'), validate(medicineCreateSchema), createMedicine);

/**
 * @swagger
 * /medicines/{id}:
 *   get:
 *     summary: Get medicine by ID
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medicine found
 *       404:
 *         description: Medicine not found
 *   put:
 *     summary: Update or restock medicine
 *     tags: [Pharmacy]
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
 *         description: Medicine updated
 *   delete:
 *     summary: Remove medicine
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medicine removed
 */
router.route('/:id')
  .get(authenticate, authorize('ADMIN', 'STAFF'), validate(idSchema, 'params'), getMedicineById)
  .put(authenticate, authorize('ADMIN'), validate(idSchema, 'params'), validate(medicineUpdateSchema), updateMedicine)
  .delete(authenticate, authorize('ADMIN'), validate(idSchema, 'params'), deleteMedicine);

module.exports = router;
