const mongoose = require('mongoose');

const mealTaskSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    dietChart: { type: mongoose.Schema.Types.ObjectId, ref: 'DietChart', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'PantryStaff', required: true },
    deliveryAssignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson' || "UnAssigned" },
    mealType: { type: String, enum: ['Morning', 'Evening', 'Night'], required: true },
    preparationStatus: { type: String, enum: ['Pending', 'In Progress', 'Prepared'], default: 'Pending' },
    deliveryStatus: { type: String, enum: ['Pending', 'Delivered'], default: 'Pending' },
    deliveryNotes: { type: String },
    assignedAt: { type: Date, default: Date.now },
    preparedAt: { type: Date },
    deliveredAt: { type: Date },
}, { timestamps: true });

const MealTask = mongoose.model('MealTask', mealTaskSchema);

module.exports = MealTask;
