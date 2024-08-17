import { body } from "express-validator";
export const description = body("description")
    .optional({ checkFalsy: true })
    .trim().isLength({ min: 5, max: 255 })
    .withMessage("Description must be between 5 and 255 characters");
