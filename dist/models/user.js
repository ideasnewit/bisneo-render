import { DataTypes, Model, } from "sequelize";
export class User extends Model {
    static associate(models) {
        this.belongsTo(models.Client, {
            as: "client",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
        });
    }
}
export const UserFactory = (sequelize) => {
    return User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
        },
        userName: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(15),
            unique: false,
            allowNull: true,
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
        paymentRate: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        paymentTerm: {
            type: DataTypes.ENUM("hour", "day", "week", "month"),
            allowNull: false,
        },
        clients: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        createdBy: {
            type: DataTypes.UUID,
            unique: false,
            allowNull: true,
        },
        updatedBy: {
            type: DataTypes.UUID,
            unique: false,
            allowNull: true,
        },
    }, {
        tableName: "users",
        sequelize,
        indexes: [
            {
                name: "user_username_unique_index",
                unique: true,
                fields: ["clientId", "userName"],
            },
            {
                name: "user_phone_unique_index",
                unique: true,
                fields: ["clientId", "phone"],
            },
        ],
    });
};
