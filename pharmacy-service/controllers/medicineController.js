const Medicine = require('../models/Medicine');
const AppError = require('../utils/AppError');

exports.getAllMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find();
    res.status(200).json(medicines);
  } catch (error) {
    next(error);
  }
};

exports.getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    res.status(200).json(medicine);
  } catch (error) {
    next(error);
  }
};

exports.createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (error) {
    next(error);
  }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    res.status(200).json(medicine);
  } catch (error) {
    next(error);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }

    res.status(200).json({ message: 'Medicine removed successfully', medicine });
  } catch (error) {
    next(error);
  }
};
