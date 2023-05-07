import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
import moment from "moment";
const Op = Sequelize.Op;
export function userPayment(req, res, next) {
    const { userId, fromDate, toDate } = req.query;
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
    processFilters(req, res, next, conditions);
}
