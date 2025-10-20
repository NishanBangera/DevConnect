import { body } from "express-validator";
import User from "../../models/user.model.js";

// Validators for updating user profile
export const updateUserProfileValidators = [
    body('firstName')
        .optional()
        .isString()
        .isLength({ min: 4 })
        .withMessage('First name must be a string with at least 4 characters'),
    body('lastName')
        .optional()
        .isString()
        .withMessage('Last name must be a string'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('A valid email is required')
        .custom(async (email, { req }) => {
            const userId = (req as any).userId;
            if (email) {
                const normalizedEmail = email.toLowerCase().trim();
                const existingUser = await User.findOne({ 
                    email: normalizedEmail, 
                    _id: { $ne: userId } 
                });
                if (existingUser) {
                    throw new Error('Email is already in use by another account');
                }
            }
            return true;
        }),
    body('age')
        .optional()
        .isInt({ min: 13 })
        .withMessage('Age must be an integer and at least 13'),
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage("Gender must be 'male', 'female' or 'other'"),
];

// Validators for updating password
export const updatePasswordValidators = [
    // currentPassword must be provided
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    // newPassword must be at least 6 chars
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),

    // confirmPassword must match newPassword
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Confirm password does not match new password');
            }
            return true;
        })
];
