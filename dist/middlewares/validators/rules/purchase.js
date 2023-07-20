import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { Purchase, Supplier, Product } = db;
const commonRules = [
    body("supplierId")
        .trim().escape().notEmpty().withMessage("Supplier id is required").bail()
        .custom(async (id) => {
        const supplier = await Supplier.findByPk(id);
        if (supplier === null) {
            throw new Error("Supplier not found");
        }
        return true;
    }),
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
        .trim().notEmpty().withMessage("Quantity of items purchased is required")
        .isInt({ min: 1 }).withMessage("Quantity of items purchased must be greater than 0")
        .toInt(),
    body("unitCost")
        .trim().notEmpty().withMessage("Unit cost is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Unit cost must not exceeding 2 decimal places")
        .isFloat({ min: 1.00 }).withMessage("Unit cost must be greater than 0")
        .toFloat(),
    body("unitPrice")
        .trim().notEmpty().withMessage("Unit price is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Unit price must not exceeding 2 decimal places")
        .isFloat({ min: 1.00 }).withMessage("Unit price must be greater than 0")
        .toFloat()
        .custom((unitPrice, { req }) => {
        if (unitPrice < req.body.unitCost) {
            throw new Error("Unit price must not be less than unit cost");
        }
        return true;
    }),
    body("discount")
        .trim().notEmpty().withMessage("Discount is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Discount must not exceeding 2 decimal places")
        .isFloat({ min: 0 }).withMessage("Discount cannot be negative")
        .toFloat(),
    body("amountPaid")
        .trim().notEmpty().withMessage("Amount Paid is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Amount Paid must not exceeding 2 decimal places")
        .isFloat({ min: 0 }).withMessage("Amount Paid cannot be negative")
        .toFloat(),
    body("location")
        .trim().notEmpty().withMessage("Location is required")
        .isAlpha().withMessage("Location must be alphabetic")
        .isIn(["store", "counter"]).withMessage("Valid locations are 'store' or 'counter'"),
    body("date")
        .trim().notEmpty().withMessage("Purchase Date is required")
        .isDate().withMessage("Purchase Date must be a valid date")
];
export const purchaseRules = {
    filter: [
        queryWithFilter("supplier", async (supplierName) => await Supplier.findAll({
            where: {
                name: { [Op.iLike]: `%${supplierName}%` }
            }
        })),
        queryWithFilter("product", async (productName) => await Product.findAll({
            where: {
                name: { [Op.iLike]: `%${productName}%` }
            }
        })),
        ...filters,
    ],
    create: commonRules,
    read: [
        read("Purchase"),
    ],
    update: [
        body("id")
            .trim().escape().notEmpty().withMessage("Purchase id is required").bail()
            .custom(async (id) => {
            const purchase = await Purchase.findByPk(id);
            if (purchase === null) {
                throw new Error("Purchase not found");
            }
            return true;
        }),
        ...commonRules
    ],
    destroy: [
        destroy("Purchase", async (pk) => await Purchase.findByPk(pk)),
    ],
};
