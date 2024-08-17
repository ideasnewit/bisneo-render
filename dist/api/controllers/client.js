import db from "../../models/index.js";
import moment from "moment";
import { getPaymaneDuration } from "../../libs/index.js";
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
        const { name, tagLine, phone, alternatePhone, email, address, description, logo, gstNumber, registrationNumber, ein, dbNumber, industryCodes, userName, userLoginUserName, userPassword, userPhone, userEmail, userAddress, userPaymentRate, userPaymentTerm, branchName, branchPhone, branchAlternatePhone, branchEmail, branchAddress, currency, workingHoursPerDay, workingDaysPerWeek,
        // branchUserName,
        // branchUserLoginUserName,
        // branchUserPassword,
        // branchUserPhone,
        // branchUserEmail,
        // branchUserAddress,
        // branchUserPaymentRate,
        // branchUserPaymentTerm,
         } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : null;
        const userCount = await User.count({
            where: { userName: userLoginUserName },
        });
        // if (userLoginUserName === branchUserLoginUserName) {
        //   return res.status(400).json({
        //     error: "Organization user name and branch user name can not be same.",
        //   });
        // } else {
        if (userCount > 0) {
            return res.status(400).json({
                error: "Organization User Login User Name already exists. Please use different user name.",
            });
        }
        else {
            // const branchUserCount = await User.count({
            //   where: { userName: branchUserLoginUserName },
            // });
            // if (branchUserCount > 0) {
            //   return res.status(400).json({
            //     error:
            //       "Branch User Login User Name already exists. Please use different user name.",
            //   });
            // } else {
            // const clientCount = await Client.count({
            //   where: { phone: phone },
            // });
            // if (clientCount > 0) {
            //   return res.status(400).json({
            //     error:
            //       "Organization with the same phone number already exists. Please use different phone number to register or login with the admin user name and password you have given while registering, if you have already registered.",
            //   });
            // } else {
            const duration = getPaymaneDuration("FREE");
            const subscription = {
                type: "FREE",
                duration: duration,
                activeTill: moment(new Date()).add(duration, "months").toDate(),
                branches: 1,
                users: 1,
                amount: 0,
            };
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
                // activeTill: moment(new Date()).add(1, "months").toDate(),
                isBranch: false,
                isActive: true,
                subscription: JSON.stringify(subscription),
                createdBy: reqUser ? reqUser : undefined,
                updatedBy: reqUser ? reqUser : undefined,
            });
            if (client && client.dataValues) {
                const clientBranch = await Client.create({
                    name: branchName,
                    tagLine: tagLine,
                    phone: branchPhone,
                    alternatePhone: branchAlternatePhone,
                    email: branchEmail,
                    address: branchAddress,
                    description: description,
                    logo: logo,
                    gstNumber: gstNumber,
                    registrationNumber: registrationNumber,
                    ein: ein,
                    dbNumber: dbNumber,
                    industryCodes: industryCodes,
                    currency: currency,
                    workingHoursPerDay: workingHoursPerDay,
                    workingDaysPerWeek: workingDaysPerWeek,
                    showProfit: true,
                    // activeTill: moment(new Date()).add(1, "months").toDate(),
                    isBranch: true,
                    parentId: client.dataValues.id,
                    isActive: true,
                    createdBy: reqUser ? reqUser : undefined,
                    updatedBy: reqUser ? reqUser : undefined,
                });
                const clientUser = await User.create({
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
                    clients: clientBranch &&
                        clientBranch.dataValues &&
                        clientBranch.dataValues.id
                        ? [client.dataValues.id, clientBranch.dataValues.id]
                        : [client.dataValues.id],
                    isActive: true,
                    createdBy: reqUser ? reqUser : undefined,
                    updatedBy: reqUser ? reqUser : undefined,
                });
                // if (clientBranch && clientBranch.dataValues) {
                //   const branchUser = await User.create({
                //     clientId: clientBranch.dataValues.id,
                //     name: branchUserName,
                //     userName: branchUserLoginUserName,
                //     password: branchUserPassword,
                //     role: "ADMIN",
                //     phone: branchUserPhone,
                //     email: branchUserEmail,
                //     address: branchUserAddress,
                //     paymentRate: branchUserPaymentRate ? branchUserPaymentRate : 0,
                //     paymentTerm: branchUserPaymentTerm ? branchUserPaymentTerm : "hour",
                //     createdBy: reqUser ? reqUser : undefined,
                //     updatedBy: reqUser ? reqUser : undefined,
                //   });
                // }
                return res.status(201).json({ client });
            }
            else {
                return res.status(400).json({
                    error: "Client not created. Please try again",
                });
            }
            // }
            // }
        }
        // }
    }
    catch (error) {
        console.log("\n\nError creating client: ", error, "\n\n");
        next({ status: 500, error: "Db error creating client" });
    }
}
async function branches(req, res, next) {
    try {
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const { filter, pagination } = res.locals;
        const { count, rows } = await Client.findAndCountAll({
            ...filter,
            where: {
                parentId: clientId,
                ...filter.where,
            },
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ clients: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No branch found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting clients: ", error, "\n\n");
        next({ status: 500, error: "Db error getting clients" });
    }
}
async function allBranches(req, res, next) {
    try {
        const clientId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const { pagination } = res.locals;
        const { count, rows } = await Client.findAndCountAll({
            attributes: ["id", "name", "isActive"],
            where: {
                parentId: clientId,
            },
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ clients: rows, pagination });
        }
        else {
            return res.status(400).json({
                error: "No branch found",
            });
        }
    }
    catch (error) {
        console.log("\n\nError getting clients: ", error, "\n\n");
        next({ status: 500, error: "Db error getting clients" });
    }
}
async function addBranch(req, res, next) {
    try {
        const { name, tagLine, phone, alternatePhone, email, address, description, logo, gstNumber, registrationNumber, ein, dbNumber, industryCodes, currency, workingHoursPerDay, workingDaysPerWeek,
        // userName,
        // userLoginUserName,
        // userPassword,
        // userPhone,
        // userEmail,
        // userAddress,
        // userPaymentRate,
        // userPaymentTerm,
         } = req.body;
        const parentId = req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : null;
        // const userCount = await User.count({
        //   where: { userName: userName },
        // });
        // if (userCount > 0) {
        //   return res.status(400).json({
        //     error:
        //       "Branch User Login User Name already exists. Please use different user name.",
        //   });
        // } else {
        // const clientCount = await Client.count({
        //   where: { phone: phone },
        // });
        // if (clientCount > 0) {
        //   return res.status(400).json({
        //     error:
        //       "Branch with the same phone number already exists. Please use different phone number to register a new branch.",
        //   });
        // } else {
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
            // activeTill: moment(new Date()).add(1, "months").toDate(),
            isBranch: true,
            parentId: parentId,
            isActive: true,
            createdBy: reqUser ? reqUser : undefined,
            updatedBy: reqUser ? reqUser : undefined,
        });
        if (client && client.dataValues) {
            // const branchUser = await User.create({
            //   clientId: client.dataValues.id,
            //   name: userName,
            //   userName: userLoginUserName,
            //   password: userPassword,
            //   role: "ADMIN",
            //   phone: userPhone,
            //   email: userEmail,
            //   address: userAddress,
            //   paymentRate: userPaymentRate ? userPaymentRate : 0,
            //   paymentTerm: userPaymentTerm ? userPaymentTerm : "hour",
            //   createdBy: reqUser ? reqUser : undefined,
            //   updatedBy: reqUser ? reqUser : undefined,
            // });
            return res.status(201).json({ client });
        }
        else {
            return res.status(400).json({
                error: "Branch not created. Please try again",
            });
        }
        // }
        // }
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
async function updateStatus(req, res, next) {
    try {
        const { id, isActive } = req.body;
        const reqUser = req.headers["user-id"]
            ? req.headers["user-id"].toString()
            : "";
        let [affectedRows] = await Client.update({ isActive, updatedBy: reqUser }, { where: { id } });
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
        // const { count, rows } = await Client.findAndCountAll({ where: { id } });
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
        const { clientId, date, plan, transaction, paymentMode, paymentType, 
        // duration,
        comments, } = req.body;
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
            let lastActiveTill = moment(new Date());
            try {
                const lastSubscription = JSON.parse(client.dataValues?.subscription
                    ? client.dataValues?.subscription
                    : "{}");
                if (lastSubscription && lastSubscription.activeTill) {
                    const tempLastActiveTill = moment(lastSubscription?.activeTill);
                    if (tempLastActiveTill.isAfter(lastActiveTill)) {
                        lastActiveTill = tempLastActiveTill;
                    }
                }
            }
            catch (ex) {
                lastActiveTill = moment(new Date());
            }
            const duration = getPaymaneDuration(plan.type);
            const subscription = {
                type: plan.type,
                duration: duration,
                activeTill: lastActiveTill.add(duration, "months").toDate(),
                branches: plan.branches,
                users: plan.users,
                amount: plan.amount,
            };
            const clientPayment = await ClientPayment.create({
                clientId,
                amount: plan.amount,
                date,
                transaction: JSON.stringify(transaction),
                paymentMode,
                paymentType,
                // plan,
                // duration,
                subscription: JSON.stringify(subscription),
                comments,
                createdBy: reqUser,
                updatedBy: reqUser,
            });
            if (clientPayment.dataValues) {
                let [affectedRows] = await Client.update({
                    // activeTill: activeTill,
                    subscription: JSON.stringify(subscription),
                    updatedBy: reqUser,
                }, { where: { id: clientId } });
                const updatedClient = await Client.findByPk(clientId);
                return res.status(201).json({ client: updatedClient });
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
        next({ status: 500, error: "Db error creating payment" });
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
async function requestFreeAccess(req, res, next) {
    try {
        const { clientId } = req.body;
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
            let lastActiveTill = moment(new Date());
            try {
                const lastSubscription = JSON.parse(client.dataValues?.subscription
                    ? client.dataValues?.subscription
                    : "{}");
                if (lastSubscription && lastSubscription.activeTill) {
                    const tempLastActiveTill = moment(lastSubscription?.activeTill);
                    if (tempLastActiveTill.isAfter(lastActiveTill)) {
                        lastActiveTill = tempLastActiveTill;
                    }
                }
            }
            catch (ex) {
                lastActiveTill = moment(new Date());
            }
            const duration = getPaymaneDuration("FREE");
            const subscription = {
                type: "FREE",
                duration: duration,
                activeTill: lastActiveTill.add(duration, "months").toDate(),
                branches: 1,
                users: 1,
                amount: 0,
            };
            // let activeTill: any = moment(client.dataValues?.activeTill);
            // activeTill = activeTill.add(1, "months").toDate();
            let [affectedRows] = await Client.update({
                // activeTill: activeTill,
                subscription: JSON.stringify(subscription),
                updatedBy: reqUser,
            }, { where: { id: clientId } });
            const updatedClient = await Client.findByPk(clientId);
            return res.status(201).json({ client: updatedClient });
        }
    }
    catch (error) {
        console.log("\n\nError requesting free access: ", error, "\n\n");
        next({ status: 500, error: "Db error requesting free access" });
    }
}
export { clients, create, addBranch, branches, allBranches, read, update, updateStatus, destroy, pay, payments, requestFreeAccess, };
