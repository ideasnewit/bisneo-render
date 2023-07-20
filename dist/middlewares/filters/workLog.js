import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
import moment from "moment";
const Op = Sequelize.Op;
export function workLog(req, res, next) {
    const { userId, fromDate, toDate, productId } = req.query;
    const conditions = [];
    if (userId) {
        conditions.push({
            userId: userId,
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
    if (productId) {
        conditions.push({
            productId: productId
        });
    }
    processFilters(req, res, next, conditions);
}
