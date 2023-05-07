import { Model, DataTypes, } from "sequelize";
export class SaleProduct extends Model {
    static associate(models) {
        this.belongsTo(models.Product, {
            as: "product",
            foreignKey: {
                name: "productId",
                allowNull: false,
            },
        });
        this.belongsTo(models.Product, {
            as: "sale",
            foreignKey: {
                name: "saleId",
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
export const SaleProductFactory = (sequelize) => {
    return SaleProduct.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
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
        tax: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
    }, {
        tableName: "saleProducts",
        sequelize,
    });
};
