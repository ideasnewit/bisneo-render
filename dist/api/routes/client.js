import { default as express } from "express";
import * as clientController from "../controllers/client.js";
import { clientRules } from "../../middlewares/validators/rules/client.js";
import { clientPaymentRules } from "../../middlewares/validators/rules/clientPayment.js";
import { simpleValidate, validate, } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/:id")
    .get(clientRules.read, validate, clientController.read)
    .delete(clientRules.destroy, validate, clientController.destroy);
router
    .route("/")
    .get(clientRules.filter, validate, filter.customer, clientController.clients)
    .patch(clientRules.update, validate, clientController.update)
    .post(clientRules.create, simpleValidate, clientController.create);
router
    .route("/payment")
    .get(clientPaymentRules.filter, validate, filter.clientPayment, clientController.payments)
    .post(clientPaymentRules.create, validate, clientController.pay);
