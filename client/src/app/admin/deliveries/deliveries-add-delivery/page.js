
"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import { Trash2, Undo2, Filter } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function BatchDeliveriesPage() {
  const router = useRouter();
  
  // State for product items in the table
  const [productItems, setProductItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deliveryNumber, setDeliveryNumber] = useState("DR-" + Math.floor(Math.random() * 90000 + 10000));
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
    datePayment2: ""
  });
  
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
    deliveryProducts: "http://localhost:8080/deliveryProducts",
    paymentTypes: "http://localhost:8080/deliveryPaymentTypes",
    paymentModes: "http://localhost:8080/deliveryModeOfPayment",
    paymentStatuses: "http://localhost:8080/deliveryPaymentStatus",
    paymentDetails: "http://localhost:8080/deliveryPaymentDetails"
  };

  useEffect(() => {
    loadAllData();
  }, []);

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
      
      // Set today's date as default delivery date
      const today = new Date().toISOString().split('T')[0];
      setDeliveryDate(today);
      
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
    setPaymentDetails({
      ...paymentDetails,
      [field]: value
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
    if (!newProduct.product || !newProduct.supplier || !newProduct.brand || !newProduct.unitPrice || !newProduct.quantity) {
      toast.error("Please fill in all product fields");
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
  const handleDeleteProduct = (index) => {
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
    try {
      if (productItems.length === 0) {
        toast.error("Cannot save empty delivery. Please add products first.");
        return;
      }
      
      // Validate required fields
      if (!deliveryNumber || !deliveryDate || !selectedSupplier) {
        toast.error("Please fill in all required delivery information");
        return;
      }
      
      // Create delivery object
      const deliveryPayload = {
        D_deliveryNumber: deliveryNumber,
        D_deliveryDate: new Date(deliveryDate).toISOString(),
        S_supplierID: selectedSupplier
      };
      
      // Step 1: Create/update the delivery
      await axios.post(API_CONFIG.deliveries, deliveryPayload);
      
      // Step 2: Save product details for this delivery
      const productPromises = productItems.map(item => {
        // Extract numeric quantity value
        const quantityValue = parseInt(item.quantity.split(' ')[0]);
        // Extract numeric unit price value
        const unitPriceValue = parseFloat(item.unitPrice.replace(/,/g, ''));
        
        const productDetailPayload = {
          D_deliveryNumber: deliveryNumber,
          P_productCode: item.productCode,
          DPD_quantity: quantityValue,
          DPD_unitPrice: unitPriceValue
        };
        
        return axios.post(API_CONFIG.deliveryProducts, productDetailPayload);
      });
      
      await Promise.all(productPromises);
      
      // Step 3: Save payment details
      if (paymentDetails.paymentType && paymentDetails.paymentMode && 
          paymentDetails.paymentStatus && paymentDetails.dateDue && paymentDetails.datePayment1) {
        
        const paymentPayload = {
          D_deliveryNumber: deliveryNumber,
          D_paymentTypeID: parseInt(paymentDetails.paymentType),
          D_modeOfPaymentID: parseInt(paymentDetails.paymentMode),
          D_paymentStatusID: parseInt(paymentDetails.paymentStatus),
          DPD_dateOfPaymentDue: paymentDetails.dateDue,
          DPD_dateOfPayment1: paymentDetails.datePayment1,
          DPD_dateOfPayment2: paymentDetails.datePayment2 || null
        };
        
        await axios.post(API_CONFIG.paymentDetails, paymentPayload);
      }
      
      toast.success("Delivery successfully saved!");
      
      // Generate a new delivery number for next entry
      setDeliveryNumber("DR-" + Math.floor(Math.random() * 90000 + 10000));
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
      console.error("Error saving delivery:", error);
      toast.error(error.response?.data?.message || "Failed to save delivery");
    }
  };

  // Handle delivery deletion
  const handleDeleteDelivery = async (password) => {
    try {
      if (!password) {
        toast.error("Admin password is required");
        return;
      }
      
      await axios({
        method: 'delete',
        url: `${API_CONFIG.deliveries}/${deliveryNumber}`,
        data: { adminPW: password },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      toast.success("Delivery deleted successfully");
      
      // Reset form
      setDeliveryNumber("DR-" + Math.floor(Math.random() * 90000 + 10000));
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
      console.error("Error deleting delivery:", error);
      toast.error(error.response?.data?.message || "Failed to delete delivery");
    }
  };

  // Save payment details separately
  const handleSavePaymentDetails = async () => {
    try {
      // Validate required fields
      if (!paymentDetails.paymentType || !paymentDetails.paymentMode || 
          !paymentDetails.paymentStatus || !paymentDetails.dateDue || !paymentDetails.datePayment1) {
        toast.error("Please fill in all required payment details");
        return;
      }
      
      const paymentPayload = {
        D_deliveryNumber: deliveryNumber,
        D_paymentTypeID: parseInt(paymentDetails.paymentType),
        D_modeOfPaymentID: parseInt(paymentDetails.paymentMode),
        D_paymentStatusID: parseInt(paymentDetails.paymentStatus),
        DPD_dateOfPaymentDue: paymentDetails.dateDue,
        DPD_dateOfPayment1: paymentDetails.datePayment1,
        DPD_dateOfPayment2: paymentDetails.datePayment2 || null
      };
      
      await axios.post(API_CONFIG.paymentDetails, paymentPayload);
      toast.success("Payment details saved successfully");
      
    } catch (error) {
      console.error("Error saving payment details:", error);
      toast.error(error.response?.data?.message || "Failed to save payment details");
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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full overflow-hidden">
        <div className="flex items-center justify-between bg-white p-4 sticky top-2 z-10 shadow-sm">
            <div>
              <h1 className="text-xl text-gray-600 font-medium">Batching of Deliveries</h1>
            </div>
            <div>
              <Button className="bg-blue-400 text-white" onClick={() => router.push("./")}>
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
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="deliveryNumber" className="mb-1 block">Delivery Number</Label>
                    <Input 
                      id="deliveryNumber" 
                      placeholder="Enter number only"
                      className="text-center"
                      value={deliveryNumber}
                      onChange={(e) => setDeliveryNumber(e.target.value)}
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
                            {/* For deleting transactions */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteProduct(index)}
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
                {/* Dialogue box for deleting transactions */}                
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    className="bg-green-600 text-white"
                    onClick={handleSaveDelivery}
                    disabled={loading}
                  >
                    SAVE DELIVERY
                  </Button>
                  <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="outline" className="bg-gray-400 text-white">
                        DELETE DELIVERY
                      </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-7 text-gray-700">
                        <DialogHeader>
                            <DialogTitle>
                              <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                              <span className="text-lg text-gray-400 font-normal italic">{deliveryNumber}</span></DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                          <div className="flex items-center gap-4 mt-4 pl-10">          
                            <div className="flex-1">
                              <label htmlFor={`password-${deliveryNumber}`} className="text-base font-medium text-gray-700 block mb-2">
                                Admin Password
                              </label>
                              <Input 
                                type="password" 
                                id={`password-${deliveryNumber}`} 
                                required
                                placeholder="Enter valid password"  
                                className="w-full" 
                              />
                            </div>       
                            <Button 
                              className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                              onClick={() => handleDeleteDelivery(
                                document.getElementById(`password-${deliveryNumber}`).value)
                              }
                            >
                              DELETE TRANSACTION
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
                      type="number" 
                      placeholder="Enter unit price" 
                      className="mt-1"
                      value={newProduct.unitPrice}
                      onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      placeholder="Enter quantity" 
                      className="mt-1"
                      value={newProduct.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
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
            <h2 className="text-xl text-gray-600 font-medium">Delivery Payment Details</h2>
          </div>
          
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-4">
                {/* First row */}
                <div className="col-span-3">
                  <Label htmlFor="paymentAmount" className="mb-1 block">Amount</Label>
                  <Input 
                    id="paymentAmount" 
                    value={formattedTotal.replace('₱', '')} 
                    className="bg-red-800 text-white text-center" 
                    readOnly 
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
                <div className="col-span-3">
                  <Label htmlFor="paymentMode" className="mb-1 block">Mode of Payment</Label>
                  <Select 
                    value={paymentDetails.paymentMode} 
                    onValueChange={(value) => handlePaymentDetailChange('paymentMode', value)}
                  >
                    <SelectTrigger id="paymentMode">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentModes.map(mode => (
                        <SelectItem key={mode.D_modeOfPaymentID} value={mode.D_modeOfPaymentID.toString()}>
                          {mode.D_modeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Second row */}
                <div className="col-span-3">
                  <Label htmlFor="paymentStatus" className="mb-1 block">Payment Status</Label>
                  <Select 
                    value={paymentDetails.paymentStatus} 
                    onValueChange={(value) => handlePaymentDetailChange('paymentStatus', value)}
                  >
                    <SelectTrigger id="paymentStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map(status => (
                        <SelectItem key={status.D_paymentStatusID} value={status.D_paymentStatusID.toString()}>
                          {status.D_statusName}
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
                    onChange={(e) => handlePaymentDetailChange('dateDue', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment 1</Label>
                  <Input 
                    id="paymentDate1" 
                    type="date" 
                    value={paymentDetails.datePayment1}
                    onChange={(e) => handlePaymentDetailChange('datePayment1', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentDate2" className="mb-1 block">Date of Payment 2</Label>
                  <Input 
                    id="paymentDate2" 
                    type="date" 
                    value={paymentDetails.datePayment2}
                    onChange={(e) => handlePaymentDetailChange('datePayment2', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  className="bg-blue-400 text-white"
                  onClick={handleSavePaymentDetails}
                  disabled={loading}
                >
                  SAVE DETAILS
                </Button>
              </div>
            </CardContent>
          </Card>
          <Toaster position="top-right" />
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}