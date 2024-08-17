import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { Product, User, WorkLog } = db;
const commonRules = [
    body("date")
        .trim()
        .notEmpty()
        .withMessage("Date is required")
        .isDate()
        .withMessage("Date must be a valid date"),
    body("labourCost")
        .trim()
        .notEmpty()
        .withMessage("Labour cost is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Labour cost must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Labour cost must be greater than or equal to 0")
        .toFloat(),
    body("quantity")
        .trim()
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be greater than 0")
        .toFloat(),
    body("amount")
        .trim()
        .notEmpty()
        .withMessage("Amount is required")
        .isInt({ min: 1 })
        .withMessage("Amount must be greater than 0")
        .toFloat(),
    body("productId")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Product Id is required")
        .bail()
        .custom(async (id) => {
        const product = await Product.findByPk(id);
        if (product === null) {
            throw new Error("Product not found");
        }
        return true;
    }),
    body("userId")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("User Id is required")
        .bail()
        .custom(async (id) => {
        const user = await User.findByPk(id);
        if (user === null) {
            throw new Error("User not found");
        }
        return true;
    }),
];
export const workLogRules = {
    filter: [
        queryWithFilter("userId", async (userId) => await User.findAll({
            where: {
                id: userId,
            },
        })),
        ...filters,
    ],
    create: [...commonRules],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("WorkLog Id is required")
            .custom(async (id) => {
            const workLog = await WorkLog.findByPk(id);
            if (workLog === null) {
                throw new Error("WorkLog not found");
            }
            return true;
        }),
        ...commonRules,
    ],
    read: [read("WorkLog")],
    destroy: [destroy("WorkLog", async (pk) => await WorkLog.findByPk(pk))],
};
