import Sequelize from "sequelize";
import getPagination from "./pagination.js";
const Op = Sequelize.Op;
export default function commonFilters(req, conditions) {
    const { sort, page, limit, from, to } = req.query; // common query params
    const clientId = req.headers["client-id"]
        ? req.headers["client-id"].toString()
        : "";
    // default ordering is "created_at desc"
    const order = sort || [
        ["createdAt", "desc"],
    ];
    const pagination = getPagination(page, limit);
    if (clientId) {
        conditions.push({
            clientId: clientId,
        });
    }
    if (from) {
        conditions.push({
            createdAt: { [Op.gte]: from },
        });
    }
    if (to) {
        conditions.push({
            createdAt: { [Op.lte]: to },
        });
    }
    let condition = {};
    if (conditions.length) {
        condition = {
            [Op.and]: [conditions],
        };
    }
    const filter = {
        where: condition,
        order,
    };
    if (pagination) {
        const { offset, limit } = pagination;
        filter.offset = offset;
        filter.limit = limit;
    }
    return {
        filter,
        pagination,
    };
}
