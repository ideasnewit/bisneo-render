import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
import moment from "moment";
const Op = Sequelize.Op;
export function attendance(req, res, next) {
    const { userId, fromDate, toDate } = req.query;
    const conditions = [];
    if (userId) {
        conditions.push({
            userId: userId,
        });
    }
    if (fromDate) {
        conditions.push({
            inTime: { [Op.gte]: fromDate },
        });
    }
    if (toDate) {
        conditions.push({
            outTime: {
                [Op.lte]: moment(toDate.toString()).add(1, "days").format("YYYY-MM-DD"),
            },
        });
    }
    processFilters(req, res, next, conditions, true);
}
