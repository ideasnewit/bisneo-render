import { query, body } from "express-validator";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import itemExists from "./libs/itemExists.js";
import { description } from "./libs/description.js";
import toTitleCase from "../../../libs/toTitleCase.js";
import filters from "./libs/filters.js";
const { Category } = db;
// name, description
const commonRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Category name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Category name must be between 2 and 50 characters")
        .bail()
        .custom(async (name, { req }) => {
        const clientId = req.headers && req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const category = await Category.findOne({ where: { clientId, name } });
        if (itemExists(category, req.body.id)) {
            return Promise.reject("A category with this name already exists");
        }
        return true;
    })
        .customSanitizer((name) => {
        return toTitleCase(name);
    }),
    description,
];
export const categoryRules = {
    filter: [query("name").optional({ checkFalsy: true }).trim(), ...filters],
    create: commonRules,
    read: [read("Category")],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Category id is required")
            .custom(async (id) => {
            const category = await Category.findByPk(id);
            if (category === null) {
                throw new Error("Category not found");
            }
            return true;
        }),
        ...commonRules,
    ],
    destroy: [destroy("Category", async (pk) => await Category.findByPk(pk))],
};
