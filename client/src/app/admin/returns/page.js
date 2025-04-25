"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
import { format } from 'date-fns'; // Add this import at the top
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Trash2, Ellipsis } from "lucide-react";

export default function ReturnsPage() {
  // Configuration object
  const config = {
    returns: {
      label: "Returns",
      returnIDField: "R_returnID",
      codeField: "P_productCode",
      returnTypeField: "R_returnTypeID",
      reasonField: "R_reasonOfReturn",
      dateField: "P_dateOfReturn",
      quantityField: "R_returnQuantity",
      discountField: "R_discountAmount",
      deliiveryField: "D_deliveryNumber",
      supplierField: "S_supplierID",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/returns",
        add: "http://localhost:8080/returns",
        update: "http://localhost:8080/returns",
        delete: "http://localhost:8080/returns",
      },
      returnTypes: {
        label: "Return Types",
        idField: "R_returnTypeDescription",
        nameField: "returnTypeDescription",
        isAutoInc: false,
        api: {
          fetch: "http://localhost:8080/returnTypes",
          add: "http://localhost:8080/returns",
          update: "http://localhost:8080/returns",
          delete: "http://localhost:8080/returns",
        },
      },
    },
    suppliers: {
      label: "Supplier",
      idField: "S_supplierID",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/suppliers",
        add: "http://localhost:8080/suppliers",
        update: "http://localhost:8080/suppliers",
        delete: "http://localhost:8080/suppliers",
      },
    },
    brands: {
      label: "Brand",
      idField: "B_brandID",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/brands",
        add: "http://localhost:8080/brands",
        update: "http://localhost:8080/brands",
        delete: "http://localhost:8080/brands",
      },
    },
    product: {
      label: "Product",
      codeField: "P_productCode",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/products",
        add: "http://localhost:8080/products",
        update: "http://localhost:8080/products",
        delete: "http://localhost:8080/products",
      },
    },
    deliveries: {
      label: "Delivery",
      idField: "D_deliveryNumber",
      supplierField: "supplierName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/deliveries",
        add: "http://localhost:8080/deliveries",
        update: "http://localhost:8080/deliveries",
        delete: "http://localhost:8080/deliveries",
      },
    },
  };

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [customerReturns, setCustomerReturns] = useState([]);
  const [supplierReturns, setSupplierReturns] = useState([]);
  const [activeTab, setActiveTab] = useState("customer");

  // Form state variables for Customer Returns
  const [productName, setProductName] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [returnType, setReturnType] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  // Form state variables for Supplier Returns
  const [deliveryNumber, setDeliveryNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [productItem, setProductItem] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState("");
  const [amount, setAmount] = useState("");

  // Dropdown state variables
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveryNumbers, setDeliveryNumbers] = useState([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch returns data
        const customerResponse = await axios.get(config.returns.api.fetch);
        console.log("Customer Returns:", customerResponse.data); // Log the response
        setCustomerReturns(customerResponse.data);
  
        const supplierResponse = await axios.get(config.returns.api.fetch);
        console.log("Supplier Returns:", supplierResponse.data); // Log the response
        setSupplierReturns(supplierResponse.data);
  
        // Fetch suppliers data
        const suppliersResponse = await axios.get(config.suppliers.api.fetch);
        console.log("Suppliers:", suppliersResponse.data); // Log the response
        setSuppliers(suppliersResponse.data);
  
        // Fetch brands data
        const brandsResponse = await axios.get(config.brands.api.fetch);
        console.log("Brands:", brandsResponse.data); // Log the response
        setBrands(brandsResponse.data);
  
        // Fetch products data
        const productsResponse = await axios.get(config.product.api.fetch);
        console.log("Products:", productsResponse.data); // Log the response
        setProducts(productsResponse.data);
  
        // Fetch deliveries
        const deliveriesResponse = await axios.get(config.deliveries.api.fetch);
        console.log("Deliveries:", deliveriesResponse.data); // Log the response
        const mappedDeliveries = deliveriesResponse.data.map((delivery) => {
          const supplier = suppliers.find(
            (supplier) => supplier.S_supplierID === delivery.S_supplierID
          );
          return {
            ...delivery,
            supplierName: supplier ? supplier.SupplierName : "Unknown Supplier",
          };
        });
        setDeliveryNumbers(mappedDeliveries);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Handle adding a customer return
  const handleAddCustomerReturn = async () => {
    if (!productName || !selectedSupplier || !selectedBrand || !selectedQuantity || !returnType) {
      alert("Please fill in all fields.");
      return;
    }
    const newReturn = {
      dateAdded: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      transactionID: `CR-${Math.floor(Math.random() * 10000)}`,
      product: productName,
      brand: selectedBrand,
      quantity: selectedQuantity,
      returnType: returnType,
      totalPrice: selectedPrice,
      discount: selectedDiscount,
    };
    try {
      await axios.post(config.returns.api.add, newReturn);
      alert("Customer return added successfully!");
      resetCustomerForm();
    } catch (error) {
      console.error("Error adding customer return:", error);
      alert("Failed to add customer return. Please check your connection or backend.");
    }
  };

  // Reset form fields for customer returns
  const resetCustomerForm = () => {
    setProductName("");
    setSelectedSupplier("");
    setSelectedBrand("");
    setSelectedQuantity("");
    setReturnType("");
    setSelectedDiscount("");
    setSelectedPrice("");
  };

  // Handle adding a supplier return
  const handleAddSupplierReturn = async () => {
    if (!deliveryNumber || !supplierName || !productItem || !brand || !quantity || !total || !amount) {
      alert("Please fill in all fields.");
      return;
    }
    const newReturn = {
      dateAdded: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      deliveryNumber,
      supplier: supplierName,
      product: productItem,
      brand,
      quantity,
      total,
      amount,
    };
    try {
      await axios.post(config.returns.api.add, newReturn);
      alert("Supplier return added successfully!");
      resetSupplierForm();
    } catch (error) {
      console.error("Error adding supplier return:", error);
      alert("Failed to add supplier return. Please check your connection or backend.");
    }
  };

  // Reset form fields for supplier returns
  const resetSupplierForm = () => {
    setDeliveryNumber("");
    setSupplierName("");
    setProductItem("");
    setBrand("");
    setQuantity("");
    setTotal("");
    setAmount("");
  };

  // Handle deleting a transaction
  const handleDelete = (id, password, type) => {
    if (password !== "admin123") {
      alert("Incorrect password.");
      return;
    }
    if (type === "customer") {
      setCustomerReturns((prevReturns) =>
        prevReturns.filter((item) => item.transactionID !== id)
      );
    } else {
      setSupplierReturns((prevReturns) =>
        prevReturns.filter((item) => item.deliveryNumber !== id)
      );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg">
            <h1 className="text-lg text-gray-600 font-medium">Processing of Returns</h1>
          </div>
          <Tabs defaultValue="customer" className="w-full mb-4" onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start bg-white shadow-md rounded-md px-6 py-6 mb-4">
              <TabsTrigger value="customer" className="data-[state=active]:text-indigo-600 hover:text-black">
                RETURN FROM CUSTOMER
              </TabsTrigger>
              <TabsTrigger value="supplier" className="data-[state=active]:text-indigo-600 hover:text-black">
                RETURN TO SUPPLIER
              </TabsTrigger>
            </TabsList>
            {/* Customer Returns Tab Content */}
            <TabsContent value="customer" className="mt-4">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Left side - Product items table */}
                <Card className="w-full lg:w-2/3 flex flex-col">
                  <CardContent className="p-4 flex flex-col justify-between flex-grow">
                    <div className="overflow-x-auto max-h-[60vh] flex-grow">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead className="text-center">Date</TableHead>
                            <TableHead className="text-center">Return ID</TableHead>
                            <TableHead className="text-center">Product </TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">Return Type</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerReturns.length > 0 ? (
                            customerReturns.map((item) => (
                              <TableRow key={item.R_returnID}>
                                <TableCell className="text-center">{new Date(item.R_dateOfReturn).toLocaleDateString()}</TableCell>
                                <TableCell className="text-center">{item.R_returnID}</TableCell>
                                <TableCell className="text-center">{products.find(product => product.P_productCode === item.P_productCode)?.P_productName || "Unknown Product" }</TableCell>
                                <TableCell className="text-center">{item.R_returnQuantity}</TableCell>
                                <TableCell className="text-center">{item.R_returnTypeID}</TableCell>
                                <TableCell className="text-center">{item.R_reasonOfReturn}</TableCell>
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
                <Card className="w-full lg:w-1/3 flex flex-col justify-between text-gray-700">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-center text-xl">Add Customer Product Return</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <Select onValueChange={(value) => setProductName(value)}>
                          <SelectTrigger id="productName" className="mt-1">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.ProductID} value={product.ProductName}>
                                {product.ProductName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="supplier">Supplier</Label>
                        <Select onValueChange={(value) => setSelectedSupplier(value)}>
                          <SelectTrigger id="supplier" className="mt-1">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.supplierID} value={supplier.SupplierName}>
                                {supplier.SupplierName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Select onValueChange={(value) => setSelectedBrand(value)}>
                          <SelectTrigger id="brand" className="mt-1">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.BrandID} value={brand.BrandName}>
                                {brand.BrandName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="Enter quantity"
                          value={selectedQuantity}
                          onChange={(e) => setSelectedQuantity(e.target.value)}
                          className="mt-1"
                        />
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
                        <Input
                          id="discount"
                          type="text"
                          placeholder="Enter discount"
                          value={selectedDiscount}
                          onChange={(e) => setSelectedDiscount(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Price/Amount</Label>
                        <Input
                          id="amount"
                          type="text"
                          placeholder="Enter amount"
                          value={selectedPrice}
                          onChange={(e) => setSelectedPrice(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-center mt-6">
                        <Button className="w-2/3 bg-blue-500 text-white" onClick={handleAddCustomerReturn}>
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
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Left side - Product items table */}
                <Card className="w-full lg:w-2/3 flex flex-col">
                  <CardContent className="p-4 flex flex-col justify-between flex-grow">
                    <div className="overflow-x-auto max-h-[60vh] flex-grow">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center w-24">Date</TableHead>
                            <TableHead className="text-center w-32">Product Code</TableHead>
                            <TableHead className="text-center w-32">Supplier</TableHead>
                            <TableHead className="text-center w-40">Product</TableHead>
                            <TableHead className="text-center w-20">Quantity</TableHead>
                            <TableHead className="text-center w-24">Total</TableHead>
                            <TableHead className="text-center w-[50px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supplierReturns.length > 0 ? (
                            supplierReturns.map((item) => (
                              <TableRow key={item.R_returnID}>
                                <TableCell className="text-center">{new Date(item.R_dateOfReturn).toLocaleDateString()}</TableCell>
                                <TableCell className="text-center">{item.P_productCode}</TableCell>
                                <TableCell className="text-center">{item.S_supplierID}</TableCell>
                                <TableCell className="text-center">{products.find(product => product.P_productCode === item.P_productCode)?.P_productName || "Unknown Product" }</TableCell>
                                <TableCell className="text-center">{item.R_returnQuantity}</TableCell>
                                <TableCell className="text-center">{item.total}</TableCell>
                                <TableCell className="text-center w-[50px]">
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
                                          <span className="text-lg text-gray-400 font-normal italic">{item.D_deliveryNumber}</span>
                                        </DialogTitle>
                                        <DialogClose />
                                      </DialogHeader>
                                      <p className="text-sm text-gray-800 mt-2 pl-4">
                                        Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction.
                                      </p>
                                      <div className="flex items-center gap-4 mt-4 pl-10">
                                        <div className="flex-1">
                                          <Label htmlFor={`password-${item.D_deliveryNumber}`} className="text-base font-medium text-gray-700 block mb-2">
                                            Admin Password
                                          </Label>
                                          <Input
                                            type="password"
                                            id={`password-${item.D_deliveryNumber}`}
                                            required
                                            placeholder="Enter valid password"
                                            className="w-full"
                                          />
                                        </div>
                                        <Button
                                          className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                          onClick={() =>
                                            handleDelete(
                                              item.D_deliveryNumber,
                                              document.getElementById(`password-${item.D_deliveryNumber}`).value,
                                              "supplier"
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
                <Card className="w-full lg:w-1/3 flex flex-col justify-between text-gray-700">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-center text-xl">Add Product Return to Supplier</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div className="space-y-3">
                      <div>
                        <Label>Delivery Number</Label>
                        <Select onValueChange={(value) => {
                          const selectedDelivery = deliveryNumbers.find(delivery => delivery.DeliveryNumber === value);
                          if (selectedDelivery) {
                            setDeliveryNumber(selectedDelivery.DeliveryNumber);
                            setSupplierName(selectedDelivery.supplierName); // Automatically populate supplier name
                          }
                        }}>
                          <SelectTrigger id="deliveryNumber" className="mt-1">
                            <SelectValue placeholder="Select delivery number" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryNumbers.map((delivery) => (
                              <SelectItem key={delivery.DeliveryNumber} value={delivery.DeliveryNumber}>
                                {`${delivery.supplierName}`} {/* Show both delivery number and supplier name */}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Supplier</Label>
                        <Input
                          id="supplier"
                          type="text"
                          value={supplierName}
                          readOnly // Make it read-only since it's auto-populated
                          className="mt-1 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productItem">Product</Label>
                        <Select onValueChange={(value) => setProductItem(value)}>
                          <SelectTrigger id="productItem" className="mt-1">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.ProductID} value={product.ProductName}>
                                {product.ProductName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Select onValueChange={(value) => setBrand(value)}>
                          <SelectTrigger id="brand" className="mt-1">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.BrandID} value={brand.BrandName}>
                                {brand.BrandName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="Enter quantity"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Total</Label>
                        <Input
                          id="total"
                          type="text"
                          placeholder="Enter total"
                          value={total}
                          onChange={(e) => setTotal(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Price/Amount</Label>
                        <Input
                          id="amount"
                          type="text"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-center mt-6">
                        <Button className="w-2/3 bg-blue-500 text-white" onClick={handleAddSupplierReturn}>
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