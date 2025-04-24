const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define Product model
const Product = sequelize.define('Product', {
  P_productCode: {
    type: DataTypes.STRING(10),
    primaryKey: true,
  },
  P_productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Add other product fields as needed...
}, {
  tableName: 'Products',
});

// Define ReturnType model
const ReturnType = sequelize.define('ReturnType', {
  RT_returnTypeID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  RT_returnTypeDescription: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'ReturnTypes',
});

// Define Return model
const Return = sequelize.define('Return', {
  R_returnID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  P_productCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  R_returnTypeID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  R_reasonOfReturn: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  R_dateOfReturn: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  R_returnQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  R_discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'Returns',
});

// Relationships
Product.hasMany(Return, { foreignKey: 'P_productCode', sourceKey: 'P_productCode' });
Return.belongsTo(Product, { foreignKey: 'P_productCode', targetKey: 'P_productCode' });

ReturnType.hasMany(Return, { foreignKey: 'R_returnTypeID', sourceKey: 'RT_returnTypeID' });
Return.belongsTo(ReturnType, { foreignKey: 'R_returnTypeID', targetKey: 'RT_returnTypeID' });

module.exports = { Product, ReturnType, Return };