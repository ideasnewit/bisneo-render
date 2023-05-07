import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
import moment from "moment";
const Op = Sequelize.Op;
export function stockHistory(req, res, next) {
    const { productId, fromDate, toDate } = req.query;
    const conditions = [];
    if (productId) {
        conditions.push({
            productId: productId,
        });
    }
    if (fromDate) {
        conditions.push({
            date: { [Op.gte]: fromDate },
        });
    }
    if (toDate) {
        conditions.push({
            date: {
                [Op.lte]: moment(toDate.toString()).add(1, "days").format("YYYY-MM-DD"),
            },
        });
    }
    processFilters(req, res, next, conditions);
}
