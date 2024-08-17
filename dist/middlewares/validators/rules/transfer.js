import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { Product, Transfer } = db;
export const transferRules = {
    filter: [
        queryWithFilter("product", async (productName) => await Product.findAll({
            where: {
                name: { [Op.iLike]: `%${productName}%` }
            }
        })),
        ...filters,
    ],
    create: [
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
            .trim().notEmpty().withMessage("Quantity of items to transfer is required")
            .isInt({ min: 1 }).withMessage("Quantity of items to transfer must be greater than 0")
            .toInt(),
        body("source")
            .trim().notEmpty().withMessage("Source location is required")
            .isAlpha().withMessage("Source location must be alphabetic")
            .isIn(["store", "counter"]).withMessage("Valid source locations are 'store' or 'counter'"),
        body("destination")
            .trim().notEmpty().withMessage("Destination location is required")
            .isAlpha().withMessage("Destination location must be alphabetic")
            .isIn(["store", "counter"]).withMessage("Valid destination locations are 'store' or 'counter'"),
    ],
    read: [
        read("Transfer"),
    ],
    destroy: [
        destroy("Transfer", async (pk) => await Transfer.findByPk(pk)),
    ],
};
