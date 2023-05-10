import Sequelize from "sequelize";
import { toDate, getWeekDay, getMonth } from "../../libs/index.js";
import db from "../../models/index.js";
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes;
const { sequelize, Supplier, Purchase, Sale, SaleProduct, AmountReceived, Product, Category, Customer, } = db;
async function summary(req, res, next) {
    try {
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const customerCount = await Customer.count({
            where: { clientId },
        });
        const supplierCount = await Supplier.count({
            where: { clientId },
        });
        const purchaseCount = await Purchase.count({
            where: { clientId },
        });
        const salesCount = await Sale.count({
            where: { clientId },
        });
        return res.status(200).json({
            customers: customerCount,
            suppliers: supplierCount,
            purchases: purchaseCount,
            sales: salesCount,
        });
    }
    catch (error) {
        console.log("\n\nError getting sales: ", error, "\n\n");
        next({ status: 500, error: "Db error getting sales" });
    }
}
async function sales(req, res, next) {
    try {
        let { type } = req.query;
        if (type && type.toString().length > 0) {
            type = type.toString().toUpperCase();
        }
        else {
            type = "W";
        }
        const { filter, pagination } = res.locals;
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
    catch (error) {
        console.log("\n\nError getting sales: ", error, "\n\n");
        next({ status: 500, error: "Db error getting sales" });
    }
}
async function productSales(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Sale.findAndCountAll({
            distinct: true,
            include: [
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
            ],
            ...filter,
            order: [["date", "ASC"]],
        });
        if (count) {
            pagination.count = count;
            let productsArray = [];
            if (rows && rows.length > 0) {
                rows.map((s) => {
                    if (s.products && s.products.length > 0) {
                        s.products.map((p) => {
                            p = p.dataValues ? p.dataValues : p;
                            // if(productsCount[p.name] && productsCount[p.name] > 0){
                            //     productsCount[p.name] = productsCount[p.name] + 1;
                            // }else{
                            //     productsCount[p.name] = 1;
                            // }
                            const foundIndex = productsArray.findIndex((pr) => pr.id === p.productId);
                            if (foundIndex >= 0) {
                                productsArray[foundIndex].quantity =
                                    productsArray[foundIndex].quantity + parseInt(p.quantity);
                                productsArray[foundIndex].totalCost =
                                    productsArray[foundIndex].totalCost +
                                        parseFloat(p.unitCost) * parseInt(p.quantity);
                                productsArray[foundIndex].totalPrice =
                                    productsArray[foundIndex].totalPrice +
                                        parseFloat(p.unitPrice) * parseInt(p.quantity);
                            }
                            else {
                                productsArray.push({
                                    id: p.productId,
                                    name: p.product.name,
                                    quantity: parseInt(p.quantity),
                                    totalCost: parseFloat(p.unitCost) * parseInt(p.quantity),
                                    totalPrice: parseFloat(p.unitPrice) * parseInt(p.quantity),
                                });
                            }
                        });
                    }
                });
            }
            // return res.status(200).json({ sales: result, products: productsCount, total });
            return res.status(200).json({ products: productsArray });
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
async function stockCount(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Product.findAndCountAll({
            distinct: true,
            attributes: ["name", "store", "counter"],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ products: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No products found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting products: ", error, "\n\n");
        next({ status: 500, error: "Db error getting products" });
    }
}
async function pendingBills(req, res, next) {
    try {
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const { filter, pagination } = res.locals;
        let sales = await sequelize.query(
        //   'select (((select sum(quantity * "unitPrice") as "TotalAmount" from public."saleProducts" as p where p."saleId" = s.id) + s."loadingCharge" + s."unLoadingCharge" + s."transportCharge" + s."tax") - s.discount) as TotalAmount,  (select sum(amount) as "AmountReceived" from public."amountReceived" as a where a."saleId" = s.id) as amountReceived,* from public.sales as s where ((select sum(amount) as "AmountReceived" from public."amountReceived" as a where a."saleId" = s.id) < (((select sum(quantity * "unitPrice") as "TotalAmount" from public."saleProducts" as p where p."saleId" = s.id) + s."loadingCharge" + s."unLoadingCharge" + s."transportCharge" + s."tax") - s.discount))',
        `select 
    (((select sum(quantity * "unitPrice") as "totalAmount" from public."saleProducts" as p where p."saleId" = s.id) + s."loadingCharge" + s."unLoadingCharge" + s."transportCharge" + s."tax") - s.discount) as "totalAmount",
    (select sum(amount) as "AmountReceived" from public."amountReceived" as a where a."saleId" = s.id) as "amountReceived",
    c."name" as "customerName",
    c."phone" as "customerPhone",
    c."address" as "customerAddress",
    s."id" as "id",
    s."billNumber" as "billNumber",
    s."date" as "date",
    s."discount" as "discount"
    from public.sales as s left outer join public."customers" as c on s."customerId" = c."id"
    where s.clientId = '${clientId}' and ((select sum(amount) as "amountReceived" from public."amountReceived" as a where a."saleId" = s.id) < (((select sum(quantity * "unitPrice") as "TotalAmount" from public."saleProducts" as p where p."saleId" = s.id) + s."loadingCharge" + s."unLoadingCharge" + s."transportCharge" + s."tax") - s.discount))`, { type: QueryTypes.SELECT });
        if (sales && sales.length > 0) {
            pagination.count = sales.length;
            sales = sales.map((s) => ({
                ...s,
                balanceAmount: s.totalAmount - s.amountReceived,
            }));
            return res.status(200).json({ sales, pagination });
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
async function outOfStockProducts(req, res, next) {
    try {
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const { filter, pagination } = res.locals;
        const { count, rows } = await Product.findAndCountAll({
            include: {
                model: Category,
                as: "category",
            },
            where: {
                clientId,
                store: 0,
                counter: 0,
            },
            order: [["createdAt", "ASC"]],
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ count, products: rows });
        }
        else {
            return res.status(400).json({
                error: "No products found!",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting sales: ", error, "\n\n");
        next({ status: 500, error: "Db error getting sales" });
    }
}
async function topSellingProducts(req, res, next) {
    try {
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        let { limit } = req.query;
        const { filter, pagination } = res.locals;
        let resultLimit = 10;
        if (limit && limit.length) {
            resultLimit = parseInt(limit.toString());
        }
        const products = await sequelize.query(`SELECT sp."productId" as "id", (SELECT p."name" FROM public."products" as "p" where p."id" = sp."productId") as "name", CAST(SUM(sp."quantity") AS INT) AS "total" FROM public."saleProducts" as "sp" where sp.clientId = '${clientId}' GROUP BY sp."productId" ORDER BY "total" DESC LIMIT ${resultLimit}`, { type: QueryTypes.SELECT });
        if (products && products.length > 0) {
            pagination.count = products.length;
            return res.status(200).json({ count: products.length, products });
        }
        else {
            return res.status(400).json({
                error: "No products found!",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting sales: ", error, "\n\n");
        next({ status: 500, error: "Db error getting sales" });
    }
}
async function topBuyingCustomers(req, res, next) {
    try {
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        let { limit } = req.query;
        const { filter, pagination } = res.locals;
        let resultLimit = 10;
        if (limit && limit.length) {
            resultLimit = parseInt(limit.toString());
        }
        const customers = await sequelize.query(`select 
      CAST(count(s."id") AS INT) as "count",
      (select c."name" from "customers" as "c" where c."id" = s."customerId") as "name",
      (select c."phone" from "customers" as "c" where c."id" = s."customerId") as "phone"
      from public.sales as s 
      where s.clientId = '${clientId}' 
      group by s."customerId" order by s."count" desc limit ${resultLimit}`, { type: QueryTypes.SELECT });
        if (customers && customers.length > 0) {
            pagination.count = customers.length;
            return res.status(200).json({ count: customers.length, customers });
        }
        else {
            return res.status(400).json({
                error: "No products found!",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting sales: ", error, "\n\n");
        next({ status: 500, error: "Db error getting sales" });
    }
}
export { summary, sales, productSales, stockCount, pendingBills, outOfStockProducts, topSellingProducts, topBuyingCustomers, };
