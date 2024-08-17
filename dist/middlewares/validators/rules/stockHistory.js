import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { StockHistory, Product, User } = db;
const commonRules = [
    body("productId")
        .trim().escape().notEmpty().withMessage("Product id is required").bail()
        .custom(async (id) => {
        const product = await Product.findByPk(id);
        if (product === null) {
            throw new Error("Product not found");
        }
        return true;
    }),
    body("quantity")
        .trim().notEmpty().withMessage("Quantity of items is required")
        .isInt({ min: 1 }).withMessage("Quantity of items must be greater than 0")
        .toInt(),
    body("unitCost")
        // .trim().notEmpty().withMessage("Unit cost is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Unit cost must not exceeding 2 decimal places")
        .isFloat({ min: 0 }).withMessage("Unit cost must be greater than or equal to 0")
        .toFloat(),
    body("unitPrice")
        // .trim().notEmpty().withMessage("Unit price is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Unit price must not exceeding 2 decimal places")
        .isFloat({ min: 1.00 }).withMessage("Unit price must be greater than 0")
        .toFloat()
        .custom((unitPrice, { req }) => {
        if (unitPrice && req.body.unitCost && unitPrice < req.body.unitCost) {
            throw new Error("Unit price must not be less than unit cost");
        }
        return true;
    }),
    body("location")
        .trim().notEmpty().withMessage("Location is required")
        .isAlpha().withMessage("Location must be alphabetic")
        .isIn(["store", "counter"]).withMessage("Valid locations are 'store' or 'counter'"),
    body("date")
        .trim().notEmpty().withMessage("Date is required")
        .isDate().withMessage("Date must be a valid date")
];
export const stockHistoryRules = {
    filter: [
        queryWithFilter("product", async (productName) => await Product.findAll({
            where: {
                name: { [Op.iLike]: `%${productName}%` }
            }
        })),
        ...filters,
    ],
    create: commonRules,
    read: [
        read("StockHistory"),
    ],
    update: [
        body("id")
            .trim().escape().notEmpty().withMessage("Stock History id is required").bail()
            .custom(async (id) => {
            const stockHistory = await StockHistory.findByPk(id);
            if (stockHistory === null) {
                throw new Error("Stock History not found");
            }
            return true;
        }),
        ...commonRules
    ],
    destroy: [
        destroy("StockHistory", async (pk) => await StockHistory.findByPk(pk)),
    ],
};
