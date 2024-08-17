import { DataTypes, Model, } from "sequelize";
export class Transfer extends Model {
    static associate(models) {
        this.belongsTo(models.Product, {
            as: "product",
            foreignKey: {
                name: "productId",
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
export const TransferFactory = (sequelize) => {
    return Transfer.init({
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
        source: {
            type: DataTypes.ENUM("store", "counter"),
            allowNull: false,
        },
        destination: {
            type: DataTypes.ENUM("store", "counter"),
            allowNull: false,
        },
    }, {
        tableName: "transfers",
        sequelize,
    });
};
