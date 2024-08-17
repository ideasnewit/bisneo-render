import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../constants/index.js";
const createInvalidDataObject = (errors) => {
    const invalidData = {};
    for (const error of errors) {
        if (error.nestedErrors) {
            error.nestedErrors.forEach((error) => (invalidData[error.param] = error.msg));
        }
        else {
            invalidData[error.param] = error.msg;
        }
    }
    return invalidData;
};
export function validate(req, res, next) {
    try {
        let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase
        if (token && token.toString().startsWith("Bearer ")) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        if (token) {
            let clientId = req.headers["client-id"]
                ? req.headers["client-id"].toString()
                : "";
            let userId = req.headers["user-id"]
                ? req.headers["user-id"].toString()
                : "";
            if (clientId.length > 0 && userId.length > 0) {
                jwt.verify(token.toString(), JWT_SECRET, (err, decoded) => {
                    if (err) {
                        return res.status(401).json({
                            error: "Authentication Token is not valid.",
                        });
                    }
                    else {
                        // req.decoded = decoded;
                        // next();
                        const errors = validationResult(req);
                        if (errors.isEmpty()) {
                            next();
                        }
                        else {
                            const errs = errors.array();
                            const invalidData = createInvalidDataObject(errs);
                            return res.status(400).json({
                                invalidData,
                            });
                        }
                    }
                });
            }
            else {
                let msg = "";
                if (userId.length < 1) {
                    msg = "an user-id";
                }
                if (clientId.length < 1) {
                    if (msg.length > 0) {
                        msg += " and client-id.";
                    }
                    else {
                        msg = "client-id.";
                    }
                }
                return res.status(401).json({
                    error: `Please provide ${msg}`,
                });
            }
        }
        else {
            return res.status(401).json({
                error: "Please provide an authentication token.",
            });
        }
    }
    catch (error) {
        console.log("\n\nError in validate middleware = ", error, "\n\n");
    }
}
export function simpleValidate(req, res, next) {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next();
        }
        else {
            const errs = errors.array();
            const invalidData = createInvalidDataObject(errs);
            return res.status(400).json({
                invalidData,
            });
        }
    }
    catch (error) {
        console.log("\n\nError in validate middleware = ", error, "\n\n");
    }
}
