import { Model, DataTypes, } from "sequelize";
export class Sale extends Model {
    static associate(models) {
        this.belongsTo(models.Customer, {
            as: "customer",
            foreignKey: {
                name: "customerId",
                allowNull: false,
            },
        });
        this.hasMany(models.AmountReceived, {
            as: "amountReceiveds",
            foreignKey: {
                name: "saleId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.SaleProduct, {
            as: "products",
            foreignKey: {
                name: "saleId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
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
export const SaleFactory = (sequelize) => {
    return Sale.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        billNumber: {
            type: DataTypes.BIGINT,
            // defaultValue: 0,
            unique: true,
            allowNull: false,
            autoIncrement: true,
        },
        discount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        tax: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        loadingCharge: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.0,
        },
        unLoadingCharge: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.0,
        },
        transportCharge: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.0,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        paymentType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        saleType: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        tableName: "sales",
        sequelize,
    });
};
