import { DataTypes, Model, } from "sequelize";
export class Supplier extends Model {
    static associate(models) {
        this.hasMany(models.Purchase, {
            as: "purchases",
            foreignKey: {
                name: "supplierId",
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
export const SupplierFactory = (sequelize) => {
    return Supplier.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            // unique: true,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(15),
            // unique: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
        },
    }, {
        tableName: "suppliers",
        sequelize,
        indexes: [
            {
                name: "supplier_phone_unique_index",
                unique: true,
                fields: ["clientId", "phone"],
            },
        ],
    });
};
