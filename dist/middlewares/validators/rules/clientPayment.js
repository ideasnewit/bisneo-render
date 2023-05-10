import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { Client, ClientPayment } = db;
export const clientPaymentRules = {
    filter: [
        queryWithFilter("clientId", async (clientId) => await Client.findAll({
            where: {
                id: clientId,
            },
        })),
        ...filters,
    ],
    create: [
        body("clientId")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Client Id is required")
            .bail()
            .custom(async (id) => {
            const client = await Client.findByPk(id);
            if (client === null) {
                throw new Error("Client not found");
            }
            return true;
        }),
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
    ],
    requestFreeAccess: [
        body("clientId")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Client Id is required")
            .bail()
            .custom(async (id) => {
            const client = await Client.findByPk(id);
            if (client === null) {
                throw new Error("Client not found");
            }
            return true;
        }),
    ],
    read: [read("ClientPayment")],
    destroy: [
        destroy("ClientPayment", async (pk) => await ClientPayment.findByPk(pk)),
    ],
};
