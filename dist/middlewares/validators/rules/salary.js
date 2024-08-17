import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { User, Salary } = db;
export const salaryRules = {
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
        // body("amount")
        //   .trim()
        //   .notEmpty()
        //   .withMessage("Amount is required")
        //   .isDecimal({ decimal_digits: "1,2" })
        //   .withMessage("Amount must not exceeding 2 decimal places")
        //   .isFloat({ min: 0 })
        //   .withMessage("Amount must be greater than or equal to 0")
        //   .toFloat(),
        // body("fromDate")
        //   .trim()
        //   .notEmpty()
        //   .withMessage("From Date is required")
        //   .isDate()
        //   .withMessage("From Date must be a valid date"),
        // body("toDate")
        //   .trim()
        //   .notEmpty()
        //   .withMessage("To Date is required")
        //   .isDate()
        //   .withMessage("To Date must be a valid date"),
    ],
    read: [read("Salary")],
    destroy: [destroy("Salary", async (pk) => await Salary.findByPk(pk))],
};
