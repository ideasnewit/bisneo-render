import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
const Op = Sequelize.Op;
export function supplier(req, res, next) {
    const { name, phone, email } = req.query;
    const conditions = [];
    if (name) {
        conditions.push({
            name: {
                [Op.like]: `%${name}%`
            }
        });
    }
    if (phone) {
        conditions.push({
            phone: {
                [Op.like]: `%${phone}%`
            }
        });
    }
    if (email) {
        conditions.push({
            email: {
                [Op.like]: `%${email}%`
            }
        });
    }
    processFilters(req, res, next, conditions);
}
