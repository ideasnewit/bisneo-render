import sendEmail from "../../libs/email.js";
import { toDateTime } from "../../libs/index.js";
import db from "../../models/index.js";
const { sequelize, Transfer, Product, User } = db;
async function transfers(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Transfer.findAndCountAll({
            distinct: true,
            include: {
                model: Product,
                as: "product",
            },
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ transfers: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No transfers found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting transfers: ", error, "\n\n");
        next({ status: 500, error: "Db error getting transfers" });
    }
}
async function create(req, res) {
    try {
        const { productId, quantity, source, destination } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const product = await Product.findByPk(productId);
        if (product === null) {
            return res.status(400).json({
                error: "Product not found",
            });
        }
        let { store, counter } = product.dataValues;
        switch (source) {
            case "counter":
                if (quantity <= counter) {
                    counter -= quantity;
                    store += quantity;
                }
                else {
                    return res.status(400).json({
                        error: `Only ${counter} items are left in ${source}`,
                    });
                }
                break;
            case "store":
                if (quantity <= store) {
                    store -= quantity;
                    counter += quantity;
                }
                else {
                    return res.status(400).json({
                        error: `Only ${store} items are left in ${source}`,
                    });
                }
                break;
            default:
                return res.status(400).json({
                    error: `Source must be either 'store' or 'counter'`,
                });
        }
        return await sequelize.transaction(async (t) => {
            const [affectedProductRows] = await Product.update({ counter, store }, {
                where: { id: productId },
                transaction: t,
            });
            const transfer = await Transfer.create({
                clientId,
                productId,
                quantity,
                source,
                destination,
                createdBy: reqUser,
                updatedBy: reqUser,
            }, { transaction: t });
            if (affectedProductRows === 1 && transfer.dataValues) {
                const user = await User.findByPk(reqUser);
                let mailSubject = user?.name +
                    " trasnfered " +
                    quantity +
                    ' "' +
                    product?.name +
                    '" from ' +
                    source +
                    " to " +
                    destination +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, product, transfer, false));
                return res.status(201).json({ transfer });
            }
            else {
                throw new Error("Transfer not created. Please try again");
            }
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
async function read(req, res, next) {
    try {
        const transfer = await Transfer.findByPk(req.params.id, {
            include: [
                {
                    model: Product,
                    as: "product",
                },
            ],
        });
        if (transfer === null) {
            return res.status(400).json({
                error: "Transfer not found",
            });
        }
        else {
            return res.status(200).json({ transfer });
        }
    }
    catch (error) {
        console.log("\n\nError getting transfer: ", error, "\n\n");
        next({ status: 500, error: "Db error getting transfer" });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // const transfer = await Transfer.findByPk(id, {
        //     include: [{
        //         model: Product,
        //         as: "product"
        //     }],
        // });
        const { count, rows } = await Transfer.findAndCountAll({
            where: { id },
            include: [
                {
                    model: Product,
                    as: "product",
                },
            ],
        });
        const affectedRows = await Transfer.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} transfers` : "Transfer"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map((t) => {
                let mailSubject = user?.name +
                    " deleted the trasnfer " +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, t?.product, t?.dataValues, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} transfers` : "Transfer"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting transfer(s) ", error, "\n\n");
        next({ status: 500, error: "Db error deleting transfer(s)" });
    }
}
const getMailBody = (title, product, transfer, isCancel = false) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Transfer Details:</span></div>
    <div><span style="font-weight: bold;">Product Name: </span><span>${product?.name}</span></div>
    <div><span style="font-weight: bold;">Quantity: </span><span>${transfer?.quantity}</span></div>
    <div><span style="font-weight: bold;">Source: </span><span>${transfer?.source}</span></div>
    <div><span style="font-weight: bold;">Destination: </span><span>${transfer?.destination}</span></div>
    <div><span style="font-weight: bold;">Created At: </span><span>${toDateTime(transfer?.createdAt)}</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { transfers, create, read, destroy };
