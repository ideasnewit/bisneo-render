import Sequelize from "sequelize";
import { toDate, getWeekDay, getMonth } from "../../libs/index.js";
import db from "../../models/index.js";
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes;
const { sequelize, Client, Sale, SaleProduct, AmountReceived } = db;
async function sales(req, res, next) {
    try {
        let { type } = req.query;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        if (type && type.toString().length > 0) {
            type = type.toString().toUpperCase();
        }
        else {
            type = "W";
        }
        const { filter, pagination } = res.locals;
        // Get all clients under the current org
        const clientIds = await Client.findAll({
            attributes: ["id"],
            where: {
                parentId: clientId,
            },
        });
        if (clientIds && clientIds.length > 0) {
            console.log("clientIds::: ", clientIds.map((c) => c.id));
            filter.where.clientId = clientIds.map((c) => c.id);
            console.log("LLLL::: ", filter);
            const { count, rows } = await Sale.findAndCountAll({
                distinct: true,
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
                ...filter,
                order: [["date", "ASC"]],
            });
            if (count) {
                pagination.count = count;
                let result = [];
                let total = {
                    count: count,
                    amount: 0,
                    discount: 0,
                    amountAfterDiscount: 0,
                    amountReceived: 0,
                    balance: 0,
                    profit: 0,
                };
                if (rows && rows.length > 0) {
                    rows.map((s) => {
                        if (type === "Y") {
                            const month = getMonth(s.date);
                            const foundIndex = result.findIndex((r) => r.label === month);
                            if (foundIndex >= 0) {
                                result[foundIndex].value = result[foundIndex].value + 1;
                            }
                            else {
                                result.push({
                                    label: month,
                                    value: 1,
                                });
                            }
                        }
                        else {
                            const saleDate = toDate(s.date);
                            const foundIndex = result.findIndex((r) => r.date === saleDate);
                            if (foundIndex >= 0) {
                                result[foundIndex].value = result[foundIndex].value + 1;
                            }
                            else {
                                let obj = {
                                    date: saleDate,
                                    value: 1,
                                };
                                if (type === "W") {
                                    obj.label = getWeekDay(s.date);
                                    //   } else if (type === "M") {
                                    //     obj.label = moment(s.date).format("DD");
                                }
                                else {
                                    obj.label = saleDate;
                                }
                                result.push(obj);
                            }
                        }
                        let tax = parseFloat(s.tax.toString());
                        let discount = parseFloat(s.discount.toString());
                        let loadingCharge = parseFloat(s.loadingCharge.toString());
                        let unLoadingCharge = parseFloat(s.unLoadingCharge.toString());
                        let transportCharge = parseFloat(s.transportCharge.toString());
                        let totalAmountReceived = 0;
                        if (s.amountReceiveds && s.amountReceiveds.length > 0) {
                            s.amountReceiveds.map((a) => {
                                totalAmountReceived += parseFloat(a.amount);
                            });
                        }
                        let productTotal = 0, totalAmount = 0, totalCost = 0;
                        if (s.products && s.products.length > 0) {
                            s.products.map((p) => {
                                p = p.dataValues ? p.dataValues : p;
                                productTotal += p.unitPrice * p.quantity;
                                totalCost += p.unitCost * p.quantity;
                                // if(productsCount[p.name] && productsCount[p.name] > 0){
                                //     productsCount[p.name] = productsCount[p.name] + 1;
                                // }else{
                                //     productsCount[p.name] = 1;
                                // }
                            });
                        }
                        totalAmount =
                            productTotal +
                                loadingCharge +
                                unLoadingCharge +
                                transportCharge +
                                tax;
                        const totalAmountAfterDiscount = totalAmount - discount;
                        const balance = totalAmountAfterDiscount - totalAmountReceived;
                        const profit = productTotal - discount - totalCost;
                        total.amount = total.amount + totalAmount;
                        total.discount = total.discount + discount;
                        total.amountAfterDiscount =
                            total.amountAfterDiscount + totalAmountAfterDiscount;
                        total.amountReceived = total.amountReceived + totalAmountReceived;
                        total.balance = total.balance + balance;
                        total.profit = total.profit + profit;
                    });
                }
                // return res.status(200).json({ sales: result, products: productsCount, total });
                return res.status(200).json({ sales: result, total });
            }
            else {
                return res.status(400).json({
                    error: "No sales found",
                });
            }
        }
        else {
            return res.status(400).json({
                error: "No branch found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting sales: ", error, "\n\n");
        next({ status: 500, error: "Db error getting sales" });
    }
}
export { sales };
