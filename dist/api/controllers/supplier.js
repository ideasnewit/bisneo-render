import Sequelize from "sequelize";
import sendEmail from "../../libs/email.js";
import { toDateTime } from "../../libs/index.js";
import db from "../../models/index.js";
const QueryTypes = Sequelize.QueryTypes;
const { sequelize, Supplier, User } = db;
async function suppliers(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Supplier.findAndCountAll({ ...filter });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ suppliers: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No suppliers found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting suppliers: ", error, "\n\n");
        next({ status: 500, error: "Db error getting suppliers" });
    }
}
async function create(req, res, next) {
    try {
        const { name, phone, email, address } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const supplier = await Supplier.create({
            clientId,
            name,
            phone,
            email,
            address,
            createdBy: reqUser,
            updatedBy: reqUser,
        });
        if (supplier.dataValues) {
            const user = await User.findByPk(reqUser);
            let mailSubject = 'New supplier "' +
                supplier?.name +
                '" is created by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, supplier, false));
            return res.status(201).json({ supplier });
        }
        else {
            return res.status(400).json({
                error: "Supplier not created. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError creating supplier: ", error, "\n\n");
        next({ status: 500, error: "Db error creating supplier" });
    }
}
async function read(req, res, next) {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (supplier === null) {
            return res.status(400).json({
                error: "Supplier not found",
            });
        }
        else {
            return res.status(200).json({ supplier });
        }
    }
    catch (error) {
        console.log("\n\nError getting supplier: ", error, "\n\n");
        next({ status: 500, error: "Db error getting supplier" });
    }
}
async function update(req, res, next) {
    try {
        const { id, name, phone, email, address } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        let [affectedRows] = await Supplier.update({ name, phone, email, address, updatedBy: reqUser }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "Supplier not updated. Please try again",
            });
        }
        else {
            const supplier = await Supplier.findByPk(id);
            const user = await User.findByPk(reqUser);
            let mailSubject = 'Supplier "' +
                supplier?.name +
                '" is updated by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, supplier?.dataValues, false));
            return res.status(200).json({ supplier });
        }
    }
    catch (error) {
        console.log("\n\nError updating supplier: ", error, "\n\n");
        next({ status: 500, error: "Db error updating supplier" });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // const supplier = await Supplier.findByPk(id);
        const { count, rows } = await Supplier.findAndCountAll({ where: { id } });
        const affectedRows = await Supplier.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} suppliers` : "Supplier"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map((s) => {
                let mailSubject = 'Supplier "' +
                    s?.name +
                    '" is deleted by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, s?.dataValues, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} suppliers` : "Supplier"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting supplier(s) ", error, "\n\n");
        next({ status: 500, error: "Db error deleting supplier(s)" });
    }
}
async function exportSuppliers(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Supplier.findAndCountAll({
            attributes: ["name", "phone", "email", "address"],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ suppliers: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No suppliers found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting suppliers: ", error, "\n\n");
        next({ status: 500, error: "Db error getting suppliers" });
    }
}
async function importSuppliers(req, res, next) {
    try {
        const suppliers = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        if (suppliers && suppliers.length > 0) {
            let query = `with bulkSuppliers(name, phone, email, address) AS (VALUES`;
            suppliers.map((c, i) => {
                query += `${i !== 0 ? "," : ""} ('${c.name}', '${c.phone ? c.phone : ""}', '${c.email ? c.email : ""}', '${c.address ? c.address : ""}')`;
            });
            query += `) INSERT INTO suppliers(id, name, phone, email, address, "clientId", "createdAt", "updatedAt", "createdBy", "updatedBy") SELECT gen_random_uuid (), name, phone, email, address, cast('${clientId}' as uuid), NOW(), NOW(), cast('${reqUser}' as uuid), cast('${reqUser}' as uuid) FROM bulkSuppliers b WHERE NOT EXISTS(SELECT 1 FROM suppliers c WHERE cast(c."clientId" as varchar) = '${clientId}' AND ((LOWER(c."name") = LOWER(b."name") OR c."phone" = b."phone" OR (c."email" IS NOT NULL AND LENGTH(c."email") > 0 AND LOWER(c."email") = LOWER(b."email")))))`;
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
        console.log("\n\nError importing suppliers: ", error, "\n\n");
        next({ status: 500, error: "Db error importing suppliers" });
    }
}
const getMailBody = (title, supplier, isCancel = false) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Supplier Details:</span></div>
    <div><span style="font-weight: bold;">Name: </span><span>${supplier?.name}</span></div>
    <div><span style="font-weight: bold;">Phone: </span><span>${supplier?.phone}</span></div>
    <div><span style="font-weight: bold;">Email: </span><span>${supplier?.email ? supplier?.email : ""}</span></div>
    <div><span style="font-weight: bold;">Address: </span><span>${supplier?.address ? supplier?.address : ""}</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { suppliers, create, read, update, destroy, exportSuppliers, importSuppliers, };
