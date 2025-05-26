"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AppSidebar } from "@/components/admin-sidebar"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import { 
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell 
} from "@/components/ui/table";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { X, Trash2, Undo2, Filter } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function BatchDeliveriesPage() {
  const router = useRouter();
  
  // State for product items in the table
  const [productItems, setProductItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deliveryNumber, setDeliveryNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  
  // State for payment details
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({
    paymentType: "",
    paymentMode: "",
    paymentStatus: "",
    dateDue: "",
    datePayment1: "",
    // for 2nd payment
    paymentMode2: "",
    paymentStatus2: "2",  // ← default to Unpaid (primary key = 2)
    dateDue2: "",
    datePayment2: ""
  });
  
  // Track UI-selected payment status values: -1 (unset), 1 = paid, 2 = unpaid
  const [selectedPaymentStatus1, setSelectedPaymentStatus1] = useState(-1);
  const [selectedPaymentStatus2, setSelectedPaymentStatus2] = useState(-1);
  const [selectedPaymentType, setSelectedPaymentType] = useState(-1);  // 1 = full upfront, 2 = one-time, 3 = two-time
  
  const [showSecondPayment, setShowSecondPayment] = useState(false);
  const secondCardRef = useRef(null);
  
  // State for new product form
  const [newProduct, setNewProduct] = useState({
    product: "",
    supplier: "",
    brand: "",
    unitPrice: "",
    quantity: ""
  });

  // API endpoints
  const API_CONFIG = {
    products: "http://localhost:8080/products",
    suppliers: "http://localhost:8080/suppliers",
    brands: "http://localhost:8080/brands",
    deliveries: "http://localhost:8080/deliveries",
    deliveryProducts: "http://localhost:8080/deliveries/products",
    paymentTypes: "http://localhost:8080/deliveries/payment-types",
    paymentModes: "http://localhost:8080/deliveries/mode-of-payment",
    paymentStatuses: "http://localhost:8080/deliveries/payment-status",
    paymentDetails: "http://localhost:8080/deliveries/payment-details",
  };

  useEffect(() => {
    loadAllData();
  }, []);
  
  useEffect(() => {
    if (showSecondPayment && secondCardRef.current) {
      secondCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [showSecondPayment]);

  // Function to load all needed data
  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data in parallel
      const [
        productsRes, 
        suppliersRes, 
        brandsRes, 
        paymentTypesRes, 
        paymentModesRes, 
        paymentStatusesRes
      ] = await Promise.all([
        axios.get(API_CONFIG.products),
        axios.get(API_CONFIG.suppliers),
        axios.get(API_CONFIG.brands),
        axios.get(API_CONFIG.paymentTypes),
        axios.get(API_CONFIG.paymentModes),
        axios.get(API_CONFIG.paymentStatuses)
      ]);
      
      setProducts(productsRes.data);
      setSuppliers(suppliersRes.data);
      setBrands(brandsRes.data);
      setPaymentTypes(paymentTypesRes.data);
      setPaymentModes(paymentModesRes.data);
      setPaymentStatuses(paymentStatusesRes.data);
      
      // Set today's date as default delivery date (philippines)
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm   = String(now.getMonth() + 1).padStart(2, '0');
      const dd   = String(now.getDate()).padStart(2, '0');
      setDeliveryDate(`${yyyy}-${mm}-${dd}`);

      // Initialize payment details with due date
      setPaymentDetails(prev => ({
        ...prev,
      }));
      
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load necessary data");
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate total value of all products
  const calculateTotal = () => {
    return productItems.reduce((sum, item) => {
      const numericTotal = parseFloat(item.total.replace(/[^\d.]/g, ""));
      return sum + numericTotal;
    }, 0);
  };
  
  // Format total for display
  const formattedTotal = calculateTotal().toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  });

  // Handle form input changes for new product
  const handleInputChange = (field, value) => {
    setNewProduct({
      ...newProduct,
      [field]: value
    });
    
    // If product is selected, automatically fill unit price
    if (field === 'product') {
      const selectedProduct = products.find(p => p.P_productName === value);
      if (selectedProduct) {
        setNewProduct(prev => ({
          ...prev,
          unitPrice: selectedProduct.P_unitPrice || ""
        }));
      }
    }
    
    // If supplier is selected, filter brands and products
    if (field === 'supplier') {
      // Find the supplier ID based on the selected supplier name
      const supplierObj = suppliers.find(s => s.S_supplierName === value);
      setSelectedSupplier(supplierObj ? supplierObj.S_supplierID : "");
    }
    
    if (field === 'brand') {
    }
  };

  // Handle payment details input changes
  const handlePaymentDetailChange = (field, value) => {
    setPaymentDetails(prev => {
      let next = { ...prev, [field]: value };

      // 1) On Payment Type change
      if (field === 'paymentType') {
        const selectedType = parseInt(value, 10);
        setSelectedPaymentType(selectedType); // 1 = full upfront, 2 = one-time, 3 = two-time
        setShowSecondPayment(selectedType === 3);

        // auto-fill/clear first payment date
        if (value === '1') {
          const today = new Date().toISOString().split('T')[0];
          next.datePayment1 = today;
        } else if (prev.paymentType === '1') {
          next.datePayment1 = '';
        }

        // auto-set or clear first payment status & due date
        if (value === '1') {
          const paidStatus = paymentStatuses
            .find(s => s.D_statusName.toLowerCase() === 'paid');
          next.paymentStatus = paidStatus
            ? paidStatus.D_paymentStatusID.toString()
            : '';
          // clear the "Date of Payment Due" so it shows blank/placeholder
          next.dateDue = '';
        } else if (value === '2') {
          // set due date exactly 1 month after the delivery date
          if (deliveryDate) {
            const due = new Date(deliveryDate);
            due.setMonth(due.getMonth() + 1);
            next.dateDue = due.toISOString().split('T')[0];
          }
          next.paymentStatus = '';
        }
        else if (value === '3') {
          // two-time payment: set due dates 30 and 60 days later
          if (deliveryDate) {
            const due1 = new Date(deliveryDate);
            due1.setDate(due1.getDate() + 30);
            next.dateDue = due1.toISOString().split('T')[0];

            const due2 = new Date(deliveryDate);
            due2.setDate(due2.getDate() + 60);
            next.dateDue2 = due2.toISOString().split('T')[0];
          }
          next.paymentStatus = '';
          next.paymentStatus2 = '2'; // ← default to Unpaid
        }
        else if (prev.paymentType === '1') {
          next.paymentStatus = '';
          // restore original due-date if you need
        }
      }
      
      // 2) On Payment Status change (purely UI-driven “Unpaid”)
      if (field === 'paymentStatus') {
        const statusObj = paymentStatuses
          .find(s => s.D_paymentStatusID.toString() === value);
        const statusName = statusObj?.D_statusName.toLowerCase();

        const newStatus = statusName === 'paid' ? 1 : statusName === 'unpaid' ? 2 : -1;
        setSelectedPaymentStatus1(newStatus);

        if (newStatus === 2) {
          next.datePayment1 = '';
          
          if (selectedPaymentType === 3) {
            next.paymentMode2   = '';
          }
        } else if (newStatus === 1) {
          const today = new Date().toISOString().split('T')[0];
          next.datePayment1 = today;
        }
      }

      if (field === 'paymentStatus2') {
        const statusObj2 = paymentStatuses.find(s => s.D_paymentStatusID.toString() === value);
        const statusName2 = statusObj2?.D_statusName.toLowerCase();
        setSelectedPaymentStatus2(statusName2 === 'paid' ? 1 : statusName2 === 'unpaid' ? 2 : -1);
      }

      return next;
    });
  };

  // Generate a unique product code
  const generateProductCode = () => {
    // Find the maximum product code from the existing items
    let maxCode = 0;
    
    productItems.forEach(item => {
      const code = parseInt(item.productCode, 10);
      if (!isNaN(code) && code > maxCode) {
        maxCode = code;
      }
    });
    
    // Return the next code
    return (maxCode + 1).toString();
  };

  // Add new product to the list
  const handleAddProduct = () => {
    // Validate form inputs
    // 1) Supplier
    if (!newProduct.supplier) {
      toast.error("Supplier field is empty");
      return;
    }
    // 2) Brand
    if (!newProduct.brand) {
      toast.error("Brand field is empty");
      return;
    }
    // 3) Product name
    if (!newProduct.product) {
      toast.error("Product name field is empty");
      return;
    }
    // 4) Unit price
    if (!newProduct.unitPrice) {
      toast.error("Unit price field is empty");
      return;
    }
    
    // 5) Quantity field must not be empty
    if (!newProduct.quantity) {
      toast.error("Quantity field is empty");
      return;
    }
    
    // 6) Quantity must be a non‐zero positive integer (1,2,3…)
    if (!/^[1-9]\d*$/.test(newProduct.quantity)) {
      toast.error("Quantity is not a positive integer");
      return;
    }

    // Find the selected product in the products array
    const selectedProduct = products.find(p => p.P_productName === newProduct.product);
    
    if (!selectedProduct) {
      toast.error("Product not found");
      return;
    }
    
    // Find the selected brand
    const selectedBrand = brands.find(b => b.B_brandName === newProduct.brand);
    
    if (!selectedBrand) {
      toast.error("Brand not found");
      return;
    }
    
    // Find the expected brand for this product
    const productBrand = brands.find(b => b.B_brandID === selectedProduct.B_brandID);
    
    // Only check supplier match since we have an issue with product's brand ID
    if (String(selectedProduct.S_supplierID) !== String(newProduct.supplier)) {
      toast.error("Product with the given supplier not found");
      return;
    }
    
    // Check if selected brand name matches the product's expected brand name
    if (productBrand && productBrand.B_brandName !== newProduct.brand) {
      toast.error(`Product is associated with brand "${productBrand.B_brandName}", not "${newProduct.brand}"`);
      return;
    }

    // Format the values
    const quantity = `${newProduct.quantity} ${parseInt(newProduct.quantity) > 1 ? 'pcs' : 'pc'}`;
    const unitPrice = parseInt(newProduct.unitPrice).toLocaleString();
    const total = (parseInt(newProduct.unitPrice) * parseInt(newProduct.quantity)).toLocaleString();

    // Create new product object
    const productToAdd = {
      productCode: selectedProduct.P_productCode || generateProductCode(),
      supplier: suppliers.find(s => s.S_supplierID === newProduct.supplier)?.S_supplierName || newProduct.supplier,
      supplierID: newProduct.supplier,
      brand: newProduct.brand,
      product: newProduct.product,
      quantity: quantity,
      unitPrice: unitPrice,
      total: total
    };

    // Add to product items list
    setProductItems([...productItems, productToAdd]);

    // Clear form fields
    setNewProduct({
      product: "",
      supplier: "",
      brand: "",
      unitPrice: "",
      quantity: ""
    });
    
    toast.success("Product added to delivery");
  };

  // Handle deleting a product from the list
  const handleCancelProduct = (index) => {
    const updatedItems = [...productItems];
    updatedItems.splice(index, 1);
    setProductItems(updatedItems);
    toast.success("Product removed from delivery");
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Save the delivery to the database
  const handleSaveDelivery = async () => {
    const raw = deliveryNumber.trim();

    // 1) Error if the field is completely empty:
    if (!raw) {
      toast.error("Delivery number field is empty");
      return;
    }

    // 2) Then enforce integer-only
    if (!/^\d+$/.test(raw)) {
      toast.error("Delivery number not an integer");
      return;
    }
    const dnInt = Number(raw);

    try {
      if (productItems.length === 0) {
        toast.error("Cannot save empty delivery. Please add products first.");
        return;
      }
      
      // Error if no delivery number
      if (!deliveryNumber) {
        toast.error("Delivery Number field is empty");
        return;
      }
      
      // Validate required fields for payment details
      // 1st payment: explicit checks
      if (!paymentDetails.paymentType) {
        toast.error("Payment Type field is empty");
        return;
      }
      if (!paymentDetails.paymentStatus) {
        toast.error("Payment Status field is empty");
        return;
      }
      // if payment status is Paid or payment type is Full upfront
      if (selectedPaymentStatus1 === 1 || selectedPaymentType === 1) {
        if (!paymentDetails.paymentMode) {
          toast.error("Payment Mode field is empty");
          return;
        }
      }

      // 2nd payment (if shown): explicit checks
      if (showSecondPayment && selectedPaymentStatus1 === 1) { // if only status 1 is Paid
        if (!paymentDetails.paymentStatus2) {
          toast.error("2nd Payment Status field is empty");
          return;
        }
        if (!paymentDetails.paymentMode2 && selectedPaymentStatus2 === 1) {
          toast.error("2nd Payment Mode field is empty");
          return;
        }
        if (!paymentDetails.dateDue2) {
          toast.error("2nd Date of Payment Due field is empty");
          return;
        }
      }

      setLoading(true);
      
      const supplierForDelivery = String(
        selectedSupplier || (productItems.length > 0 ? productItems[0].supplierID : null)
      );    
      if (!supplierForDelivery) {
        toast.error("Missing supplier information");
        return;
      }

      // Create comprehensive delivery payload using the format expected
      const deliveryPayload = {
        D_deliveryNumber: parseInt(deliveryNumber.trim(), 10),
        D_deliveryDate: deliveryDate,
        products: productItems.map(item => ({
          P_productCode: String(item.productCode),
          DPD_quantity: parseInt(item.quantity, 10)
        })),
        payment: {
          D_paymentTypeID: parseInt(paymentDetails.paymentType, 10),
          D_modeOfPaymentID: parseInt(paymentDetails.paymentMode, 10),
          D_paymentStatusID: parseInt(paymentDetails.paymentStatus, 10),
          DPD_dateOfPaymentDue: paymentDetails.dateDue || null,
          DPD_dateOfPayment1: paymentDetails.datePayment1 || null,
          // for 2nd payment
          D_modeOfPaymentID2: showSecondPayment
            ? parseInt(paymentDetails.paymentMode2, 10) : null,
          D_paymentStatusID2: showSecondPayment
            ? parseInt(paymentDetails.paymentStatus2, 10) : null,
          DPD_dateOfPaymentDue2: showSecondPayment
            ? paymentDetails.dateDue2 : null,
          DPD_dateOfPayment2: showSecondPayment
            ? paymentDetails.datePayment2 : null
        }
      };

      // Send all delivery data in a single request to the complete delivery endpoint
      const deliveryResponse = await axios.post(API_CONFIG.deliveries, deliveryPayload);
      
      toast.success("Delivery and payment details successfully saved!");
      
      // Reset the form for next entry
      setDeliveryNumber("");
      setSelectedSupplier("");
      setProductItems([]);
      setPaymentDetails({
        paymentType: "",
        paymentMode: "",
        paymentStatus: "",
        dateDue: "",
        datePayment1: "",
        // keep all keys defined so inputs never go from defined→undefined:
        paymentMode2: "",
        paymentStatus2: "2",   // match your initial default
        dateDue2: "",
        datePayment2: ""
      });
      setNewProduct({
        product: "",
        supplier: "",
        brand: "",
        unitPrice: "",
        quantity: ""
      });
      
      // reset global variables
      setSelectedPaymentType(-1);
      setSelectedPaymentStatus1(-1);
      setSelectedPaymentStatus2(-1);
      
      // go back to main deliveries page
      router.push("./deliveries");
      
    } catch (error) {
      console.error("Error saving delivery:", error);
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Failed to save delivery";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }

  };

  // Save payment details separately
  const handleSavePaymentDetails = (deliveryNum) => {
    const detail = paymentDetails[deliveryNum];
    if (!detail) {
      toast.error("No payment details to save");
      return;
    }
    setIsLoading(true);

    const payload = {
      D_paymentTypeID:    parseInt(detail.paymentType, 10),
      D_modeOfPaymentID:  parseInt(detail.paymentMode, 10),
      D_paymentStatusID:  parseInt(detail.paymentStatus, 10),
      DPD_dateOfPaymentDue: detail.dateDue,
      DPD_dateOfPayment1:   detail.datePayment1,
      D_modeOfPaymentID2:   detail.paymentMode2  ? parseInt(detail.paymentMode2, 10)  : null,
      D_paymentStatusID2:   detail.paymentStatus2 ? parseInt(detail.paymentStatus2, 10) : null,
      DPD_dateOfPaymentDue2: detail.dateDue2      || null,
      DPD_dateOfPayment2:   detail.datePayment2   || null,
    };

    axios
      .put(
        `${API_CONFIG.paymentDetails.update}/${deliveryNum}/payment-details`,
        payload
      )
      .then(() => {
        toast.success("Payment details updated successfully!");
        // optionally re-load or refresh here
      })
      .catch(err => {
        console.error("Error updating payment details:", err.response?.data || err);
        toast.error("Failed to update payment details");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  // Handle delivery deletion
  const handleDeleteDelivery = async (password) => {
    try {
      if (!password) {
        toast.error("Admin password is required");
        return;
      }
      
      await axios({
        method: 'put', // Change from 'delete' to 'put'
        url: `${API_CONFIG.deliveries}/${deliveryNumber}/mark-deleted`, // Update endpoint
        data: { adminPW: password },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      toast.success("Delivery marked as deleted");
      
      // Reset form
      setDeliveryNumber("");
      setProductItems([]);
      setPaymentDetails({
        paymentType: "",
        paymentMode: "",
        paymentStatus: "",
        dateDue: "",
        datePayment1: "",
        datePayment2: ""
      });
      
    } catch (error) {
      console.error("Error marking delivery as deleted:", error);
      toast.error(error.response?.data?.message || "Failed to delete delivery");
    }
  };
  
  // Search handler for suppliers
  const handleSupplierSearch = (searchTerm) => {
    if (!searchTerm) {
      return suppliers;
    }
    return suppliers.filter(supplier => 
      supplier.S_supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Search handler for brands
  const handleBrandSearch = (searchTerm) => {
    if (!searchTerm) {
      return brands;
    }
    return brands.filter(brand => 
      brand.B_brandName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Search handler for products
  const handleProductSearch = (searchTerm) => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(product => 
      product.P_productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
    
  // disable 2nd panel Date of Payment if its status is "Unpaid"
  const status2Obj = paymentStatuses
    .find(s => s.D_paymentStatusID.toString() === paymentDetails.paymentStatus2);
  const isSecondUnpaid = status2Obj?.D_statusName.toLowerCase() === 'unpaid';
  
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayDate = getTodayDate();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col overflow-x-hidden">
          <div className="bg-blue-950 p-4 rounded-sm mb-2 shadow-md">
            <div className="flex items-center justify-between sticky top-2 z-10">
              <h1 className="text-2xl text-blue-50 font-bold">Batching of Deliveries</h1>
            
              <Button className="bg-blue-400 text-white" onClick={() => router.push("./deliveries")}>
                <Undo2 size={16} className="mr-2" />
                <span>Return to Deliveries</span>
              </Button>
            </div>
          </div>

          {/* Filter Card */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-1/3">
                    <Label htmlFor="deliveryDate" className="mb-1 block">Date of Delivery</Label>
                    <Input 
                      id="deliveryDate" 
                      type="date" 
                      value={deliveryDate}
                      readOnly
                    />
                    {/* onChange={(e) => setDeliveryDate(e.target.value)} */}
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="deliveryNumber" className="mb-1 block">Delivery Number</Label>
                    <Input
                      id="deliveryNumber"
                      type="text"
                      placeholder="Enter number only"
                      className="text-center"
                      value={deliveryNumber}
                      onChange={e => {
                        let val = e.target.value;
                        // strip all non-digits
                        val = val.replace(/\D/g, '');
                        // remove leading zeros
                        val = val.replace(/^0+/, '');
                        setDeliveryNumber(val);
                      }}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main content layout */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Left side - Product items table */}
            <Card className="w-full lg:w-2/3 flex flex-col">
              <CardContent className="p-4 flex flex-col justify-between flex-grow">
                {/* Product items table with scrollable container */}
                <div className="flex flex-col overflow-auto max-h-[60vh] w-full">
                  <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow>
                        <TableHead>Product Code</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total (QxUP)</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productCode}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>{item.brand}</TableCell>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitPrice}</TableCell>
                          <TableCell>{item.total}</TableCell>
                          <TableCell>
                            {/* For cancelling a product */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white bg-red-500 hover:text-red-800 hover:bg-red-300"
                              onClick={() => handleCancelProduct(index)}
                            >
                              <X size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                        <TableRow>
                          <TableCell colSpan={6} className="text-right text-gray-600 font-medium">
                            Total:
                          </TableCell>
                          <TableCell className="font-semibold text-gray-600">{formattedTotal}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Right side - Add product form */}
            <Card className="w-full lg:w-1/3 flex flex-col justify-between text-gray-700">
              <CardHeader className="pb-0">
                <CardTitle className="text-center text-xl">Add Product to Delivery Batch</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-1 justify-between">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select 
                      value={newProduct.supplier} 
                      onValueChange={(value) => handleInputChange('supplier', value)}
                    >
                      <SelectTrigger id="supplier" className="mt-1">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search suppliers..."
                            className="mb-2"
                            id="supplierSearch"
                            onChange={(e) => {
                              const searchTerm = e.target.value;
                              const results = handleSupplierSearch(searchTerm);
                              // Hide/show options based on search results
                              suppliers.forEach(supplier => {
                                const element = document.getElementById(`supplier-${supplier.S_supplierID}`);
                                if (element) {
                                  element.style.display = results.some(s => s.S_supplierID === supplier.S_supplierID) ? 'block' : 'none';
                                }
                              });
                            }}
                          />
                        </div>
                        {suppliers.map(supplier => (
                          <SelectItem 
                            key={supplier.S_supplierID} 
                            value={supplier.S_supplierID}
                            id={`supplier-${supplier.S_supplierID}`}
                          >
                            {supplier.S_supplierName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                                 
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select 
                      value={newProduct.brand} 
                      onValueChange={(value) => handleInputChange('brand', value)}
                    >
                      <SelectTrigger id="brand" className="mt-1">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search brands..."
                            className="mb-2"
                            id="brandSearch"
                            onChange={(e) => {
                              const searchTerm = e.target.value;
                              const results = brands.filter(brand => 
                                brand.B_brandName.toLowerCase().includes(searchTerm.toLowerCase())
                              );
                              // Hide/show options based on search results
                              brands.forEach(brand => {
                                const element = document.getElementById(`brand-${brand.B_brandID}`);
                                if (element) {
                                  element.style.display = results.some(b => b.B_brandID === brand.B_brandID) ? 'block' : 'none';
                                }
                              });
                            }}
                          />
                        </div>
                        {brands.map(brand => (
                          <SelectItem 
                            key={brand.B_brandID} 
                            value={brand.B_brandName}
                            id={`brand-${brand.B_brandID}`}
                          >
                            {brand.B_brandName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Select 
                      value={newProduct.product} 
                      onValueChange={(value) => handleInputChange('product', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search products..."
                            className="mb-2"
                            id="productSearch"
                            onChange={(e) => {
                              const searchTerm = e.target.value;
                              const results = products.filter(product => 
                                product.P_productName.toLowerCase().includes(searchTerm.toLowerCase())
                              );
                              // Hide/show options based on search results
                              products.forEach(product => {
                                const element = document.getElementById(`product-${product.P_productCode}`);
                                if (element) {
                                  element.style.display = results.some(p => p.P_productCode === product.P_productCode) ? 'block' : 'none';
                                }
                              });
                            }}
                          />
                        </div>
                        {products.map(product => (
                          <SelectItem 
                            key={product.P_productCode} 
                            value={product.P_productName}
                            id={`product-${product.P_productCode}`}
                          >
                            {product.P_productName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>   
                  </div>
                                    
                  <div>
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input 
                      id="unitPrice" 
                      type="text" 
                      placeholder="Enter unit price" 
                      className="mt-1"
                      value={newProduct.unitPrice}
                      onChange={e => {
                        let val = e.target.value;
                        // 1) strip any non-digit/non-dot
                        val = val.replace(/[^0-9.]/g, '');
                        // 2) allow only one dot
                        const parts = val.split('.');
                        val = parts.shift() + (parts.length ? '.' + parts.join('') : '');
                        // 3) remove leading zeros (but allow "0" or "0.xxx")
                        val = val.replace(/^0+([1-9])/, '$1').replace(/^0+$/, '0');
                        handleInputChange('unitPrice', val);
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="text" 
                      placeholder="Enter quantity" 
                      className="mt-1"
                      autoComplete="off"      // ← Disable autocomplete/history
                      spellCheck={false}      // ← Disable spellcheck suggestions
                      value={newProduct.quantity}
                      onChange={e => {
                        const val = e.target.value;
                        // strip any non-digit
                        const digitsOnly = val.replace(/\D/g, '');
                        // remove leading zeros
                        const sanitized = digitsOnly.replace(/^0+/, '');
                        handleInputChange('quantity', sanitized);
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Button 
                      className="w-2/3 bg-blue-400 text-white"
                      onClick={handleAddProduct}
                      disabled={loading}
                    >
                      ADD PRODUCT
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Payment Details Section */}
          <div className="w-full mt-6 mb-4">
            <h2 className="text-2xl text-blue-950 font-bold">Delivery Payment Details</h2>
          </div>
          
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-4">
                {/* First row */}
                <div className="col-span-3">
                  <Label htmlFor="paymentAmount" className="mb-1 block">Amount</Label>
                  <Input
                    id="paymentAmount"
                    className="bg-red-800 text-white text-center"
                    readOnly
                    value={
                      (showSecondPayment
                        ? calculateTotal() / 2
                        : calculateTotal()
                      ).toLocaleString('en-PH', {
                        style: 'currency',
                        currency: 'PHP',
                        minimumFractionDigits: 0
                      }).replace('₱', '')
                    }
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentType" className="mb-1 block">Payment Type</Label>
                  <Select 
                    value={paymentDetails.paymentType} 
                    onValueChange={(value) => handlePaymentDetailChange('paymentType', value)}
                  >
                    <SelectTrigger id="paymentType">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map(type => (
                        <SelectItem key={type.D_paymentTypeID} value={type.D_paymentTypeID.toString()}>
                          {type.D_paymentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3"> </div>
                <div className="col-span-3"> </div>
                
                {/* Second row */}
                <div className="col-span-3">
                  <Label htmlFor="paymentStatus" className="mb-1 block">Payment Status</Label>
                  <Select 
                    value={paymentDetails.paymentStatus} 
                    onValueChange={(value) => handlePaymentDetailChange('paymentStatus', value)}
                    disabled={paymentDetails.paymentType === '1'}
                  >
                    <SelectTrigger id="paymentStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map(status => (
                        <SelectItem 
                          key={status.D_paymentStatusID}
                          value={status.D_paymentStatusID.toString()}
                        >
                          {status.D_statusName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-3">
                  <Label htmlFor="paymentMode" className="mb-1 block">Mode of Payment</Label>
                  <Select 
                    value={paymentDetails.paymentMode} 
                    onValueChange={(value) => handlePaymentDetailChange('paymentMode', value)}
                    disabled={
                      selectedPaymentType !== 1 && selectedPaymentStatus1 !== 1
                    }
                  >
                    <SelectTrigger id="paymentMode">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentModes.map(mode => (
                        <SelectItem key={mode.D_modeOfPaymentID} value={mode.D_modeOfPaymentID.toString()}>
                          {mode.D_mopName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <Label htmlFor="paymentDateDue" className="mb-1 block">Date of Payment Due</Label>
                  <Input 
                    id="paymentDateDue" 
                    type="date" 
                    value={paymentDetails.dateDue}
                    placeholder="N/A"
                    className={paymentDetails.paymentType === '1' ? 'text-gray-400' : ''}
                    readOnly
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment</Label>
                  <Input 
                    id="paymentDate1" 
                    type="date" 
                    value={paymentDetails.datePayment1 || ''}
                    disabled={true}
                    onChange={(e) => handlePaymentDetailChange('datePayment1', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Save All Details button */}
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  className="bg-green-600 text-white"
                  onClick={handleSaveDelivery}
                  disabled={loading}
                >
                  SAVE ALL DETAILS
                </Button>
              </div>
              
            </CardContent>
          </Card>
          
          {showSecondPayment && (
            <Card className="mb-4" ref={secondCardRef}>
              <div className="w-full mt-6 mb-4 pl-4">
                <h2 className="text-xl text-gray-600 font-medium">2nd Payment</h2>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-4">
                  {/* Amount 2 */}
                  <div className="col-span-3">
                    <Label className="mb-1 block">Amount</Label>
                    <Input
                      value={(calculateTotal()/2).toLocaleString('en-PH', {
                        style: 'currency',
                        currency: 'PHP', minimumFractionDigits: 0
                      }).replace('₱','')}
                      readOnly
                      className="bg-red-800 text-white text-center"
                    />
                  </div>
                  <div className="col-span-3"> </div>
                  <div className="col-span-3"> </div>
                  <div className="col-span-3"> </div>
                  {/* Payment Status 2 */}
                  <div className="col-span-3">
                    <Label>Payment Status</Label>
                    <Select
                      value={paymentDetails.paymentStatus2}
                      onValueChange={v => handlePaymentDetailChange('paymentStatus2', v)}
                      disabled={selectedPaymentStatus1 !== 1}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatuses.map(s => (
                          <SelectItem key={s.D_paymentStatusID} value={s.D_paymentStatusID.toString()}>
                            {s.D_statusName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Mode of Payment 2 */}
                  <div className="col-span-3">
                    <Label>Mode of Payment</Label>
                    <Select
                      value={paymentDetails.paymentMode2}
                      onValueChange={v => handlePaymentDetailChange('paymentMode2', v)}
                      disabled={selectedPaymentStatus2 !== 1}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentModes.map(m => (
                          <SelectItem key={m.D_modeOfPaymentID} value={m.D_modeOfPaymentID.toString()}>
                            {m.D_mopName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Date of Payment Due 2 */}
                  <div className="col-span-3">
                    <Label>Date of Payment Due</Label>
                    <Input
                      type="date"
                      value={paymentDetails.dateDue2}
                      readOnly
                      disabled={selectedPaymentStatus1 !== 1}
                    />
                  </div>
                  {/* Date of Payment 2 */}
                  <div className="col-span-3">
                    <Label>Date of Payment</Label>
                    <Input
                      type="date"
                      value={selectedPaymentStatus2 === 1 ? todayDate : ''}
                      onChange={e => handlePaymentDetailChange('datePayment2', e.target.value)}
                      disabled={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Toaster position="top-right" />
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}