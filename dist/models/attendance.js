import { Model, DataTypes, } from "sequelize";
export class Attendance extends Model {
    static associate(models) {
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
export const AttendanceFactory = (sequelize) => {
    return Attendance.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        inTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        outTime: {
            type: DataTypes.DATE,
            allowNull: true,
            // defaultValue: null,
        },
        duration: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            // defaultValue: 0.0,
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
        tableName: "attendance",
        sequelize,
    });
};
