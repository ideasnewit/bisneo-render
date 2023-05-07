import { query, body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import itemExists from "./libs/itemExists.js";
import { description } from "./libs/description.js";
import toTitleCase from "../../../libs/toTitleCase.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { Category, Product } = db;
// categoryId, name, description, unitCost, unitPrice, store, counter
const commonRules = [
    body("categoryId")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Category id is required")
        .bail()
        .custom(async (id) => {
        const category = await Category.findByPk(id);
        if (category === null) {
            throw new Error("Category not found");
        }
        return true;
    }),
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Product code is required")
        .isLength({ min: 2, max: 25 })
        .withMessage("Product code must be between 2 and 25 characters")
        .bail()
        .custom(async (code, { req }) => {
        const product = await Product.findOne({ where: { code } });
        if (itemExists(product, req.body.id)) {
            return Promise.reject("A product with this code already exists");
        }
        return true;
    }),
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Product name must be between 2 and 50 characters")
        .bail()
        .custom(async (name, { req }) => {
        const product = await Product.findOne({ where: { name } });
        if (itemExists(product, req.body.id)) {
            return Promise.reject("A product with this name already exists");
        }
        return true;
    })
        .customSanitizer((name) => {
        return toTitleCase(name);
    }),
    description,
    body("unitCost")
        .trim()
        .notEmpty()
        .withMessage("Unit cost is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Unit cost must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Unit cost must be greater than or equal to 0")
        .toFloat(),
    body("unitPrice")
        .trim()
        .notEmpty()
        .withMessage("Unit price is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Unit price must not exceeding 2 decimal places")
        .isFloat({ min: 1.0 })
        .withMessage("Unit price must be greater than 0")
        .toFloat()
        .custom((unitPrice, { req }) => {
        if (unitPrice < req.body.unitCost) {
            throw new Error("Unit price must not be less than unit cost");
        }
        return true;
    }),
    body("taxPercentage")
        .trim()
        .notEmpty()
        .withMessage("Tax Percentage is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Tax Percentage must not exceeding 2 decimal places")
        .isFloat({ min: 0, max: 100 })
        .withMessage("Tax Percentage cannot be negative")
        .toFloat(),
    body("store")
        .trim()
        .notEmpty()
        .withMessage("Number of items in store is required")
        // .isInt({ min: 1 }).withMessage("Number of items in store must be greater than 0")
        .isInt({ min: 0 })
        .withMessage("Number of items in store cannot be negative")
        .toInt(),
    body("counter")
        .trim()
        .notEmpty()
        .withMessage("Number of items in counter is required")
        // .isInt({ min: 1 }).withMessage("Number of items in counter must be greater than 0")
        .isInt({ min: 0 })
        .withMessage("Number of items in counter cannot be negative")
        .toInt(),
];
export const productRules = {
    filter: [
        query("name").optional({ checkFalsy: true }).trim(),
        queryWithFilter("category", async (categoryName) => await Category.findAll({
            where: {
                name: { [Op.like]: `%${categoryName}%` },
            },
        })),
        ...filters,
    ],
    create: commonRules,
    read: [read("Product")],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Product id is required")
            .custom(async (id) => {
            const product = await Product.findByPk(id);
            if (product === null) {
                throw new Error("Product not found");
            }
            return true;
        }),
        ...commonRules,
    ],
    destroy: [destroy("Product", async (pk) => await Product.findByPk(pk))],
};
