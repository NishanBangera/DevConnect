import { body } from "express-validator";

// Validators for register route
export const registerValidators = [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    body("age")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Age must be a positive integer"),
    body("gender")
        .optional()
        .isIn(["male", "female", "other"])
        .withMessage("Gender must be 'male', 'female' or 'other'"),
];

// Validators for login route
export const loginValidators = [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

// Validator for forgot password
export const forgotPasswordValidators = [
    body('email').isEmail().withMessage('A valid email is required')
];

export const resetPasswordValidators = [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];