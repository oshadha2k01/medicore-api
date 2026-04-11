const Appointment = require('../models/Appointment');
const AppError = require('../utils/AppError');

exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const appointmentDateTime = new Date(`${req.body.date}T${req.body.time}:00`);
    if (Number.isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()) {
      throw new AppError('Appointment must be scheduled in the future', 400);
    }

    req.body.date = new Date(req.body.date);
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    if (req.body.date && req.body.time) {
      const appointmentDateTime = new Date(`${req.body.date}T${req.body.time}:00`);
      if (Number.isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()) {
        throw new AppError('Appointment must be scheduled in the future', 400);
      }
    }

    if (req.body.date) {
      req.body.date = new Date(req.body.date);
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    res.status(200).json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    next(error);
  }
};
