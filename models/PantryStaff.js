const mongoose = require('mongoose');

const pantryStaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactInfo: { type: String, required: true },
    location: { type: String, required: true },
}, { timestamps: true });

const PantryStaff = mongoose.model('PantryStaff', pantryStaffSchema);

module.exports = PantryStaff;
