const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");


// REGISTER VALIDATION
router.post(
    "/register",
    [
        body("name")
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 3 })
            .withMessage("Name must be at least 3 characters"),

        body("email")
            .isEmail()
            .withMessage("Please enter a valid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
    ],
    registerUser
);


// LOGIN VALIDATION
router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Invalid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],
    loginUser
);

module.exports = router;
