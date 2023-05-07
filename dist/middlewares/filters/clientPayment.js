import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
import moment from "moment";
const Op = Sequelize.Op;
export function clientPayment(req, res, next) {
    const { clientId, fromDate, toDate } = req.query;
    const conditions = [];
    if (clientId) {
        conditions.push({
            clientId: clientId,
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
