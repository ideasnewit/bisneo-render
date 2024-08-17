import { default as express } from "express";
import * as userController from "../controllers/user.js";
import { userPaymentRules } from "../../middlewares/validators/rules/userPayment.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/:id")
    .get(userPaymentRules.read, validate, userController.readPayment);
router
    .route("/")
    .get(userPaymentRules.filter, validate, filter.userPayment, userController.payments)
    .patch(userPaymentRules.update, validate, userController.editPayment)
    .post(userPaymentRules.create, validate, userController.pay);
