import { default as express } from "express";
import * as userController from "../controllers/user.js";
import { salaryRules } from "../../middlewares/validators/rules/salary.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/")
    .get(salaryRules.filter, validate, filter.salary, userController.salaries)
    .post(salaryRules.create, validate, userController.calculateSalary);
router
    .route("/info")
    .post(salaryRules.create, validate, userController.getSalaryInfo);
router
    .route("/approve")
    .post(salaryRules.create, validate, userController.approveSalary);
