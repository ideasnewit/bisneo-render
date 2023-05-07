import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { User, UserPayment } = db;
const commonRules = [
    body("amount")
        .trim()
        .notEmpty()
        .withMessage("Amount is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Amount must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Amount must be greater than or equal to 0")
        .toFloat(),
    body("date")
        .trim()
        .notEmpty()
        .withMessage("Date is required")
        .isDate()
        .withMessage("Date must be a valid date"),
];
export const userPaymentRules = {
    filter: [
        queryWithFilter("userId", async (userId) => await User.findAll({
            where: {
                id: userId,
            },
        })),
        ...filters,
    ],
    create: [
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
        body("isPaid")
            .trim()
            .notEmpty()
            .withMessage("isPaid is required")
            .isBoolean()
            .withMessage("isPaid must be true or false"),
        ...commonRules,
    ],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Payment id is required")
            .custom(async (id) => {
            const product = await UserPayment.findByPk(id);
            if (product === null) {
                throw new Error("Payment not found");
            }
            return true;
        }),
        ...commonRules,
    ],
    read: [read("UserPayment")],
    destroy: [
        destroy("UserPayment", async (pk) => await UserPayment.findByPk(pk)),
    ],
};
