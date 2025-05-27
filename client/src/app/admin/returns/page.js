"use client";
import React, { useState, useEffect } from "react";
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
import { Trash2, Eye, ChevronsUpDown, ChevronUp, ChevronDown, EyeOff, Search, ChevronLeft, ChevronRight } from "lucide-react";
// Toast Notifications
import { toast, Toaster } from "react-hot-toast";
import MinimumScreenGuard from "@/components/MinimumScreenGuard";

// Helper function to format PHP currency
const formatToPHP = (amount) => {
  return `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
};

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
      totalPriceField: "R_TotalPrice",
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
      nameField: "S_supplierName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/suppliers",
      },
    },
    brands: {
      label: "Brand",
      idField: "B_brandID",
      nameField: "B_brandName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/brands",
      },
    },
    products: {
      label: "Product",
      codeField: "P_productCode",
      nameField: "P_productName",
      priceField: "P_sellingPrice",
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
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [customerReturns, setCustomerReturns] = useState([]);
  const [supplierReturns, setSupplierReturns] = useState([]);
  const [activeTab, setActiveTab] = useState("customer");
  
  // Pagination states
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [supplierCurrentPage, setSupplierCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Customer Return Form
  const [productName, setProductName] = useState(""); // Product Code
  const [selectedSupplierName, setSelectedSupplierName] = useState(""); // Supplier Name (displayed)
  const [selectedSupplierID, setSelectedSupplierID] = useState(""); // Supplier ID (sent to backend)
  const [selectedBrand, setSelectedBrand] = useState(""); // Brand (autofilled)
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [returnType, setReturnType] = useState(""); // Return Type (string)
  const [selectedDiscount, setSelectedDiscount] = useState("0");
  const [productPrice, setProductPrice] = useState(0);
  // Supplier Return Form
  const [deliveryNumber, setDeliveryNumber] = useState("");
  const [supplierName, setSupplierName] = useState(""); // Supplier Name (displayed)
  const [supplierID, setSupplierID] = useState(""); // Supplier ID (sent to backend)
  const [productItem, setProductItem] = useState(""); // Product Code
  const [brand, setBrand] = useState(""); // Brand (autofilled)
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState(""); // Total price for Supplier Returns
  const [selectedProductPrice, setSelectedProductPrice] = useState(0); // Price of the selected product for Supplier Returns
  // Dropdown Options
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveryNumbers, setDeliveryNumbers] = useState([]);
  // Search Terms
  const [productSearchTerm, setProductSearchTerm] = useState(""); // For customer return product search
  const [productSearchTerm2, setProductSearchTerm2] = useState(""); // For supplier return product search
  // Sort
  const [customerSortConfig, setCustomerSortConfig] = useState({ key: null, direction: "ascending" });
  const [supplierSortConfig, setSupplierSortConfig] = useState({ key: null, direction: "ascending" });
  const [showPassword, setShowPassword] = useState(false);
  
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
        const productsRes = await axios.get(config.products.api.fetch);
        setProducts(productsRes.data);
        const deliveriesRes = await axios.get(config.deliveries.api.fetch);
        setDeliveryNumbers(deliveriesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data.");
      }
    };
    fetchData();
  }, []);

  // Reset to page 1 when search terms or sort changes
  useEffect(() => {
    setCustomerCurrentPage(1);
  }, [customerSearchTerm, customerSortConfig]);

  useEffect(() => {
    setSupplierCurrentPage(1);
  }, [supplierSearchTerm, supplierSortConfig]);

  // Handle Delete
  const handleDelete = async (id, password, type) => {
    if (!password) {
      toast.error("Password is required.");
      return;
    }

    try {
      const response = await axios.delete(`${config.returns.api.delete}/${id}`, {
        data: { adminPW: password },
      });

      if (response.status === 200) {
        if (type === "customer") {
          setCustomerReturns((prev) =>
            prev.filter((item) => item.R_returnID !== id)
          );
        } else {
          setSupplierReturns((prev) =>
            prev.filter((item) => item.R_returnID !== id)
          );
        }
        toast.success("Item deleted successfully.");
      } else {
        toast.error(response.data.message || "Failed to delete item.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.response?.data?.message || "Failed to delete item.");

      // Handle invalid credentials
      if (error.response?.status === 403) {
        toast.error("Invalid admin password.");
      }
    }
  };
  // Handle sorting
  const handleSort = (key, setSortConfig) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "ascending") {
          return { key, direction: "descending" };
        } else if (prev.direction === "descending") {
          return { key: null, direction: null }; // reset sort
        }
      }
      return { key, direction: "ascending" };
    });
  };

  function SortIcon({ column, sortConfig }) {
    if (sortConfig.key !== column)
      return <ChevronsUpDown className="inline ml-1 w-4 h-4 text-gray-400" />;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="inline ml-1 w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="inline ml-1 w-4 h-4 text-blue-500" />
    );
  }

  // Filter function for customer returns
  const getFilteredCustomerReturns = (data, searchTerm) => {
    if (!searchTerm.trim()) return data;
    
    const filtered = data.filter((item) => {
      const productName = products.find(p => p.P_productCode === item.P_productCode)?.P_productName?.toLowerCase() || "";
      const supplierName = suppliers.find(s => s.S_supplierID === item.S_supplierID)?.S_supplierName?.toLowerCase() || "";
      const returnId = item.R_returnID?.toString().toLowerCase() || "";
      const returnType = item.R_reasonOfReturn?.toLowerCase() || "";
      const productCode = item.P_productCode?.toString().toLowerCase() || "";
      const date = new Date(item.R_dateOfReturn).toLocaleDateString().toLowerCase();
      
      const search = searchTerm.toLowerCase();
      
      return (
        productName.includes(search) ||
        supplierName.includes(search) ||
        returnId.includes(search) ||
        returnType.includes(search) ||
        productCode.includes(search) ||
        date.includes(search)
      );
    });
    
    return filtered;
  };

  // Filter function for supplier returns
  const getFilteredSupplierReturns = (data, searchTerm) => {
    if (!searchTerm.trim()) return data;
    
    const filtered = data.filter((item) => {
      const productName = products.find(p => p.P_productCode === item.P_productCode)?.P_productName?.toLowerCase() || "";
      const supplierName = suppliers.find(s => s.S_supplierID === item.S_supplierID)?.S_supplierName?.toLowerCase() || "";
      const productCode = item.P_productCode?.toString().toLowerCase() || "";
      const deliveryNum = item.D_deliveryNumber?.toString().toLowerCase() || "";
      const date = new Date(item.R_dateOfReturn).toLocaleDateString().toLowerCase();
      
      const search = searchTerm.toLowerCase();
      
      return (
        productName.includes(search) ||
        supplierName.includes(search) ||
        productCode.includes(search) ||
        deliveryNum.includes(search) ||
        date.includes(search)
      );
    });
    
    return filtered;
  };

  const getSortedReturns = (data, sortConfig) => {
    if (!sortConfig || !sortConfig.key) return data;
    const { key, direction } = sortConfig;
    return [...data].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      if (key === "supplierName") {
        valA = suppliers.find(s => s.S_supplierID === a.S_supplierID)?.S_supplierName || "";
        valB = suppliers.find(s => s.S_supplierID === b.S_supplierID)?.S_supplierName || "";
      }
      if (key === "productName") {
        valA = products.find(p => p.P_productCode === a.P_productCode)?.P_productName || "";
        valB = products.find(p => p.P_productCode === b.P_productCode)?.P_productName || "";
      }
      else if (key.toLowerCase().includes("date")) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      else if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }
      else {
        valA = valA?.toString().toLowerCase() || "";
        valB = valB?.toString().toLowerCase() || "";
      }
      return direction === "ascending"
        ? valA > valB ? 1 : valA < valB ? -1 : 0
        : valA < valB ? 1 : valA > valB ? -1 : 0;
    });
  };

  // Get paginated data for customer returns
  const getPaginatedCustomerReturns = () => {
    const filteredData = getFilteredCustomerReturns(customerReturns, customerSearchTerm);
    const sortedData = getSortedReturns(filteredData, customerSortConfig);
    const startIndex = (customerCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  };

  // Get paginated data for supplier returns
  const getPaginatedSupplierReturns = () => {
    const filteredData = getFilteredSupplierReturns(supplierReturns, supplierSearchTerm);
    const sortedData = getSortedReturns(filteredData, supplierSortConfig);
    const startIndex = (supplierCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  };

  // Calculate total pages for customer returns
  const getCustomerTotalPages = () => {
    const filteredData = getFilteredCustomerReturns(customerReturns, customerSearchTerm);
    return Math.ceil(filteredData.length / itemsPerPage);
  };

  // Calculate total pages for supplier returns
  const getSupplierTotalPages = () => {
    const filteredData = getFilteredSupplierReturns(supplierReturns, supplierSearchTerm);
    return Math.ceil(filteredData.length / itemsPerPage);
  };

  // Handle page change for customer returns
  const handleCustomerPageChange = (page) => {
    setCustomerCurrentPage(page);
  };

  // Handle page change for supplier returns
  const handleSupplierPageChange = (page) => {
    setSupplierCurrentPage(page);
  };

  // Pagination component for customer returns
  const CustomerPaginationControls = () => {
    const totalPages = getCustomerTotalPages();
    const filteredData = getFilteredCustomerReturns(customerReturns, customerSearchTerm);
    const totalItems = filteredData.length;
    const startItem = (customerCurrentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(customerCurrentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (customerCurrentPage <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (customerCurrentPage >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', customerCurrentPage - 1, customerCurrentPage, customerCurrentPage + 1, '...', totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startItem} to {endItem} of {totalItems} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCustomerPageChange(customerCurrentPage - 1)}
            disabled={customerCurrentPage === 1}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={customerCurrentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCustomerPageChange(page)}
                  className={`min-w-[2.5rem] ${
                    customerCurrentPage === page 
                      ? "bg-blue-500 text-white" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCustomerPageChange(customerCurrentPage + 1)}
            disabled={customerCurrentPage === totalPages}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Pagination component for supplier returns
  const SupplierPaginationControls = () => {
    const totalPages = getSupplierTotalPages();
    const filteredData = getFilteredSupplierReturns(supplierReturns, supplierSearchTerm);
    const totalItems = filteredData.length;
    const startItem = (supplierCurrentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(supplierCurrentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (supplierCurrentPage <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (supplierCurrentPage >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', supplierCurrentPage - 1, supplierCurrentPage, supplierCurrentPage + 1, '...', totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startItem} to {endItem} of {totalItems} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSupplierPageChange(supplierCurrentPage - 1)}
            disabled={supplierCurrentPage === 1}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={supplierCurrentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSupplierPageChange(page)}
                  className={`min-w-[2.5rem] ${
                    supplierCurrentPage === page 
                      ? "bg-blue-500 text-white" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSupplierPageChange(supplierCurrentPage + 1)}
            disabled={supplierCurrentPage === totalPages}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <MinimumScreenGuard>
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          <div className="z-10 sticky top-0 mb-4 bg-blue-950 p-4 rounded-sm">
            <h1 className="text-2xl text-blue-50 font-bold">Processing of Returns</h1>
          </div>
          <Tabs defaultValue="customer" onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full flex justify-start bg-white shadow-md rounded-md px-6 py-6 mb-4">
              <TabsTrigger value="customer" className="data-[state=active]:text-indigo-600 hover:text-black">
                RETURN FROM CUSTOMER
              </TabsTrigger>
              <TabsTrigger value="supplier" className="data-[state=active]:text-indigo-600 hover:text-black">
                RETURN TO SUPPLIER
              </TabsTrigger>
            </TabsList>
            
            {/* Customer Returns Tab */}
            <TabsContent value="customer" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=active]:flex data-[state=inactive]:hidden">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch flex-1 overflow-hidden">
                <Card className="w-full flex-1 flex flex-col overflow-hidden">
                  <CardContent className="p-4 flex flex-col flex-1 overflow-hidden">
                    {/* Search Filter for Customer Returns */}
                    <div className="mb-4 flex-shrink-0">
                      <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search customer returns..."
                          value={customerSearchTerm}
                          onChange={(e) => setCustomerSearchTerm(e.target.value)}
                          className="pl-10 w-full"
                        />
                      </div>
                    </div>
                    
                    {/* Scrollable Table Container */}
                    <div className="flex-1 overflow-hidden border rounded-lg">
                      <div className="h-full overflow-auto">
                        <Table>
                          <TableHeader className="sticky top-0 z-10 bg-white border-b">
                            <TableRow>
                              <TableHead onClick={() => handleSort("R_dateOfReturn", setCustomerSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Date <SortIcon column="R_dateOfReturn" sortConfig={customerSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("R_returnID", setCustomerSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Return ID <SortIcon column="R_returnID" sortConfig={customerSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("P_productCode", setCustomerSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Product Code <SortIcon column="P_productCode" sortConfig={customerSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("productName", setCustomerSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Product <SortIcon column="productName" sortConfig={customerSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("R_returnQuantity", setCustomerSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Quantity <SortIcon column="R_returnQuantity" sortConfig={customerSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("R_TotalPrice", setCustomerSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Total <SortIcon column="R_TotalPrice" sortConfig={customerSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("R_returnTypeID", setCustomerSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Return Type <SortIcon column="R_returnTypeID" sortConfig={customerSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("R_reasonOfReturn", setCustomerSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Return Reason <SortIcon column="R_reasonOfReturn" sortConfig={customerSortConfig} />
                              </TableHead>
                              <TableHead className="text-center whitespace-nowrap">View/Delete</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              const paginatedData = getPaginatedCustomerReturns();
                              
                              return paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                  <TableRow key={item.R_returnID}>
                                    <TableCell className="text-center whitespace-nowrap">{new Date(item.R_dateOfReturn).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-center">{item.R_returnID}</TableCell>
                                    <TableCell className="text-center">{item.P_productCode}</TableCell>
                                    <TableCell className="text-center">
                                      {products.find(p => p.P_productCode === item.P_productCode)?.P_productName || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-center">{item.R_returnQuantity}</TableCell>
                                    <TableCell className="text-center whitespace-nowrap">{formatToPHP(item.R_TotalPrice)}</TableCell>
                                    <TableCell className="text-center">{item.R_returnTypeID}</TableCell>
                                    <TableCell className="text-center">{item.R_reasonOfReturn}</TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex justify-center space-x-2">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-black">
                                              <Eye size={16} />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="w-[90vw] max-w-4xl sm:max-w-lg md:max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                                            <DialogHeader>
                                              <DialogTitle>Return Details</DialogTitle>
                                              <DialogClose />
                                            </DialogHeader>
                                            <div className="overflow-x-auto">
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
                                                    <TableCell>{new Date(item.R_dateOfReturn).toLocaleDateString()}</TableCell>
                                                    <TableCell>{item.P_productCode}</TableCell>
                                                    <TableCell>
                                                      {suppliers.find(s => s.S_supplierID === item.S_supplierID)?.S_supplierName || "Unknown"}
                                                    </TableCell>
                                                    <TableCell>
                                                      {products.find(p => p.P_productCode === item.P_productCode)?.brand || "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                      {products.find(p => p.P_productCode === item.P_productCode)?.category || "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                      {products.find(p => p.P_productCode === item.P_productCode)?.P_productName || "Unknown"}
                                                    </TableCell>
                                                    <TableCell>{item.R_returnQuantity}</TableCell>
                                                    <TableCell>{item.R_discountAmount}%</TableCell>
                                                    <TableCell>{formatToPHP(item.R_TotalPrice)}</TableCell>
                                                  </TableRow>
                                                </TableBody>
                                              </Table>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                                              <Trash2 size={16} />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
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
                                            <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
                                              <div className="flex-1">
                                                <Label htmlFor={`password-${item.R_returnID}`} className="block mb-2 text-base font-medium text-gray-700">
                                                  Admin Password
                                                </Label>
                                                <div className="relative w-full">
                                                <Input
                                                  id={`password-${item.R_returnID}`}
                                                   type={showPassword ? "text" : "password"} required
                                                  placeholder="Enter valid password"
                                                  className="w-full"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => setShowPassword((prev) => !prev)}
                                                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                                  tabIndex={-1}
                                                >
                                                  {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                  ) : (
                                                    <Eye className="w-5 h-5" />
                                                  )}
                                              </button>
                                              </div>
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
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                    {customerSearchTerm ? "No customer returns found matching your search" : "No customer returns found"}
                                  </TableCell>
                                </TableRow>
                              );
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    {/* Customer Pagination Controls */}
                    <div className="border-t border-gray-200 bg-white flex-shrink-0">
                      <CustomerPaginationControls />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Supplier Returns Tab */}
            <TabsContent value="supplier" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=active]:flex data-[state=inactive]:hidden">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch flex-1 overflow-hidden">
                <Card className="w-full flex-1 flex flex-col overflow-hidden">
                  <CardContent className="p-4 flex flex-col flex-1 overflow-hidden">
                    {/* Search Filter for Supplier Returns */}
                    <div className="mb-4 flex-shrink-0">
                      <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search supplier returns..."
                          value={supplierSearchTerm}
                          onChange={(e) => setSupplierSearchTerm(e.target.value)}
                          className="pl-10 w-full"
                        />
                      </div>
                    </div>
                    
                    {/* Scrollable Table Container */}
                    <div className="flex-1 overflow-hidden border rounded-lg">
                      <div className="h-full overflow-auto">
                        <Table className="min-w-full">
                          <TableHeader className="sticky top-0 z-10 bg-white border-b">
                            <TableRow>
                              <TableHead onClick={() => handleSort("R_dateOfReturn", setSupplierSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Date <SortIcon column="R_dateOfReturn" sortConfig={supplierSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("P_productCode", setSupplierSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Product Code <SortIcon column="P_productCode" sortConfig={supplierSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("supplierName", setSupplierSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Supplier <SortIcon column="supplierName" sortConfig={supplierSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("productName", setSupplierSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Product <SortIcon column="productName" sortConfig={supplierSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("R_returnQuantity", setSupplierSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Quantity <SortIcon column="R_returnQuantity" sortConfig={supplierSortConfig} />
                              </TableHead>
                              <TableHead onClick={() => handleSort("R_TotalPrice", setSupplierSortConfig)} className="text-center cursor-pointer whitespace-nowrap">
                                Total <SortIcon column="R_TotalPrice" sortConfig={supplierSortConfig} />
                              </TableHead>
                              <TableHead className="text-center whitespace-nowrap">Delete</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              const paginatedData = getPaginatedSupplierReturns();
                              
                              return paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                  <TableRow key={item.R_returnID}>
                                    <TableCell className="text-center whitespace-nowrap">{new Date(item.R_dateOfReturn).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-center">{item.P_productCode}</TableCell>
                                    <TableCell className="text-center">
                                      {suppliers.find(s => s.S_supplierID === item.S_supplierID)?.S_supplierName || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {products.find(p => p.P_productCode === item.P_productCode)?.P_productName || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-center">{item.R_returnQuantity}</TableCell>
                                    <TableCell className="text-center whitespace-nowrap">{formatToPHP(item.R_TotalPrice)}</TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex justify-center">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                                              <Trash2 size={16} />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                                            <DialogHeader>
                                              <DialogTitle>
                                                <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                                                <span className="text-lg text-gray-400 font-normal italic">{item.R_returnID}</span>
                                              </DialogTitle>
                                              <DialogClose />
                                            </DialogHeader>
                                            <p className="text-sm text-gray-800 mt-2 pl-4">
                                              Deleting this transaction will reflect on Void Transactions.
                                              Enter the admin password to delete this transaction.
                                            </p>
                                            <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
                                              <div className="flex-1">
                                                <Label htmlFor={`password-${item.R_returnID}`} className="text-base font-medium text-gray-700 block mb-2">
                                                  Admin Password
                                                </Label>
                                                <div className="relative w-full">
                                                <Input
                                                  id={`password-${item.R_returnID}`}
                                                  type={showPassword ? "text" : "password"} required
                                                  placeholder="Enter valid password"
                                                  className="w-full"
                                                />
                                                 <button
                                                  type="button"
                                                  onClick={() => setShowPassword((prev) => !prev)}
                                                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                                  tabIndex={-1}
                                                >
                                                  {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                  ) : (
                                                    <Eye className="w-5 h-5" />
                                                  )}
                                                </button>
                                                </div>
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
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                    {supplierSearchTerm ? "No supplier returns found matching your search" : "No supplier returns found"}
                                  </TableCell>
                                </TableRow>
                              );
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    {/* Supplier Pagination Controls */}
                    <div className="border-t border-gray-200 bg-white flex-shrink-0">
                      <SupplierPaginationControls />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
    </MinimumScreenGuard>
  );
}