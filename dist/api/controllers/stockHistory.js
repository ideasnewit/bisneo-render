import db from "../../models/index.js";
import { toDate, toDateTime } from "../../libs/index.js";
import sendEmail from "../../libs/email.js";
const { sequelize, StockHistory, Product, User } = db;
async function stockHistorys(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await StockHistory.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: Product,
                    as: "product",
                },
                // {
                //     model: User,
                //     as: "createdBy"
                // },
                // {
                //     model: User,
                //     as: "updatedBy"
                // },
            ],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ stocks: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No Stock History found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting stock history: ", error, "\n\n");
        next({ status: 500, error: "Db error getting stock history" });
    }
}
async function create(req, res) {
    try {
        const { isAdd, productId, quantity, unitCost, unitPrice, location, date } = req.body;
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
        if (!isAdd) {
            if ((!location || location.length < 1 || location === "counter") &&
                product.dataValues.counter < quantity) {
                return res.status(400).json({
                    error: `Only ${product.dataValues.counter} items are left in counter`,
                });
            }
            else if (location === "store" && product.dataValues.store < quantity) {
                return res.status(400).json({
                    error: `Only ${product.dataValues.counter} items are left in store`,
                });
            }
        }
        return await sequelize.transaction(async (t) => {
            const stockHistory = await StockHistory.create({
                clientId,
                isAdd,
                productId,
                quantity,
                unitCost,
                unitPrice,
                location,
                date,
                createdBy: reqUser,
                updatedBy: reqUser,
            }, { transaction: t });
            let { store, counter } = product.dataValues;
            if (isAdd) {
                if (location === "store") {
                    store += quantity;
                }
                if (location === "counter") {
                    counter += quantity;
                }
            }
            else {
                if (location === "store") {
                    store -= quantity;
                }
                if (location === "counter") {
                    counter -= quantity;
                }
            }
            if (store < 0) {
                throw new Error("Stock History creation will result in a negative value for items in store");
            }
            if (counter < 0) {
                throw new Error("Stock History creation will result in a negative value for items in counter");
            }
            const [affectedProductRows] = await Product.update({ unitCost, unitPrice, store, counter, updatedBy: reqUser }, {
                where: { id: productId },
                transaction: t,
            });
            if (stockHistory.dataValues && affectedProductRows === 1) {
                const user = await User.findByPk(reqUser);
                let mailSubject = `${user?.name} ${isAdd ? " Added " : " Removed "} ${quantity} ${product.name} ${isAdd ? " to " : " from "} stock at ${toDate(date)}`;
                sendEmail(mailSubject, getMailBody(mailSubject, product, stockHistory, false));
                return res.status(201).json({ stock: stockHistory });
            }
            else {
                throw new Error("Stock History not created. Please try again");
            }
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
async function read(req, res, next) {
    try {
        const stockHistory = await StockHistory.findByPk(req.params.id, {
            include: [
                {
                    model: Product,
                    as: "product",
                },
            ],
        });
        if (stockHistory === null) {
            return res.status(400).json({
                error: "Stock History not found",
            });
        }
        else {
            return res.status(200).json({ stock: stockHistory });
        }
    }
    catch (error) {
        console.log("\n\nError getting Stock History: ", error, "\n\n");
        next({ status: 500, error: "Db error getting Stock History" });
    }
}
async function update(req, res) {
    try {
        const { id, isAdd, productId, quantity, unitCost, unitPrice, location, date, } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const stockHistory = await StockHistory.findByPk(id);
        if (stockHistory === null) {
            return res.status(400).json({
                error: "Stock History not found",
            });
        }
        const product = await Product.findByPk(productId);
        if (product === null) {
            return res.status(400).json({
                error: "Product not found",
            });
        }
        if (!isAdd && stockHistory.dataValues.quantity === quantity) {
            return res.status(200).json({
                message: "Stock History updated successfully",
            });
        }
        return await sequelize.transaction(async (t) => {
            let { store, counter } = product.dataValues;
            const prevLocation = stockHistory.dataValues.location;
            const prevQuantity = stockHistory.dataValues.quantity;
            // if (prevLocation !== location) {
            if (isAdd) {
                if (prevLocation === "store") {
                    store -= prevQuantity;
                }
                if (prevLocation === "counter") {
                    counter -= prevQuantity;
                }
            }
            else {
                if (prevLocation === "store") {
                    store += prevQuantity;
                }
                if (prevLocation === "counter") {
                    counter += prevQuantity;
                }
            }
            if (store < 0) {
                throw new Error("Stock History update will result in a negative value for items in store");
            }
            if (counter < 0) {
                throw new Error("Stock History update will result in a negative value for items in counter");
            }
            if (isAdd) {
                if (location === "store") {
                    store += quantity;
                }
                if (location === "counter") {
                    counter += quantity;
                }
            }
            else {
                if (location === "store") {
                    store -= quantity;
                }
                if (location === "counter") {
                    counter -= quantity;
                }
            }
            // }
            const [affectedStockHistoryRow] = await StockHistory.update({
                isAdd,
                productId,
                quantity,
                unitCost,
                unitPrice,
                location,
                date,
                updatedBy: reqUser,
            }, {
                where: { id },
                transaction: t,
            });
            const [affectedProductRow] = await Product.update({ store, counter, updatedBy: reqUser }, {
                where: { id: productId },
                transaction: t,
            });
            if (affectedStockHistoryRow === 1 && affectedProductRow === 1) {
                const user = await User.findByPk(reqUser);
                let mailSubject = `${user?.name} updated the stock - ${isAdd ? " Added " : " Removed "} ${quantity} ${product.name} ${isAdd ? " to " : " from "} stock at ${toDateTime(new Date())}`;
                sendEmail(mailSubject, getMailBody(mailSubject, product, stockHistory, false));
                return res.status(200).json({ stock: stockHistory });
            }
            else {
                throw new Error("Stock History not updated. Please try again");
            }
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // const stockHistory = await StockHistory.findByPk(id, {
        //     include: [{
        //         model: Product,
        //         as: "product"
        //     }],
        // });
        const { count, rows } = await StockHistory.findAndCountAll({
            where: { id },
            include: [
                {
                    model: Product,
                    as: "product",
                },
            ],
        });
        const affectedRows = await StockHistory.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} Stock Historys` : "Stock History"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map((s) => {
                const product = s?.dataValues.product;
                let mailSubject = `${user?.name} deleted the stock - ${s?.isAdd ? " Added " : " Removed "} ${s?.quantity} ${product.name} ${s?.isAdd ? " to " : " from "} stock at ${toDateTime(new Date())}`;
                sendEmail(mailSubject, getMailBody(mailSubject, product, s?.dataValues, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} Stock Historys` : "Stock History"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting Stock History(s) ", error, "\n\n");
        next({ status: 500, error: "Db error deleting Stock History(s)" });
    }
}
const getMailBody = (title, product, stockHistory, isCancel = false) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Stock Details:</span></div>
    <div><span style="font-weight: bold;">Product Name: </span><span>${product?.name}</span></div>
    <div><span style="font-weight: bold;">Quantity: </span><span>${stockHistory?.quantity}</span></div>
    <div><span style="font-weight: bold;">Unit Cost: </span><span>${stockHistory?.unitCost}</span></div>
    <div><span style="font-weight: bold;">Unit Price: </span><span>${stockHistory?.unitPrice}</span></div>
    <div><span style="font-weight: bold;">Date: </span><span>${toDate(stockHistory?.date)}</span></div>
    <div><span style="font-weight: bold;">Location: </span><span>${stockHistory?.location}</span></div>
    <div><span style="font-weight: bold;">Type: </span><span style="font-weight: bold; background-color: #FFFFFF; border-radius: 2px; padding: 3px; color: ${stockHistory?.isAdd ? "#298f31" : "#dc3545"};">${stockHistory?.isAdd ? "Added" : "Removed"}</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { stockHistorys, create, read, update, destroy };
