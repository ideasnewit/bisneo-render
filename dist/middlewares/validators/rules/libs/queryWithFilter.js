import { query } from "express-validator";
export const queryWithFilter = (fields, filter) => {
    return query(fields)
        .optional().trim().escape().bail()
        .customSanitizer(async (value) => {
        const rows = await filter(value);
        if (rows.length) {
            return rows.map((row) => row.id);
        }
        else {
            return null;
        }
    });
};
