import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
const Op = Sequelize.Op;
export function product(req, res, next) {
    const { code, name, category } = req.query;
    const conditions = [];
    if (code) {
        conditions.push({
            code: {
                [Op.like]: `%${code}%`,
            },
        });
    }
    if (name) {
        conditions.push({
            name: {
                [Op.like]: `%${name}%`,
            },
        });
    }
    if (category) {
        conditions.push({
            categoryId: category,
        });
    }
    processFilters(req, res, next, conditions);
}
