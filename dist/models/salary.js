import { Model, DataTypes, } from "sequelize";
export class Salary extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            as: "user",
            foreignKey: {
                name: "userId",
                allowNull: false,
            },
        });
        this.belongsTo(models.UserPayment, {
            as: "userPayment",
            foreignKey: {
                name: "userPaymentId",
                allowNull: false,
            },
        });
        this.belongsTo(models.Client, {
            as: "client",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
        });
        this.belongsTo(models.User, {
            as: "createdByUser",
            foreignKey: {
                name: "createdBy",
                allowNull: false,
            },
        });
        this.belongsTo(models.User, {
            as: "updatedByUser",
            foreignKey: {
                name: "updatedBy",
                allowNull: false,
            },
        });
    }
}
export const SalaryFactory = (sequelize) => {
    return Salary.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        fromDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        toDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        bonus: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        deduction: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        totalAmount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        comments: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: "salary",
        sequelize,
    });
};
