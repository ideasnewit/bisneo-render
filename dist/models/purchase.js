import { DataTypes, Model, } from "sequelize";
export class Purchase extends Model {
    static associate(models) {
        this.belongsTo(models.Product, {
            as: "product",
            foreignKey: {
                name: "productId",
                allowNull: false,
            },
        });
        this.belongsTo(models.Supplier, {
            as: "supplier",
            foreignKey: {
                name: "supplierId",
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
export const PurchaseFactory = (sequelize) => {
    return Purchase.init({
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
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        unitCost: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        unitPrice: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        discount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        amountPaid: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        location: {
            type: DataTypes.ENUM("store", "counter"),
            allowNull: false,
            defaultValue: "store",
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
    }, {
        tableName: "purchases",
        sequelize,
    });
};
