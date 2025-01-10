const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Patient = require("../models/Patient");
const DietChart = require("../models/DietChart");
const PantryStaff = require("../models/PantryStaff");
const MealTask = require("../models/MealTask");

const router = express.Router();

// Middleware to check for Manager role
router.use(fetchUser, async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "Manager") {
        return res.status(403).json({ error: "Access denied. Only managers are allowed." });
    }
    next();
});

// ROUTE 1: Add new patient details using: POST "/api/manager/addPatient". Login required
router.post("/addPatient", [
    body("name", "Name is required").notEmpty(),
    body("age", "Age must be a number").isInt(),
    body("contactInfo", "Invalid contact information").isMobilePhone(),
    body("roomNumber", "Room is required").notEmpty(),
    body("bedNumber", "Bed is required").notEmpty(),
    body("floorNumber", "Floor is required").notEmpty(),
    body("gender", "Gender is required").notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let checkPatient = await Patient.findOne({ bedNumber: req.body.bedNumber });
        if (checkPatient) {
            return res.status(400).json({ error: "Bed is occupied or you are trying to add same patient again." });
        }
        const { name, diseases, allergies, roomNumber, bedNumber, floorNumber, age, gender, contactInfo, emergencyContact, remarks } = req.body;

        const patient = await Patient.create({
            name,
            diseases,
            allergies,
            roomNumber,
            bedNumber,
            floorNumber,
            age,
            gender,
            contactInfo,
            emergencyContact,
            remarks,
        });

        res.json({ success: true, patient, message: "Patient added successfully." });
    } catch (error) {
        console.error("Error adding patient details", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Update existing patient details using: POST "/api/manager/updatePatient". Login required
router.put("/updatePatient/:id", async (req, res) => {
    try {
        const updates = req.body;
        const patient = await Patient.findByIdAndUpdate(req.params.id, updates, { new: true });

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.json({ success: true, patient, message: "Patient updated successfully." });
    } catch (error) {
        console.error("Error updating patient details", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Delete existing patient details using: POST "/api/manager/deletePatient". Login required
router.delete("/deletePatient/:id", async (req, res) => {
    try {
        const patientId = req.params.id;
        const deletedPatient = await Patient.findByIdAndDelete(patientId);
        if (!deletedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        await DietChart.deleteMany({ patientId: patientId });
        await MealTask.deleteMany({ patientId: patientId });

        res.json({ success: true, message: "Patient and related records deleted successfully." });
    } catch (error) {
        console.error("Error deleting patient details", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Create or Update diet charts for a patient using: POST "/api/manager/setDiet". Login required
router.post("/setDiet/:patientId", async (req, res) => {
    try {
        const { morningMeal, eveningMeal, nightMeal, ingredients, instructions } = req.body;

        const patientExists = await Patient.findById(req.params.patientId);

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient does not exist. Cannot create or update Diet Chart."
            });
        }

        const dietChart = await DietChart.findOneAndUpdate(
            { patientId: req.params.patientId },
            { morningMeal, eveningMeal, nightMeal, ingredients, instructions },
            { new: true, upsert: true }
        );

        res.json({ success: true, dietChart, message: "Diet Chart set successfully." });
    } catch (error) {
        console.error("Error setting diet chart", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 5: Add pantry staff details using: POST "/api/manager/addPantryStaff". Login required
router.post("/addPantryStaff", async (req, res) => {
    try {
        const { name, contactInfo, location } = req.body;

        const pantryStaff = await PantryStaff.create({
            name,
            contactInfo,
            location,
        });

        res.json({ success: true, pantryStaff, message: "Pantry Staff details added successfully." });
    } catch (error) {
        console.error("Error adding pantry staff", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 6: Assign food preparation tasks to pantry staff using: POST "/api/manager/assignPreparationTask". Login required
router.post("/assignPreparationTask", [
    body("patientId", "Patient ID is required").notEmpty(),
    body("dietChartId", "Diet Chart ID is required").notEmpty(),
    body("pantryStaffId", "Pantry Staff ID is required").notEmpty(),
    body("mealType", "Meal Type is required").isIn(["Morning", "Evening", "Night"]),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { mealType, pantryStaffId, dietChartId, patientId } = req.body;

        const patientExists = await Patient.findById(patientId);

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient does not exist."
            });
        }

        const task = await MealTask.findOneAndUpdate(
            { patientId, mealType }, // Search criteria
            { assignedTo: pantryStaffId, dietChart: dietChartId, mealType }, // Fields to update
            { new: true, upsert: true } // Options: return the updated doc & create if not found
        );

        res.json({ success: true, task });
    } catch (error) {
        console.error("Error assigning preparation task", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 7: To track food preparation status using: POST "/api/manager/preparationStatus". Login required
router.get("/preparationStatus", async (req, res) => {
    try {
        const tasks = await MealTask.find().populate("assignedTo").populate("dietChart");
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching preparation status", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 8: To track meal delivery status using: POST "/api/manager/deliveryStatus". Login required
router.get("/deliveryStatus", async (req, res) => {
    try {
        const deliveries = await MealTask.find({ deliveryStatus: { $exists: true } })
            .populate("patientId", "name contactInfo")
            .populate("dietChartId", "mealPlan instructions")
            .populate("pantryStaffId", "name contactInfo");

        res.json(deliveries);
    } catch (error) {
        console.error("Error fetching delivery status", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;