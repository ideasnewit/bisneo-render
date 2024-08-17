import Sequelize from "sequelize";
import { toDateTime } from "../../libs/index.js";
import sendEmail from "../../libs/email.js";
import db from "../../models/index.js";
const QueryTypes = Sequelize.QueryTypes;
const { sequelize, Product, Category, User } = db;
async function products(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Product.findAndCountAll({
            distinct: true,
            include: {
                model: Category,
                as: "category",
            },
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
async function create(req, res, next) {
    try {
        const { categoryId, code, name, unitCost, unitPrice, labourCost, taxPercentage, store, counter, description, } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const product = await Product.create({
            clientId,
            categoryId,
            code,
            name,
            unitCost,
            unitPrice,
            labourCost,
            taxPercentage,
            store,
            counter,
            description,
            createdBy: reqUser,
            updatedBy: reqUser,
        }, {
            include: [
                {
                    model: Category,
                    as: "category",
                },
            ],
        });
        if (product.dataValues) {
            const category = await Category.findByPk(product.dataValues.categoryId);
            const user = await User.findByPk(reqUser);
            let mailSubject = 'New product "' +
                product?.name +
                '" is created by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, category?.dataValues, product, false));
            return res.status(201).json({ product });
        }
        else {
            return res.status(400).json({
                error: "Product not created. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError creating product: ", error, "\n\n");
        next({ status: 500, error: "Db error creating product" });
    }
}
async function read(req, res, next) {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: Category,
                    as: "category",
                },
            ],
        });
        if (product === null) {
            return res.status(400).json({
                error: "Product not found",
            });
        }
        else {
            return res.status(200).json({ product });
        }
    }
    catch (error) {
        console.log("\n\nError getting product: ", error, "\n\n");
        next({ status: 500, error: "Db error getting product" });
    }
}
async function readByCode(req, res, next) {
    try {
        const product = await Product.findOne({
            where: { code: req.params.code },
            include: [
                {
                    model: Category,
                    as: "category",
                },
            ],
        });
        if (product === null) {
            return res.status(400).json({
                error: "Product not found",
            });
        }
        else {
            return res.status(200).json({ product });
        }
    }
    catch (error) {
        console.log("\n\nError getting product: ", error, "\n\n");
        next({ status: 500, error: "Db error getting product" });
    }
}
async function update(req, res, next) {
    try {
        const { id, categoryId, code, name, unitCost, unitPrice, labourCost, taxPercentage, store, counter, description, } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const [affectedRows] = await Product.update({
            categoryId,
            code,
            name,
            unitCost,
            unitPrice,
            labourCost,
            taxPercentage,
            store,
            counter,
            description,
            updatedBy: reqUser,
        }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "Product not updated. Please try again",
            });
        }
        else {
            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: Category,
                        as: "category",
                    },
                ],
            });
            const user = await User.findByPk(reqUser);
            let mailSubject = 'product "' +
                product?.name +
                '" is updated by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, product?.dataValues.category, product?.dataValues, false));
            return res.status(200).json({ product });
        }
    }
    catch (error) {
        console.log("\n\nError updating product: ", error, "\n\n");
        next({ status: 500, error: "Db error updating product" });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // const product = await Product.findByPk(id, {
        //     include: [{
        //         model: Category,
        //         as: "category"
        //     }],
        // });
        const { count, rows } = await Product.findAndCountAll({
            where: { id },
            include: [
                {
                    model: Category,
                    as: "category",
                },
            ],
        });
        const affectedRows = await Product.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} products` : "Product"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map((p) => {
                let mailSubject = 'Product "' +
                    p?.name +
                    '" is deleted by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, p?.dataValues.category, p?.dataValues, false));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} products` : "Product"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting product(s) ", error, "\n\n");
        next({ status: 500, error: "Db error deleting product(s)" });
    }
}
async function exportProducts(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Product.findAndCountAll({
            distinct: true,
            include: {
                model: Category,
                as: "category",
                attributes: ["name", "description"],
            },
            attributes: [
                "code",
                "name",
                "unitCost",
                "unitPrice",
                "labourCost",
                "taxPercentage",
                "description",
            ],
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
async function importProducts(req, res, next) {
    try {
        const products = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        if (products && products.length > 0) {
            let query = `with bulkProducts(categoryId, code, name, description, unitCost, unitPrice, labourCost, taxPercentage) AS (VALUES`;
            products.map((c, i) => {
                query += `${i !== 0 ? "," : ""} ('${c.categoryId}', '${c.code}', '${c.name}', '${c.description ? c.description : ""}', ${isNaN(c.unitCost) ? null : +c.unitCost}, ${isNaN(c.unitPrice) ? null : +c.unitPrice}, ${isNaN(c.labourCost) ? null : +c.labourCost}, ${isNaN(c.taxPercentage) ? null : +c.taxPercentage})`;
            });
            query += `) INSERT INTO products(id, code, name, description, "unitCost", "unitPrice", "labourCost", "taxPercentage", "categoryId", "clientId", "createdAt", "updatedAt", "createdBy", "updatedBy") SELECT gen_random_uuid (), code, name, description, unitCost, unitPrice, labourCost, taxPercentage, cast(categoryId as uuid), cast('${clientId}' as uuid), NOW(), NOW(), cast('${reqUser}' as uuid), cast('${reqUser}' as uuid) FROM bulkProducts b WHERE NOT EXISTS(SELECT 1 FROM products c WHERE cast(c."clientId" as varchar) = '${clientId}' AND (LOWER(c."code") = LOWER(b."code") OR LOWER(c."name") = LOWER(b."name")))`;
            let result = await sequelize.query(query, { type: QueryTypes.RAW });
            if (result) {
                return res.status(201).json({ success: true });
            }
            else {
                return res.status(400).json({
                    error: "Failed to import.",
                });
            }
        }
        else {
            return res.status(400).json({
                error: "No data found to import.",
            });
        }
    }
    catch (error) {
        console.log("\n\nError importing products: ", error, "\n\n");
        next({ status: 500, error: "Db error importing products" });
    }
}
const getMailBody = (title, category, product, isCancel = false) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Product Details:</span></div>
    <div><span style="font-weight: bold;">Code: </span><span>${product?.code}</span></div>
    <div><span style="font-weight: bold;">Name: </span><span>${product?.name}</span></div>
    <div><span style="font-weight: bold;">Unit Cost: </span><span>${product?.unitCost}</span></div>
    <div><span style="font-weight: bold;">Unit Price: </span><span>${product?.unitPrice}</span></div>
    <div><span style="font-weight: bold;">Labour Cost: </span><span>${product?.labourCost}</span></div>
    <div><span style="font-weight: bold;">tax Percentage: </span><span>${product?.taxPercentage}</span></div>
    <div><span style="font-weight: bold;">Store: </span><span>${product?.store}</span></div>
    <div><span style="font-weight: bold;">Counter: </span><span>${product?.counter}</span></div>
    <div><span style="font-weight: bold;">Category: </span><span>${category?.name}</span></div>
    <div><span style="font-weight: bold;">Product Description: </span><span>${product?.description ? product?.description : ""}</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { products, create, read, readByCode, update, destroy, exportProducts, importProducts, };
