const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser"); // Import the fetchUser middleware

// Single endpoint to handle role-based routing
router.get("/", fetchUser, (req, res) => {
  const role = req.user.role;

  switch (role) {
    case 'Manager':
      // Return Manager Dashboard data
      res.json({ message: "Welcome to the Manager Dashboard." });
      break;
    case 'PantryStaff':
      // Return Pantry Staff Dashboard data
      res.json({ message: "Welcome to the Pantry Staff Dashboard." });
      break;
    case 'DeliveryPersonnel':
      // Return Delivery Personnel Dashboard data
      res.json({ message: "Welcome to the Delivery Personnel Dashboard." });
      break;
    default:
      // If the role is not recognized or missing
      res.status(403).json({ error: "Forbidden: You do not have access to this resource." });
      break;
  }
});

module.exports = router;
