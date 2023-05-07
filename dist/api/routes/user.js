import { default as express } from "express";
import * as userController from "../controllers/user.js";
import { userRules } from "../../middlewares/validators/rules/user.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/:id")
    .get(userRules.read, validate, userController.read)
    .delete(userRules.destroy, validate, userController.destroy);
router
    .route("/")
    .get(userRules.filter, validate, filter.user, userController.users)
    .patch(userRules.update, validate, userController.update)
    .post(userRules.create, validate, userController.create);
