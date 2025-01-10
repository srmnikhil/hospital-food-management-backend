const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactInfo: { type: String, required: true },
    otherDetails: { type: String },
}, { timestamps: true });

const DeliveryPerson = mongoose.model('DeliveryPerson', deliveryPersonSchema);

module.exports = DeliveryPerson;
