const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    diseases: { type: String, default: 'Unknown' },
    allergies: { type: String, default: 'Unknown' },
    roomNumber: { type: String, required: true },
    bedNumber: { type: String, required: true },
    floorNumber: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    contactInfo: { type: String, required: true },
    emergencyContact: { type: String, default: 'Unknown' },
    remarks: { type: String, default: "Not Given" },
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
