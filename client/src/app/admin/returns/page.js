"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
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
      dateField: "P_dateAdded",
      quantityField: "R_returnQuantity",
      discountField: "R_discountAmount",
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
          delete: "http://localhost:8080/brands"
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
      deliveryNumbers: {
        label: "Delivery Numbers",
        idField: "D_deliveryNumber",
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
        setCustomerReturns(customerResponse.data);

        const supplierResponse = await axios.get(config.returns.api.fetch);
        setSupplierReturns(supplierResponse.data);

        // Fetch dropdown data
        const suppliersResponse = await axios.get(config.dropdowns.suppliers.api.fetch);
        setSuppliers(suppliersResponse.data);

        const brandsResponse = await axios.get(config.dropdowns.brands.api.fetch);
        setBrands(brandsResponse.data);

        const productsResponse = await axios.get(config.dropdowns.products.api.fetch);
        setProducts(productsResponse.data);

        const deliveryNumbersResponse = await axios.get(config.dropdowns.deliveryNumbers.api.fetch);
        setDeliveryNumbers(deliveryNumbersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // ID Mapping for Dropdowns
  const supplierIDMap = suppliers.reduce((map, supplier) => {
    map[supplier.SupplierName] = supplier.SupplierID;
    return map;
  }, {});

  const brandIDMap = brands.reduce((map, brand) => {
    map[brand.BrandName] = brand.BrandID;
    return map;
  }, {});

  const productIDMap = products.reduce((map, product) => {
    map[product.ProductName] = product.ProductID;
    return map;
  }, {});

  const deliveryNumberIDMap = deliveryNumbers.reduce((map, delivery) => {
    map[delivery.DeliveryNumber] = delivery.DeliveryID;
    return map;
  }, {});

  // Handle adding a customer return
  const handleAddCustomerReturn = async () => {
    if (!productName || !selectedSupplier || !selectedBrand || !selectedQuantity || !returnType) {
      alert("Please fill in all fields.");
      return;
    }

    const newReturn = {
      dateAdded: new Date().toISOString(),
      transactionID: `CR-${Math.floor(Math.random() * 10000)}`,
      product: productName,
      supplier: selectedSupplier,
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
      dateAdded: new Date().toISOString(),
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
                            <TableHead>Date</TableHead>
                            <TableHead>Return ID</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Return Type</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerReturns.length > 0 ? (
                            customerReturns.map((item) => (
                              <TableRow key={item.transactionID}>
                                <TableCell>{new Date(item.dateAdded).toLocaleDateString()}</TableCell>
                                <TableCell>{item.transactionID}</TableCell>
                                <TableCell>{item.product}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.totalPrice}</TableCell>
                                <TableCell>{item.returnType}</TableCell>
                                <TableCell className="flex space-x-2">
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
                                          <span className="text-lg text-gray-400 font-normal italic">{item.transactionID}</span>
                                        </DialogTitle>
                                        <DialogClose />
                                      </DialogHeader>
                                      <p className="text-sm text-gray-800 mt-2 pl-4">
                                        Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction.
                                      </p>
                                      <div className="flex items-center gap-4 mt-4 pl-10">
                                        <div className="flex-1">
                                          <Label htmlFor={`password-${item.transactionID}`} className="text-base font-medium text-gray-700 block mb-2">
                                            Admin Password
                                          </Label>
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
                                              document.getElementById(`password-${item.transactionID}`).value,
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
                              <SelectItem key={supplier.SupplierID} value={supplier.SupplierName}>
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
                            <TableHead className="w-24">Date</TableHead>
                            <TableHead className="w-32">Delivery Number</TableHead>
                            <TableHead className="w-32">Supplier</TableHead>
                            <TableHead className="w-40">Product</TableHead>
                            <TableHead className="w-20 text-center">Quantity</TableHead>
                            <TableHead className="w-24 text-center">Total</TableHead>
                            <TableHead className="w-[50px] text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supplierReturns.length > 0 ? (
                            supplierReturns.map((item) => (
                              <TableRow key={item.deliveryNumber}>
                                <TableCell>{new Date(item.dateAdded).toLocaleDateString()}</TableCell>
                                <TableCell>{item.deliveryNumber}</TableCell>
                                <TableCell>{item.supplier}</TableCell>
                                <TableCell>{item.product}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-center">{item.total}</TableCell>
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
                                          <span className="text-lg text-gray-400 font-normal italic">{item.deliveryNumber}</span>
                                        </DialogTitle>
                                        <DialogClose />
                                      </DialogHeader>
                                      <p className="text-sm text-gray-800 mt-2 pl-4">
                                        Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction.
                                      </p>
                                      <div className="flex items-center gap-4 mt-4 pl-10">
                                        <div className="flex-1">
                                          <Label htmlFor={`password-${item.deliveryNumber}`} className="text-base font-medium text-gray-700 block mb-2">
                                            Admin Password
                                          </Label>
                                          <Input
                                            type="password"
                                            id={`password-${item.deliveryNumber}`}
                                            required
                                            placeholder="Enter valid password"
                                            className="w-full"
                                          />
                                        </div>
                                        <Button
                                          className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                          onClick={() =>
                                            handleDelete(
                                              item.deliveryNumber,
                                              document.getElementById(`password-${item.deliveryNumber}`).value,
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
                        <Select onValueChange={(value) => setDeliveryNumber(value)}>
                          <SelectTrigger id="deliveryNumber" className="mt-1">
                            <SelectValue placeholder="Select delivery number" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryNumbers.map((delivery) => (
                              <SelectItem key={delivery.DeliveryID} value={delivery.DeliveryNumber}>
                                {delivery.DeliveryNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="supplier">Supplier</Label>
                        <Select onValueChange={(value) => setSupplierName(value)}>
                          <SelectTrigger id="supplier" className="mt-1">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.SupplierID} value={supplier.SupplierName}>
                                {supplier.SupplierName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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