import { default as express } from "express";
import * as stockHistoryController from "../controllers/stockHistory.js";
import { stockHistoryRules } from "../../middlewares/validators/rules/stockHistory.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router.route("/:id")
    .get(stockHistoryRules.read, validate, stockHistoryController.read)
    .delete(stockHistoryRules.destroy, validate, stockHistoryController.destroy);
router.route("/")
    .get(stockHistoryRules.filter, validate, filter.stockHistory, stockHistoryController.stockHistorys)
    .patch(stockHistoryRules.update, validate, stockHistoryController.update)
    .post(stockHistoryRules.create, validate, stockHistoryController.create);
