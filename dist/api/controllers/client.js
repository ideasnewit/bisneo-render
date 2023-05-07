import db from "../../models/index.js";
import moment from "moment";
const { Client, User, ClientPayment } = db;
async function clients(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Client.findAndCountAll({ ...filter });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ clients: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No clients found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting clients: ", error, "\n\n");
        next({ status: 500, error: "Db error getting clients" });
    }
}
async function create(req, res, next) {
    try {
        const { name, tagLine, phone, alternatePhone, email, address, description, logo, gstNumber, registrationNumber, ein, dbNumber, industryCodes, currency, workingHoursPerDay, workingDaysPerWeek, userName, userLoginUserName, userPassword, userPhone, userEmail, userAddress, userPaymentRate, userPaymentTerm, } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : null;
        const client = await Client.create({
            name,
            tagLine,
            phone,
            alternatePhone,
            email,
            address,
            description,
            logo,
            gstNumber,
            registrationNumber,
            ein,
            dbNumber,
            industryCodes,
            currency,
            workingHoursPerDay,
            workingDaysPerWeek,
            showProfit: true,
            activeTill: moment(new Date()).add(1, "months").toDate(),
            createdBy: reqUser ? reqUser : undefined,
            updatedBy: reqUser ? reqUser : undefined,
        });
        if (client.dataValues) {
            const user = await User.create({
                clientId: client.dataValues.id,
                name: userName,
                userName: userLoginUserName,
                password: userPassword,
                role: "ADMIN",
                phone: userPhone,
                email: userEmail,
                address: userAddress,
                paymentRate: userPaymentRate ? userPaymentRate : 0,
                paymentTerm: userPaymentTerm ? userPaymentTerm : "hour",
                createdBy: reqUser ? reqUser : undefined,
                updatedBy: reqUser ? reqUser : undefined,
            });
            return res.status(201).json({ client });
        }
        else {
            return res.status(400).json({
                error: "Client not created. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError creating client: ", error, "\n\n");
        next({ status: 500, error: "Db error creating client" });
    }
}
async function read(req, res, next) {
    try {
        const client = await Client.findByPk(req.params.id);
        if (client === null) {
            return res.status(400).json({
                error: "Client not found",
            });
        }
        else {
            return res.status(200).json({ client });
        }
    }
    catch (error) {
        console.log("\n\nError getting client: ", error, "\n\n");
        next({ status: 500, error: "Db error getting client" });
    }
}
async function update(req, res, next) {
    try {
        const { id, name, tagLine, phone, alternatePhone, email, address, description, logo, gstNumber, registrationNumber, ein, dbNumber, industryCodes, currency, workingHoursPerDay, workingDaysPerWeek, showProfit, } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        let [affectedRows] = await Client.update({
            name,
            tagLine,
            phone,
            alternatePhone,
            email,
            address,
            description,
            logo,
            gstNumber,
            registrationNumber,
            ein,
            dbNumber,
            industryCodes,
            currency,
            workingHoursPerDay,
            workingDaysPerWeek,
            showProfit,
            updatedBy: reqUser,
        }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "Client not updated. Please try again",
            });
        }
        else {
            const client = await Client.findByPk(id);
            return res.status(200).json({ client });
        }
    }
    catch (error) {
        console.log("\n\nError updating client: ", error, "\n\n");
        next({ status: 500, error: "Db error updating client" });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // const client = await Client.findByPk(id);
        const { count, rows } = await Client.findAndCountAll({ where: { id } });
        const affectedRows = await Client.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} clients` : "Client"} not deleted. Please try again`,
            });
        }
        else {
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} clients` : "Client"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting client(s) ", error, "\n\n");
        next({ status: 500, error: "Db error deleting client(s)" });
    }
}
async function pay(req, res, next) {
    try {
        const { clientId, amount, date, paymentMode, paymentType, plan, duration, comments, } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const client = await Client.findByPk(clientId);
        if (client === null) {
            return res.status(400).json({
                error: "Client not found",
            });
        }
        else {
            const clientPayment = await ClientPayment.create({
                clientId,
                amount,
                date,
                paymentMode,
                paymentType,
                plan,
                duration,
                comments,
                createdBy: reqUser,
                updatedBy: reqUser,
            });
            if (clientPayment.dataValues) {
                // activeTill = Get current activeTill and check if it is less thean or equal to current date the current date + duration (in months) else activeTIll + duration
                let [affectedRows] = await Client.update({
                    activeTill: moment(client.dataValues?.activeTill)
                        .add(1, "months")
                        .toDate(),
                    updatedBy: reqUser,
                }, { where: { id: clientId } });
                return res.status(201).json({ clientPayment });
            }
            else {
                return res.status(400).json({
                    error: "Payment not created. Please try again",
                });
            }
        }
    }
    catch (error) {
        console.log("\n\nError creating payment: ", error, "\n\n");
        next({ status: 500, error: "Db error creating user" });
    }
}
async function payments(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await ClientPayment.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: Client,
                    as: "client",
                },
            ],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ payments: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No payments found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting payments:", error, "\n\n");
        next({ status: 500, error: "Db error getting payments" });
    }
}
export { clients, create, read, update, destroy, pay, payments };
