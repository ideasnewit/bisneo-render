import { default as express } from "express";
import * as clientController from "../controllers/client.js";
import { clientPaymentRules } from "../../middlewares/validators/rules/clientPayment.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/")
    .get(clientPaymentRules.filter, validate, filter.clientPayment, clientController.payments)
    .post(clientPaymentRules.create, validate, clientController.pay);
router
    .route("/request-free-access")
    .post(clientPaymentRules.requestFreeAccess, validate, clientController.requestFreeAccess);
