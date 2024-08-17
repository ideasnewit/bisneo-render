import { default as express } from "express";
import * as userController from "../controllers/user.js";
import { userRules } from "../../middlewares/validators/rules/user.js";
import { validate } from "../../middlewares/validators/validate.js";
export const router = express.Router();
router
    .route("/get/:id")
    .get(userRules.read, validate, userController.readProfile);
router
    .route("/")
    .patch(userRules.updateProfile, validate, userController.updateProfile);
router
    .route("/change-password")
    .patch(userRules.changePassword, validate, userController.changePassword);
