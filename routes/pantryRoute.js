const express = require('express');
const { body, validationResult } = require("express-validator");
const MealTask = require('../models/MealTask');
const DeliveryPerson = require('../models/DeliveryPerson');
const User = require('../models/User');
const fetchUser = require('../middleware/fetchUser');
const router = express.Router();

router.use(fetchUser, async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'PantryStaff') {
        return res.status(403).json({ error: "Access denied. Only PantryStaff can access these routes." });
    }
    next();
});

// ROUTE 1: View assigned meal preparation tasks
router.get("/tasks", async (req, res) => {
    try {
        const tasks = await MealTask.find()
            .populate("assignedTo", "name")
            .populate("patientId", "name bedNumber")
            .populate("dietChart");
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Update the preparation status for individual meals
router.patch("/task/:taskId", [
    body("preparationStatus", "Preparation Status must be Pending, In Progress or Prepared").isIn(["Pending", "In Progress", "Prepared"])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const task = await MealTask.findByIdAndUpdate(
            req.params.taskId,
            { preparationStatus: req.body.preparationStatus },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        console.error("Error updating task preparation status", error);
        res.status(500).send("Internal Server Error");
    }
});

// **Manage delivery personnel**:

// ROUTE 3: Add delivery personnel details
router.post("/addDeliveryPersonnel", async (req, res) => {
    try {
        const { name, contactInfo, otherDetails } = req.body;

        const newDeliveryPerson = new DeliveryPerson({
            name,
            contactInfo,
            otherDetails
        });

        await newDeliveryPerson.save();

        res.status(201).json(newDeliveryPerson);
    } catch (error) {
        console.error("Error adding delivery person", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: To fetch all Delivery Personnel
router.get("/getDeliveryPersonnel", async (req, res) => {
    try {
        // Fetch all delivery personnel from the Patient model
        const deliveryPersons = await DeliveryPerson.find();

        // If no delivery personnel found, send an appropriate message
        if (deliveryPersons.length === 0) {
            return res.status(404).json({ message: "No delivery personnel found" });
        }

        // Return the list of delivery personnel
        res.json({ success: true, deliveryPersons });
    } catch (error) {
        console.error("Error fetching all delivery personnel", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Assign specific meal boxes to delivery personnel
router.patch("/assignDelivery/:taskId", async (req, res) => {
    try {
        const { deliveryPersonId } = req.body;

        const task = await MealTask.findById(req.params.taskId);
        
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        if (task.preparationStatus !== "Prepared") {
            return res.status(400).json({ 
                error: "Task cannot be assigned for delivery. Preparation is not completed." 
            });
        }

        const updatedTask = await MealTask.findByIdAndUpdate(
            req.params.taskId,
            {
                deliveryAssignedTo: deliveryPersonId, 
                deliveryStatus: "Out for Delivery"
            },
            { new: true }
        );
        res.json(updatedTask);
    } catch (error) {
        console.error("Error assigning delivery personnel", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
