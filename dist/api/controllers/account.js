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
            user.password = "";
            // const client = await Client.findByPk(user.clientId);
            // generate token
            let token = jwt.sign({ username: req.body.userName }, JWT_SECRET, {
                expiresIn: "24h",
            }); // expires in 24 hours
            return res.status(200).json({ appUser: { token, user } });
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
