import { param } from "express-validator";
export const read = (name, fields = "id") => {
    return param(fields)
        .trim().notEmpty().withMessage(`${name} id is required`);
};
