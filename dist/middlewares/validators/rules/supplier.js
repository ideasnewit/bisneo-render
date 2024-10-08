import Sequelize from "sequelize";
import { query, body } from "express-validator";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import itemExists from "./libs/itemExists.js";
// import toTitleCase from "../../../libs/toTitleCase.js";
import filters from "./libs/filters.js";
const Op = Sequelize.Op;
const { Supplier } = db;
const commonRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Supplier's name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Supplier's name must be between 2 and 50 characters")
        .bail()
        .custom(async (name, { req }) => {
        const clientId = req.headers && req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const supplier = await Supplier.findOne({
            where: {
                clientId,
                name: {
                    [Op.iLike]: `${name}`,
                },
            },
        });
        if (itemExists(supplier, req.body.id)) {
            return Promise.reject("A supplier with this name already exists");
        }
        return true;
    }),
    // .customSanitizer((name: string) => {
    //   return toTitleCase(name);
    // }),
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Supplier's phone number is required")
        .isLength({ min: 4, max: 15 })
        .withMessage("A phone number must between 4 to 15 characters long.")
        // .isInt()
        // .withMessage("A phone number must be numerical")
        .bail()
        .custom(async (phone, { req }) => {
        const clientId = req.headers && req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const supplier = await Supplier.findOne({ where: { clientId, phone } });
        if (itemExists(supplier, req.body.id)) {
            return Promise.reject("A supplier with this phone number already exists");
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
        const supplier = await Supplier.findOne({ where: { clientId, email } });
        if (itemExists(supplier, req.body.id)) {
            return Promise.reject("A supplier with this email address already exists");
        }
        return true;
    }),
    body("address")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Address must be between 5 and 255 characters"),
];
export const supplierRules = {
    filter: [query("name").optional({ checkFalsy: true }).trim(), ...filters],
    create: commonRules,
    read: [read("Supplier")],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Supplier id is required")
            .custom(async (id) => {
            const supplier = await Supplier.findByPk(id);
            if (supplier === null) {
                throw new Error("Supplier not found");
            }
            return true;
        }),
        ...commonRules,
    ],
    destroy: [destroy("Supplier", async (pk) => await Supplier.findByPk(pk))],
    import: [
        body("suppliers").escape().notEmpty().withMessage("Suppliers required"),
    ],
};
