import sendEmail from "../../libs/email.js";
import { toDate, toDateTime } from "../../libs/index.js";
import db from "../../models/index.js";
const { sequelize, Purchase, Product, Supplier, User } = db;
async function purchases(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Purchase.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: Product,
                    as: "product",
                },
                {
                    model: Supplier,
                    as: "supplier",
                },
            ],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ purchases: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No purchases found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting purchases: ", error, "\n\n");
        next({ status: 500, error: "Db error getting purchases" });
    }
}
async function create(req, res) {
    try {
        const { supplierId, productId, quantity, unitCost, unitPrice, discount, amountPaid, location, date, } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const supplier = await Supplier.findByPk(supplierId);
        if (supplier === null) {
            return res.status(400).json({
                error: "Supplier not found",
            });
        }
        const product = await Product.findByPk(productId);
        if (product === null) {
            return res.status(400).json({
                error: "Product not found",
            });
        }
        return await sequelize.transaction(async (t) => {
            const purchase = await Purchase.create({
                clientId,
                supplierId,
                productId,
                quantity,
                unitCost,
                unitPrice,
                discount,
                amountPaid,
                location,
                date,
                createdBy: reqUser,
                updatedBy: reqUser,
            }, { transaction: t });
            let { store, counter } = product.dataValues;
            if (location === "store") {
                store += quantity;
            }
            if (location === "counter") {
                counter += quantity;
            }
            if (store < 0) {
                throw new Error("Purchase creation will result in a negative value for items in store");
            }
            if (counter < 0) {
                throw new Error("Purchase creation will result in a negative value for items in counter");
            }
            const [affectedProductRows] = await Product.update({ unitCost, unitPrice, store, counter }, {
                where: { id: productId },
                transaction: t,
            });
            if (purchase.dataValues && affectedProductRows === 1) {
                const user = await User.findByPk(reqUser);
                let mailSubject = 'New purchase "' +
                    purchase.dataValues.billNumber +
                    '" is created by ' +
                    user?.name +
                    " at " +
                    toDate(date);
                sendEmail(mailSubject, getMailBody(mailSubject, product, supplier, purchase.dataValues, false));
                return res.status(201).json({ purchase });
            }
            else {
                throw new Error("Purchase not created. Please try again");
            }
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
async function read(req, res, next) {
    try {
        const purchase = await Purchase.findByPk(req.params.id, {
            include: [
                {
                    model: Product,
                    as: "product",
                },
                {
                    model: Supplier,
                    as: "supplier",
                },
            ],
        });
        if (purchase === null) {
            return res.status(400).json({
                error: "Purchase not found",
            });
        }
        else {
            return res.status(200).json({ purchase });
        }
    }
    catch (error) {
        console.log("\n\nError getting purchase: ", error, "\n\n");
        next({ status: 500, error: "Db error getting purchase" });
    }
}
async function update(req, res) {
    try {
        const { id, supplierId, productId, quantity, unitCost, unitPrice, discount, amountPaid, location, date, } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const purchase = await Purchase.findByPk(id);
        if (purchase === null) {
            return res.status(400).json({
                error: "Purchase not found",
            });
        }
        const supplier = await Supplier.findByPk(supplierId);
        if (supplier === null) {
            return res.status(400).json({
                error: "Supplier not found",
            });
        }
        const product = await Product.findByPk(productId);
        if (product === null) {
            return res.status(400).json({
                error: "Product not found",
            });
        }
        return await sequelize.transaction(async (t) => {
            let { store, counter } = product.dataValues;
            const prevLocation = purchase.dataValues.location;
            const prevQuantity = purchase.dataValues.quantity;
            // if (prevLocation !== location) {
            if (prevLocation === "store") {
                store -= prevQuantity;
            }
            if (prevLocation === "counter") {
                counter -= prevQuantity;
            }
            if (store < 0) {
                throw new Error("Purchase update will result in a negative value for items in store");
            }
            if (counter < 0) {
                throw new Error("Purchase update will result in a negative value for items in counter");
            }
            if (location === "store") {
                store += quantity;
            }
            if (location === "counter") {
                counter += quantity;
            }
            // }
            const [affectedPurchaseRow] = await Purchase.update({
                supplierId,
                productId,
                quantity,
                unitCost,
                unitPrice,
                discount,
                amountPaid,
                location,
                date,
                updatedBy: reqUser,
            }, {
                where: { id },
                transaction: t,
            });
            const [affectedProductRow] = await Product.update({ store, counter }, {
                where: { id: productId },
                transaction: t,
            });
            if (affectedPurchaseRow === 1 && affectedProductRow === 1) {
                const user = await User.findByPk(reqUser);
                let mailSubject = 'Purchase "' +
                    purchase.dataValues.billNumber +
                    '" is updated by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, product, supplier, purchase.dataValues, false));
                return res.status(200).json({ purchase });
            }
            else {
                throw new Error("Purchase not updated. Please try again");
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
        // const purchase = await Purchase.findByPk(req.params.id, {
        //     include: [
        //         {
        //             model: Product,
        //             as: "product"
        //         },
        //         {
        //             model: Supplier,
        //             as: "supplier"
        //         },
        //     ],
        // });
        const { count, rows } = await Purchase.findAndCountAll({
            where: { id },
            include: [
                {
                    model: Product,
                    as: "product",
                },
                {
                    model: Supplier,
                    as: "supplier",
                },
            ],
        });
        const affectedRows = await Purchase.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} purchases` : "Purchase"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map((p) => {
                let mailSubject = 'Purchase "' +
                    p?.dataValues.billNumber +
                    '" is deleted by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, p?.dataValues.product, p?.dataValues.supplier, p?.dataValues, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} purchases` : "Purchase"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting purchase(s) ", error, "\n\n");
        next({ status: 500, error: "Db error deleting purchase(s)" });
    }
}
const getMailBody = (title, product, supplier, purchase, isCancel = false) => {
    let discount = 0, quantity = 0, amountPaid = 0;
    if (purchase) {
        discount = purchase.discount;
        quantity = purchase.quantity;
        amountPaid = purchase.amountPaid;
    }
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Purchase Details:</span></div>
    <div><span style="font-weight: bold;">Bill Number: </span><span>${purchase?.billNumber}</span></div>
    <div><span style="font-weight: bold;">Product: </span><span>${product.name}</span></div>
    <div><span style="font-weight: bold;">Quantity: </span><span>${quantity}</span></div>
    <div><span style="font-weight: bold;">Unit Cost: </span><span>${product.unitCost}</span></div>
    <div><span style="font-weight: bold;">Unit Price: </span><span>${product.unitPrice}</span></div>
    <div><span style="font-weight: bold;">Total Amount: </span><span>${product.unitCost * quantity}</span></div>
    <div><span style="font-weight: bold;">Discount: </span><span>${discount}</span></div>
    <div><span style="font-weight: bold;">Total Amount after Discount: </span><span>${product.unitCost * quantity - discount}</span></div>
    <div><span style="font-weight: bold;">Amount Paid: </span><span>${amountPaid}</span></div>
    <div><span style="font-weight: bold;">Balance Amount: </span><span>${product.unitCost * quantity - discount - amountPaid}</span></div>
    <div><span style="font-weight: bold;">Purchase Date: </span><span>${toDate(purchase?.date)}</span></div>
    <div><span style="font-weight: bold;">Supplier Name: </span><span>${supplier?.name}</span></div>
    <div><span style="font-weight: bold;">Supplier Phone: </span><span>${supplier?.phone}</span></div>
    <div><span style="font-weight: bold;">Supplier Email: </span><span>${supplier?.email ? supplier?.email : ""}</span></div>
    <div><span style="font-weight: bold;">Supplier Address: </span><span>${supplier?.address ? supplier?.address : ""}</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { purchases, create, read, update, destroy };
