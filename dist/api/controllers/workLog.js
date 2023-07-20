import sendEmail from "../../libs/email.js";
import { toDateTime } from "../../libs/index.js";
import db from "../../models/index.js";
const { WorkLog, User, Product } = db;
async function workLogs(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await WorkLog.findAndCountAll({ include: [
                {
                    model: Product,
                    as: "product",
                },
            ], ...filter });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ workLogs: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No work log found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting work log:", error, "\n\n");
        next({ status: 500, error: "Db error getting work log" });
    }
}
async function create(req, res, next) {
    try {
        const { userId, productId, date, labourCost, quantity, amount, comments } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const workLog = await WorkLog.create({
            clientId,
            userId,
            productId,
            date,
            labourCost,
            quantity,
            amount,
            comments,
            isActive: true,
            createdBy: reqUser,
            updatedBy: reqUser,
        });
        if (workLog.dataValues) {
            const user = await User.findByPk(reqUser);
            let mailSubject = 'New work log is created by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, workLog, false));
            return res.status(201).json({ workLog });
        }
        else {
            return res.status(400).json({
                error: "Work log not created. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError creating work Log: ", error, "\n\n");
        next({ status: 500, error: "Db error creating work log" });
    }
}
async function read(req, res, next) {
    try {
        const workLog = await WorkLog.findByPk(req.params.id);
        if (workLog === null) {
            return res.status(400).json({
                error: "Work log not found",
            });
        }
        else {
            return res.status(200).json({ workLog });
        }
    }
    catch (error) {
        console.log("\n\nError getting work log: ", error, "\n\n");
        next({ status: 500, error: "Db error getting work log" });
    }
}
async function update(req, res, next) {
    try {
        const { id, productId, date, labourCost, quantity, amount, comments } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const [affectedRows] = await WorkLog.update({ productId,
            date,
            labourCost,
            quantity,
            amount,
            comments,
            updatedBy: reqUser }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "Work log not updated. Please try again",
            });
        }
        else {
            const workLog = await WorkLog.findByPk(id);
            const user = await User.findByPk(reqUser);
            let mailSubject = 'Work Log is updated by ' +
                user?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, workLog?.dataValues, false));
            return res.status(200).json({ workLog });
        }
    }
    catch (error) {
        console.log("\n\nError updating work log: ", error, "\n\n");
        next({ status: 500, error: "Db error updating work log" });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const { count, rows } = await WorkLog.findAndCountAll({ where: { id } });
        const affectedRows = await WorkLog.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} workLogs` : "Work log"} not deleted. Please try again`,
            });
        }
        else {
            const user = await User.findByPk(reqUser);
            rows.map((c) => {
                let mailSubject = 'Work Log is deleted by ' +
                    user?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, c?.dataValues, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} workLogs` : "Work log"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting work log ", error, "\n\n");
        next({ status: 500, error: "Db error deleting work log" });
    }
}
const getMailBody = (title, workLog, isCancel = false) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">Work log Details:</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { workLogs, create, read, update, destroy };
