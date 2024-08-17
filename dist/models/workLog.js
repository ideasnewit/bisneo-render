import { Model, DataTypes, } from "sequelize";
export class WorkLog extends Model {
    static associate(models) {
        this.belongsTo(models.Product, {
            as: "product",
            foreignKey: {
                name: "productId",
                allowNull: false,
            },
        });
        this.belongsTo(models.User, {
            as: "user",
            foreignKey: {
                name: "userId",
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
export const WorkLogFactory = (sequelize) => {
    return WorkLog.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        labourCost: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        quantity: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0.0,
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0.0,
        },
        comments: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        tableName: "workLog",
        sequelize,
    });
};
