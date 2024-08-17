import Sequelize from "sequelize";
import sendEmail from "../../libs/email.js";
import { toDateTime } from "../../libs/index.js";
import db from "../../models/index.js";
import sequelize from "../../config/config.js";
import moment from "moment";
const QueryTypes = Sequelize.QueryTypes;
const Op = Sequelize.Op;
const { User, UserPayment, Salary, Attendance, Client, WorkLog, Product } = db;
async function users_OLD(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await User.findAndCountAll({
            attributes: [
                "id",
                "clientId",
                "name",
                "userName",
                "role",
                "phone",
                "email",
                "address",
                "paymentRate",
                "paymentTerm",
                "clients",
                "createdBy",
                "updatedBy",
                "createdAt",
                "updatedAt",
            ],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ users: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No users found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting users:", error, "\n\n");
        next({ status: 500, error: "Db error getting users" });
    }
}
async function users(req, res, next) {
    try {
        const { isBranch } = req.query;
        const { filter, pagination } = res.locals;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const { count, rows } = await User.findAndCountAll({
            attributes: [
                "id",
                "clientId",
                "name",
                "userName",
                "role",
                "phone",
                "email",
                "address",
                "paymentRate",
                "paymentTerm",
                "clients",
                "isActive",
                "createdBy",
                "updatedBy",
                "createdAt",
                "updatedAt",
            ],
            ...filter,
            where: isBranch && isBranch === "1"
                ? {
                    ...filter.where,
                    clients: {
                        [Sequelize.Op.contains]: [clientId],
                    },
                }
                : {
                    ...filter.where,
                },
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ users: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No users found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting users:", error, "\n\n");
        next({ status: 500, error: "Db error getting users" });
    }
}
async function create(req, res, next) {
    try {
        const { clientId, name, userName, password, role, phone, email, address, paymentRate, paymentTerm, clients, } = req.body;
        const rClientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const user = await User.create({
            clientId: clientId && clientId.length > 0 && clientId != "0"
                ? clientId
                : rClientId,
            name,
            userName,
            password,
            role,
            phone,
            email,
            address,
            paymentRate,
            paymentTerm,
            clients,
            isActive: true,
            createdBy: reqUser,
            updatedBy: reqUser,
        });
        if (user.dataValues) {
            const rUser = await User.findByPk(reqUser);
            let mailSubject = 'New User "' +
                user?.name +
                '" is created by ' +
                rUser?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, user, false));
            return res.status(201).json({ user });
        }
        else {
            return res.status(400).json({
                error: "User not created. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError creating user: ", error, "\n\n");
        next({ status: 500, error: "Db error creating user" });
    }
}
async function read(req, res, next) {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [
                {
                    model: Client,
                    as: "client",
                },
            ],
        });
        if (user === null) {
            return res.status(400).json({
                error: "User not found",
            });
        }
        else {
            user.password = "";
            return res.status(200).json({ user });
        }
    }
    catch (error) {
        console.log("\n\nError getting user: ", error, "\n\n");
        next({ status: 500, error: "Db error getting user" });
    }
}
async function readInDepth(req, res, next) {
    try {
        let user = await User.findByPk(req.params.id, {
            include: [
                {
                    model: Client,
                    as: "client",
                },
            ],
        });
        if (user === null) {
            return res.status(400).json({
                error: "User not found",
            });
        }
        else {
            user = user.dataValues ? user.dataValues : user;
            user.password = "";
            user.client = user.client.dataValues
                ? user.client.dataValues
                : user.client;
            if (user.client.isBranch) {
                let client = await Client.findByPk(user.client.parentId);
                client = client?.dataValues ? client.dataValues : client;
                if (client && client.id) {
                    user.client.parent = client;
                }
                if (user.client.parent && user.client.parent.subscription) {
                    user.client.parent.subscription = JSON.parse(user.client.parent.subscription);
                    if (user.client.parent.subscription &&
                        user.client.parent.subscription.activeTill) {
                        user.client.parent.subscription.activeTill = new Date(user.client.parent.subscription.activeTill);
                    }
                }
            }
            else {
                if (user.client && user.client.subscription) {
                    user.client.subscription = JSON.parse(user.client.subscription);
                    if (user.client.subscription && user.client.subscription.activeTill) {
                        user.client.subscription.activeTill = new Date(user.client.subscription.activeTill);
                    }
                }
            }
            return res.status(200).json({ user });
        }
    }
    catch (error) {
        console.log("\n\nError getting user: ", error, "\n\n");
        next({ status: 500, error: "Db error getting user" });
    }
}
async function readProfile(req, res, next) {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ["id", "name", "userName", "phone", "email", "address"],
        });
        if (user === null) {
            return res.status(400).json({
                error: "User not found",
            });
        }
        else {
            return res.status(200).json({ user });
        }
    }
    catch (error) {
        console.log("\n\nError getting user: ", error, "\n\n");
        next({ status: 500, error: "Db error getting user" });
    }
}
async function update(req, res, next) {
    try {
        const { id, name, userName, password, role, phone, email, address, paymentRate, paymentTerm, clients, } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const [affectedRows] = await User.update({
            name,
            userName,
            password,
            role,
            phone,
            email,
            address,
            paymentRate,
            paymentTerm,
            clients,
            updatedBy: reqUser,
        }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "User not updated. Please try again",
            });
        }
        else {
            const user = await User.findByPk(id);
            const rUser = await User.findByPk(reqUser);
            let mailSubject = 'User "' +
                user?.name +
                '" is updated by ' +
                rUser?.name +
                " at " +
                toDateTime(new Date());
            sendEmail(mailSubject, getMailBody(mailSubject, user?.dataValues, false));
            return res.status(200).json({ user });
        }
    }
    catch (error) {
        console.log("\n\nError updating user: ", error, "\n\n");
        next({ status: 500, error: "Db error updating user" });
    }
}
async function updateProfile(req, res, next) {
    try {
        const { id, name, userName, phone, email, address } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const [affectedRows] = await User.update({
            name,
            userName,
            phone,
            email,
            address,
            updatedBy: reqUser,
        }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "Profile not updated. Please try again",
            });
        }
        else {
            return res.status(200).json({ isUpdated: true });
        }
    }
    catch (error) {
        console.log("\n\nError updating profile: ", error, "\n\n");
        next({ status: 500, error: "Db error updating profile" });
    }
}
async function changePassword(req, res, next) {
    try {
        const { id, oldPassword, password } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const user = await User.findByPk(id);
        if (user === null) {
            return res.status(400).json({
                error: "User not found",
            });
        }
        else {
            if (user.password === oldPassword) {
                const [affectedRows] = await User.update({
                    password,
                    updatedBy: reqUser,
                }, { where: { id } });
                if (affectedRows !== 1) {
                    return res.status(400).json({
                        error: "Password not changed. Please try again",
                    });
                }
                else {
                    return res.status(200).json({ isChanged: true });
                }
            }
            else {
                return res.status(400).json({
                    error: "Current Password is wrong. Please enter the correct password.",
                });
            }
        }
    }
    catch (error) {
        console.log("\n\nError changing password: ", error, "\n\n");
        next({ status: 500, error: "Db error changing password" });
    }
}
async function destroy(req, res, next) {
    try {
        const { id } = req.params;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // const user = await User.findByPk(id);
        const { count, rows } = await User.findAndCountAll({ where: { id } });
        const affectedRows = await User.destroy({ where: { id } });
        if (affectedRows !== id.length) {
            const notDeleted = id.length - affectedRows;
            return res.status(400).json({
                error: `${notDeleted > 1 ? `${notDeleted} Users` : "User"} not deleted. Please try again`,
            });
        }
        else {
            const rUser = await User.findByPk(reqUser);
            rows.map((u) => {
                let mailSubject = 'User "' +
                    u?.name +
                    '" is deleted by ' +
                    rUser?.name +
                    " at " +
                    toDateTime(new Date());
                sendEmail(mailSubject, getMailBody(mailSubject, u?.dataValues, true));
            });
            return res.status(200).json({
                message: `${id.length > 1 ? `${id.length} Users` : "User"} deleted successfully`,
            });
        }
    }
    catch (error) {
        console.log("\n\nError deleting user ", error, "\n\n");
        next({ status: 500, error: "Db error deleting user" });
    }
}
async function updateStatus(req, res, next) {
    try {
        const { id, isActive } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        let [affectedRows] = await User.update({ isActive, updatedBy: reqUser }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "User not updated. Please try again",
            });
        }
        else {
            const user = await User.findByPk(id);
            return res.status(200).json({ user });
        }
    }
    catch (error) {
        console.log("\n\nError updating user: ", error, "\n\n");
        next({ status: 500, error: "Db error updating user" });
    }
}
async function pay(req, res, next) {
    try {
        const { userId, amount, isPaid, date, paymentMode, paymentType, comments } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const userPayment = await UserPayment.create({
            clientId,
            userId,
            amount,
            isPaid,
            isSalary: false,
            date,
            paymentMode,
            paymentType,
            comments,
            isActive: true,
            createdBy: reqUser,
            updatedBy: reqUser,
        });
        if (userPayment.dataValues) {
            const user = await User.findByPk(userId);
            const rUser = await User.findByPk(reqUser);
            let mailSubject = `Amount ${amount} ${isPaid ? "paid to" : "received from"} "${user?.name}" by ${rUser?.name} at ${date}`;
            sendEmail(mailSubject, getPaymentMailBody(mailSubject, user, userPayment));
            // Deactivate all User Payment if paid and received are equal.
            let amountPaid = 0;
            let amountReceived = 0;
            const totalPaid = await getTotalActiveAmount(clientId, userId?.toString(), true, next);
            if (totalPaid && totalPaid.totalAmount && totalPaid.totalAmount > 0) {
                amountPaid = totalPaid.totalAmount;
            }
            const totalReceived = await getTotalActiveAmount(clientId, userId?.toString(), false, next);
            if (totalReceived &&
                totalReceived.totalAmount &&
                totalReceived.totalAmount > 0) {
                amountReceived = totalReceived.totalAmount;
            }
            if ((amountPaid > 0 || amountReceived > 0) &&
                amountPaid === amountReceived) {
                const [affectedRows] = await UserPayment.update({
                    isActive: false,
                    updatedBy: reqUser,
                }, {
                    where: {
                        clientId: clientId,
                        userId: userId,
                        isActive: true,
                    },
                });
            }
            return res.status(201).json({ userPayment });
        }
        else {
            return res.status(400).json({
                error: "Payment not created. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError creating payment: ", error, "\n\n");
        next({ status: 500, error: "Db error creating payment" });
    }
}
async function editPayment(req, res, next) {
    try {
        const { id, amount, date, paymentMode, paymentType, comments } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const [affectedRows] = await UserPayment.update({
            amount,
            date,
            paymentMode,
            paymentType,
            comments,
            updatedBy: reqUser,
        }, { where: { id } });
        if (affectedRows !== 1) {
            return res.status(400).json({
                error: "Payment not updated. Please try again",
            });
        }
        else {
            const userPayment = await UserPayment.findByPk(id);
            return res.status(200).json({ userPayment });
        }
    }
    catch (error) {
        console.log("\n\nError updating payment: ", error, "\n\n");
        next({ status: 500, error: "Db error updating payment" });
    }
}
async function payments(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { userId } = req.query;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const { count, rows } = await UserPayment.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: User,
                    as: "user",
                },
            ],
            ...filter,
        });
        let summary = {
            amountPaid: 0,
            amountReceived: 0,
            amountPayable: 0,
            amountReceivable: 0,
        };
        if (userId) {
            const totalPaid = await getTotalActiveAmount(clientId, userId?.toString(), true, next);
            if (totalPaid && totalPaid.totalAmount && totalPaid.totalAmount > 0) {
                summary.amountPaid = totalPaid.totalAmount;
            }
            const totalReceived = await getTotalActiveAmount(clientId, userId?.toString(), false, next);
            if (totalReceived &&
                totalReceived.totalAmount &&
                totalReceived.totalAmount > 0) {
                summary.amountReceived = totalReceived.totalAmount;
            }
            if (summary.amountPaid > summary.amountReceived) {
                summary.amountReceivable = summary.amountPaid - summary.amountReceived;
            }
            else if (summary.amountReceived > summary.amountPaid) {
                summary.amountPayable = summary.amountReceived - summary.amountPaid;
            }
        }
        if (count) {
            pagination.count = count;
            return res.status(200).json({ summary, payments: rows, pagination });
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
async function readPayment(req, res, next) {
    try {
        const userPayment = await UserPayment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: "user",
                },
            ],
        });
        if (userPayment === null) {
            return res.status(400).json({
                error: "Payment not found",
            });
        }
        else {
            const salary = await Salary.findOne({
                where: {
                    userPaymentId: req.params.id,
                },
            });
            return res
                .status(200)
                .json({ userPayment: { ...userPayment.dataValues, salary } });
        }
    }
    catch (error) {
        console.log("\n\nError getting payment: ", error, "\n\n");
        next({ status: 500, error: "Db error getting payment" });
    }
}
async function logTime(req, res, next) {
    try {
        const { userId, comments } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        const lastAttendance = await Attendance.findOne({
            where: {
                clientId: clientId,
                userId: userId?.toString(),
                isActive: true,
            },
            order: [["updatedAt", "DESC"]],
        });
        let isLogged = false;
        let isSwipeIn = true;
        if (lastAttendance && lastAttendance.outTime === null) {
            var now = moment(new Date());
            var start = moment(lastAttendance.inTime);
            var duration = moment.duration(now.diff(start));
            var seconds = duration.asSeconds();
            const [affectedRows] = await Attendance.update({
                outTime: new Date(),
                duration: seconds,
                updatedBy: reqUser,
            }, { where: { id: lastAttendance.id } });
            if (affectedRows > 0) {
                isLogged = true;
                isSwipeIn = false;
            }
        }
        else {
            const attendance = await Attendance.create({
                clientId,
                userId,
                inTime: new Date(),
                comments,
                isActive: true,
                createdBy: reqUser,
                updatedBy: reqUser,
            });
            if (attendance && attendance.id) {
                isLogged = true;
                isSwipeIn = true;
            }
        }
        if (isLogged) {
            return res.status(201).json({ isLogged, isSwipeIn });
        }
        else {
            return res.status(400).json({
                error: "Failed to log time. Please try again",
            });
        }
    }
    catch (error) {
        console.log("\n\nError logginr time: ", error, "\n\n");
        next({ status: 500, error: "Db error logging time" });
    }
}
async function loginStatus(req, res, next) {
    try {
        const { userId } = req.query;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        if (userId && userId?.toString().length > 0) {
            const lastAttendance = await Attendance.findOne({
                where: {
                    clientId: clientId,
                    userId: userId?.toString(),
                    isActive: true,
                },
                order: [["updatedAt", "DESC"]],
            });
            let isLoggedIn = false;
            if (lastAttendance && lastAttendance.outTime === null) {
                isLoggedIn = true;
            }
            return res.status(201).json({ isLoggedIn, lastAttendance });
        }
        else {
            return res.status(400).json({
                error: "User Id is required.",
            });
        }
    }
    catch (error) {
        console.log("\n\nError loading loggin status: ", error, "\n\n");
        next({ status: 500, error: "Db error loading loggin status" });
    }
}
async function attendanceList(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Attendance.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: User,
                    as: "user",
                },
            ],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ attendances: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No attendance found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting attendance:", error, "\n\n");
        next({ status: 500, error: "Db error getting attendance" });
    }
}
async function salaries(req, res, next) {
    try {
        const { filter, pagination } = res.locals;
        const { count, rows } = await Salary.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: User,
                    as: "user",
                },
            ],
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ salary: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No salarys found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting salarys:", error, "\n\n");
        next({ status: 500, error: "Db error getting salarys" });
    }
}
async function getSalaryInfo(req, res, next) {
    try {
        const { userId } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        // Load last salary row
        const lastSalary = await Salary.findOne({
            where: {
                clientId: clientId,
                userId: userId?.toString(),
            },
            order: [["createdAt", "DESC"]],
        });
        if (lastSalary &&
            lastSalary.toDate &&
            moment().diff(moment(lastSalary.toDate, "hours")) < 24) {
            return res.status(400).json({
                error: `You have done the salary calculation ${moment(lastSalary.toDate).fromNow()} for this user. So please wait 24 hours to calculate salary again.`,
            });
        }
        else {
            const user = await User.findByPk(userId);
            if (user === null) {
                return res.status(400).json({
                    error: "User not found",
                });
            }
            else {
                const client = await Client.findByPk(clientId);
                if (client === null) {
                    return res.status(400).json({
                        error: "Client not found",
                    });
                }
                else {
                    let attendanceList = [];
                    const attendanceRows = await Attendance.findAll({
                        where: {
                            clientId: clientId,
                            userId: userId,
                            isActive: true,
                            duration: {
                                [Op.gt]: 0,
                            },
                            // outTime: {
                            //   [Op.not]: undefined,
                            // },
                        },
                        order: [["outTime", "DESC"]],
                    });
                    if (attendanceRows && attendanceRows.length > 0) {
                        const paymentTerm = user.dataValues?.paymentTerm;
                        const paymentRate = user.dataValues?.paymentRate
                            ? user.dataValues?.paymentRate
                            : 0;
                        let ratePerHour = 0;
                        if (paymentTerm === "hour") {
                            ratePerHour = paymentRate;
                        }
                        else {
                            const workingHoursPerDay = client.dataValues?.workingHoursPerDay
                                ? client.dataValues?.workingHoursPerDay
                                : 0;
                            const workingDaysPerWeek = client.dataValues?.workingDaysPerWeek
                                ? client.dataValues?.workingDaysPerWeek
                                : 0;
                            if (paymentTerm === "day") {
                                ratePerHour = paymentRate / workingHoursPerDay;
                            }
                            else if (paymentTerm === "week") {
                                ratePerHour =
                                    paymentRate / (workingHoursPerDay * workingDaysPerWeek);
                            }
                            else if (paymentTerm === "month") {
                                ratePerHour =
                                    paymentRate / (workingHoursPerDay * workingDaysPerWeek * 4);
                            }
                        }
                        // Calculate amount for each attendance row.
                        attendanceRows.map((a) => {
                            let amount = 0;
                            let duration = a.duration ? a.duration : 0;
                            const activeMinutes = duration / 60;
                            amount = (activeMinutes / 60) * ratePerHour;
                            if (amount > 0) {
                                amount = +amount.toFixed(2);
                            }
                            attendanceList.push({
                                ...(a.dataValues ? a.dataValues : a),
                                amount,
                            });
                        });
                    }
                    // Get work log list
                    const workLogRows = await WorkLog.findAll({
                        include: [
                            {
                                model: Product,
                                as: "product",
                            },
                        ],
                        where: {
                            clientId: clientId,
                            userId: userId,
                            isActive: true,
                        },
                        order: [["date", "DESC"]],
                    });
                    return res.status(200).json({
                        salaryInfo: {
                            attendances: attendanceList,
                            workLogs: workLogRows,
                        },
                    });
                }
            }
        }
    }
    catch (error) {
        console.log("\n\nError getting salary info: ", error, "\n\n");
        next({ status: 500, error: "Db error getting salary info" });
    }
}
async function approveSalary(req, res, next) {
    try {
        const { userId, attendances, workLogs, bonus, deduction, totalAmount, totalSalary, from, to, comments, } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // Create user payment
        const userPayment = await UserPayment.create({
            clientId,
            userId,
            amount: totalSalary,
            isPaid: false,
            isSalary: true,
            date: new Date(),
            paymentMode: "",
            paymentType: "",
            comments: comments,
            isActive: true,
            createdBy: reqUser,
            updatedBy: reqUser,
        });
        if (userPayment.dataValues) {
            // Update all active Attendance rows to inactive
            if (attendances && attendances.length > 0) {
                const [affectedRows] = await Attendance.update({
                    isActive: false,
                    updatedBy: reqUser,
                }, {
                    where: {
                        id: {
                            [Op.in]: attendances.map((a) => a.id),
                        },
                    },
                });
            }
            // Update all active Work Log rows to inactive
            if (workLogs && workLogs.length > 0) {
                // for(let i = 0;i < workLogs.length;i++){
                //   const [affectedRows] = await WorkLog.update(
                //     {
                //       amount: +workLogs[i].amount,
                //       isActive: false,
                //       updatedBy: reqUser,
                //     },
                //     {
                //       where: {
                //         id:{
                //           [Op.in]: workLogs[i].id
                //         }
                //       },
                //     }
                //   );
                // }
                let wlUpdateQuery = "";
                workLogs.map((w) => {
                    wlUpdateQuery += `UPDATE public."workLog" SET "amount" = ${+w.amount}, "isActive" = false, "updatedBy" = '${reqUser}'  WHERE id = '${w.id}';`;
                });
                const affectedRows = await sequelize.query(wlUpdateQuery, {
                    type: QueryTypes.UPDATE,
                });
            }
            // Create salary
            const salary = await Salary.create({
                clientId,
                userId,
                userPaymentId: userPayment.dataValues.id,
                fromDate: from,
                toDate: to,
                amount: totalAmount,
                bonus: bonus,
                deduction: deduction,
                totalAmount: totalSalary,
                comments: comments,
                details: JSON.stringify(req.body),
                createdBy: reqUser,
                updatedBy: reqUser,
            });
            if (salary.dataValues) {
                return res.status(200).json({ salary: salary });
            }
            else {
                return res.status(400).json({
                    error: "Failed to create salary.",
                });
            }
        }
        else {
            return res.status(400).json({
                error: "Failed to create payment.",
            });
        }
    }
    catch (error) {
        console.log("\n\nError approve salary: ", error, "\n\n");
        next({ status: 500, error: "Db error approve salary" });
    }
}
async function calculateSalary(req, res, next) {
    try {
        const { userId, comments } = req.body;
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        // Load last salary row
        const lastSalary = await Salary.findOne({
            where: {
                clientId: clientId,
                userId: userId?.toString(),
            },
            order: [["createdAt", "DESC"]],
        });
        if (lastSalary &&
            lastSalary.toDate &&
            moment().diff(moment(lastSalary.toDate, "hours")) < 24) {
            return res.status(400).json({
                error: `You have done the salary calculation ${moment(lastSalary.toDate).fromNow()} for this user. So please wait 24 hours to calculate salary again.`,
            });
        }
        else {
            let totalActiveDurations = 0;
            // let totalActiveWorkLogAmount = 0;
            // Load active duration from attendance
            const totalActiveDurationsResult = await getTotalActiveDuration(clientId, userId?.toString(), next);
            if (totalActiveDurationsResult &&
                totalActiveDurationsResult.totalDuration &&
                totalActiveDurationsResult.totalDuration > 0) {
                totalActiveDurations = totalActiveDurationsResult.totalDuration;
            }
            // Load active work log amount from work log
            // const totalActiveWorkLogAmountResult: any = await getTotalActiveWorkLogAmount(
            //   clientId,
            //   userId?.toString(),
            //   next
            // );
            // if (
            //   totalActiveWorkLogAmountResult &&
            //   totalActiveWorkLogAmountResult.totalAmount &&
            //   totalActiveWorkLogAmountResult.totalAmount > 0
            // ) {
            //   totalActiveWorkLogAmount = totalActiveWorkLogAmountResult.totalAmount;
            // }
            if (totalActiveDurations && totalActiveDurations > 0) {
                // Load salary from
                const salaryFrom = await Attendance.findOne({
                    where: {
                        clientId: clientId,
                        userId: userId?.toString(),
                        isActive: true,
                        duration: {
                            [Op.gt]: 0,
                        },
                        // outTime: {
                        //   [Op.not]: undefined,
                        // },
                    },
                    order: [["inTime", "ASC"]],
                    raw: true,
                });
                // Load salary to
                const salaryTo = await Attendance.findOne({
                    where: {
                        clientId: clientId,
                        userId: userId?.toString(),
                        isActive: true,
                        duration: {
                            [Op.gt]: 0,
                        },
                        // outTime: {
                        //   [Op.not]: undefined,
                        // },
                    },
                    order: [["outTime", "DESC"]],
                    raw: true,
                });
                if (salaryFrom && salaryFrom?.inTime && salaryTo && salaryTo?.outTime) {
                    // Load user
                    const user = await User.findByPk(userId);
                    if (user === null) {
                        return res.status(400).json({
                            error: "User not found",
                        });
                    }
                    else {
                        const paymentTerm = user.dataValues?.paymentTerm;
                        const paymentRate = user.dataValues?.paymentRate
                            ? user.dataValues?.paymentRate
                            : 0;
                        let ratePerHour = 0;
                        if (paymentTerm === "hour") {
                            ratePerHour = paymentRate;
                        }
                        else {
                            // Load client
                            const client = await Client.findByPk(clientId);
                            if (client === null) {
                                return res.status(400).json({
                                    error: "Client not found",
                                });
                            }
                            else {
                                const workingHoursPerDay = client.dataValues?.workingHoursPerDay
                                    ? client.dataValues?.workingHoursPerDay
                                    : 0;
                                const workingDaysPerWeek = client.dataValues?.workingDaysPerWeek
                                    ? client.dataValues?.workingDaysPerWeek
                                    : 0;
                                if (paymentTerm === "day") {
                                    ratePerHour = paymentRate / workingHoursPerDay;
                                }
                                else if (paymentTerm === "week") {
                                    ratePerHour =
                                        paymentRate / (workingHoursPerDay * workingDaysPerWeek);
                                }
                                else if (paymentTerm === "month") {
                                    ratePerHour =
                                        paymentRate / (workingHoursPerDay * workingDaysPerWeek * 4);
                                }
                            }
                        }
                        const totalActiveMinutes = totalActiveDurations / 60;
                        let totalSalary = (totalActiveMinutes / 60) * ratePerHour;
                        if (totalSalary > 0) {
                            totalSalary = +totalSalary.toFixed(2);
                        }
                        if (totalSalary && totalSalary > 0) {
                            // Create user payment
                            const userPayment = await UserPayment.create({
                                clientId,
                                userId,
                                amount: totalSalary,
                                isPaid: false,
                                isSalary: true,
                                date: new Date(),
                                paymentMode: "",
                                paymentType: "",
                                comments: `Salary calculated for the work done from ${toDateTime(salaryFrom?.inTime)} to ${toDateTime(salaryTo?.outTime)} (${(totalActiveMinutes / 60).toFixed(2)} hours)`,
                                isActive: true,
                                createdBy: reqUser,
                                updatedBy: reqUser,
                            });
                            if (userPayment.dataValues) {
                                // Update all active Attendance rows to inactive
                                const [affectedRows] = await Attendance.update({
                                    isActive: false,
                                    updatedBy: reqUser,
                                }, {
                                    where: {
                                        clientId: clientId,
                                        userId: userId?.toString(),
                                        isActive: true,
                                        duration: {
                                            [Op.gt]: 0,
                                        },
                                        // outTime: {
                                        //   [Op.not]: undefined,
                                        // },
                                    },
                                });
                                // Create salary
                                const salary = await Salary.create({
                                    clientId,
                                    userId,
                                    userPaymentId: userPayment.dataValues.id,
                                    amount: totalSalary,
                                    fromDate: salaryFrom?.inTime,
                                    toDate: salaryTo?.outTime,
                                    bonus: 0,
                                    deduction: 0,
                                    totalAmount: 0,
                                    comments: `Salary calculated for the work done from ${toDateTime(salaryFrom?.inTime)} to ${toDateTime(salaryTo?.outTime)}`,
                                    createdBy: reqUser,
                                    updatedBy: reqUser,
                                });
                                if (salary.dataValues) {
                                    return res.status(200).json({ salary: salary });
                                }
                                else {
                                    return res.status(400).json({
                                        error: "Failed to calculated salary.",
                                    });
                                }
                            }
                            else {
                                return res.status(400).json({
                                    error: "Failed to calculated salary.",
                                });
                            }
                        }
                        else {
                            return res.status(400).json({
                                error: "Calculated salary is 0.",
                            });
                        }
                    }
                }
                else {
                    return res.status(400).json({
                        error: "Salary can not be calculated for this user, because there is no proper attendance.",
                    });
                }
            }
            else {
                return res.status(400).json({
                    error: "Salary can not be calculated for this user, because total duration worked is 0.",
                });
            }
        }
    }
    catch (error) {
        console.log("\n\nError calculating salary: ", error, "\n\n");
        next({ status: 500, error: "Db error calculating salary" });
    }
}
async function getTotalActiveAmount(clientId, userId, isPaid, next) {
    try {
        return await UserPayment.findOne({
            attributes: [
                [sequelize.fn("sum", sequelize.col("amount")), "totalAmount"],
            ],
            group: ["userId"],
            where: {
                clientId: clientId,
                userId: userId?.toString(),
                isPaid: isPaid,
                isActive: true,
            },
            raw: true,
        });
    }
    catch (error) {
        console.log("\n\nError calculating active amount: ", error, "\n\n");
        next({ status: 500, error: "Db error calculating active amount" });
    }
}
async function getTotalActiveDuration(clientId, userId, next) {
    try {
        return await Attendance.findOne({
            attributes: [
                [sequelize.fn("sum", sequelize.col("duration")), "totalDuration"],
            ],
            group: ["userId"],
            where: {
                clientId: clientId,
                userId: userId,
                isActive: true,
                duration: {
                    [Op.gt]: 0,
                },
                // outTime: {
                //   [Op.not]: undefined,
                // },
            },
            raw: true,
        });
    }
    catch (error) {
        console.log("\n\nError calculating attendance active amount: ", error, "\n\n");
        next({
            status: 500,
            error: "Db error calculating attendance active amount",
        });
    }
}
async function getTotalActiveWorkLogAmount(clientId, userId, next) {
    try {
        return await WorkLog.findOne({
            attributes: [
                [sequelize.fn("sum", sequelize.col("amount")), "totalAmount"],
            ],
            group: ["userId"],
            where: {
                clientId: clientId,
                userId: userId,
                isActive: true,
            },
            raw: true,
        });
    }
    catch (error) {
        console.log("\n\nError calculating work log active amount: ", error, "\n\n");
        next({ status: 500, error: "Db error calculating work log active amount" });
    }
}
const getMailBody = (title, user, isCancel = false) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="${isCancel
        ? "font-weight: bold; color: #dc3545; background-color: #FFFFFF; border-radius: 2px; padding: 3px;"
        : "font-weight: bold;"}">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">User Details:</span></div>
    <div><span style="font-weight: bold;">Name: </span><span>${user?.name}</span></div>
    <div><span style="font-weight: bold;">User Name: </span><span>${user?.userName}</span></div>
    <div><span style="font-weight: bold;">Role: </span><span>${user?.role}</span></div>
    <div><span style="font-weight: bold;">Phone: </span><span>${user?.phone}</span></div>
    <div><span style="font-weight: bold;">Email: </span><span>${user?.email ? user?.email : ""}</span></div>
    <div><span style="font-weight: bold;">Address: </span><span>${user?.address ? user?.address : ""}</span></div>
    <div><span style="font-weight: bold;">Payment Rate: </span><span>${user?.paymentRate}</span></div>
    <div><span style="font-weight: bold;">Payment Term: </span><span>${user?.paymentTerm}</span></div>
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
const getPaymentMailBody = (title, user, payment) => {
    let mailBody = `<div style="background-color: #3d89ae; color: #FFFFFF; width: auto; display: inline-block; padding: 15px; font-size: 15px; border-radius: 11px;">
    <div style="margin-bottom: 20px;"><span style="font-weight: bold;">${title}</span></div>
    <div><span style="font-weight: bold; text-decoration: underline;">User Details:</span></div>
    <div><span style="font-weight: bold;">Name: </span><span>${user?.name}</span></div>
    <div><span style="font-weight: bold;">User Name: </span><span>${payment?.amount}</span></div>
    <div><span style="font-weight: bold;">Payment: </span><span>${payment?.isPaid ? "Paid" : "Received"}</span></div>
    <div><span style="font-weight: bold;">Date: </span><span>${payment?.date}</span></div>   
    </div><div style="margin-top: 30px;">
    <div><span style="font-weight: bold;">Thanks & Regards,</span></div>
    <div><span>Sri Amman Hollowblocks</span></div>
    </div>`;
    return mailBody;
};
export { users, create, read, readInDepth, readProfile, update, updateProfile, changePassword, destroy, updateStatus, pay, editPayment, payments, readPayment, logTime, loginStatus, attendanceList, salaries, getSalaryInfo, approveSalary, calculateSalary, };
