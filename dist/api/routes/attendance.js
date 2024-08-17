import { default as express } from "express";
import * as userController from "../controllers/user.js";
import { attendanceRules } from "../../middlewares/validators/rules/attendance.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/")
    .get(attendanceRules.filter, validate, filter.attendance, userController.attendanceList)
    .post(attendanceRules.create, validate, userController.logTime);
router
    .route("/status")
    .get(attendanceRules.filter, validate, filter.attendance, userController.loginStatus);
