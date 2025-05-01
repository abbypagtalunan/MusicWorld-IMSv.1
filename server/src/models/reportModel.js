const db = require("../config/db"); // adjust according to your DB setup

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

  const [rows] = await db.query(sql, params);
  return rows;
};

exports.deleteTransaction = async (transactionID) => {
  await db.query("DELETE FROM Transactions WHERE T_transactionID = ?", [transactionID]);
};
