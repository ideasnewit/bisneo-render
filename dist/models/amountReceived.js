import { Model, DataTypes, } from "sequelize";
export class AmountReceived extends Model {
    static associate(models) {
        this.belongsTo(models.Sale, {
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
export const AmountReceivedFactory = (sequelize) => {
    return AmountReceived.init({
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
    }, {
        tableName: "amountReceived",
        sequelize,
    });
};
