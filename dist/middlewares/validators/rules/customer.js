import { query, body } from "express-validator";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import itemExists from "./libs/itemExists.js";
import toTitleCase from "../../../libs/toTitleCase.js";
import filters from "./libs/filters.js";
const { Customer } = db;
const commonRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Customer's name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Customer's name must be between 2 and 50 characters")
        .bail()
        .customSanitizer((name) => {
        return toTitleCase(name);
    }),
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Customer's phone number is required")
        .isLength({ min: 10, max: 15 })
        .withMessage("A phone number must be 10 characters long")
        .isInt()
        .withMessage("A phone number must be numerical")
        .bail()
        .custom(async (phone, { req }) => {
        const clientId = req.headers && req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const customer = await Customer.findOne({ where: { clientId, phone } });
        if (itemExists(customer, req.body.id)) {
            return Promise.reject("A customer with this phone number already exists");
        }
        return true;
    }),
    body("email")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 40 })
        .withMessage("Email must be between 5 and 40 characters long")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail()
        .toLowerCase()
        .bail()
        .custom(async (email, { req }) => {
        const clientId = req.headers && req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const customer = await Customer.findOne({ where: { clientId, email } });
        if (itemExists(customer, req.body.id)) {
            return Promise.reject("A customer with this email address already exists");
        }
        return true;
    }),
    body("address")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Address must be between 5 and 255 characters"),
    //   body("dob")
    //     .isDate()
    //     .withMessage("Customer Date of Birth must be a valid date"),
];
export const customerRules = {
    filter: [query("name").optional({ checkFalsy: true }).trim(), ...filters],
    create: commonRules,
    read: [read("Customer")],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Customer id is required")
            .custom(async (id) => {
            const customer = await Customer.findByPk(id);
            if (customer === null) {
                throw new Error("Customer not found");
            }
            return true;
        }),
        ...commonRules,
    ],
    destroy: [destroy("Customer", async (pk) => await Customer.findByPk(pk))],
};
