import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../constants/index.js";
import db from "../../models/index.js";
const { User, Client } = db;
async function login(req, res, next) {
    try {
        const { userName, password } = req.body;
        let user = await User.findOne({
            include: [
                {
                    model: Client,
                    as: "client",
                },
            ],
            where: { userName, password },
        });
        if (user && user.id) {
            user = user.dataValues ? user.dataValues : user;
            user.password = "";
            if (user.isActive) {
                user.client = user.client.dataValues
                    ? user.client.dataValues
                    : user.client;
                if (user.client && user.client.isActive) {
                    if (user.client.isBranch) {
                        const client = await Client.findByPk(user.client.parentId);
                        if (client && client.dataValues && client.dataValues.id) {
                            user.client.parent = client.dataValues;
                            if (user.client.parent && user.client.parent.subscription) {
                                user.client.parent.subscription = JSON.parse(user.client.parent.subscription);
                                if (user.client.parent.subscription &&
                                    user.client.parent.subscription.activeTill) {
                                    user.client.parent.subscription.activeTill = new Date(user.client.parent.subscription.activeTill);
                                }
                            }
                        }
                    }
                    else {
                        if (user.client.subscription) {
                            user.client.subscription = JSON.parse(user.client.subscription);
                            if (user.client.subscription &&
                                user.client.subscription.activeTill) {
                                user.client.subscription.activeTill = new Date(user.client.subscription.activeTill);
                            }
                        }
                    }
                    if (!user.client.isBranch ||
                        (user.client.parent &&
                            user.client.parent.subscription &&
                            user.client.parent.subscription.activeTill &&
                            user.client.parent.subscription.activeTill.getTime() >
                                new Date().getTime())) {
                        // Load all associated clients
                        if (user.clients && user.clients.length > 0) {
                            user.clients = await Client.findAll({
                                where: {
                                    id: user.clients,
                                },
                            });
                        }
                        // const client = await Client.findByPk(user.clientId);
                        // generate token
                        let token = jwt.sign({ username: req.body.userName }, JWT_SECRET, {
                            expiresIn: "24h",
                        }); // expires in 24 hours
                        return res.status(200).json({ appUser: { token, user } });
                    }
                    else {
                        return res.status(401).json({
                            error: `Your organization's subscription is over, so you can not login. Please contact administrator.`,
                        });
                    }
                }
                else {
                    return res.status(401).json({
                        error: `Your ${user.client.isBranch ? " branch " : " organization "} is not active, so you can not login. Please contact administrator.`,
                    });
                }
            }
            else {
                return res.status(401).json({
                    error: "You do not have access to login. Please contact administrator.",
                });
            }
        }
        else {
            return res.status(401).json({
                error: "Invalid credientials. Please provide correct user name and password.",
            });
        }
    }
    catch (error) {
        console.log("\n\nError login user:", error, "\n\n");
        next({ status: 500, error: "Db error login user" });
    }
}
export { login };
