const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const JWT_SECRET = `srmnikku`;

// ROUTE 1: Create a User using: POST "/api/auth/register". No login required
router.post("/register", [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Password must have min 8 characters.").isLength({ min: 8 }),
    body("role", "Role must be one of Manager, Pantry Staff, or Delivery Personnel")
        .isIn(["Manager", "PantryStaff", "DeliveryPersonnel"]),
    body("contactInfo", "Enter a valid Contact Number").isLength({ min: 10, max: 10 }),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    // Check if email or mobile no. exists already
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            success = false;
            return res.status(400).json({ success, error: "Sorry an user with this email already exists." });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        // Creating a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: secPass,
            role: req.body.role,
            contactInfo: req.body.contactInfo
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.error("Internal error occurring while creating user.", error);
        res.status(500).send("Internal server error occurring while creating user.");
    }
})

// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post("/login", [
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Password cannot be blank").exists()
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials." });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials." });
        }
        const data = {
            user: {
                id: user.id,
                role: user.role,
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken, role: user.role });
    } catch (error) {
        console.error("Error while authenticating user.", error);
        res.status(500).send("Internal server Error.");
    }
})

module.exports = router;
