import { default as express } from "express";
import * as reportsController from "../controllers/reports.js";
import { saleRules } from "../../middlewares/validators/rules/sale.js";
import { validate } from "../../middlewares/validators/validate.js";
import filter from "../../middlewares/filters/index.js";
import { productRules } from "../../middlewares/validators/rules/product.js";
export const router = express.Router();
router
    .route("/summary")
    .get(saleRules.filter, validate, filter.sale, reportsController.summary);
router.route("/count").get(validate, reportsController.count);
router
    .route("/sales")
    .get(saleRules.filter, validate, filter.sale, reportsController.sales);
router
    .route("/productsales")
    .get(saleRules.filter, validate, filter.sale, reportsController.productSales);
router
    .route("/stockcount")
    .get(saleRules.filter, validate, filter.sale, reportsController.stockCount);
router
    .route("/pendingbills")
    .get(saleRules.filter, validate, filter.sale, reportsController.pendingBills);
router
    .route("/outofstockproducts")
    .get(productRules.filter, validate, filter.product, reportsController.outOfStockProducts);
router
    .route("/topsellingproducts")
    .get(productRules.filter, validate, filter.product, reportsController.topSellingProducts);
router
    .route("/topbuyingcustomers")
    .get(productRules.filter, validate, filter.product, reportsController.topBuyingCustomers);
router
    .route("/topsellingusers")
    .get(productRules.filter, validate, filter.product, reportsController.topSellingUsers);
router
    .route("/topbuyingusers")
    .get(productRules.filter, validate, filter.product, reportsController.topBuyingUsers);
router
    .route("/activeusers")
    .get(productRules.filter, validate, filter.product, reportsController.activeUsers);
router
    .route("/pendingtransactions")
    .get(productRules.filter, validate, filter.product, reportsController.pendingTransactions);
