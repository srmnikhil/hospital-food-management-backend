const express = require('express');
const MealTask = require('../models/MealTask');
const User = require('../models/User');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser'); // Assuming fetchUser middleware is already defined

// Middleware to check if the logged-in user is a DeliveryPersonnel
router.use(fetchUser, async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'DeliveryPersonnel') {
        return res.status(403).json({ error: "Access denied. Only DeliveryPersonnel can access these routes." });
    }
    next();
});

// ROUTE 1: Update delivery status from "Out for Delivery" to "Delivered"
router.patch("/updateDeliveryStatus/:taskId", async (req, res) => {
    try {
        const task = await MealTask.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Ensure the delivery status is "Out for Delivery" before updating
        if (task.deliveryStatus !== 'Out for Delivery') {
            return res.status(400).json({ error: "Delivery status is not 'Out for Delivery'. Cannot update to 'Delivered'." });
        }

        // Update the delivery status to "Delivered"
        task.deliveryStatus = 'Delivered';
        task.deliveredAt = new Date(); // Set the deliveredAt timestamp

        await task.save();

        res.json({ message: "Delivery status updated successfully.", task });
    } catch (error) {
        console.error("Error updating delivery status", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
