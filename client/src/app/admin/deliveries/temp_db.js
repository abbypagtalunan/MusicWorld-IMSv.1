<<<<<<< HEAD
// temp_db.js - Acting as a temporary database emulator for the application

// Initial data for deliveries
const initialDeliveries = [
  { dateAdded: "11/12/22", deliveryNum: "12345", supplier: "Lazer", totalCost: "₱31,990" },
  { dateAdded: "11/12/22", deliveryNum: "12346", supplier: "Lazer", totalCost: "₱4,500" },
  { dateAdded: "11/12/22", deliveryNum: "12347", supplier: "Lazer", totalCost: "₱1,995" },
  { dateAdded: "11/12/22", deliveryNum: "12348", supplier: "Mirbros", totalCost: "₱29,995" },
  { dateAdded: "11/12/22", deliveryNum: "12349", supplier: "Mirbros", totalCost: "₱125" },
  { dateAdded: "11/12/22", deliveryNum: "12350", supplier: "Mirbros", totalCost: "₱2,595" },
  { dateAdded: "11/12/22", deliveryNum: "12351", supplier: "Lazer", totalCost: "₱395" },
  { dateAdded: "11/12/22", deliveryNum: "12352", supplier: "Lazer", totalCost: "₱295" },
  { dateAdded: "11/12/22", deliveryNum: "12353", supplier: "Lazer", totalCost: "₱15,995" },
];

// Initial data mapping for deliveries with their associated products
const initialDeliveryProducts = {
  "12345": [{ productCode: "188090", supplier: "Lazer", brand: "Cort", product: "AD 890 NS W/ BAG", quantity: "2 pcs", unitPrice: "15,995", total: "31,990" }],
  "12346": [{ productCode: "188091", supplier: "Lazer", brand: "Lazer", product: "Mapex Drumset", quantity: "1 set", unitPrice: "4,500", total: "4,500" }],
  "12347": [{ productCode: "188092", supplier: "Lazer", brand: "Cort", product: "Guitar Strings", quantity: "3 pcs", unitPrice: "665", total: "1,995" }],
  "12348": [{ productCode: "188093", supplier: "Mirbros", brand: "Yamaha", product: "Digital Piano", quantity: "1 pc", unitPrice: "29,995", total: "29,995" }],
  "12349": [{ productCode: "188094", supplier: "Mirbros", brand: "Lazer", product: "Guitar Pick", quantity: "5 pcs", unitPrice: "25", total: "125" }],
  "12350": [{ productCode: "188095", supplier: "Mirbros", brand: "Cort", product: "Guitar Capo", quantity: "1 pc", unitPrice: "2,595", total: "2,595" }],
  "12351": [{ productCode: "188096", supplier: "Lazer", brand: "Lazer", product: "Drum Sticks", quantity: "1 pair", unitPrice: "395", total: "395" }],
  "12352": [{ productCode: "188097", supplier: "Lazer", brand: "Lazer", product: "Guitar Strap", quantity: "1 pc", unitPrice: "295", total: "295" }],
  "12353": [{ productCode: "188098", supplier: "Lazer", brand: "Cort", product: "Acoustic Guitar", quantity: "1 pc", unitPrice: "15,995", total: "15,995" }]
};

// Initial payment details for each delivery
const initialPaymentDetailsData = {
  "12345": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12346": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12347": { paymentType: "1 month", paymentMode: "check", paymentStatus: "partial1", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12348": { paymentType: "2 months", paymentMode: "bank transfer", paymentStatus: "unpaid", dateDue: "2024-03-01", datePayment1: "", datePayment2: "" },
  "12349": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12350": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12351": { paymentType: "2 months", paymentMode: "bank transfer", paymentStatus: "partial2", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "2024-04-01" },
  "12352": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12353": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" }
};

// Create mutable copies of the initial data
let deliveriesData = [...initialDeliveries];
let deliveryProductsData = { ...initialDeliveryProducts };
let paymentDetailsData = { ...initialPaymentDetailsData };

// Database API functions
export const db = {
  // Getters
  getDeliveries: () => [...deliveriesData],
  getDeliveryProducts: () => ({ ...deliveryProductsData }),
  getPaymentDetails: () => ({ ...paymentDetailsData }),
  
  // Add a new delivery
  addDelivery: (delivery) => {
    deliveriesData.push(delivery);
    return delivery;
  },
  
  // Add products to a delivery
  addDeliveryProducts: (deliveryNum, products) => {
    deliveryProductsData[deliveryNum] = products;
    return products;
  },
  
  // Update payment details
  updatePaymentDetails: (deliveryNum, details) => {
    paymentDetailsData[deliveryNum] = {
      ...paymentDetailsData[deliveryNum] || {},
      ...details
    };
    return paymentDetailsData[deliveryNum];
  },
  
  // Delete a delivery and its associated data
  deleteDelivery: (deliveryNum) => {
    deliveriesData = deliveriesData.filter(d => d.deliveryNum !== deliveryNum);
    delete deliveryProductsData[deliveryNum];
    delete paymentDetailsData[deliveryNum];
    return true;
  },
  
  // Reset database to initial state (for testing)
  resetDatabase: () => {
    deliveriesData = [...initialDeliveries];
    deliveryProductsData = { ...initialDeliveryProducts };
    paymentDetailsData = { ...initialPaymentDetailsData };
    return true;
  },
  
  // Get a single delivery by its number
  getDeliveryByNumber: (deliveryNum) => {
    return deliveriesData.find(d => d.deliveryNum === deliveryNum);
  },
  
  // Update an existing delivery
  updateDelivery: (deliveryNum, updates) => {
    const index = deliveriesData.findIndex(d => d.deliveryNum === deliveryNum);
    if (index !== -1) {
      deliveriesData[index] = { ...deliveriesData[index], ...updates };
      return deliveriesData[index];
    }
    return null;
  }
};

// For backward compatibility, export these variables too
export const deliveries = deliveriesData;
export const deliveryProducts = deliveryProductsData;
=======
// temp_db.js - Acting as a temporary database emulator for the application

// Initial data for deliveries
const initialDeliveries = [
  { dateAdded: "11/12/22", deliveryNum: "12345", supplier: "Lazer", totalCost: "₱31,990" },
  { dateAdded: "11/12/22", deliveryNum: "12346", supplier: "Lazer", totalCost: "₱4,500" },
  { dateAdded: "11/12/22", deliveryNum: "12347", supplier: "Lazer", totalCost: "₱1,995" },
  { dateAdded: "11/12/22", deliveryNum: "12348", supplier: "Mirbros", totalCost: "₱29,995" },
  { dateAdded: "11/12/22", deliveryNum: "12349", supplier: "Mirbros", totalCost: "₱125" },
  { dateAdded: "11/12/22", deliveryNum: "12350", supplier: "Mirbros", totalCost: "₱2,595" },
  { dateAdded: "11/12/22", deliveryNum: "12351", supplier: "Lazer", totalCost: "₱395" },
  { dateAdded: "11/12/22", deliveryNum: "12352", supplier: "Lazer", totalCost: "₱295" },
  { dateAdded: "11/12/22", deliveryNum: "12353", supplier: "Lazer", totalCost: "₱15,995" },
];

// Initial data mapping for deliveries with their associated products
const initialDeliveryProducts = {
  "12345": [{ productCode: "188090", supplier: "Lazer", brand: "Cort", product: "AD 890 NS W/ BAG", quantity: "2 pcs", unitPrice: "15,995", total: "31,990" }],
  "12346": [{ productCode: "188091", supplier: "Lazer", brand: "Lazer", product: "Mapex Drumset", quantity: "1 set", unitPrice: "4,500", total: "4,500" }],
  "12347": [{ productCode: "188092", supplier: "Lazer", brand: "Cort", product: "Guitar Strings", quantity: "3 pcs", unitPrice: "665", total: "1,995" }],
  "12348": [{ productCode: "188093", supplier: "Mirbros", brand: "Yamaha", product: "Digital Piano", quantity: "1 pc", unitPrice: "29,995", total: "29,995" }],
  "12349": [{ productCode: "188094", supplier: "Mirbros", brand: "Lazer", product: "Guitar Pick", quantity: "5 pcs", unitPrice: "25", total: "125" }],
  "12350": [{ productCode: "188095", supplier: "Mirbros", brand: "Cort", product: "Guitar Capo", quantity: "1 pc", unitPrice: "2,595", total: "2,595" }],
  "12351": [{ productCode: "188096", supplier: "Lazer", brand: "Lazer", product: "Drum Sticks", quantity: "1 pair", unitPrice: "395", total: "395" }],
  "12352": [{ productCode: "188097", supplier: "Lazer", brand: "Lazer", product: "Guitar Strap", quantity: "1 pc", unitPrice: "295", total: "295" }],
  "12353": [{ productCode: "188098", supplier: "Lazer", brand: "Cort", product: "Acoustic Guitar", quantity: "1 pc", unitPrice: "15,995", total: "15,995" }]
};

// Initial payment details for each delivery
const initialPaymentDetailsData = {
  "12345": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12346": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12347": { paymentType: "1 month", paymentMode: "check", paymentStatus: "partial1", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12348": { paymentType: "2 months", paymentMode: "bank transfer", paymentStatus: "unpaid", dateDue: "2024-03-01", datePayment1: "", datePayment2: "" },
  "12349": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12350": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12351": { paymentType: "2 months", paymentMode: "bank transfer", paymentStatus: "partial2", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "2024-04-01" },
  "12352": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12353": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" }
};

// Create mutable copies of the initial data
let deliveriesData = [...initialDeliveries];
let deliveryProductsData = { ...initialDeliveryProducts };
let paymentDetailsData = { ...initialPaymentDetailsData };

// Database API functions
export const db = {
  // Getters
  getDeliveries: () => [...deliveriesData],
  getDeliveryProducts: () => ({ ...deliveryProductsData }),
  getPaymentDetails: () => ({ ...paymentDetailsData }),
  
  // Add a new delivery
  addDelivery: (delivery) => {
    deliveriesData.push(delivery);
    return delivery;
  },
  
  // Add products to a delivery
  addDeliveryProducts: (deliveryNum, products) => {
    deliveryProductsData[deliveryNum] = products;
    return products;
  },
  
  // Update payment details
  updatePaymentDetails: (deliveryNum, details) => {
    paymentDetailsData[deliveryNum] = {
      ...paymentDetailsData[deliveryNum] || {},
      ...details
    };
    return paymentDetailsData[deliveryNum];
  },
  
  // Delete a delivery and its associated data
  deleteDelivery: (deliveryNum) => {
    deliveriesData = deliveriesData.filter(d => d.deliveryNum !== deliveryNum);
    delete deliveryProductsData[deliveryNum];
    delete paymentDetailsData[deliveryNum];
    return true;
  },
  
  // Reset database to initial state (for testing)
  resetDatabase: () => {
    deliveriesData = [...initialDeliveries];
    deliveryProductsData = { ...initialDeliveryProducts };
    paymentDetailsData = { ...initialPaymentDetailsData };
    return true;
  },
  
  // Get a single delivery by its number
  getDeliveryByNumber: (deliveryNum) => {
    return deliveriesData.find(d => d.deliveryNum === deliveryNum);
  },
  
  // Update an existing delivery
  updateDelivery: (deliveryNum, updates) => {
    const index = deliveriesData.findIndex(d => d.deliveryNum === deliveryNum);
    if (index !== -1) {
      deliveriesData[index] = { ...deliveriesData[index], ...updates };
      return deliveriesData[index];
    }
    return null;
  }
};

// For backward compatibility, export these variables too
export const deliveries = deliveriesData;
export const deliveryProducts = deliveryProductsData;
>>>>>>> 3bbc15c6834d101270771ec49ed36850a0d3561f
export const initialPaymentDetails = paymentDetailsData;