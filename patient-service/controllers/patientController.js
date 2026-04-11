const Patient = require('../models/Patient');
const AppError = require('../utils/AppError');

// GET all patients
exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};

// GET patient by ID
exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
};

// POST create patient
exports.createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

// PUT update patient
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
};

// DELETE patient
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.status(200).json({ message: 'Patient deleted successfully', patient });
  } catch (error) {
    next(error);
  }
};
