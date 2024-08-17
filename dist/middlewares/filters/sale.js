import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
import moment from "moment";
const Op = Sequelize.Op;
export function sale(req, res, next) {
    const { customerId, billNumber, fromDate, toDate, paymentType, createdBy, saleType } = req.query;
    const conditions = [];
    // if (product) {
    //     conditions.push({
    //         productId: product
    //     });
    // }
    //   if (customerName) {
    //     conditions.push({
    //       customerName: {
    //         [Op.like]: `%${customerName}%`,
    //       },
    //     });
    //   }
    // if (customerPhone) {
    //     conditions.push({
    //         customerPhone: {
    //             [Op.like]: `%${customerPhone}%`
    //         }
    //     });
    // }
    if (customerId) {
        conditions.push({
            customerId: customerId,
        });
    }
    if (billNumber) {
        conditions.push({
            billNumber: billNumber,
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
    if (paymentType) {
        conditions.push({
            paymentType: paymentType,
        });
    }
    if (createdBy) {
        conditions.push({
            createdBy: createdBy,
        });
    }
    if (saleType) {
        conditions.push({
            saleType: saleType,
        });
    }
    processFilters(req, res, next, conditions);
}
