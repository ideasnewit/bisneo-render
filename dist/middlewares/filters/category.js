import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
const Op = Sequelize.Op;
export function category(req, res, next) {
    const { name } = req.query;
    const conditions = [];
    if (name) {
        conditions.push({
            name: {
                [Op.iLike]: `%${name}%`,
            },
        });
    }
    processFilters(req, res, next, conditions);
}
