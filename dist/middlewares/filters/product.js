import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
const Op = Sequelize.Op;
export function product(req, res, next) {
    const { code, name, categoryId } = req.query;
    const conditions = [];
    if (code) {
        conditions.push({
            code: {
                [Op.iLike]: `%${code}%`,
            },
        });
    }
    if (name) {
        conditions.push({
            name: {
                [Op.iLike]: `%${name}%`,
            },
        });
    }
    if (categoryId) {
        conditions.push({
            categoryId: categoryId,
        });
    }
    processFilters(req, res, next, conditions);
}
