import { default as express } from "express";
import * as accountController from "../controllers/account.js";
import { userRules } from "../../middlewares/validators/rules/user.js";
import { simpleValidate } from "../../middlewares/validators/validate.js";
export const router = express.Router();
router
    .route("/login")
    .post(userRules.login, simpleValidate, accountController.login);
