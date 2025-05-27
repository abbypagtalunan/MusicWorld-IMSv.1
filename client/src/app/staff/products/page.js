"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/staff-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ListFilter, ChevronsUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import MinimumScreenGuard from "@/components/MinimumScreenGuard";
import React from "react";

export default function ProductsPage() {
  const config = {
    product: {
      label: "Product",
      codeField: "P_productCode",
      categoryField: "P_category",
      categoryID: "P_categoryID",
      nameField: "P_productName",
      brandField: "P_brand",
      brandID: "P_brandID",
      supplierField: "P_supplier",
      supplierID: "P_supplierID",
      stockField: "P_stockNum",
      lastRestockField: "P_lastRestockDateTime",
      lastUpdateField: "P_lastEditedDateTime",
      unitpriceField: "P_unitPrice",
      sellingpriceField: "P_sellingPrice",
      statusField: "P_productStatusName",
      statusId: "P_productStatusID",
      dateField: "P_dateAdded",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/products",
      },
    },
    
    category: {
      label: "Category",
      idField: "CategoryID",
      nameField: "CategoryName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/categories",
      },
    },

    brand: {
      label: "Brand",
      idField: "BrandID",
      nameField: "BrandName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/brands",
      },
    },
    
    supplier: {
      label: "Supplier",
      idField: "SupplierID",
      nameField: "SupplierName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/suppliers",
      },
    },

    productStatus: {
      label: "Product Status",
      idField: "PStatusID",
      nameField: "PStatusName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/productStatus",
      },
    },
  };

  const [data, setData] = useState([]);
  const [values, setValues] = useState({
    [config.product.categoryField]: "",    
    [config.product.nameField]: "",
    [config.product.brandField]: "",
    [config.product.supplierField]: "",
    [config.product.stockField]: "",
    [config.product.unitpriceField]: "",
    [config.product.sellingpriceField]: "",
    [config.product.statusField]: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const normalizedData = (products) => products.data.map((item) => ({
    productCode: item.P_productCode,
    category: item.category || "",
    categoryID: item.C_categoryID,
    productName: item.P_productName,
    brand: item.brand || "",
    brandID: item.B_brandID,
    supplier: item.supplier || "",
    supplierID: item.S_supplierID,
    stockNumber: item.stock,
    lastRestock: item.P_lastRestockDateTime ? formatDateTime(item.P_lastRestockDateTime) : "",
    lastEdit: item.P_lastEditedDateTime ? formatDateTime(item.P_lastEditedDateTime) : "", 
    price: item.P_unitPrice,
    sellingPrice: item.P_sellingPrice,
    status: item.status,
    dateAdded: item.P_dateAdded ? formatDate(item.P_dateAdded) : ""
  }));
  
  // Fetch
  useEffect(() => {
    axios
      .get(config.product.api.fetch)
      .then((res) => setData(normalizedData(res)))
      .catch((error) => console.error("Error fetching data:", error));
    
      setValues({
        [config.product.codeField]: "",
        [config.product.categoryField]: "",
        [config.product.nameField]: "",
        [config.product.brandField]: "",
        [config.product.supplierField]: "",
        [config.product.stockField]: "",
        [config.product.lastRestockField]: "",
        [config.product.lastUpdateField]: "",
        [config.product.unitpriceField]: "",
        [config.product.sellingpriceField]: "",
        [config.product.statusField]: "",
        [config.product.dateField]: "",
    });

    setSearchTerm("");
  }, []);

  // Search
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);  
  
  // Sort
   const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  const handleSort = (key) => {
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

  const getFilteredTransactions = () => {
    let sortedTransactions = [...data];

    // Search
    if (searchTerm) {
      sortedTransactions = sortedTransactions.filter(
        (item) =>
          (item.productName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (item.productCode?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }

    // Dropdown Filters
    if (selectedFilter && selectedSubFilter) {
      if (selectedFilter === "Supplier") {
        sortedTransactions = sortedTransactions.filter(item => item.supplier === selectedSubFilter);
      }
      if (selectedFilter === "Brand") {
        sortedTransactions = sortedTransactions.filter(item => item.brand === selectedSubFilter);
      }
      if (selectedFilter === "Category") {
        sortedTransactions = sortedTransactions.filter(item => item.category === selectedSubFilter);
      }
      if (selectedFilter === "Product Status") {
        sortedTransactions = sortedTransactions.filter(item => item.status === selectedSubFilter);
      }
    }

    if (selectedFilter === "Product Name" || selectedFilter === "Date added") {
      sortedTransactions.sort((a, b) => {
        const key = selectedFilter === "Product Name" ? "productName" : "dateAdded";
        const valA = a[key] ?? "";
        const valB = b[key] ?? "";

        return selectedSubFilter === "Ascending"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    if (selectedFilter === "Price") {
      const getPrice = (val) => parseFloat(val?.toString().replace(/[^\d.]/g, "") || 0);
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Low to High"
          ? getPrice(a.price) - getPrice(b.price)
          : getPrice(b.price) - getPrice(a.price)
      );
    }

    // Table Header Sorting
    if (sortConfig.key !== null) {
      sortedTransactions.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        // Fix: convert to number if both are numeric
        if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
          return sortConfig.direction === "ascending"
            ? parseFloat(valA) - parseFloat(valB)
            : parseFloat(valB) - parseFloat(valA);
        }

        // Fix: parse dates properly
        if (Date.parse(valA) && Date.parse(valB)) {
          return sortConfig.direction === "ascending"
            ? new Date(valA) - new Date(valB)
            : new Date(valB) - new Date(valA);
        }

        // Fallback: string compare
        return sortConfig.direction === "ascending"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return sortedTransactions;
  };

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = getFilteredTransactions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filteredData = getFilteredTransactions();
    return Math.ceil(filteredData.length / itemsPerPage);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter, selectedSubFilter, sortConfig]);

  function SortIcon({ column }) {
    if (sortConfig.key !== column) return <ChevronsUpDown className="inline ml-1 w-4 h-4 text-gray-400" />;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="inline ml-1 w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="inline ml-1 w-4 h-4 text-blue-500" />
    );
  }

  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  // For Dropdowns
  const[suppliers, setSuppliers] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8080/suppliers")
      .then(res => setSuppliers(res.data))
      .catch((err) => console.error("Failed to fetch supplier options:", err));
  }, []);
  const[brands, setBrands] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8080/brands")
      .then(res => setBrands(res.data))
      .catch((err) => console.error("Failed to fetch brand options:", err));
  }, []);
  const[categories, setCategories] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8080/categories")
      .then(res => setCategories(res.data))
      .catch((err) => console.error("Failed to fetch category options:", err));
  }, []);
  const[pStatus, setPStatus] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8080/productStatus")
      .then(res => setPStatus(res.data))
      .catch((err) => console.error("Failed to fetch product status options:", err));
  }, []);

  // Pagination component
  const PaginationControls = () => {
    const totalPages = getTotalPages();
    const totalItems = getFilteredTransactions().length;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startItem} to {endItem} of {totalItems} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
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
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[2.5rem] ${
                    currentPage === page 
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
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
        <div className="flex-1 p-4 flex flex-col overflow-x-hidden">
          <div className="flex flex-wrap gap-4 justify-between mb-4 bg-white shadow-sm p-4 rounded-lg">
            <div className="flex flex-wrap items-center gap-2 min-w-[250px]">
              <div className="relative w-80">
                <Input
                  type="text"
                  placeholder="Search product code, product, category"
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <ListFilter className="w-4 h-4" />
                      <span>Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Category</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {categories.map((category) => (
                          <DropdownMenuItem
                            key={category.C_categoryName}
                            onClick={() => handleFilterSelect("Category", category.C_categoryName)}>
                            {category.C_categoryName}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Brand</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {brands.map((brand) => (
                          <DropdownMenuItem
                            key={brand.B_brandName}
                            onClick={() => handleFilterSelect("Brand", brand.B_brandName)}>
                            {brand.B_brandName}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Supplier</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {suppliers.map((supplier) => (
                          <DropdownMenuItem
                            key={supplier.S_supplierName}
                            onClick={() => handleFilterSelect("Supplier", supplier.S_supplierName)}>
                            {supplier.S_supplierName}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Product Status</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Available")}>
                          Available
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Out of Stock")}>
                          Out of Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Low Stock")}>
                          Low Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Discontinued")}>
                          Discontinued
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem 
                      onClick={() => handleFilterSelect(null, null)} 
                      className="text-red-500 font-medium"
                      >
                        Reset Filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <h1 className="text-2xl mb-4 p-4 rounded-sm text-blue-50 bg-blue-950 font-bold">Products</h1>
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-hidden w-full">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead onClick={() => handleSort("productCode")} className="cursor-pointer select-none">Product Code <SortIcon column="productCode" /></TableHead>
                    <TableHead onClick={() => handleSort("category")} className="cursor-pointer select-none">Category <SortIcon column="category" /></TableHead>
                    <TableHead onClick={() => handleSort("productName")} className="cursor-pointer select-none">Product <SortIcon column="productName" /></TableHead>
                    <TableHead onClick={() => handleSort("brand")} className="cursor-pointer select-none">Brand <SortIcon column="brand" /></TableHead>
                    <TableHead onClick={() => handleSort("supplier")} className="cursor-pointer select-none">Supplier <SortIcon column="supplier" /></TableHead>
                    <TableHead onClick={() => handleSort("stockNumber")} className="cursor-pointer select-none">Stock amount <SortIcon column="stockNumber" /></TableHead>
                    <TableHead onClick={() => handleSort("lastRestock")} className="cursor-pointer select-none">Last Restock Date and Time <SortIcon column="lastRestock" /></TableHead>
                    <TableHead onClick={() => handleSort("price")} className="cursor-pointer select-none">Price <SortIcon column="price" /></TableHead>
                    <TableHead onClick={() => handleSort("sellingPrice")} className="cursor-pointer select-none">Selling Price <SortIcon column="sellingPrice" /></TableHead>
                    <TableHead onClick={() => handleSort("status")} className="cursor-pointer select-none">Status <SortIcon column="status" /></TableHead>
                    <TableHead onClick={() => handleSort("dateAdded")} className="cursor-pointer select-none">Date Added <SortIcon column="dateAdded" /></TableHead>
                    <TableHead onClick={() => handleSort("lastEdit")} className="cursor-pointer select-none">Last Edited<SortIcon column="lastEdit" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {getPaginatedData().map((item) => (
                    <TableRow key={item.productCode} className={getStatusColor(item.status)}>
                      <TableCell>{item.productCode}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.stockNumber} pcs</TableCell>
                      <TableCell>{item.lastRestock}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.sellingPrice}</TableCell>
                      <TableCell className={`font-semibold ${getStatusTextColor(item.status)}`}>{item.status}</TableCell>
                      <TableCell>{item.dateAdded}</TableCell>
                      <TableCell>{item.lastEdit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            
            {/* Pagination Controls */}
            <PaginationControls />
        </div>
      </div>
    </div>
    </SidebarProvider>
    </MinimumScreenGuard>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "Out of Stock":
      return "bg-red-100";
    case "Low Stock":
      return "bg-yellow-100";
    case "Discontinued":
      return "bg-gray-100";
    default:
      return "";
  }
}

function getStatusTextColor(status) {
  switch (status) {
    case "Active":
      return "text-green-600";
    case "Out of Stock":
      return "text-red-600";
    case "Low Stock":
      return "text-orange-600";
    case "Discontinued":
      return "text-gray-500";
  }
}

function formatDateTime(dateTimeString) {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return "N/A";
  }
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return "N/A";
  }
}