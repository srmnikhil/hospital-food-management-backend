const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default: function () {
            return this.role === "Manager"
                ? "Hospital Manager"
                : this.role === "PantryStaff"
                    ? "Pantry Staff"
                    : "Delivery Personnel";
        }
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['Manager', 'PantryStaff', 'DeliveryPersonnel'],
        required: true
    },
    contactInfo: { type: String, required: false, default: "Not Provided" },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
