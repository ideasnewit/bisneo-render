import { query, body } from "express-validator";
import Sequelize from "sequelize";
import db from "../../../models/index.js";
import { destroy } from "./libs/destroy.js";
import { read } from "./libs/read.js";
import itemExists from "./libs/itemExists.js";
// import toTitleCase from "../../../libs/toTitleCase.js";
import filters from "./libs/filters.js";
const Op = Sequelize.Op;
const { Client, User } = db;
const commonRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Organization name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Organization name must be between 2 and 100 characters.")
        .bail()
        // .customSanitizer((name: string) => {
        //   return toTitleCase(name);
        // })
        .custom(async (name, { req }) => {
        const parentId = req.headers && req.headers["client-id"]
            ? req.headers["client-id"].toString()
            : "";
        let condition = {
            name: { [Op.iLike]: `${name}` },
        };
        if (req.body && req.body.id && req.body.id.length > 0) {
            condition.id = {
                [Op.not]: req.body.id,
            };
        }
        if (parentId && parentId.length > 0) {
            condition.parentId = parentId;
        }
        const client = await Client.findOne({
            where: condition,
        });
        if (itemExists(client, req.body.id) &&
            (!req.body.parentId || client?.id !== req.body.parentId)) {
            return Promise.reject("An organization with this name already exists");
        }
        return true;
    }),
    body("tagLine")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Tag Line must be between 5 and 255 characters."),
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Client phone number is required")
        .isLength({ min: 4, max: 15 })
        .withMessage("A phone number must between 4 to 15 characters long."),
    // .isInt()
    // .withMessage("A phone number must be numerical")
    // .bail()
    // .custom(async (phone: string, { req }) => {
    //   const client = await Client.findOne({
    //     where: {
    //       phone,
    //       id: {
    //         [Op.not]: req.body.id,
    //       },
    //     },
    //   });
    //   if (
    //     itemExists(client, req.body.id) &&
    //     (!req.body.parentId || client?.id !== req.body.parentId)
    //   ) {
    //     return Promise.reject("An organization with this phone number already exists.");
    //   }
    //   return true;
    // }),
    body("alternatePhone")
        .trim()
        .isLength({ min: 0, max: 15 })
        .withMessage("A phone number must between 4 to 15 characters long."),
    // .isInt()
    // .withMessage("A phone number must be numerical")
    // .bail()
    // .custom(async (phone: string, { req }) => {
    //   const client = await Client.findOne({
    //     where: {
    //       alternatePhone: phone,
    //       id: {
    //         [Op.not]: req.body.id,
    //       },
    //     },
    //   });
    //   if (
    //     itemExists(client, req.body.id) &&
    //     (!req.body.parentId || client?.id !== req.body.parentId)
    //   ) {
    //     return Promise.reject("An organization with this phone number already exists.");
    //   }
    //   return true;
    // }),
    body("email")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 50 })
        .withMessage("Email must be between 5 and 50 characters long")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail()
        .toLowerCase()
        .bail(),
    // .custom(async (email: string, { req }) => {
    //   const client = await Client.findOne({
    //     where: {
    //       email,
    //       id: {
    //         [Op.not]: req.body.id,
    //       },
    //     },
    //   });
    //   if (
    //     itemExists(client, req.body.id) &&
    //     (!req.body.parentId || client?.id !== req.body.parentId)
    //   ) {
    //     return Promise.reject(
    //       "A client with this email address already exists"
    //     );
    //   }
    //   return true;
    // }),
    body("address")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Address must be between 5 and 255 characters"),
    body("description")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Description must be between 5 and 255 characters"),
    body("currency").trim().notEmpty().withMessage("Currency is required"),
    body("workingHoursPerDay")
        .trim()
        .notEmpty()
        .withMessage("Working Hours Per Day is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Working Hours Per Day must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Working Hours Per Day cannot be negative")
        .toFloat(),
    body("workingDaysPerWeek")
        .trim()
        .notEmpty()
        .withMessage("Working Days Per Week is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Working Days Per Week must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Working Days Per Week cannot be negative")
        .toFloat(),
    //   body("dob")
    //     .isDate()
    //     .withMessage("Client Date of Birth must be a valid date"),
];
const branchRules = [
    body("branchName")
        .trim()
        .notEmpty()
        .withMessage("Branch name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Branch name must be between 2 and 100 characters")
        .bail(),
    // .customSanitizer((name: string) => {
    //   return toTitleCase(name);
    // }),
    body("tagLine")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Tag Line must be between 5 and 255 characters"),
    body("branchPhone")
        .trim()
        .notEmpty()
        .withMessage("Branch phone number is required")
        .isLength({ min: 4, max: 15 })
        .withMessage("A phone number must between 4 to 15 characters long."),
    // .bail()
    // .custom(async (phone: string, { req }) => {
    //   const client = await Client.findOne({
    //     where: {
    //       phone,
    //       id: {
    //         [Op.not]: req.body.id,
    //       },
    //     },
    //   });
    //   if (
    //     itemExists(client, req.body.id) &&
    //     (!req.body.parentId || client?.id !== req.body.parentId)
    //   ) {
    //     return Promise.reject("An organization with this phone number already exists.");
    //   }
    //   return true;
    // }),
    body("branchAlternatePhone")
        .trim()
        .isLength({ min: 0, max: 15 })
        .withMessage("A phone number must between 4 to 15 characters long."),
    // .bail()
    // .custom(async (phone: string, { req }) => {
    //   const client = await Client.findOne({
    //     where: {
    //       alternatePhone: phone,
    //       id: {
    //         [Op.not]: req.body.id,
    //       },
    //     },
    //   });
    //   if (
    //     itemExists(client, req.body.id) &&
    //     (!req.body.parentId || client?.id !== req.body.parentId)
    //   ) {
    //     return Promise.reject("An organization with this phone number already exists.");
    //   }
    //   return true;
    // }),
    body("branchEmail")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 50 })
        .withMessage("Email must be between 5 and 50 characters long")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail()
        .toLowerCase()
        .bail(),
    // .custom(async (email: string, { req }) => {
    //   const client = await Client.findOne({ where: { email } });
    //   if (itemExists(client, req.body.id)) {
    //     return Promise.reject(
    //       "A client with this email address already exists"
    //     );
    //   }
    //   return true;
    // }),
    body("branchAddress")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Address must be between 5 and 255 characters"),
    body("description")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Description must be between 5 and 255 characters"),
    body("currency").trim().notEmpty().withMessage("Currency is required"),
    body("workingHoursPerDay")
        .trim()
        .notEmpty()
        .withMessage("Working Hours Per Day is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Working Hours Per Day must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Working Hours Per Day cannot be negative")
        .toFloat(),
    body("workingDaysPerWeek")
        .trim()
        .notEmpty()
        .withMessage("Working Days Per Week is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Working Days Per Week must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Working Days Per Week cannot be negative")
        .toFloat(),
];
const userRules = [
    body("userName")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 100 characters")
        .bail(),
    // .customSanitizer((name: string) => {
    //   return toTitleCase(name);
    // }),
    body("userLoginUserName")
        .trim()
        .notEmpty()
        .withMessage("User Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("User Name must be between 2 and 50 characters")
        .bail()
        .custom(async (userLoginUserName, { req }) => {
        const user = await User.findOne({
            where: { userName: { [Op.iLike]: `${userLoginUserName}` } },
        });
        if (itemExists(user, req.body.id)) {
            return Promise.reject("A user with this user name already exists");
        }
        return true;
    }),
    body("userPassword")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 50 })
        .withMessage("Password must be between 8 and 50 characters")
        .bail(),
    body("userPhone")
        .trim()
        .notEmpty()
        .withMessage("User's phone number is required")
        .isLength({ min: 4, max: 15 })
        .withMessage("A phone number must between 4 to 15 characters long.")
        // .isInt()
        // .withMessage("A phone number must be numerical")
        .bail()
        .custom(async (phone, { req }) => {
        const supplier = await User.findOne({ where: { phone } });
        if (itemExists(supplier, req.body.id)) {
            return Promise.reject("A user with this phone number already exists");
        }
        return true;
    }),
    body("userEmail")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 40 })
        .withMessage("Email must be between 5 and 40 characters long")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail()
        .toLowerCase()
        .bail()
        .custom(async (email, { req }) => {
        const user = await User.findOne({ where: { email } });
        if (itemExists(user, req.body.id)) {
            return Promise.reject("A user with this email address already exists");
        }
        return true;
    }),
    body("userAddress")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage("Address must be between 5 and 255 characters"),
    body("userPaymentRate")
        .trim()
        .notEmpty()
        .withMessage("Payment Rate is required")
        .isDecimal({ decimal_digits: "1,2" })
        .withMessage("Payment Rate must not exceeding 2 decimal places")
        .isFloat({ min: 0 })
        .withMessage("Payment Rate cannot be negative")
        .toFloat(),
    body("userPaymentTerm")
        .trim()
        .notEmpty()
        .withMessage("Payment Term is required")
        .isAlpha()
        .withMessage("Payment Term must be alphabetic")
        .isIn(["hour", "day", "week", "month"])
        .withMessage("Valid Payment Terms are 'hour', 'day', 'week', 'month'"),
];
// const branchUserRules = [
//   body("branchUserName")
//     .trim()
//     .notEmpty()
//     .withMessage("Name is required")
//     .isLength({ min: 2, max: 50 })
//     .withMessage("Name must be between 2 and 100 characters")
//     .bail()
//     .customSanitizer((name: string) => {
//       return toTitleCase(name);
//     }),
//   body("branchUserLoginUserName")
//     .trim()
//     .notEmpty()
//     .withMessage("User Name is required")
//     .isLength({ min: 2, max: 50 })
//     .withMessage("User Name must be between 2 and 50 characters")
//     .bail()
//     .custom(async (userLoginUserName: string, { req }) => {
//       const user = await User.findOne({
//         where: { userName: userLoginUserName },
//       });
//       if (itemExists(user, req.body.id)) {
//         return Promise.reject("A user with this user name already exists");
//       }
//       return true;
//     }),
//   body("branchUserPassword")
//     .trim()
//     .notEmpty()
//     .withMessage("Password is required")
//     .isLength({ min: 8, max: 50 })
//     .withMessage("Password must be between 8 and 50 characters")
//     .bail(),
//   body("branchUserPhone")
//     .trim()
//     .notEmpty()
//     .withMessage("User's phone number is required")
//     .isLength({ min: 4, max: 15 })
//     .withMessage("A phone number must between 4 to 15 characters long.")
//     // .isInt()
//     // .withMessage("A phone number must be numerical")
//     .bail()
//     .custom(async (phone: string, { req }) => {
//       const supplier = await User.findOne({ where: { phone } });
//       if (itemExists(supplier, req.body.id)) {
//         return Promise.reject("A user with this phone number already exists");
//       }
//       return true;
//     }),
//   body("branchUserEmail")
//     .optional({ checkFalsy: true })
//     .trim()
//     .isLength({ min: 5, max: 40 })
//     .withMessage("Email must be between 5 and 40 characters long")
//     .isEmail()
//     .withMessage("Please provide a valid email address")
//     .normalizeEmail()
//     .toLowerCase()
//     .bail()
//     .custom(async (email: string, { req }) => {
//       const user = await User.findOne({ where: { email } });
//       if (itemExists(user, req.body.id)) {
//         return Promise.reject("A user with this email address already exists");
//       }
//       return true;
//     }),
//   body("branchUserAddress")
//     .optional({ checkFalsy: true })
//     .trim()
//     .isLength({ min: 5, max: 255 })
//     .withMessage("Address must be between 5 and 255 characters"),
//   body("branchUserPaymentRate")
//     .trim()
//     .notEmpty()
//     .withMessage("Payment Rate is required")
//     .isDecimal({ decimal_digits: "1,2" })
//     .withMessage("Payment Rate must not exceeding 2 decimal places")
//     .isFloat({ min: 0 })
//     .withMessage("Payment Rate cannot be negative")
//     .toFloat(),
//   body("branchUserPaymentTerm")
//     .trim()
//     .notEmpty()
//     .withMessage("Payment Term is required")
//     .isAlpha()
//     .withMessage("Payment Term must be alphabetic")
//     .isIn(["hour", "day", "week", "month"])
//     .withMessage("Valid Payment Terms are 'hour', 'day', 'week', 'month'"),
// ];
export const clientRules = {
    filter: [query("name").optional({ checkFalsy: true }).trim(), ...filters],
    // create: [...commonRules, ...branchRules, ...userRules, ...branchUserRules],
    create: [...commonRules, ...branchRules, ...userRules],
    createBranch: [...commonRules],
    read: [read("Client")],
    update: [
        body("id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Client id is required")
            .custom(async (id) => {
            const client = await Client.findByPk(id);
            if (client === null) {
                throw new Error("Client not found");
            }
            return true;
        }),
        ...commonRules,
        body("showProfit")
            .trim()
            .notEmpty()
            .withMessage("Show Profit  is required")
            .isBoolean()
            .withMessage("Show Profit must be trur or false"),
    ],
    destroy: [destroy("Client", async (pk) => await Client.findByPk(pk))],
};
