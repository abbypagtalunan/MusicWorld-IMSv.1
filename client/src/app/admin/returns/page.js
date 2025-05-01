"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
import { format } from 'date-fns';

// UI Components
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
  const config = {
    returns: {
      label: "Returns",
      returnIDField: "R_returnID",
      codeField: "P_productCode",
      returnTypeField: "R_returnTypeID",
      reasonField: "R_reasonOfReturn",
      dateField: "R_dateOfReturn",
      quantityField: "R_returnQuantity",
      discountField: "R_discountAmount",
      deliveryField: "D_deliveryNumber",
      supplierField: "S_supplierID",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/returns",
        add: "http://localhost:8080/returns",
        update: "http://localhost:8080/returns",
        delete: "http://localhost:8080/returns",
      },
    },
    suppliers: {
      label: "Supplier",
      idField: "S_supplierID",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/suppliers",
      },
    },
    brands: {
      label: "Brand",
      idField: "B_brandID",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/brands",
      },
    },
    product: {
      label: "Product",
      codeField: "P_productCode",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/products",
      },
    },
    deliveries: {
      label: "Delivery",
      idField: "D_deliveryNumber",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/deliveries",
      },
    },
  };

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [customerReturns, setCustomerReturns] = useState([]);
  const [supplierReturns, setSupplierReturns] = useState([]);
  const [activeTab, setActiveTab] = useState("customer");

  // Customer Return Form
  const [productName, setProductName] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [returnType, setReturnType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState("");

  // Supplier Return Form
  const [deliveryNumber, setDeliveryNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [productItem, setProductItem] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");

  // Dropdown Options
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveryNumbers, setDeliveryNumbers] = useState([]);

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch filtered returns
        const customerRes = await axios.get(`${config.returns.api.fetch}?source=customer`);
        setCustomerReturns(customerRes.data);

        const supplierRes = await axios.get(`${config.returns.api.fetch}?source=supplier`);
        setSupplierReturns(supplierRes.data);

        // Fetch dropdown options
        const suppliersRes = await axios.get(config.suppliers.api.fetch);
        setSuppliers(suppliersRes.data);

        const brandsRes = await axios.get(config.brands.api.fetch);
        setBrands(brandsRes.data);

        const productsRes = await axios.get(config.product.api.fetch);
        setProducts(productsRes.data);

        const deliveriesRes = await axios.get(config.deliveries.api.fetch);
        setDeliveryNumbers(deliveriesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Handle Add Customer Return
  const handleAddCustomerReturn = async () => {
    if (
      !productName ||
      !selectedSupplier ||
      !selectedBrand ||
      !selectedQuantity ||
      !returnType ||
      selectedDiscount === "" ||
      selectedPrice === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }
  
    const newReturn = {
      P_productCode: productName,
      returnTypeDescription: "Customer Return", // <-- Add this
      R_reasonOfReturn: returnType,
      R_dateOfReturn: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      R_returnQuantity: selectedQuantity,
      R_discountAmount: selectedDiscount,
      D_deliveryNumber: "1", // dummy value
      S_supplierID: selectedSupplier,
    };
  
    try {
      await axios.post(config.returns.api.add, newReturn);
      alert("Customer return added successfully!");
      resetCustomerForm();
    } catch (error) {
      console.error("Error adding customer return:", error);
      alert("Failed to add customer return.");
    }
  };

  const resetCustomerForm = () => {
    setProductName("");
    setSelectedSupplier("");
    setSelectedBrand("");
    setSelectedQuantity("");
    setReturnType("");
    setSelectedPrice("");
    setSelectedDiscount("");
  };

  // Handle Add Supplier Return
  const handleAddSupplierReturn = async () => {
    if (!deliveryNumber || !supplierName || !productItem || !brand || !quantity || !amount) {
      alert("Please fill in all fields.");
      return;
    }
  
    const newReturn = {
      P_productCode: productItem,
      returnTypeDescription: "Supplier Return", // <-- Add this
      R_reasonOfReturn: "Supplier Defect",
      R_dateOfReturn: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      R_returnQuantity: quantity,
      R_discountAmount: 0, // default
      D_deliveryNumber: deliveryNumber,
      S_supplierID: supplierName,
    };
  
    try {
      await axios.post(config.returns.api.add, newReturn);
      alert("Supplier return added successfully!");
      resetSupplierForm();
    } catch (error) {
      console.error("Error adding supplier return:", error);
      alert("Failed to add supplier return.");
    }
  };

  const resetSupplierForm = () => {
    setDeliveryNumber("");
    setSupplierName("");
    setProductItem("");
    setBrand("");
    setQuantity("");
    setAmount("");
  };
  // Handle Delete
  const handleDelete = (id, password, type) => {
    if (password !== "admin123") {
      alert("Incorrect password.");
      return;
    }
  
    if (type === "customer") {
      setCustomerReturns((prev) => prev.filter((item) => item.R_returnID !== id));
    } else {
      setSupplierReturns((prev) => prev.filter((item) => item.R_returnID !== id));
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

          <Tabs defaultValue="customer" onValueChange={setActiveTab}  className="flex-1 flex flex-col overflow-hidden">
            <div className="w-full z-10 sticky">
            <TabsList className="w-full flex justify-start bg-white rounded-md shadow-md px-6 py-6 space-x-4">
              <TabsTrigger value="customer" className="data-[state=active]:text-indigo-600 hover:text-black">
                RETURN FROM CUSTOMER
              </TabsTrigger>
              <TabsTrigger value="supplier" className="data-[state=active]:text-indigo-600 hover:text-black">
                RETURN TO SUPPLIER
              </TabsTrigger>
            </TabsList>
            </div>

            {/* Customer Returns Tab Content */}
          <div className ="flex-1 overflow-y-auto p-4 space-y-4">
            <TabsContent value="customer" className="mt-0">
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
                            <TableHead className="text-center">Product</TableHead>
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
                                <TableCell className="text-center">
                                  {products.find(p => p.P_productCode === item.P_productCode)?.P_productName || "Unknown"}
                                </TableCell>
                                <TableCell className="text-center">{item.R_returnQuantity}</TableCell>
                                <TableCell className="text-center">{item.totalPrice}</TableCell>
                                <TableCell className="text-center">{item.R_reasonOfReturn}</TableCell>
                                <TableCell className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                        <Ellipsis size={16} />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl p-7 text-gray-700">
                                      <DialogHeader>
                                        <DialogTitle>Return Details</DialogTitle>
                                        <DialogClose />
                                      </DialogHeader>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Product Code</TableHead>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Discount</TableHead>
                                            <TableHead>Total</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          <TableRow>
                                            <TableCell>{item.R_dateOfReturn}</TableCell>
                                            <TableCell>{item.P_productCode}</TableCell>
                                            <TableCell>{item.S_supplierID}</TableCell>
                                            <TableCell>{item.B_brandName}</TableCell>
                                            <TableCell>{item.C_category}</TableCell>
                                            <TableCell>{item.P_productName}</TableCell>
                                            <TableCell>{item.R_returnQuantity}</TableCell>
                                            <TableCell>{item.R_discountAmount}</TableCell>
                                            <TableCell>{item.totalPrice}</TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </DialogContent>
                                  </Dialog>

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
                                          <span className="text-lg text-gray-400 italic">{item.R_returnID}</span>
                                        </DialogTitle>
                                        <DialogClose />
                                      </DialogHeader>
                                      <p className="mt-2 pl-4 text-sm text-gray-800">
                                        Deleting this transaction will reflect on Void Transactions.
                                        Enter the admin password to delete this transaction.
                                      </p>
                                      <div className="flex items-center gap-4 mt-4 pl-10">
                                        <div className="flex-1">
                                          <Label htmlFor={`password-${item.R_returnID}`} className="block mb-2 text-base font-medium text-gray-700">
                                            Admin Password
                                          </Label>
                                          <Input
                                            id={`password-${item.R_returnID}`}
                                            type="password"
                                            placeholder="Enter valid password"
                                            className="w-full"
                                          />
                                        </div>
                                        <Button
                                          className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                          onClick={() =>
                                            handleDelete(
                                              item.R_returnID,
                                              document.getElementById(`password-${item.R_returnID}`).value,
                                              "customer"
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
                              <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                No customer returns found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Right side - Add form */}
                <Card className="w-full lg:w-1/3 flex flex-col justify-between text-gray-700">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-center text-xl">Add Customer Product Return</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <Select onValueChange={(selectedName) => {
                      const product = products.find(p => p.P_productName === selectedName);
                      if (product) {
                        setProductName(product.P_productCode); // Save the CODE
                      }
                    }}>
                      <SelectTrigger id="productName">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.P_productID} value={product.P_productName}>
                            {product.P_productName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      </div>
                      <div>
                      <Label htmlFor="supplier">Supplier</Label>
<Select onValueChange={(selectedName) => {
  const selected = suppliers.find(s => s.S_supplierName === selectedName);
  if (selected) {
    setSelectedSupplier(selected.S_supplierID); // Save the ID, not the name
  } else {
    setSelectedSupplier(""); // Fallback
  }
}}>
  <SelectTrigger id="supplier" className="mt-1">
    <SelectValue placeholder="Select supplier" />
  </SelectTrigger>
  <SelectContent>
    {suppliers.map((supplier) => (
      <SelectItem 
        key={supplier.S_supplierID} 
        value={supplier.S_supplierName}  // Display name in dropdown
      >
        {supplier.S_supplierName}
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
                              <SelectItem key={brand.B_brandID} value={brand.B_brandName}>
                                {brand.B_brandName}
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
                        <Label htmlFor="discount">Discount (%)</Label>
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
                        <Label htmlFor="price">Price/Amount</Label>
                        <Input
                          id="price"
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

            {/* Supplier Returns Tab */}
            <TabsContent value="supplier">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Left side - Product items table */}
                <Card className="w-full lg:w-2/3 flex flex-col">
                  <CardContent className="p-4 flex flex-col justify-between flex-grow">
                    <div className="overflow-x-auto max-h-[60vh] flex-grow">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">Date</TableHead>
                            <TableHead className="text-center">Product Code</TableHead>
                            <TableHead className="text-center">Supplier</TableHead>
                            <TableHead className="text-center">Product</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supplierReturns.length > 0 ? (
                            supplierReturns.map((item) => (
                              <TableRow key={item.R_returnID}>
                                <TableCell className="text-center">{new Date(item.R_dateOfReturn).toLocaleDateString()}</TableCell>
                                <TableCell className="text-center">{item.P_productCode}</TableCell>
                                <TableCell className="text-center">{item.S_supplierID}</TableCell>
                                <TableCell className="text-center">
                                  {products.find(p => p.P_productCode === item.P_productCode)?.P_productName || "Unknown"}
                                </TableCell>
                                <TableCell className="text-center">{item.R_returnQuantity}</TableCell>
                                <TableCell className="text-center">{item.total}</TableCell>
                                <TableCell className="text-center">
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
                                        Deleting this transaction will reflect on Void Transactions.
                                        Enter the admin password to delete this transaction.
                                      </p>
                                      <div className="flex items-center gap-4 mt-4 pl-10">
                                        <div className="flex-1">
                                          <Label htmlFor={`password-${item.D_deliveryNumber}`} className="text-base font-medium text-gray-700 block mb-2">
                                            Admin Password
                                          </Label>
                                          <Input
                                            id={`password-${item.D_deliveryNumber}`}
                                            type="password"
                                            required
                                            placeholder="Enter valid password"
                                            className="w-full"
                                          />
                                        </div>
                                        <Button
                                          className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                          onClick={() =>
                                            handleDelete(
                                              item.R_returnID,
                                              document.getElementById(`password-${item.R_returnID}`).value,
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
                              <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                No supplier returns found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Right side - Add form */}
                <Card className="w-full lg:w-1/3 flex flex-col justify-between text-gray-700">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-center text-xl">Add Product Return to Supplier</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-1 justify-between">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="deliveryNumber">Delivery Number</Label>
                        <Select onValueChange={(value) => {
                          const selected = deliveryNumbers.find(d => d.D_deliveryNumber === value);
                          if (selected) {
                            setDeliveryNumber(selected.D_deliveryNumber);
                            setSupplierName(selected.supplierName); // auto-fill supplier
                          }
                        }}>
                          <SelectTrigger id="deliveryNumber" className="mt-1">
                            <SelectValue placeholder="Select delivery number" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryNumbers.map((d) => (
                              <SelectItem key={d.D_deliveryNumber} value={d.D_deliveryNumber}>
                                {d.D_deliveryNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="supplier">Supplier</Label>
<Select onValueChange={(selectedName) => {
  const selected = suppliers.find(s => s.S_supplierName === selectedName);
  if (selected) {
    setSelectedSupplier(selected.S_supplierID); // Save the ID, not the name
  } else {
    setSelectedSupplier(""); // Fallback
  }
}}>
  <SelectTrigger id="supplier" className="mt-1">
    <SelectValue placeholder="Select supplier" />
  </SelectTrigger>
  <SelectContent>
    {suppliers.map((supplier) => (
      <SelectItem 
        key={supplier.S_supplierID} 
        value={supplier.S_supplierName}  // Display name in dropdown
      >
        {supplier.S_supplierName}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
                      </div>
                      <div>
                      <Label htmlFor="productName">Product Name</Label>
                        <Select onValueChange={(selectedName) => {
                      const product = products.find(p => p.P_productName === selectedName);
                      if (product) {
                        setProductName(product.P_productCode); // Save the CODE
                      }
                    }}>
                      <SelectTrigger id="productName">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.P_productID} value={product.P_productName}>
                            {product.P_productName}
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
                              <SelectItem key={brand.B_brandID} value={brand.B_brandName}>
                                {brand.B_brandName}
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
                        <Label htmlFor="total">Total</Label>
                        <Input
                          id="total"
                          type="text"
                          placeholder="Enter total"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Price/Amount</Label>
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
            </div>
          </Tabs>
          </div>
        </div>
    </SidebarProvider>
  );
}