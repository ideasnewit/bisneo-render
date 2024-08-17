import sequelize from "../config/config.js";
import { ClientFactory } from "./client.js";
import { UserFactory } from "./user.js";
import { CategoryFactory } from "./category.js";
import { ProductFactory } from "./product.js";
import { PurchaseFactory } from "./purchase.js";
import { SaleFactory } from "./sale.js";
import { SupplierFactory } from "./supplier.js";
import { TransferFactory } from "./transfer.js";
import { StockHistoryFactory } from "./stockHistory.js";
import { AmountReceivedFactory } from "./amountReceived.js";
import { SaleProductFactory } from "./saleProduct.js";
import { CustomerFactory } from "./customer.js";
import { UserPaymentFactory } from "./userPayment.js";
import { ClientPaymentFactory } from "./clientPayment.js";
import { SalaryFactory } from "./salary.js";
import { AttendanceFactory } from "./attendance.js";
import { WorkLogFactory } from "./workLog.js";
const models = {
    Client: ClientFactory(sequelize),
    User: UserFactory(sequelize),
    Category: CategoryFactory(sequelize),
    Product: ProductFactory(sequelize),
    Purchase: PurchaseFactory(sequelize),
    Sale: SaleFactory(sequelize),
    Supplier: SupplierFactory(sequelize),
    Transfer: TransferFactory(sequelize),
    StockHistory: StockHistoryFactory(sequelize),
    AmountReceived: AmountReceivedFactory(sequelize),
    SaleProduct: SaleProductFactory(sequelize),
    Customer: CustomerFactory(sequelize),
    UserPayment: UserPaymentFactory(sequelize),
    ClientPayment: ClientPaymentFactory(sequelize),
    Salary: SalaryFactory(sequelize),
    Attendance: AttendanceFactory(sequelize),
    WorkLog: WorkLogFactory(sequelize),
};
Object.keys(models).forEach((modelName) => {
    if (models[modelName].associations) {
        models[modelName].associate(models);
    }
});
const db = {
    sequelize,
    ...models,
};
export default db;
