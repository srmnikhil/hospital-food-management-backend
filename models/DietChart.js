const mongoose = require('mongoose');

const dietChartSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    morningMeal: { type: String },
    eveningMeal: { type: String },
    nightMeal: { type: String },
    ingredients: { type: String },
    instructions: { type: String },
}, { timestamps: true });

const DietChart = mongoose.model('DietChart', dietChartSchema);

module.exports = DietChart;
