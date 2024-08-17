import Sequelize from "sequelize";
import sendEmail from "../../libs/email.js";
import { toDateTime } from "../../libs/index.js";
import db from "../../models/index.js";
const QueryTypes = Sequelize.QueryTypes;
const { sequelize, Category, User } = db;
async function categories(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Category.findAndCountAll({ ...filter });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ categories: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No categories found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting categories:", error, "\n\n");
        next({ status: 500, error: "Db error getting categories" });
    }
}
async function create(req, res, next) {
    try {
        const { name, description } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const category = await Category.create({
            clientId,
            name,
            description,
            createdBy: reqUser,
            updatedBy: reqUser,
        });
        if (category.dataValues) {
            const user = await User.findByPk(reqUser);
            let mailSubject = 'New category "' +
                category?.name +
                '" is created by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, category, false));
            return res.status(201).json({ category });
        }
        else {
            return res.status(400).json({
                error: "Category not created. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError creating category: ", error, "\n\n");
        next({ status: 500, error: "Db error creating category" });
    }
}
async function read(req, res, next) {
    try {
        const category = await Category.findByPk(req.params.id);
        if (category === null) {
            return res.status(400).json({
                error: "Category not found",
            });
        }
        else {
            return res.status(200).json({ category });
        }
    }
    catch (error) {
        console.log("\n\nError getting category: ", error, "\n\n");
        next({ status: 500, error: "Db error getting category" });
    }
}
async function update(req, res, next) {
    try {
        const { id, name, description } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const [affectedRows] = await Category.update({ name, description, updatedBy: reqUser }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "Category not updated. Please try again",
            });
        }
        else {
            const category = await Category.findByPk(id);
            const user = await User.findByPk(reqUser);
            let mailSubject = 'Category "' +
                category?.name +
                '" is updated by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, category?.dataValues, false));
            return res.status(200).json({ category });
        }
    }
    catch (error) {
        console.log("\n\nError updating category: ", error, "\n\n");
        next({ status: 500, error: "Db error updating category" });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const { count, rows } = await Category.findAndCountAll({ where: { id } });
        const affectedRows = await Category.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} categories` : "Category"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map((c) => {
                let mailSubject = 'Category "' +
                    c?.name +
                    '" is deleted by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, c?.dataValues, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} categories` : "Category"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting category ", error, "\n\n");
        next({ status: 500, error: "Db error deleting category" });
    }
}
async function exportCategories(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Category.findAndCountAll({
            distinct: true,
            attributes: ["name", "description"],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ categories: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No category found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting categories: ", error, "\n\n");
        next({ status: 500, error: "Db error getting categories" });
    }
}
async function importCategories(req, res, next) {
    try {
        const categories = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        if (categories && categories.length > 0) {
            let query = `with bulkCategories(name, description) AS (VALUES`;
            categories.map((c, i) => {
                query += `${i !== 0 ? "," : ""} ('${c.name}', '${c.description ? c.description : ""}')`;
            });
            query += `) INSERT INTO categories(id, name, description, "clientId", "createdAt", "updatedAt", "createdBy", "updatedBy") SELECT gen_random_uuid (), name, description, cast('${clientId}' as uuid), NOW(), NOW(), cast('${reqUser}' as uuid), cast('${reqUser}' as uuid) FROM bulkCategories b WHERE NOT EXISTS(SELECT 1 FROM categories c WHERE cast(c."clientId" as varchar) = '${clientId}' AND LOWER(c."name") = LOWER(b."name"))`;
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
        console.log("\n\nError importing categories: ", error, "\n\n");
        next({ status: 500, error: "Db error importing categories" });
    }
}
const getMailBody = (title, category, isCancel = false) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Category Details:</span></div>
    <div><span style="font-weight: bold;">Name: </span><span>${category?.name}</span></div>
    <div><span style="font-weight: bold;">Description: </span><span>${category?.description}</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { categories, create, read, update, destroy, exportCategories, importCategories, };
