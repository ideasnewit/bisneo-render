import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
// import toTitleCase from "../../../libs/toTitleCase.js";
const Op = Sequelize.Op;
const { Product, Sale, Customer } = db;
const quantity = body("quantity")
    .trim()
    .notEmpty()
    .withMessage("Quantity of items sold is required")
    .isInt({ min: 1 })
    .withMessage("Quantity of items sold must be greater than 0")
    .toInt();
export const saleRules = {
    filter: [
        queryWithFilter("product", async (productName) => await Product.findAll({
            where: {
                name: { [Op.iLike]: `%${productName}%` },
            },
        })),
        ...filters,
    ],
    create: [
        body("products")
            .isArray()
            .withMessage("Products are required")
            .bail()
            .custom(async (products) => {
            let error = "";
            products.map(async (p) => {
                const product = await Product.findByPk(p.id);
                if (product === null) {
                    error += (error.length > 0 ? ", " : "") + p.name;
                }
            });
            if (error.length > 0) {
                throw new Error("Product not found : " + error);
            }
            return true;
        }),
        quantity,
        body("discount")
            .trim()
            .notEmpty()
            .withMessage("Discount is required")
            .isDecimal({ decimal_digits: "1,2" })
            .withMessage("Discount must not exceeding 2 decimal places")
            .isFloat({ min: 0 })
            .withMessage("Discount cannot be negative")
            .toFloat(),
        body("tax")
            .trim()
            .notEmpty()
            .withMessage("Tax is required")
            .isDecimal({ decimal_digits: "1,2" })
            .withMessage("Tax must not exceeding 2 decimal places")
            .isFloat({ min: 0 })
            .withMessage("Tax cannot be negative")
            .toFloat(),
        body("loadingCharge")
            .trim()
            .notEmpty()
            .withMessage("Loading Charge is required")
            .isDecimal({ decimal_digits: "1,2" })
            .withMessage("Loading Charge must not exceeding 2 decimal places")
            .isFloat({ min: 0 })
            .withMessage("Loading Charge cannot be negative")
            .toFloat(),
        body("unLoadingCharge")
            .trim()
            .notEmpty()
            .withMessage("Unloading Charge is required")
            .isDecimal({ decimal_digits: "1,2" })
            .withMessage("Unloading Charge must not exceeding 2 decimal places")
            .isFloat({ min: 0 })
            .withMessage("Unloading Charge cannot be negative")
            .toFloat(),
        body("transportCharge")
            .trim()
            .notEmpty()
            .withMessage("Transport Charge is required")
            .isDecimal({ decimal_digits: "1,2" })
            .withMessage("Transport Charge must not exceeding 2 decimal places")
            .isFloat({ min: 0 })
            .withMessage("Transport Charge cannot be negative")
            .toFloat(),
        body("amountReceived")
            .trim()
            .notEmpty()
            .withMessage("Amount Received is required")
            .isDecimal({ decimal_digits: "1,2" })
            .withMessage("Amount Received must not exceeding 2 decimal places")
            .isFloat({ min: 0 })
            .withMessage("Amount Received cannot be negative")
            .toFloat(),
        body("date")
            .trim()
            .notEmpty()
            .withMessage("Sales Date is required")
            .isDate()
            .withMessage("Sale Date must be a valid date"),
        body("paymentType")
            .trim()
            .notEmpty()
            .withMessage("Payment Type is required"),
        body("saleType").trim().notEmpty().withMessage("Sale Type is required"),
        body("customerId")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Customer id is required")
            .bail()
            .custom(async (id) => {
            const customer = await Customer.findByPk(id);
            if (customer === null) {
                throw new Error("Customer not found");
            }
            return true;
        }),
    ],
    read: [read("Sale")],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Sale id is required")
            .bail()
            .custom(async (id) => {
            const sale = await Sale.findByPk(id);
            if (sale === null) {
                throw new Error("Sale not found");
            }
            return true;
        }),
        quantity,
    ],
    destroy: [destroy("Sale", async (pk) => await Sale.findByPk(pk))],
};
