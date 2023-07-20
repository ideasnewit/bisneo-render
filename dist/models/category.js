import { DataTypes, Model, } from "sequelize";
export class Category extends Model {
    static associate(models) {
        this.hasMany(models.Product, {
            as: "products",
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
export const CategoryFactory = (sequelize) => {
    return Category.init({
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
        description: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
        },
    }, {
        tableName: "categories",
        sequelize,
        indexes: [
            {
                name: "category_name_unique_index",
                unique: true,
                fields: ["clientId", "name"],
            },
        ],
    });
};
