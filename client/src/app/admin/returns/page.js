"use client";

import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider, } from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Ellipsis } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";


// sample product data incl: quantity, product, brand, category
const products = [
  { productCode: "188090", product: "AD W/ W Case", quantity: 2, brand: "Yamaha", category: "Drums" },
  { productCode: "188091", product: "Maple Snare Drum", quantity: 1, brand: "Pearl", category: "Drums" },
  { productCode: "188092", product: "Cymbal Straight Stand", quantity: 3, brand: "Zildjian", category: "Accessories" },
  { productCode: "188093", product: "Alice Violin String", quantity: 0, brand: "Alice", category: "Strings" },
  { productCode: "188094", product: "Bee Harmonica", quantity: 0, brand: "Hohner", category: "Wind Instruments" },
  { productCode: "188095", product: "Cort Acoustic Guitar", quantity: 2, brand: "Cort", category: "Guitars" },
  { productCode: "188096", product: "AD W/ W Case", quantity: 2, brand: "Yamaha", category: "Drums" },
  { productCode: "188097", product: "Maple Snare Drum", quantity: 1, brand: "Pearl", category: "Drums" },
  { productCode: "188098", product: "Cymbal Straight Stand", quantity: 3, brand: "Zildjian", category: "Accessories" },
];

// sample transactions data incl: date, tid, total, discount
const transactions = [
  { dateAdded: "11/12/22", transactionID: "9090", transactionType: "Sales", productCode: "188090", totalPrice: "₱15,995", discount: "0%" },
  { dateAdded: "11/12/22", transactionID: "9091", transactionType: "Return", productCode: "188091", totalPrice: "₱4,500", discount: "5%" },
  { dateAdded: "11/12/22", transactionID: "9092", transactionType: "Sales", productCode: "188092", totalPrice: "₱1,995", discount: "0%" },
  { dateAdded: "11/12/22", transactionID: "9093", transactionType: "Sales", productCode: "188093", totalPrice: "₱29,995", discount: "10%" },
  { dateAdded: "11/12/22", transactionID: "9094", transactionType: "Sales", productCode: "188094", totalPrice: "₱125", discount: "0%" },
  { dateAdded: "11/12/22", transactionID: "9095", transactionType: "Sales", productCode: "188095", totalPrice: "₱2,595", discount: "0%" },
  { dateAdded: "11/12/22", transactionID: "9096", transactionType: "Return", productCode: "188096", totalPrice: "₱395", discount: "0%" },
  { dateAdded: "11/12/22", transactionID: "9097", transactionType: "Return", productCode: "188097", totalPrice: "₱295", discount: "0%" },
  { dateAdded: "11/12/22", transactionID: "9098", transactionType: "Return", productCode: "188098", totalPrice: "₱15,995", discount: "15%" },
];

// sample data for deliveries with supplier information
const deliveries = [
  { dateAdded: "11/12/22", deliveryNum: "D-188090", supplier: "Lazer", productCode: "188090", totalCost: "₱15,995" },
  { dateAdded: "11/12/22", deliveryNum: "D-188091", supplier: "Lazer", productCode: "188091", totalCost: "₱4,500" },
  { dateAdded: "11/12/22", deliveryNum: "D-188092", supplier: "Lazer", productCode: "188092", totalCost: "₱1,995" },
  { dateAdded: "11/12/22", deliveryNum: "D-188093", supplier: "Mirbros", productCode: "188093", totalCost: "₱29,995" },
  { dateAdded: "11/12/22", deliveryNum: "D-188094", supplier: "Mirbros", productCode: "188094", totalCost: "₱125" },
  { dateAdded: "11/12/22", deliveryNum: "D-188095", supplier: "Mirbros", productCode: "188095", totalCost: "₱2,595" },
  { dateAdded: "11/12/22", deliveryNum: "D-188096", supplier: "Lazer", productCode: "188096", totalCost: "₱395" },
  { dateAdded: "11/12/22", deliveryNum: "D-188097", supplier: "Lazer", productCode: "188097", totalCost: "₱295" },
  { dateAdded: "11/12/22", deliveryNum: "D-188098", supplier: "Lazer", productCode: "188098", totalCost: "₱15,995" },
];


export default function ReturnsPage() {
  
  const configMap = {
    return: {
      label: "Return",
      idField: "R_returnID",
      nameField: "R_returnID", // Using ID as name since there's no specific name field
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080./admin/returns",
        add: "http://localhost:8080/admin/returns",
        update: "http://localhost:8080/admin/returns",
        delete: "http://localhost:8080/admin/returns",
      },
      fields: {
        productCode: "P_productCode",
        returnTypeID: "R_returnTypeID",
        reason: "R_reasonOfReturn",
        date: "R_dateOfReturn",
        quantity: "R_returnQuantity",
        discount: "R_discountAmount"
      }
    }
  };

  const [supplierReturn, setSupplierReturn] = useState({
    deliveryNumber: "",
    supplier: "",
    productItem: "",
    brand: "",
    quantity: "",
    total: "",
    amount: ""
  });
  
const [searchTerm, setSearchTerm] = useState("");
const [customerReturns, setCustomerReturns] = useState([]);
const [filteredSupplierReturns, setFilteredSupplierReturns] = useState([]);
const [selectedFilter, setSelectedFilter] = useState("All");
const [activeTab, setActiveTab] = useState("customer");
const [productName, setProductName] = useState("");
const [returnType, setReturnType] = useState("");
const [supplier, setSupplier] = useState("");
const [brand, setBrand] = useState("");
const [quantity, setQuantity] = useState("");
const [discount, setDiscount] = useState("");
const [price, setPrice] = useState("");
const [filteredCustomerReturns, setFilteredCustomerReturns] = useState([]);


// Fetch all necessary data for returns
useEffect(() => {
  // In your useEffect data fetching:
const fetchData = async () => {
  try {
    // Fetch returns data
    const returnsResponse = await axios.get("http://localhost:8080/admin/returns");
    const returnsData = returnsResponse.data;

    // Process the data to match your table structure
    const processedReturns = returnsData.map(item => ({
      dateAdded: item.R_dateOfReturn, // Make sure this matches your backend field
      transactionID: item.R_returnID,
      product: item.P_productName || "Unknown Product", // Adjust based on joined data
      quantity: item.R_returnQuantity,
      totalPrice: `₱${item.R_totalPrice?.toLocaleString() || "0"}`, // Format price
      returnType: item.RT_returnTypeDescription || "Unknown Type",
      productCode: item.P_productCode,
      supplier: item.S_supplierName || "Unknown Supplier",
      brand: item.B_brandName || "Unknown Brand",
      category: item.P_category || "Unknown Category"
    }));

    setCustomerReturns(processedReturns);
    setFilteredCustomerReturns(processedReturns); // Initialize filtered data
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

  fetchData();
}, []);

// Filter returns based on search and filters
useEffect(() => {
  let filtered = customerReturns;

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(item =>
      item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transactionID.includes(searchTerm)
    );
  }

  // Apply other filters
  if (selectedFilter !== "All") {
    filtered = filtered.filter(item => item.returnType === selectedFilter);
  }

  if (productName) {
    filtered = filtered.filter(item =>
      item.product.toLowerCase().includes(productName.toLowerCase())
    );
  }

  if (returnType) {
    filtered = filtered.filter(item => item.returnType === returnType);
  }

  if (supplier) {
    filtered = filtered.filter(item =>
      item.supplier.toLowerCase().includes(supplier.toLowerCase())
    );
  }

  if (brand) {
    filtered = filtered.filter(item =>
      item.brand.toLowerCase().includes(brand.toLowerCase())
    );
  }

  if (quantity) {
    filtered = filtered.filter(item => item.quantity === parseInt(quantity));
  }

  if (discount) {
    filtered = filtered.filter(item => item.discount >= parseFloat(discount));
  }

  if (price) {
    filtered = filtered.filter(item => item.price >= parseFloat(price));
  }

  setFilteredSupplierReturns(filtered);
}, [
  searchTerm,
  selectedFilter,
  productName,
  returnType,
  supplier,
  brand,
  quantity,
  discount,
  price,
  customerReturns
]);
  return (
    
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg">
            <div>
              <h1 className="text-lg text-gray-600 font-medium">Processing of Returns</h1>
            </div>  
          </div>
         
          <Tabs defaultValue="customer" className="w-full mb-4" onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start bg-white shadow-md rounded-md px-6 py-6 mb-4">
              <TabsTrigger value="customer" className="data-[state=active]:text-indigo-600 hover:text-black">RETURN FROM CUSTOMER</TabsTrigger>
              <TabsTrigger value="supplier" className="data-[state=active]:text-indigo-600 hover:text-black">RETURN TO SUPPLIER</TabsTrigger>
            </TabsList>
            
            {/* Customer Returns Tab Content */}
            <TabsContent value="customer" className="mt-4">
              {/* Main content layout */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Left side - Product items table */}
                <Card className="w-full lg:w-2/3 flex flex-col">
                  <CardContent className="p-4 flex flex-col justify-between flex-grow">
                    {/* Product items table with scrollable container */}
                    <div className="overflow-x-auto max-h-[60vh] flex-grow">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Return ID</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Return Type</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCustomerReturns.length > 0 ? (
                              filteredCustomerReturns.map((item) => (
                                <TableRow key={item.transactionID}>
                                  <TableCell>{item.dateAdded}</TableCell>
                                  <TableCell>{item.transactionID}</TableCell>
                                  <TableCell>{item.product}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{item.totalPrice}</TableCell>
                                  <TableCell>{item.returnType}</TableCell>
                                  <TableCell className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                        <Ellipsis size={16} />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[90vw] sm:w-[600px] md:w-[750px] lg:w-[900px] xl:w-[1100px] max-w-[95vw] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl text-gray-600 font-medium pb-0">Return Details</DialogTitle>
                                        <DialogClose />
                                      </DialogHeader>
                                      <div className="py-4">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="text-center">Date</TableHead>
                                              <TableHead className="text-center">Product Code</TableHead>
                                              <TableHead className="text-center">Supplier</TableHead>
                                              <TableHead className="text-center">Brand</TableHead>
                                              <TableHead className="text-center">Category</TableHead>
                                              <TableHead className="text-center">Product</TableHead>
                                              <TableHead className="text-center">Quantity</TableHead>
                                              <TableHead className="text-center">Discount</TableHead>
                                              <TableHead className="text-center">Total</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            <TableRow>
                                              <TableCell className="text-center">{item.dateAdded}</TableCell>
                                              <TableCell className="text-center">{item.productCode}</TableCell>
                                              <TableCell className="text-center">{item.supplier}</TableCell>
                                              <TableCell className="text-center">{item.brand}</TableCell>
                                              <TableCell className="text-center">{item.category}</TableCell>
                                              <TableCell className="text-center">{item.product}</TableCell>
                                              <TableCell className="text-center">{item.quantity}</TableCell>
                                              <TableCell className="text-center">{item.discount}</TableCell>
                                              <TableCell className="text-center">{item.totalPrice}</TableCell>
                                            </TableRow>
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  {/* For delete transactions */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                                        <Trash2 size={16} />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl p-7 text-gray-700">
                                      <DialogHeader>
                                        <DialogTitle>
                                          <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                                          <span className="text-lg text-gray-400 font-normal italic">{item.transactionID}</span>
                                        </DialogTitle>
                                        <DialogClose />
                                      </DialogHeader>
                                      <p className='text-sm text-gray-800 mt-2 pl-4'>
                                        Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction.
                                      </p>
                                      <div className="flex items-center gap-4 mt-4 pl-10">
                                        <div className="flex-1">
                                          <label htmlFor={`password-${item.transactionID}`} className="text-base font-medium text-gray-700 block mb-2">
                                            Admin Password
                                          </label>
                                          <Input
                                            type="password"
                                            id={`password-${item.transactionID}`}
                                            required
                                            placeholder="Enter valid password"
                                            className="w-full"
                                          />
                                        </div>
                                        <Button
                                          className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                          onClick={() =>
                                            handleDelete(
                                              item.transactionID,
                                              document.getElementById(`password-${item.transactionID}`).value
                                            )
                                          }
                                        >
                                          DELETE TRANSACTION
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                  No return records found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                  </CardContent>
                </Card>
    
                {/* Right side - Add product form */}
                <Card className="w-full lg:w-1/3 flex flex-col justify-between  text-gray-700">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-center text-xl">Add Customer Product Return</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div className="space-y-3">
                    <div>
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        type="text"
                        placeholder="Type product name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                      
                      <div>
                        <Label htmlFor="supplier">Supplier</Label>
                        <Select>
                          <SelectTrigger id="supplier" className="mt-1">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lazer">Lazer</SelectItem>
                            <SelectItem value="Cort">Cort</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                                      
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Select>
                          <SelectTrigger id="brand" className="mt-1">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cort">Cort</SelectItem>
                            <SelectItem value="Lazer">Lazer</SelectItem>
                            <SelectItem value="Lazer">Bee</SelectItem>
                            <SelectItem value="Lazer">Alice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Select>
                          <SelectTrigger id="quantity" className="mt-1">
                            <SelectValue placeholder="Select quantity" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="returnType">Return Type</Label>
                        <Input
                          id="returnType"
                          type="text"
                          placeholder="Type return type"
                          value={returnType}
                          onChange={(e) => setReturnType(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>  
                        <Label>Discount</Label>
                        <Select>
                          <SelectTrigger id="discount" className="mt-1">
                            <SelectValue placeholder="Select discount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">none</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Price/Amount</Label>
                        <Select>
                          <SelectTrigger id="amount" className="mt-1">
                            <SelectValue placeholder="Select amount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price1">₱15,995</SelectItem>
                            <SelectItem value="price2">₱10</SelectItem>
                          </SelectContent>
                         </Select> 
                      </div>
                        
                      <div className="flex justify-center mt-6">
                        <Button className="w-2/3 bg-blue-500 text-white">
                          ADD RETURN
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Supplier Returns Tab Content */}
            <TabsContent value="supplier" className="mt-4">
              {/* Main content layout */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Left side - Product items table */}
                <Card className="w-full lg:w-2/3 flex flex-col">
                  <CardContent className="p-4 flex flex-col justify-between flex-grow">
                    {/* Product items table with scrollable container */}
                    <div className="overflow-x-auto max-h-[60vh] flex-grow">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-24">Date</TableHead>
                            <TableHead className="w-32">Product Code</TableHead>
                            <TableHead className="w-32">Supplier</TableHead>
                            <TableHead className="w-40">Product</TableHead>
                            <TableHead className="w-20 text-center">Quantity</TableHead>
                            <TableHead className="w-24 text-center">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {filteredSupplierReturns.length > 0 ? (
                          filteredSupplierReturns.map((item) => (
                            <TableRow key={item.returnID}>
                              <TableCell>{item.dateAdded}</TableCell>
                              <TableCell>{item.productCode}</TableCell>
                              <TableCell>{item.supplier}</TableCell>
                              <TableCell>{item.product}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-center">{item.totalCost}</TableCell>
                              <TableCell className="w-[50px] text-center">
                                {/* Delete Dialog */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                                      <Trash2 size={16} />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl p-7 text-gray-700">
                                    <DialogHeader>
                                      <DialogTitle>
                                        <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                                        <span className="text-lg text-gray-400 font-normal italic">{item.productCode}</span>
                                      </DialogTitle>
                                      <DialogClose />
                                    </DialogHeader>
                                    <p className='text-sm text-gray-800 mt-2 pl-4'>
                                      Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction.
                                    </p>
                                    <div className="flex items-center gap-4 mt-4 pl-10">
                                      <div className="flex-1">
                                        <label htmlFor={`password-${item.productCode}`} className="text-base font-medium text-gray-700 block mb-2">
                                          Admin Password
                                        </label>
                                        <Input
                                          type="password"
                                          id={`password-${item.productCode}`}
                                          required
                                          placeholder="Enter valid password"
                                          className="w-full"
                                        />
                                      </div>
                                      <Button
                                        className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                        onClick={() =>
                                          handleDelete(
                                            item.productCode,
                                            document.getElementById(`password-${item.productCode}`).value
                                          )
                                        }
                                      >
                                        DELETE TRANSACTION
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                No supplier return records found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
    
                {/* Right side - Add product form */}
                <Card className="w-full lg:w-1/3 flex flex-col justify-between  text-gray-700">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-center text-xl">Add Product Return to Supplier</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div className="space-y-3">

                      <div>
                      <Label>Delivery Number</Label>
                        <Select>
                        <SelectTrigger id="deliveryNumber" className="mt-1">
                            <SelectValue placeholder="Select delivery number" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delivery1">188090</SelectItem>
                            <SelectItem value="delivery2">188091</SelectItem>
                          </SelectContent>
                        </Select>     
                      </div>


                      
                      <div>
                        <Label htmlFor="supplier">Supplier</Label>
                        <Select>
                          <SelectTrigger id="supplier" className="mt-1">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lazer">Lazer</SelectItem>
                            <SelectItem value="Cort">Cort</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="productItem">Product</Label>
                        <Select>
                          <SelectTrigger id="productItem" className="mt-1">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Product A">Product A</SelectItem>
                            <SelectItem value="Product B">Product B</SelectItem>
                          </SelectContent>
                        </Select>   
                      </div>   

                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Select>
                          <SelectTrigger id="brand" className="mt-1">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cort">Cort</SelectItem>
                            <SelectItem value="lazer">Lazer</SelectItem>
                            <SelectItem value="bee">Bee</SelectItem>
                            <SelectItem value="alice">Alice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Select>
                          <SelectTrigger id="quantity" className="mt-1">
                            <SelectValue placeholder="Select quantity" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>  
                        <Label>Total</Label>
                        <Select>
                          <SelectTrigger id="total" className="mt-1">
                            <SelectValue placeholder="Select total" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="totalPrice1">	₱7,995</SelectItem>
                          <SelectItem value="totalPrice2">₱4,500</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Price/Amount</Label>
                        <Select>
                          <SelectTrigger id="amount" className="mt-1">
                            <SelectValue placeholder="Select amount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price1">₱15,995</SelectItem>
                            <SelectItem value="price2">₱10</SelectItem>
                          </SelectContent>
                         </Select> 
                      </div>
                        
                      <div className="flex justify-center mt-6">
                        <Button className="w-2/3 bg-blue-500 text-white">
                          ADD RETURN
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarProvider>
  );
}