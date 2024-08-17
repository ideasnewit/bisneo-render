import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
import moment from "moment";
const Op = Sequelize.Op;
export function purchase(req, res, next) {
    const { supplierId, billNumber, product, fromDate, toDate, createdBy } = req.query;
    const conditions = [];
    if (supplierId) {
        conditions.push({
            supplierId: supplierId,
        });
    }
    // if (supplierPhone) {
    //     conditions.push({
    //         supplierId: supplierPhone
    //     });
    // }
    if (billNumber) {
        conditions.push({
            billNumber: billNumber,
        });
    }
    // if (product) {
    //     conditions.push({
    //         productId: product
    //     });
    // }
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
    if (createdBy) {
        conditions.push({
            createdBy: createdBy,
        });
    }
    processFilters(req, res, next, conditions);
}
