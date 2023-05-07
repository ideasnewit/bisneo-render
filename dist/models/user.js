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
            type: DataTypes.STRING(10),
            unique: true,
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
        paymentRate: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        paymentTerm: {
            type: DataTypes.ENUM("hour", "day", "week", "month"),
            allowNull: false,
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
    });
};
