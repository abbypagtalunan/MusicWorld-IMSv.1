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

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Trash2, Undo2, FilePen } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import MinimumScreenGuard from "@/components/MinimumScreenGuard";

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

  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [duplicateError, setDuplicateError] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const computedTotal = (() => {
  const price = parseFloat(unitPrice) || 0;
  const qty = parseInt(quantity) || 0;
  return (price * qty).toFixed(2);
})();
  
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

  const isSaveDisabled = productItems.length === 0||
  !deliveryNumber ||
  !paymentDetails.paymentType ||
  !paymentDetails.paymentStatus ||
  ((selectedPaymentStatus1 === 1 || selectedPaymentType === 1) && !paymentDetails.paymentMode) ||
  loading;

const newHandleSaveDelivery = async () => {
  const raw = deliveryNumber.trim();
  if (!raw) {
    toast.error("Delivery number field is empty");
    return;
  }

  if (!deliveryDate) {
    toast.error("Delivery date is missing");
    return;
  }

  if (productItems.length === 0) {
    toast.error("Add at least one product to save delivery.");
    return;
  }

  // Validate required payment fields if paymentDetails exist
  if (paymentDetails) {
    if (!paymentDetails.paymentType || !paymentDetails.paymentStatus) {
      toast.error("Payment Type and Payment Status are required");
      return;
    }
  }

  try {
    setLoading(true);
    const deliveryPayload = {
      D_deliveryNumber: parseInt(raw, 10),
      D_deliveryDate: deliveryDate,
      products: productItems.map(item => ({
        P_productCode: parseInt(item.productCode, 10),
        DPD_quantity: parseInt(item.quantity, 10),
        P_unitPrice: parseFloat(item.unitPrice),
      })),
      payment: paymentDetails ? {
        D_paymentTypeID: parseInt(paymentDetails.paymentType, 10),
        D_paymentStatusID: parseInt(paymentDetails.paymentStatus, 10),
        D_modeOfPaymentID: paymentDetails.paymentMode ? parseInt(paymentDetails.paymentMode, 10) : null,
      } : null
    };

    console.log("Submitting delivery payload:", JSON.stringify(deliveryPayload, null, 2));
    const res = await axios.post("http://localhost:8080/deliveries", deliveryPayload);
    toast.success("Delivery and product details successfully saved!");
    console.log("Server response:", res.data);

    setDeliveryNumber("");
    setProductItems([]);
    setPaymentDetails({
      paymentType:   "",
      paymentMode:   "",
      paymentStatus: "",
      dateDue:       "",
      datePayment1:  "",
      // for 2nd payment
      paymentMode2:   "",
      paymentStatus2: "2",   // default back to “Unpaid”
      dateDue2:       "",
      datePayment2:   ""
    });

  } catch (error) {
    console.error("Error saving delivery:", error);
      // Handle duplicate entry error specifically
    if (error.response?.data?.message?.includes("already used")) {
      toast.error("This delivery number is already in use. Please enter a unique delivery number.");
      setDuplicateError(true);
    } else {
      toast.error(error.response?.data?.message || "Failed to save delivery");
    }
  } finally {
    setLoading(false);
  }
};

const handleAddProduct = () => {
  const productToAdd = {
    productCode: selectedProduct.code,
    supplier: selectedProduct.supplier,
    brand: selectedProduct.brand,
    product: selectedProduct.name,
    quantity: quantity,
    unitPrice: unitPrice,
    total: computedTotal
  };

  let updatedData = [];
  if (isEditMode) {
    updatedData = data.map((item) =>
      item["Product Code"] === selectedProduct.code
        ? { ...item, ...productToAdd }
        : item
    );
    setData(updatedData);

    setProductItems(productItems.map(item =>
      item.productCode === selectedProduct.code ? { ...item, ...productToAdd } : item
    ));
  } else {
    updatedData = [...data, productToAdd];
    setData(updatedData);
    setProductItems([...productItems, productToAdd]);
  }

  // Reset form
  setSelectedProduct(null);
  setQuantity(1);
  setIsEditMode(false);
  setUnitPrice(' ');
};


  const handleEditProduct = (row) => {
    const {
      productCode: code,
      quantity,
      unitPrice
    } = row;

    const matchedProduct = products.find((p) => p.code === code);
    if (!matchedProduct) return;

    // Autofill fields
    setSelectedProduct(matchedProduct);
    setQuantity(quantity);
    setUnitPrice(unitPrice);
    setIsEditMode(true);
  };

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

  // Handle deleting a product from the list
  const handleCancelProduct = (index) => {
    const updatedItems = [...productItems];
    updatedItems.splice(index, 1);
    setProductItems(updatedItems);
  };

  // Save the delivery to the database
  const handleSaveDelivery = async () => {
    const raw = deliveryNumber.trim();

    // 1) Error if the field is completely empty:
    if (!raw) {
      toast.error("Delivery number field is empty");
      return;
    }

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
      // if payment status is Paid and Date of Payment is empty
      if (selectedPaymentStatus === 1) {
        if (!paymentDetails.datePayment1) {
          toast.error("Date of Payment field is empty");
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

    // Create comprehensive delivery payload using the format expected
    const deliveryPayload = {
      D_deliveryNumber: parseInt(deliveryNumber.trim(), 10),
      D_deliveryDate: deliveryDate,

      products: productItems.map(({ productCode, quantity, unitPrice, total }) => ({
        P_productCode: String(productCode),
        DPD_quantity: parseInt(quantity, 10),
        DPD_unitPrice: parseFloat(unitPrice),
        DPD_total: parseFloat(total),
      })),

      payment: {
        D_paymentTypeID: parseInt(paymentDetails.paymentType, 10),
        D_modeOfPaymentID: paymentDetails.paymentMode ? parseInt(paymentDetails.paymentMode, 10) : null,
        D_paymentStatusID: parseInt(paymentDetails.paymentStatus, 10),
        DPD_dateOfPaymentDue: paymentDetails.dateDue || null,
        DPD_dateOfPayment1: paymentDetails.datePayment1 || null,

        // 2nd payment (conditional)
        D_modeOfPaymentID2: showSecondPayment && paymentDetails.paymentMode2
          ? parseInt(paymentDetails.paymentMode2, 10)
          : null,
        D_paymentStatusID2: showSecondPayment && paymentDetails.paymentStatus2
          ? parseInt(paymentDetails.paymentStatus2, 10)
          : null,
        DPD_dateOfPaymentDue2: showSecondPayment ? paymentDetails.dateDue2 || null : null,
        DPD_dateOfPayment2: showSecondPayment ? paymentDetails.datePayment2 || null : null
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
    
  // disable 2nd panel Date of Payment if its status is "Unpaid"
  const status2Obj = paymentDetails
  ? paymentStatuses.find(s => s.D_paymentStatusID.toString() === paymentDetails.paymentStatus2)
  : null;
  const isSecondUnpaid = status2Obj?.D_statusName.toLowerCase() === 'unpaid';
  
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayDate = getTodayDate();

  // NEW PRODUCT SEARCH
  useEffect(() => {
        fetchProductsCombobox();
      }, []);
  
    const fetchProductsCombobox = async () => {
      try {
        const res = await axios.get("http://localhost:8080/products");
        const mappedProducts = res.data.map((p) => ({
          code: p.P_productCode,
          name: p.P_productName,
          brand: p.brand,
          supplier: p.supplier,
          price: p.P_sellingPrice,
          unitPrice: p.P_unitPrice,
          stock: p.stock,
          label: `${p.P_productName} - S${p.supplier} - B${p.brand}`,
        }));
        setProducts(mappedProducts);
        console.log("Products fetched and mapped for product chooser.");
      } catch (err) {
        console.error("Failed to fetch products for product chooser:", err);
      }
    };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setOpenProduct(false);
    setQuantity(1);
  };

  // Autofill unit price when product is selected
  useEffect(() => {
    if (selectedProduct?.unitPrice) {
      setUnitPrice(selectedProduct.unitPrice.toString());
    }
  }, [selectedProduct]);
  
  return (
    <MinimumScreenGuard>
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
              <div className="flex items-center justify-between w-full">
                {/* Date of Delivery */}
                <div className="w-1/2 pr-2">
                  <Label htmlFor="deliveryDate" className="mb-1 block">Date of Delivery</Label>
                  <Input 
                    id="deliveryDate" 
                    type="date" 
                    value={deliveryDate}
                    readOnly
                  />
                </div>

                {/* Delivery Number */}
                <div className="w-1/2 pl-2">
                  <Label htmlFor="deliveryNumber" className="mb-1 block text-left">Delivery Number</Label>
                  <Input
                    id="deliveryNumber"
                    type="text"
                    className={`text-center w-full ${duplicateError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={deliveryNumber}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setDeliveryNumber(val);
                      setDuplicateError(false);
                    }}
                    autoComplete="off"
                  />
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
                        <TableHead>Total</TableHead>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-800"
                              onClick={() => handleEditProduct(item)}
                            >
                              <FilePen size={16} />
                            </Button>
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-800"
                              onClick={() => handleCancelProduct(index)}
                            >
                              <Trash2 size={16} />
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

                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    className={`
                      px-3 py-1.5 text-xs uppercase text-white
                      ${isSaveDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                    `}
                    onClick={newHandleSaveDelivery}
                    disabled={isSaveDisabled}
                  >
                    Save Delivery
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right side - Add product form */}
            <Card className="w-full lg:w-1/3 flex flex-col justify-between text-gray-700">
              <CardHeader className="pb-0">
                <CardTitle className="text-center text-xl">Add Product to Delivery Batch</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-1 justify-between">
              <div
                onMouseLeave={() => {
                  if (isEditMode) {
                    setIsEditMode(false);
                    setSelectedProduct(null);
                    setQuantity(1);
                    setIsEditMode(false);
                    setUnitPrice(' ')
                  }
                }}
              >
              <div className="mb-3">
              <label className="block mb-1 text-sm">Product</label>
              <Popover open={openProduct} onOpenChange={setOpenProduct}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProduct}
                    className="w-full justify-between"
                  >
                    {selectedProduct ? selectedProduct.label : "Select product..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                  <Command>
                    <div className="sticky top-0 z-10 bg-white p-2 border-b">
                      <CommandInput placeholder="Search product..." />
                    </div>
                    <CommandEmpty className="p-2 text-sm text-gray-500">
                      No product found.
                    </CommandEmpty>
                    <div className="max-h-60 overflow-y-auto">
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.code}
                            value={product.label}
                            onSelect={() => {
                              handleProductSelect(product);
                              setOpenProduct(false);
                            }}
                            className={cn(
                              product.stock === 0 && "bg-gray-200 text-gray-400",
                              "cursor-default flex items-start flex-col gap-0.5"
                            )}
                          >
                            <div className="flex items-center w-full">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProduct?.code === product.code ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="font-medium">{product.label}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-6"> Stock: {product.stock}</span>
                            <span className="text-xs text-gray-500 ml-6"> Unit Price: {product.unitPrice}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="mb-3 mt-3">
                <label className="block text-sm">Supplier</label>
                  <input
                    type="text"
                    value={selectedProduct?.supplier || ''}
                    disabled
                    className="w-full pl-6 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500"
                  />
              </div>

              <div className="mb-3">
                <label className="block text-sm">Brand</label>
                  <input
                    type="text"
                    value={selectedProduct?.brand || ''}
                    disabled
                    className="w-full pl-6 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500"
                  />
              </div>

              <div className="mb-3">
                <label className="block text-sm">Unit Price</label>
                  <input
                    type="text"
                    value={unitPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d{0,2}$/.test(value)) {
                        setUnitPrice(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      const invalidKeys = ['e', '+', '-', '='];
                      if (invalidKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full border rounded-md px-5 py-2 text-sm"
                    placeholder="0.00"
                  />
              </div>

            <div className="mb-3">
              <label className="block text-sm">Quantity</label>
              <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
                className="w-full border rounded-md px-5 py-2 text-sm"
              />
            </div>
          </div> 

          <div className="mb-3">
            <label className="block text-sm">Total</label>
            <input
              type="text"
              value={computedTotal}
              disabled
              className="w-full pl-6 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500"
            />
          </div>
 
            <div className="flex justify-center mt-6">
              <Button 
                className={`w-full mt-2 py-2 rounded-md text-white 
                  ${!selectedProduct || !unitPrice || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-400 hover:bg-blue-700"
                  }`}
                onClick={handleAddProduct}
                disabled={!selectedProduct || !unitPrice || loading}
              >
                {isEditMode ? "Update Product" : "Add Product"}
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
                    <SelectTrigger
                      id="paymentType"
                      className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
                    >
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
                    disabled={
                      paymentDetails.paymentType === '1' || selectedPaymentType === 1
                    }
                  >
                    <SelectTrigger
                      id="paymentStatus"
                      className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
                    >
                      <SelectValue
                        placeholder={
                           paymentDetails.paymentType === '1' || selectedPaymentType === 1
                          ? "Null" : "Select payment status"
                        }
                      />
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
                    <SelectTrigger
                      id="paymentMode"
                      className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
                    >
                      <SelectValue
                        placeholder={
                          selectedPaymentType !== 1 && selectedPaymentStatus1 !== 1
                          ? "Null" : "Select payment mode"
                        }
                      />
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
                    disabled={true}
                    className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
                    placeholder="N/A"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment</Label>
                  <Input 
                    id="paymentDate1" 
                    type="date" 
                    value={paymentDetails.datePayment1 || ''}
                    min={deliveryDate} 
                    max={todayDate} 
                    onChange={(e) => handlePaymentDetailChange('datePayment1', e.target.value)}
                    disabled={
                      selectedPaymentStatus1 === 2
                    }
                    className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
                  />
                </div>
              </div>
              
              {/* Save All Details button */}
              {/* <div className="flex justify-end gap-2 mt-6">
                <Button 
                  className="bg-green-600 text-white"
                  onClick={handleSaveDelivery}
                  disabled={loading}
                >
                  SAVE ALL DETAILS
                </Button>
              </div> */}
              
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
                      <SelectTrigger
                        className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
                      >
                        <SelectValue
                          placeholder={
                            selectedPaymentStatus1 !== 1
                            ? "Null" : "Select payment status"
                          }
                        />
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
                      <SelectTrigger
                        className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
                      >
                        <SelectValue
                          placeholder={
                            selectedPaymentStatus2 !== 1
                            ? "Null" : "Select payment mode"
                          }
                        />
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
                      disabled={true}
                      className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
                    />
                  </div>
                  {/* Date of Payment 2 */}
                  <div className="col-span-3">
                    <Label>Date of Payment</Label>
                    <Input
                      type="date"
                      value={paymentDetails.datePayment2 || ''}
                      min={deliveryDate}
                      max={todayDate}
                      onChange={e => handlePaymentDetailChange('datePayment2', e.target.value)}
                      disabled={
                        selectedPaymentStatus1 === 2
                      }
                      className="disabled:bg-gray-200 disabled:!text-gray-600 disabled:opacity-100"
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
    </MinimumScreenGuard>
  );
}