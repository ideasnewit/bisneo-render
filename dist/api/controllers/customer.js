import Sequelize from "sequelize";
import sendEmail from "../../libs/email.js";
import { toDateTime } from "../../libs/index.js";
import db from "../../models/index.js";
import { toDate } from "../../libs/index.js";
const QueryTypes = Sequelize.QueryTypes;
const { sequelize, Customer, User } = db;
async function customers(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Customer.findAndCountAll({ ...filter });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ customers: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No customers found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting customers: ", error, "\n\n");
        next({ status: 500, error: "Db error getting customers" });
    }
}
async function create(req, res, next) {
    try {
        const { name, phone, email, address, dob } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const customer = await Customer.create({
            clientId,
            name,
            phone,
            email,
            address,
            dob: dob && dob.length > 0 ? dob : null,
            createdBy: reqUser,
            updatedBy: reqUser,
        });
        if (customer.dataValues) {
            const user = await User.findByPk(reqUser);
            let mailSubject = 'New customer "' +
                customer?.name +
                '" is created by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, customer, false));
            return res.status(201).json({ customer });
        }
        else {
            return res.status(400).json({
                error: "Customer not created. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError creating customer: ", error, "\n\n");
        next({ status: 500, error: "Db error creating customer" });
    }
}
async function read(req, res, next) {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (customer === null) {
            return res.status(400).json({
                error: "Customer not found",
            });
        }
        else {
            return res.status(200).json({ customer });
        }
    }
    catch (error) {
        console.log("\n\nError getting customer: ", error, "\n\n");
        next({ status: 500, error: "Db error getting customer" });
    }
}
async function update(req, res, next) {
    try {
        const { id, name, phone, email, address, dob } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        let [affectedRows] = await Customer.update({
            name,
            phone,
            email,
            address,
            dob: dob && dob.length > 0 ? dob : null,
            updatedBy: reqUser,
        }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "Customer not updated. Please try again",
            });
        }
        else {
            const customer = await Customer.findByPk(id);
            const user = await User.findByPk(reqUser);
            let mailSubject = 'Customer "' +
                customer?.name +
                '" is updated by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, customer?.dataValues, false));
            return res.status(200).json({ customer });
        }
    }
    catch (error) {
        console.log("\n\nError updating customer: ", error, "\n\n");
        next({ status: 500, error: "Db error updating customer" });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // const customer = await Customer.findByPk(id);
        const { count, rows } = await Customer.findAndCountAll({ where: { id } });
        const affectedRows = await Customer.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} customers` : "Customer"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map((s) => {
                let mailSubject = 'Customer "' +
                    s?.name +
                    '" is deleted by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, s?.dataValues, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} customers` : "Customer"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting customer(s) ", error, "\n\n");
        next({ status: 500, error: "Db error deleting customer(s)" });
    }
}
async function exportCustomers(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Customer.findAndCountAll({
            attributes: ["name", "phone", "email", "address", "dob"],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ customers: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No customers found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting customers: ", error, "\n\n");
        next({ status: 500, error: "Db error getting customers" });
    }
}
async function importCustomers(req, res, next) {
    try {
        const customers = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        if (customers && customers.length > 0) {
            let query = `with bulkCustomers(name, phone, email, address, dob) AS (VALUES`;
            customers.map((c, i) => {
                query += `${i !== 0 ? "," : ""} ('${c.name}', '${c.phone ? c.phone : ""}', '${c.email ? c.email : ""}', '${c.address ? c.address : ""}', '${c.dob ? c.dob : ""}')`;
            });
            query += `) INSERT INTO customers(id, name, phone, email, address, dob, "clientId", "createdAt", "updatedAt", "createdBy", "updatedBy") SELECT gen_random_uuid (), name, phone, email, address, CASE WHEN length(dob) > 0 THEN cast(dob as DATE) ELSE null END as dob, cast('${clientId}' as uuid), NOW(), NOW(), cast('${reqUser}' as uuid), cast('${reqUser}' as uuid) FROM bulkCustomers b WHERE NOT EXISTS(SELECT 1 FROM customers c WHERE cast(c."clientId" as varchar) = '${clientId}' AND (c."phone" = b."phone" OR (c."email" IS NOT NULL AND LENGTH(c."email") > 0 AND LOWER(c."email") = LOWER(b."email"))))`;
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
        console.log("\n\nError importing customers: ", error, "\n\n");
        next({ status: 500, error: "Db error importing customers" });
    }
}
const getMailBody = (title, customer, isCancel = false) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Customer Details:</span></div>
    <div><span style="font-weight: bold;">Name: </span><span>${customer?.name}</span></div>
    <div><span style="font-weight: bold;">Phone: </span><span>${customer?.phone}</span></div>
    <div><span style="font-weight: bold;">Email: </span><span>${customer?.email ? customer?.email : ""}</span></div>
    <div><span style="font-weight: bold;">Address: </span><span>${customer?.address ? customer?.address : ""}</span></div>
    <div><span style="font-weight: bold;">Date of Birth: </span><span>${customer?.dob ? toDate(customer?.dob) : ""}</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { customers, create, read, update, destroy, exportCustomers, importCustomers, };
