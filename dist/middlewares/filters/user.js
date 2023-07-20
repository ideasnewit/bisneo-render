import Sequelize from "sequelize";
import processFilters from "./processFilters.js";
const Op = Sequelize.Op;
export function user(req, res, next) {
    const { name, phone, email } = req.query;
    const conditions = [];
    // conditions.push({
    //     role: {
    //         [Op.ne]: `SUPERADMIN`
    //     }
    // });
    if (name) {
        conditions.push({
            name: {
                [Op.iLike]: `%${name}%`,
            },
        });
    }
    if (phone) {
        conditions.push({
            phone: {
                [Op.iLike]: `%${phone}%`,
            },
        });
    }
    if (email) {
        conditions.push({
            email: {
                [Op.iLike]: `%${email}%`,
            },
        });
    }
    processFilters(req, res, next, conditions);
}
