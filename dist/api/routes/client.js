import { default as express } from "express";
import * as clientController from "../controllers/client.js";
import { clientRules } from "../../middlewares/validators/rules/client.js";
import { simpleValidate, validate, } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/branches")
    .get(clientRules.filter, validate, filter.client, clientController.branches)
    .post(clientRules.createBranch, validate, clientController.addBranch);
router
    .route("/all-branches")
    .get(clientRules.filter, validate, filter.client, clientController.allBranches);
router.route("/update-status").patch(validate, clientController.updateStatus);
router
    .route("/:id")
    .get(clientRules.read, validate, clientController.read)
    .delete(clientRules.destroy, validate, clientController.destroy);
router
    .route("/")
    .get(clientRules.filter, validate, filter.client, clientController.clients)
    .patch(clientRules.update, validate, clientController.update)
    .post(clientRules.create, simpleValidate, clientController.create);
