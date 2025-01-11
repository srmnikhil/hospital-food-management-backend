const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Patient = require("../models/Patient");
const DietChart = require("../models/DietChart");
const PantryStaff = require("../models/PantryStaff");
const MealTask = require("../models/MealTask");

const router = express.Router();

router.get("/preparationStatus", async (req, res) => {
    try {
        const tasks = await MealTask.find()
            .populate("assignedTo")
            .populate("deliveryAssignedTo", "name")
            .populate("patientId", "name bedNumber")
            .populate("dietChart");
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching preparation status", error);
        res.status(500).send("Internal Server Error");
    }
});

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

// ROUTE 9: Fetch all patients using: GET "/api/manager/getAllPatients". Login required
router.get("/getAllPatients", async (req, res) => {
    try {
        // Fetch all patients from the Patient model
        const patients = await Patient.find();

        // If no patients found, send an appropriate message
        if (patients.length === 0) {
            return res.status(404).json({ message: "No patients found" });
        }

        // Return the list of patients
        res.json({ success: true, patients });
    } catch (error) {
        console.error("Error fetching all patients", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 10: Fetch all pantry staff using: GET "/api/manager/getPantryStaff". Login required
router.get("/getPantryStaff", async (req, res) => {
    try {
        // Fetch all pantry staff from the PantryStaff model
        const pantryStaff = await PantryStaff.find();

        // If no pantry staff found, send an appropriate message
        if (pantryStaff.length === 0) {
            return res.status(404).json({ message: "No Pantry Staff found" });
        }

        // Return the list of pantry staff
        res.json({ success: true, pantryStaff });
    } catch (error) {
        console.error("Error fetching all Pantry Staff", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 11: Fetch all meal task using: GET "/api/manager/getMealTask". Login required
router.get("/getMealTask", async (req, res) => {
    try {
        // Fetch all meal task from the Meal Task model
        const mealTask = await MealTask.find();

        // If no meal task found, send an appropriate message
        if (mealTask.length === 0) {
            return res.status(404).json({ message: "No Meal Task found" });
        }

        // Return the list of meal task
        res.json({ success: true, mealTask });
    } catch (error) {
        console.error("Error fetching all Meal Task", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/getDietChart", async (req, res) => {
    try {
        // Fetch all diet chart from the Diet Chart model
        const dietChart = await DietChart.find()
            .populate("patientId", "name");

        // If no diet chart found, send an appropriate message
        if (dietChart.length === 0) {
            return res.status(404).json({ message: "No Diet Chart found" });
        }

        // Return the list of diet chart
        res.json({ success: true, dietChart });
    } catch (error) {
        console.error("Error fetching all Diet Chart", error);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;