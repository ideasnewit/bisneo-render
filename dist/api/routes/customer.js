import { default as express } from "express";
import * as customerController from "../controllers/customer.js";
import { customerRules } from "../../middlewares/validators/rules/customer.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/:id")
    .get(customerRules.read, validate, customerController.read)
    .delete(customerRules.destroy, validate, customerController.destroy);
router
    .route("/")
    .get(customerRules.filter, validate, filter.customer, customerController.customers)
    .patch(customerRules.update, validate, customerController.update)
    .post(customerRules.create, validate, customerController.create);
