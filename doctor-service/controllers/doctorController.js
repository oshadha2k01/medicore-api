const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');

exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    next(error);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    res.status(200).json({ message: 'Doctor deleted successfully', doctor });
  } catch (error) {
    next(error);
  }
};
