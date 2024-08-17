import { param } from "express-validator";
export const destroy = (name, callback, fields = "id") => {
    return param(fields)
        .trim().escape().notEmpty()
        .withMessage(`${name} id(s) is/are required`) // ids can be a single id or comma separated string of ids
        .bail()
        .customSanitizer((value) => value.split(","))
        .custom(async (value) => {
        for (const id of value) {
            const response = await callback(id);
            if (response === null) {
                return Promise.reject(`${name} with id '${id}' not found`);
            }
        }
        return true;
    });
};
