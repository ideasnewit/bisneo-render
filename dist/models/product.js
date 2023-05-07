import { DataTypes, Model, } from "sequelize";
export class Product extends Model {
    static associate(models) {
        this.hasMany(models.Purchase, {
            as: "purchases",
            foreignKey: {
                name: "productId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.SaleProduct, {
            as: "saleProducts",
            foreignKey: {
                name: "productId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.Transfer, {
            as: "transfers",
            foreignKey: {
                name: "productId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.belongsTo(models.Category, {
            as: "category",
            foreignKey: {
                name: "categoryId",
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
export const ProductFactory = (sequelize) => {
    return Product.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
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
        taxPercentage: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        store: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        counter: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        description: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
        },
    }, {
        tableName: "products",
        sequelize,
    });
};
