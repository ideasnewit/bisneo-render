import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
const Op = Sequelize.Op;
const { Sale, AmountReceived } = db;
const amount = body("amount")
    .trim().notEmpty().withMessage("Amount is required")
    .isDecimal({ decimal_digits: "1,2" })
    .withMessage("Amount must not exceeding 2 decimal places")
    .isFloat({ min: 0 }).withMessage("Amount cannot be negative")
    .toFloat();
export const amountReceivedRules = {
    filter: [
        ...filters,
    ],
    create: [
        body("saleId")
            .trim().escape().notEmpty().withMessage("Sale id is required").bail()
            .custom(async (id) => {
            const sale = await Sale.findByPk(id);
            if (sale === null) {
                throw new Error("Sale not found");
            }
            return true;
        }),
        amount,
    ],
    read: [
        read("AmountReceived"),
    ],
    update: [
        body("id")
            .trim().escape().notEmpty().withMessage("Amount Received id is required").bail()
            .custom(async (id) => {
            const sale = await AmountReceived.findByPk(id);
            if (sale === null) {
                throw new Error("Amount Received not found");
            }
            return true;
        }),
        amount,
    ],
    destroy: [
        destroy("AmountReceived", async (pk) => await AmountReceived.findByPk(pk)),
    ],
};
