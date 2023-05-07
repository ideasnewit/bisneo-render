import { Sequelize } from "sequelize";
import "dotenv/config";
let sequelize;
const env = process.env.NODE_ENV;
const useEnvVariable = process.env.DATABASE_URL;
// if (env === "production") {
if (useEnvVariable && useEnvVariable.length > 0) {
    const productionConfig = {
        "dialect": "postgres",
        "dialectOptions": {
            "ssl": {
                rejectUnauthorized: false
            },
        },
        "logging": false,
    };
    sequelize = new Sequelize(useEnvVariable, productionConfig);
}
else {
    let dbName = "";
    const dbUser = process.env.DB_USER;
    const dbHost = process.env.DB_HOST;
    const dbPassword = process.env.DB_PASSWORD;
    const dbDialect = process.env.DB_DIALECT;
    if (env === "development") {
        dbName = process.env.DB_NAME;
    }
    if (env === "test") {
        dbName = process.env.TEST_DB_NAME;
    }
    sequelize = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        dialect: dbDialect,
    });
}
export default sequelize;
