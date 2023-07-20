import { query, body } from "express-validator";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import itemExists from "./libs/itemExists.js";
import toTitleCase from "../../../libs/toTitleCase.js";
import filters from "./libs/filters.js";
const { User } = db;
// name, description
const commonRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters")
        .bail()
        .customSanitizer((name) => {
        return toTitleCase(name);
    }),
    body("userName")
        .trim()
        .notEmpty()
        .withMessage("User Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("User Name must be between 2 and 50 characters")
        .bail()
        .custom(async (userName, { req }) => {
        const clientId = req.headers && req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const user = await User.findOne({ where: { clientId, userName } });
        if (itemExists(user, req.body.id)) {
            return Promise.reject("A user with this user name already exists");
        }
        return true;
    }),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 50 })
        .withMessage("Password must be between 8 and 50 characters")
        .bail(),
    body("role")
        .trim()
        .notEmpty()
        .withMessage("Role is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Role must be between 2 and 50 characters")
        .bail(),
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("User's phone number is required")
        .isLength({ min: 10, max: 10 })
        .withMessage("A phone number must be 10 characters long")
        .isInt()
        .withMessage("A phone number must be numerical")
        .bail()
        .custom(async (phone, { req }) => {
        const clientId = req.headers && req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const user = await User.findOne({ where: { clientId, phone } });
        if (itemExists(user, req.body.id)) {
            return Promise.reject("A user with this phone number already exists");
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
        const user = await User.findOne({ where: { clientId, email } });
        if (itemExists(user, req.body.id)) {
            return Promise.reject("A user with this email address already exists");
        }
        return true;
    }),
    body("address")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Address must be between 5 and 255 characters"),
    body("paymentRate")
        .trim()
        .notEmpty()
        .withMessage("Payment Rate is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Payment Rate must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Payment Rate cannot be negative")
        .toFloat(),
    body("paymentTerm")
        .trim()
        .notEmpty()
        .withMessage("Payment Term is required")
        .isAlpha()
        .withMessage("Payment Term must be alphabetic")
        .isIn(["hour", "day", "week", "month"])
        .withMessage("Valid source locations are 'hour', 'day', 'week', 'month'"),
];
export const userRules = {
    login: [
        body("userName")
            .trim()
            .notEmpty()
            .withMessage("User Name is required")
            .isLength({ min: 2, max: 50 })
            .withMessage("User Name must be between 2 and 50 characters")
            .bail(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 2, max: 50 })
            .withMessage("Password must be between 2 and 50 characters")
            .bail(),
    ],
    filter: [query("name").optional({ checkFalsy: true }).trim(), ...filters],
    create: commonRules,
    read: [read("User")],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("User id is required")
            .custom(async (id) => {
            const user = await User.findByPk(id);
            if (user === null) {
                throw new Error("User not found");
            }
            return true;
        }),
        ...commonRules,
    ],
    destroy: [destroy("User", async (pk) => await User.findByPk(pk))],
    updateProfile: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("User id is required")
            .custom(async (id) => {
            const user = await User.findByPk(id);
            if (user === null) {
                throw new Error("User not found");
            }
            return true;
        }),
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 2, max: 50 })
            .withMessage("Name must be between 2 and 50 characters")
            .bail()
            .customSanitizer((name) => {
            return toTitleCase(name);
        }),
        body("userName")
            .trim()
            .notEmpty()
            .withMessage("User Name is required")
            .isLength({ min: 2, max: 50 })
            .withMessage("User Name must be between 2 and 50 characters")
            .bail()
            .custom(async (userName, { req }) => {
            const clientId = req.headers && req.headers["client-id"]
                ? req.headers["client-id"].toString()
                : "";
            const user = await User.findOne({ where: { clientId, userName } });
            if (itemExists(user, req.body.id)) {
                return Promise.reject("A user with this user name already exists");
            }
            return true;
        }),
        body("phone")
            .trim()
            .notEmpty()
            .withMessage("User's phone number is required")
            .isLength({ min: 10, max: 15 })
            .withMessage("A phone number must be 10 characters long")
            .isInt()
            .withMessage("A phone number must be numerical")
            .bail()
            .custom(async (phone, { req }) => {
            const clientId = req.headers && req.headers["client-id"]
                ? req.headers["client-id"].toString()
                : "";
            const user = await User.findOne({ where: { clientId, phone } });
            if (itemExists(user, req.body.id)) {
                return Promise.reject("A user with this phone number already exists");
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
            const user = await User.findOne({ where: { clientId, email } });
            if (itemExists(user, req.body.id)) {
                return Promise.reject("A user with this email address already exists");
            }
            return true;
        }),
        body("address")
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ min: 5, max: 255 })
            .withMessage("Address must be between 5 and 255 characters"),
    ],
    changePassword: [
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8, max: 50 })
            .withMessage("Password must be between 8 and 50 characters")
            .bail(),
        body("oldPassword")
            .trim()
            .notEmpty()
            .withMessage("Current Password is required")
            .isLength({ min: 8, max: 50 })
            .withMessage("Current must be between 8 and 50 characters")
            .bail(),
    ],
};
