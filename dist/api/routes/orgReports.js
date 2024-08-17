import { default as express } from "express";
import * as orgReportsController from "../controllers/orgReports.js";
import { saleRules } from "../../middlewares/validators/rules/sale.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
export const router = express.Router();
router
    .route("/sales")
    .get(saleRules.filter, validate, filter.orgSale, orgReportsController.sales);
