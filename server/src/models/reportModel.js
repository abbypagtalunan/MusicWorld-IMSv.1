// reportModel.js
const db = require("../config/db"); // Adjust according to your DB setup

exports.fetchReports = async ({ search = "", from, to }) => {
  let sql = `
    SELECT 
      T.T_transactionID AS transactionID,
      T.T_transactionDate AS dateAdded,
      P.P_productCode AS productCode,
      O.O_receiptNumber AS receiptNum,
      P.P_productName AS product,
      P.P_sellingPrice AS sales,
      P.P_unitPrice AS cogs,
      (P.P_sellingPrice - P.P_unitPrice) AS net
    FROM Transactions T
    JOIN Orders O ON T.O_orderID = O.O_orderID
    JOIN Products P ON P.P_productCode = T.productCode
    WHERE 1 = 1
  `;

  const params = [];

  if (search) {
    sql += ` AND (
      P.P_productName LIKE ? OR
      T.T_transactionID LIKE ? OR
      P.P_productCode LIKE ?
    )`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (from) {
    sql += ` AND T.T_transactionDate >= ?`;
    params.push(from);
  }

  if (to) {
    sql += ` AND T.T_transactionDate <= ?`;
    params.push(to);
  }

  sql += ` ORDER BY T.T_transactionDate DESC`;

  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Failed to fetch reports");
  }
};

exports.deleteTransaction = async (transactionID, adminPassword) => {
  // You can add password validation here if needed
  try {
    const result = await db.query(
      "DELETE FROM Transactions WHERE T_transactionID = ?",
      [transactionID]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Failed to delete transaction");
  }
};

exports.deleteMultipleTransactions = async (transactionIDs, adminPassword) => {
  if (!Array.isArray(transactionIDs) || transactionIDs.length === 0) {
    throw new Error("No transaction IDs provided");
  }

  try {
    const result = await db.query(
      "DELETE FROM Transactions WHERE T_transactionID IN (?)",
      [transactionIDs]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting multiple transactions:", error);
    throw new Error("Failed to delete multiple transactions");
  }
};