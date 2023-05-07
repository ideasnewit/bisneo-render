import { body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import filters from "./libs/filters.js";
import { queryWithFilter } from "./libs/queryWithFilter.js";
const Op = Sequelize.Op;
const { User, Attendance } = db;
export const attendanceRules = {
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
    ],
    read: [read("Attendance")],
    destroy: [destroy("Attendance", async (pk) => await Attendance.findByPk(pk))],
};
