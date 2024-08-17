import { 
// Association,
// HasManyGetAssociationsMixin,
// HasManyCountAssociationsMixin,
// HasManyHasAssociationMixin,
// HasManyHasAssociationsMixin,
// HasManySetAssociationsMixin,
// HasManyAddAssociationMixin,
// HasManyAddAssociationsMixin,
// HasManyRemoveAssociationMixin,
// HasManyRemoveAssociationsMixin,
// HasManyCreateAssociationMixin,
DataTypes, Model, } from "sequelize";
export class Client extends Model {
    /*
    // model associations
  
    // Category
    declare getSales: HasManyGetAssociationsMixin<Sale>;
    declare countSales: HasManyCountAssociationsMixin;
    declare hasSale: HasManyHasAssociationMixin<Sale, Sale["id"]>;
    declare hasSales: HasManyHasAssociationsMixin<Sale, Sale["id"]>;
    declare setSales: HasManySetAssociationsMixin<Sale, Sale["id"]>;
    declare addSale: HasManyAddAssociationMixin<Sale, Sale["id"]>;
    declare addSales: HasManyAddAssociationsMixin<Sale, Sale["id"]>;
    declare removeSale: HasManyRemoveAssociationMixin<Sale, Sale["id"]>;
    declare removeSales: HasManyRemoveAssociationsMixin<Sale, Sale["id"]>;
    declare createSale: HasManyCreateAssociationMixin<Sale>;
  
    // Customer
    declare getCustomers: HasManyGetAssociationsMixin<Customer>;
    declare countCustomers: HasManyCountAssociationsMixin;
    declare hasCustomer: HasManyHasAssociationMixin<Customer, Customer["id"]>;
    declare hasCustomers: HasManyHasAssociationsMixin<Customer, Customer["id"]>;
    declare setCustomers: HasManySetAssociationsMixin<Customer, Customer["id"]>;
    declare addCustomer: HasManyAddAssociationMixin<Customer, Customer["id"]>;
    declare addCustomers: HasManyAddAssociationsMixin<Customer, Customer["id"]>;
    declare removeCustomer: HasManyRemoveAssociationMixin<
      Customer,
      Customer["id"]
    >;
    declare removeCustomers: HasManyRemoveAssociationsMixin<
      Customer,
      Customer["id"]
    >;
    declare createCustomer: HasManyCreateAssociationMixin<Customer>;
  
    // Product
    declare getProducts: HasManyGetAssociationsMixin<Product>;
    declare countProducts: HasManyCountAssociationsMixin;
    declare hasProduct: HasManyHasAssociationMixin<Product, Product["id"]>;
    declare hasProducts: HasManyHasAssociationsMixin<Product, Product["id"]>;
    declare setProducts: HasManySetAssociationsMixin<Product, Product["id"]>;
    declare addProduct: HasManyAddAssociationMixin<Product, Product["id"]>;
    declare addProducts: HasManyAddAssociationsMixin<Product, Product["id"]>;
    declare removeProduct: HasManyRemoveAssociationMixin<Product, Product["id"]>;
    declare removeProducts: HasManyRemoveAssociationsMixin<
      Product,
      Product["id"]
    >;
    declare createProduct: HasManyCreateAssociationMixin<Product>;
  
    // Purchase
    declare getPurchases: HasManyGetAssociationsMixin<Purchase>;
    declare countPurchases: HasManyCountAssociationsMixin;
    declare hasPurchase: HasManyHasAssociationMixin<Purchase, Purchase["id"]>;
    declare hasPurchases: HasManyHasAssociationsMixin<Purchase, Purchase["id"]>;
    declare setPurchases: HasManySetAssociationsMixin<Purchase, Purchase["id"]>;
    declare addPurchase: HasManyAddAssociationMixin<Purchase, Purchase["id"]>;
    declare addPurchases: HasManyAddAssociationsMixin<Purchase, Purchase["id"]>;
    declare removePurchase: HasManyRemoveAssociationMixin<
      Purchase,
      Purchase["id"]
    >;
    declare removePurchases: HasManyRemoveAssociationsMixin<
      Purchase,
      Purchase["id"]
    >;
    declare createPurchase: HasManyCreateAssociationMixin<Purchase>;
  
    // Sales
    declare getCategory: HasManyGetAssociationsMixin<Category>;
    declare countCategory: HasManyCountAssociationsMixin;
    declare hasCategory: HasManyHasAssociationMixin<Category, Category["id"]>;
    declare hasCategorys: HasManyHasAssociationsMixin<Category, Category["id"]>;
    declare setCategorys: HasManySetAssociationsMixin<Category, Category["id"]>;
    declare addCategory: HasManyAddAssociationMixin<Category, Category["id"]>;
    declare addCategorys: HasManyAddAssociationsMixin<Category, Category["id"]>;
    declare removeCategory: HasManyRemoveAssociationMixin<
      Category,
      Category["id"]
    >;
    declare removeCategorys: HasManyRemoveAssociationsMixin<
      Category,
      Category["id"]
    >;
    declare createCategory: HasManyCreateAssociationMixin<Category>;
  
    // Stock History
    declare getStockHistorys: HasManyGetAssociationsMixin<StockHistory>;
    declare countStockHistorys: HasManyCountAssociationsMixin;
    declare hasStockHistory: HasManyHasAssociationMixin<
      StockHistory,
      StockHistory["id"]
    >;
    declare hasStockHistorys: HasManyHasAssociationsMixin<
      StockHistory,
      StockHistory["id"]
    >;
    declare setStockHistorys: HasManySetAssociationsMixin<
      StockHistory,
      StockHistory["id"]
    >;
    declare addStockHistory: HasManyAddAssociationMixin<
      StockHistory,
      StockHistory["id"]
    >;
    declare addStockHistorys: HasManyAddAssociationsMixin<
      StockHistory,
      StockHistory["id"]
    >;
    declare removeStockHistory: HasManyRemoveAssociationMixin<
      StockHistory,
      StockHistory["id"]
    >;
    declare removeStockHistorys: HasManyRemoveAssociationsMixin<
      StockHistory,
      StockHistory["id"]
    >;
    declare createStockHistory: HasManyCreateAssociationMixin<StockHistory>;
  
    // Supplier
    declare getSuppliers: HasManyGetAssociationsMixin<Supplier>;
    declare countSuppliers: HasManyCountAssociationsMixin;
    declare hasSupplier: HasManyHasAssociationMixin<Supplier, Supplier["id"]>;
    declare hasSuppliers: HasManyHasAssociationsMixin<Supplier, Supplier["id"]>;
    declare setSuppliers: HasManySetAssociationsMixin<Supplier, Supplier["id"]>;
    declare addSupplier: HasManyAddAssociationMixin<Supplier, Supplier["id"]>;
    declare addSuppliers: HasManyAddAssociationsMixin<Supplier, Supplier["id"]>;
    declare removeSupplier: HasManyRemoveAssociationMixin<
      Supplier,
      Supplier["id"]
    >;
    declare removeSuppliers: HasManyRemoveAssociationsMixin<
      Supplier,
      Supplier["id"]
    >;
    declare createSupplier: HasManyCreateAssociationMixin<Supplier>;
  
    // Transfer
    declare getTransfers: HasManyGetAssociationsMixin<Transfer>;
    declare countTransfers: HasManyCountAssociationsMixin;
    declare hasTransfer: HasManyHasAssociationMixin<Transfer, Transfer["id"]>;
    declare hasTransfers: HasManyHasAssociationsMixin<Transfer, Transfer["id"]>;
    declare setTransfers: HasManySetAssociationsMixin<Transfer, Transfer["id"]>;
    declare addTransfer: HasManyAddAssociationMixin<Transfer, Transfer["id"]>;
    declare addTransfers: HasManyAddAssociationsMixin<Transfer, Transfer["id"]>;
    declare removeTransfer: HasManyRemoveAssociationMixin<
      Transfer,
      Transfer["id"]
    >;
    declare removeTransfers: HasManyRemoveAssociationsMixin<
      Transfer,
      Transfer["id"]
    >;
    declare createTransfer: HasManyCreateAssociationMixin<Transfer>;
  
    // User
    declare getUsers: HasManyGetAssociationsMixin<User>;
    declare countUsers: HasManyCountAssociationsMixin;
    declare hasUser: HasManyHasAssociationMixin<User, User["id"]>;
    declare hasUsers: HasManyHasAssociationsMixin<User, User["id"]>;
    declare setUsers: HasManySetAssociationsMixin<User, User["id"]>;
    declare addUser: HasManyAddAssociationMixin<User, User["id"]>;
    declare addUsers: HasManyAddAssociationsMixin<User, User["id"]>;
    declare removeUser: HasManyRemoveAssociationMixin<User, User["id"]>;
    declare removeUsers: HasManyRemoveAssociationsMixin<User, User["id"]>;
    declare createUser: HasManyCreateAssociationMixin<User>;
  
    // possible inclusions
    declare readonly categories?: Category[];
    declare readonly customers?: Customer[];
    declare readonly products?: Product[];
    declare readonly purchases?: Purchase[];
    declare readonly sales?: Sale[];
    declare readonly stockHistories?: StockHistory[];
    declare readonly suppliers?: Supplier[];
    declare readonly transfers?: Transfer[];
    declare readonly users?: User[];
  
    // associations
    declare static associations: {
      categories: Association<Client, Category>;
      customers: Association<Client, Customer>;
      products: Association<Client, Product>;
      purchases: Association<Client, Purchase>;
      sales: Association<Client, Sale>;
      stockHistories: Association<Client, StockHistory>;
      suppliers: Association<Client, Supplier>;
      transfers: Association<Client, Transfer>;
      users: Association<Client, User>;
    };
  */
    static associate(models) {
        this.hasMany(models.Category, {
            as: "categories",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.Customer, {
            as: "customers",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.Product, {
            as: "products",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.Purchase, {
            as: "purchases",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.Sale, {
            as: "sales",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.StockHistory, {
            as: "stockHistories",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.Supplier, {
            as: "suppliers",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.Transfer, {
            as: "transfers",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
        this.hasMany(models.User, {
            as: "users",
            foreignKey: {
                name: "clientId",
                allowNull: false,
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    }
}
export const ClientFactory = (sequelize) => {
    return Client.init({
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
        tagLine: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(15),
            unique: false,
            allowNull: false,
        },
        alternatePhone: {
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
        description: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
        },
        logo: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
        gstNumber: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
        registrationNumber: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
        ein: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
        dbNumber: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
        industryCodes: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
        currency: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
        },
        workingHoursPerDay: {
            type: DataTypes.FLOAT,
            unique: false,
            allowNull: false,
            defaultValue: 0,
        },
        workingDaysPerWeek: {
            type: DataTypes.FLOAT,
            unique: false,
            allowNull: false,
            defaultValue: 0,
        },
        showProfit: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        isBranch: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        parentId: {
            type: DataTypes.UUID,
            unique: false,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        subscription: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        },
    }, {
        tableName: "clients",
        sequelize,
    });
};
