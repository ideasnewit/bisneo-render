import { Model, DataTypes, } from "sequelize";
export class ClientPayment extends Model {
    static associate(models) {
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
export const ClientPaymentFactory = (sequelize) => {
    return ClientPayment.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        paymentMode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        plan: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        comments: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: "clientPayments",
        sequelize,
    });
};
