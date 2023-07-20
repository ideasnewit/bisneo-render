import Sequelize from "sequelize";
import sendEmail from "../../libs/email.js";
import { percentage, toDate, toDateTime } from "../../libs/index.js";
// import { AmountReceived } from "../../models/amountReceived.js";
// import { SaleProduct } from "../../models/saleProduct";
import db from "../../models/index.js";
const Op = Sequelize.Op;
const { sequelize, Sale, Product, SaleProduct, AmountReceived, User, Customer, } = db;
const SHOW_PROFIT = process.env.SHOW_PROFIT;
async function sales(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Sale.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: Customer,
                    as: "customer",
                },
                {
                    model: SaleProduct,
                    as: "products",
                    include: [
                        {
                            model: Product,
                            as: "product",
                        },
                    ],
                },
                {
                    model: AmountReceived,
                    as: "amountReceiveds",
                },
            ],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ sales: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No sales found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting sales: ", error, "\n\n");
        next({ status: 500, error: "Db error getting sales" });
    }
}
async function create(req, res) {
    try {
        const { products, discount, tax, loadingCharge, unLoadingCharge, transportCharge, amountReceived, date, paymentType, saleType, customerId, } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        if (!products || products.length < 0) {
            return res.status(400).json({
                error: "Products not found",
            });
        }
        let productIds = [];
        products.map((p) => {
            productIds.push(p.id);
        });
        const { count, rows } = await Product.findAndCountAll({
            distinct: true,
            where: {
                id: { [Op.in]: productIds },
            },
        });
        if (productIds.length != count) {
            // let productNames = "";
            // rows.filter((p: any) => productIds.indexOf(p.id) < 0).map((p: any) => {
            //     productNames += (productNames.length > 0 ? ", " : "") + p.dataValues.name;
            // });
            return res.status(400).json({
                error: "Products not found",
            });
        }
        let error = "";
        rows.map((p) => {
            let cp = products.find((ip) => ip.id === p.dataValues.id);
            if (p.dataValues.counter < cp.quantity) {
                error +=
                    (error.length > 0 ? ", " : "") +
                        `Only ${p.counter} items are left in counter of ${p.name}`;
            }
        });
        if (error.length > 0) {
            return res.status(400).json({
                error: error,
            });
        }
        // const product = await Product.findByPk(productId);
        // if (product === null) {
        //     return res.status(400).json({
        //         error: "Product not found"
        //     });
        // } else if (product.dataValues!.counter < quantity) {
        //     return res.status(400).json({
        //         error: `Only ${product.dataValues!.counter} items are left in counter`
        //     });
        // }
        return await sequelize.transaction(async (t) => {
            // const sale = await Sale.create({ productId, quantity, unitCost: product.unitCost, unitPrice: product.unitPrice, discount, date, customerName, customerPhone, customerEmail, customerAddress, createdBy: reqUser, updatedBy: reqUser }, { transaction: t });
            // // deduct quantity items from product
            // const counter = product.dataValues!.counter - quantity;
            // const [affectedProductRows] = await Product.update({ counter, updatedBy: reqUser }, {
            //     where: { id: productId }, transaction: t
            // });
            const sale = await Sale.create({
                clientId,
                discount,
                tax,
                loadingCharge,
                unLoadingCharge,
                transportCharge,
                date,
                paymentType,
                saleType,
                customerId,
                createdBy: reqUser,
                updatedBy: reqUser,
            }, { transaction: t });
            // deduct quantity items from product
            let affectedProducts = 0;
            rows.map(async (p) => {
                let cp = products.find((ip) => ip.id === p.dataValues.id);
                const counter = p.dataValues.counter - cp.quantity;
                const [affectedProductRows] = await Product.update({ counter, updatedBy: reqUser }, {
                    where: { id: p.id },
                    transaction: t,
                });
                if (affectedProductRows === 1) {
                    affectedProducts += 1;
                }
                // add products in SaleProduct table
                const affectedSaleProductRow = await SaleProduct.create({
                    clientId: clientId,
                    saleId: sale.id,
                    productId: p.id,
                    quantity: cp.quantity,
                    unitCost: cp.unitCost,
                    unitPrice: cp.unitPrice,
                    tax: cp.tax,
                    createdBy: reqUser,
                    updatedBy: reqUser,
                }, { transaction: t });
            });
            // create row in AmountReceived
            const affectedAmountReceivedRow = await AmountReceived.create({
                clientId: clientId,
                saleId: sale.id,
                amount: amountReceived,
                createdBy: reqUser,
                updatedBy: reqUser,
            }, { transaction: t });
            if (sale.dataValues &&
                affectedProducts === products.length &&
                affectedAmountReceivedRow) {
                const customer = await Customer.findByPk(customerId);
                const user = await User.findByPk(reqUser);
                let mailSubject = 'New sale "' +
                    sale.dataValues.billNumber +
                    '" is created by ' +
                    user?.name +
                    " at " +
                    toDate(date);
                sendEmail(mailSubject, getMailBody(mailSubject, products, sale.dataValues, [{ amount: amountReceived, createdAt: new Date() }], customer, false));
                return res.status(201).json({ sale });
            }
            else {
                throw new Error("Sale not created. Please try again");
            }
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
async function cancelSale(req, res) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const sale = await Sale.findByPk(id, {
            include: [
                {
                    model: SaleProduct,
                    as: "products",
                },
                {
                    model: AmountReceived,
                    as: "amountReceiveds",
                },
            ],
        });
        if (sale === null) {
            return res.status(400).json({
                error: "Sale not found",
            });
        }
        return await sequelize.transaction(async (t) => {
            let error = "";
            let affectedProducts = 0;
            let products = [];
            if (sale.dataValues &&
                sale.dataValues.products &&
                sale.dataValues.products.length > 0) {
                sale.dataValues.products.map(async (p) => {
                    const product = await Product.findByPk(p.dataValues.productId);
                    if (product && product.dataValues.id) {
                        products.push({
                            ...p.dataValues,
                            name: product?.dataValues && product?.dataValues.name
                                ? product?.dataValues.name
                                : "",
                        });
                        // update counter value in Product
                        const counter = product.dataValues.counter + p.dataValues.quantity;
                        const [affectedProductRows] = await Product.update({ counter, updatedBy: reqUser }, {
                            where: { id: product.dataValues.id },
                            transaction: t,
                        });
                        if (affectedProductRows === 1) {
                            affectedProducts += 1;
                        }
                    }
                    else {
                        error = "Product not found";
                    }
                });
            }
            if (error.length > 0) {
                return res.status(400).json({
                    error: "",
                });
            }
            // delete rows in SaleProduct and AmountReceived
            const affectedSPRows = await SaleProduct.destroy({
                where: { saleId: id },
            });
            const affectedARRows = await AmountReceived.destroy({
                where: { saleId: id },
            });
            // delete a row in sale
            const affectedSaleRows = await Sale.destroy({
                where: { id: id },
                transaction: t,
            });
            if (affectedProducts === sale.dataValues.products.length &&
                affectedSaleRows === 1) {
                const customer = await Customer.findByPk(sale?.dataValues?.customerId);
                const user = await User.findByPk(reqUser);
                let mailSubject = 'Sale "' +
                    sale.dataValues.billNumber +
                    '" is Canceled by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, products, sale?.dataValues, sale.amountReceiveds, customer, true));
                return res.status(200).json({
                    message: "Sale cancelled successfully",
                });
            }
            else {
                throw new Error("Sale not cancelled. Please try again");
            }
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
async function read(req, res, next) {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                {
                    model: Customer,
                    as: "customer",
                },
                {
                    model: SaleProduct,
                    as: "products",
                    include: [
                        {
                            model: Product,
                            as: "product",
                        },
                    ],
                },
                {
                    model: AmountReceived,
                    as: "amountReceiveds",
                },
            ],
        });
        if (sale === null) {
            return res.status(400).json({
                error: "Sale not found",
            });
        }
        else {
            return res.status(200).json({ sale });
        }
    }
    catch (error) {
        console.log("\n\nError getting sale: ", error, "\n\n");
        next({ status: 500, error: "Db error getting sale" });
    }
}
async function update(req, res) {
    try {
        const { id, discount, tax, loadingCharge, unLoadingCharge, transportCharge, paymentType, saleType, date, customerId, } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const sale = await Sale.findByPk(id, {
            include: [
                {
                    model: SaleProduct,
                    as: "products",
                },
                {
                    model: AmountReceived,
                    as: "amountReceiveds",
                },
            ],
        });
        if (sale === null) {
            return res.status(400).json({
                error: "Sale not found",
            });
        }
        // const product = await Product.findByPk(sale.dataValues!.productId);
        // if (product === null) {
        //     return res.status(400).json({
        //         error: "Product not found"
        //     });
        // }
        // if (sale.dataValues!.quantity === quantity) {
        //     sendEmail(mailSubject, getMailBody(mailSubject, product, {...sale.dataValues, quantity, discount, date, customerName, customerPhone, customerEmail, customerAddress} as ObjSale, sale.dataValues!.amountReceiveds, false));
        //     return res.status(200).json({
        //         message: "Sale updated successfully"
        //     });
        // }
        return await sequelize.transaction(async (t) => {
            // const counter = product.dataValues!.counter + sale.dataValues!.quantity - quantity;
            // const [affectedProductRows] = await Product.update({ counter, updatedBy: reqUser }, {
            //     where: { id: product.dataValues!.id }, transaction: t
            // });
            let [affectedSaleRows] = await Sale.update({
                discount,
                tax,
                loadingCharge,
                unLoadingCharge,
                transportCharge,
                date,
                paymentType,
                saleType,
                customerId,
                updatedBy: reqUser,
            }, {
                where: { id },
                transaction: t,
            });
            if (affectedSaleRows === 1) {
                const products = await getProducts(sale.dataValues?.products);
                const customer = await Customer.findByPk(customerId);
                const user = await User.findByPk(reqUser);
                let mailSubject = 'Sale "' +
                    sale.dataValues.billNumber +
                    '" is updated by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, products, {
                    ...sale.dataValues,
                    discount,
                    date,
                }, sale.dataValues.amountReceiveds, customer, false));
                return res.status(200).json({ sale });
            }
            else {
                throw new Error("Sale not updated. Please try again");
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
        // if(!id || id.length < 1){
        //     return res.status(400).json({
        //         error: `Sale Id is required.`
        //     });
        // }
        // const sale = await Sale.findByPk(id, {
        //     include: [{
        //         model: SaleProduct,
        //         as: "products"
        //     }, {
        //         model: AmountReceived,
        //         as: "amountReceiveds"
        //     }],
        // });
        const { count, rows } = await Sale.findAndCountAll({
            where: { id },
            include: [
                {
                    model: SaleProduct,
                    as: "products",
                },
                {
                    model: AmountReceived,
                    as: "amountReceiveds",
                },
            ],
        });
        const affectedSPRows = await SaleProduct.destroy({ where: { saleId: id } });
        const affectedARRows = await AmountReceived.destroy({
            where: { saleId: id },
        });
        const affectedRows = await Sale.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} sales` : "Sale"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map(async (s) => {
                const customer = await Customer.findByPk(s?.dataValues.customerId);
                const products = await getProducts(s?.dataValues?.products);
                let mailSubject = 'Sale "' +
                    s?.dataValues.billNumber +
                    '" is deleted by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, products, s?.dataValues, s?.dataValues.amountReceiveds, customer, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} sales` : "Sale"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting sale(s) ", error, "\n\n");
        next({ status: 500, error: "Db error deleting sale(s)" });
    }
}
async function addAmount(req, res) {
    try {
        const { saleId, amount } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        return await sequelize.transaction(async (t) => {
            const affectedAmountReceivedRow = await AmountReceived.create({
                clientId: clientId,
                saleId: saleId,
                amount,
                createdBy: reqUser,
                updatedBy: reqUser,
            }, { transaction: t });
            if (affectedAmountReceivedRow.dataValues) {
                const sale = await Sale.findByPk(saleId, {
                    include: [
                        {
                            model: SaleProduct,
                            as: "products",
                        },
                        {
                            model: AmountReceived,
                            as: "amountReceiveds",
                        },
                    ],
                });
                let amountReceiveds = [...sale?.dataValues.amountReceiveds];
                if (!amountReceiveds && amountReceiveds.length < 1) {
                    amountReceiveds = [];
                }
                amountReceiveds?.push({
                    dataValues: { amount: amount.toString(), createdAt: new Date() },
                    amount: amount.toString(),
                    createdAt: new Date(),
                });
                const products = await getProducts(sale?.dataValues?.products);
                const customer = await Customer.findByPk(sale?.dataValues?.customerId);
                const user = await User.findByPk(reqUser);
                let mailSubject = "Amount " +
                    amount +
                    " added to Sale " +
                    sale?.billNumber +
                    " by " +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, products, sale.dataValues, amountReceiveds, customer, false));
                return res.status(201).json({ sale: sale });
            }
            else {
                throw new Error("Amount not added. Please try again");
            }
        });
    }
    catch (error) {
        console.log("Error Adding Amount: ", error);
        return res.status(400).json({ error: error.message });
    }
}
async function getProducts(saleProducts) {
    let products = [];
    try {
        if (saleProducts && saleProducts.length > 0) {
            let productIds = [];
            saleProducts.map(async (p) => {
                productIds.push(p.productId);
            });
            const { count, rows } = await Product.findAndCountAll({
                distinct: true,
                where: {
                    id: { [Op.in]: productIds },
                },
            });
            saleProducts.map(async (sp) => {
                let p = rows.find((p) => p.dataValues.id === sp.productId);
                products.push({
                    ...sp?.dataValues,
                    name: p?.dataValues && p?.dataValues.name ? p?.dataValues.name : "",
                });
            });
        }
    }
    catch (error) {
        products = [];
    }
    return products;
}
const getMailBody = (title, products, sale, amountReceiveds, customer, isCancel = false) => {
    let mailBody = ``;
    try {
        let discount = 0, tax = 0, loadingCharge = 0, unLoadingCharge = 0, transportCharge = 0;
        if (sale) {
            discount = parseFloat(sale.discount.toString());
            tax = parseFloat(sale.tax.toString());
            loadingCharge = parseFloat(sale.loadingCharge.toString());
            unLoadingCharge = parseFloat(sale.unLoadingCharge.toString());
            transportCharge = parseFloat(sale.transportCharge.toString());
        }
        let totalAmountReceived = 0;
        let amountReceivedRows = "";
        if (amountReceiveds && amountReceiveds.length > 0) {
            amountReceiveds.map((a) => {
                totalAmountReceived += parseFloat(a.amount);
                amountReceivedRows += `<tr>
            <td style="padding: .5rem .5rem; border-bottom: 1px solid #2e6884;">${toDateTime(a.createdAt)}</td>
            <td style="padding: .5rem .5rem; border-bottom: 1px solid #2e6884;">${a.amount}</td>
        </tr>`;
            });
        }
        let productTotal = 0, totalAmount = 0, totalCost = 0;
        let productRows = "";
        if (products && products.length > 0) {
            products.map((p) => {
                p = p.dataValues ? p.dataValues : p;
                productTotal += p.unitPrice * p.quantity;
                totalCost += p.unitCost * p.quantity;
                productRows += `<tr>
            <td style="padding: .5rem .5rem; border-bottom: 1px solid #2e6884;">${p.name}</td>
            <td style="padding: .5rem .5rem; border-bottom: 1px solid #2e6884;">${p.quantity}</td>
            <td style="padding: .5rem .5rem; border-bottom: 1px solid #2e6884;">${p.unitCost}</td>
            <td style="padding: .5rem .5rem; border-bottom: 1px solid #2e6884;">${p.unitPrice}</td>
            <td style="padding: .5rem .5rem; border-bottom: 1px solid #2e6884;">${p.quantity * p.unitPrice}</td>
            <td style="padding: .5rem .5rem; border-bottom: 1px solid #2e6884;">${p.tax}</td>
        </tr>`;
            });
        }
        totalAmount =
            productTotal + loadingCharge + unLoadingCharge + transportCharge + tax;
        const totalAmountAfterDiscount = totalAmount - discount;
        mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
            ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
            : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Sale Details:</span></div>
    <div><span style="font-weight: bold;">Bill Number: </span><span>${sale?.billNumber}</span></div>
    <div><span style="font-weight: bold;">Sale Date: </span><span>${toDate(sale?.date)}</span></div>
    <div><span style="font-weight: bold;">Customer Name: </span><span>${customer?.name}</span></div>
    <div><span style="font-weight: bold;">Customer Phone: </span><span>${customer?.phone}</span></div>
    <div><span style="font-weight: bold;">Customer Email: </span><span>${customer?.email}</span></div>
    <div><span style="font-weight: bold;">Customer Address: </span><span>${customer?.address}</span></div>

    ${products && products.length > 0
            ? `<div style="margin-top: 15px;"><span style="font-weight: bold;">Products: </span></div>
        <div style="margin-bottom: 15px;">
            <table class="table table-hover" style="border: 1px solid #2e6884; caption-side: bottom; border-collapse: collapse;">
                <thead class="text-white" style="background-color: #2e6884;">
                    <th style="padding: .5rem .5rem">Product</th>
                    <th style="padding: .5rem .5rem">Quantity</th>
                    <th style="padding: .5rem .5rem">Unit Cost</th>
                    <th style="padding: .5rem .5rem">Unit Price</th>
                    <th style="padding: .5rem .5rem">Total Amount</th>
                    <th style="padding: .5rem .5rem">Tax</th>
                </thead>
                <tbody>
                    ${productRows}
                </tbody>
                <tfoot>
                    <tr style="border: 1px solid #2e6884; background-color: #2e6884; color: #FFFFFF; font-weight: bold;">
                        <td style="padding: .5rem .5rem; test-align: right;" colspan="4">Total</td>
                        <td style="padding: .5rem .5rem;">${productTotal}</td>
                    </tr>
                </tfoot>
            </table>
        </div>`
            : `<div class="mb-3 h6" style="color: #6f42c; fontWeight: bold; margin-top: 15px; margin-bottom: 15px;"><span>No Products Found</span></div>`}

    <div><span style="font-weight: bold;">Loading Charge: </span><span>${sale?.loadingCharge}</span></div>
    <div><span style="font-weight: bold;">Unloading Charge: </span><span>${sale?.unLoadingCharge}</span></div>
    <div><span style="font-weight: bold;">Transport Charge: </span><span>${sale?.transportCharge}</span></div>
    <div><span style="font-weight: bold;">Tax: </span><span>${sale?.tax}</span></div>
    <div><span style="font-weight: bold;">Total Amount: </span><span>${totalAmount}</span></div>
    <div><span style="font-weight: bold;">Discount: </span><span>${sale?.discount}</span></div>
    <div><span style="font-weight: bold;">Total Amount after Discount: </span><span>${totalAmountAfterDiscount}</span></div>

    ${amountReceiveds && amountReceiveds.length > 0
            ? `<div style="margin-top: 15px;"><span style="font-weight: bold;">Amount Received: </span></div>
        <div style="margin-bottom: 15px;">
            <table class="table table-hover" style="border: 1px solid #2e6884; caption-side: bottom; border-collapse: collapse;">
                <thead class="text-white" style="background-color: #2e6884;">
                    <th style="padding: .5rem .5rem;">Received Date</th>
                    <th style="padding: .5rem .5rem;">Amount</th>
                </thead>
                <tbody>
                    ${amountReceivedRows}
                </tbody>
                <tfoot>
                    <tr style="border: 1px solid #2e6884; background-color: #2e6884; color: #FFFFFF; font-weight: bold;">
                        <td style="padding: .5rem .5rem;">Total Amount Received</td>
                        <td style="padding: .5rem .5rem;">${totalAmountReceived}</td>
                    </tr>
                </tfoot>
            </table>
        </div>`
            : `<div class="mb-3 h6" style="color: #6f42c; fontWeight: bold; margin-top: 15px; margin-bottom: 15px;"><span>Total Amount Received: </span><span>0</span></div>`}

    <div><span style="font-weight: bold;">Balance Amount: </span><span>${totalAmountAfterDiscount - totalAmountReceived}</span></div>
    ${SHOW_PROFIT && SHOW_PROFIT === "true"
            ? `<div><span style="font-weight: bold;">Profit Amount: </span><span>${productTotal -
                discount -
                totalCost +
                ` (${percentage(productTotal - discount - totalCost, totalCost).toFixed(2)}%)`}</span></div>`
            : ``}

    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    }
    catch (ex) {
        console.log("Error constructing mail body, ", ex);
    }
    return mailBody;
};
export { sales, create, cancelSale, read, update, destroy, addAmount };
