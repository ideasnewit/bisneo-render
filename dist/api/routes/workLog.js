import { default as express } from "express";
import * as workLogsController from "../controllers/workLog.js";
import { workLogRules } from "../../middlewares/validators/rules/workLog.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/:id")
    .get(workLogRules.read, validate, workLogsController.read)
    .delete(workLogRules.destroy, validate, workLogsController.destroy);
router
    .route("/")
    .get(workLogRules.filter, validate, filter.workLog, workLogsController.workLogs)
    .patch(workLogRules.update, validate, workLogsController.update)
    .post(workLogRules.create, validate, workLogsController.create);
