"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ListFilter } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

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

  const normalizedData = (products) => products.data.map((item) => ({
    productCode: item.P_productCode,
    category: item.category || "",
    categoryID: item.C_categoryID,
    productName: item.P_productName,
    brand: item.brand || "",
    brandID: item.B_brandID,
    supplier: item.supplier || "",
    supplierID: item.S_supplierID,
    stockNumber: item.stock || 1,
    lastRestock: item.P_lastRestockDateTime ? formatDateTime(item.P_lastRestockDateTime) : "N/A",
    price: item.P_unitPrice,
    sellingPrice: item.P_sellingPrice,
    status: item.status,
    dateAdded: item.P_dateAdded ? formatDate(item.P_dateAdded) : "N/A"
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
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  useEffect(() => {
    setSelectedProducts([]);
  }, [selectedFilter, selectedSubFilter]); 
  

  const getFilteredTransactions = () => {
    config?.nameField && config?.idField
      ? data.filter(
          (item) =>
            (item[config.nameField]?.toLowerCase() || "").includes(
              searchTerm.toLowerCase()
            ) || (item[config.idField] || "").includes(searchTerm)
        )
      : [];
    let sortedTransactions = [...data];
    if (!selectedFilter || !selectedSubFilter) return sortedTransactions;

    if (selectedFilter === "Supplier") {
      sortedTransactions = sortedTransactions.filter((item) => item.supplier === selectedSubFilter);
    }
  
    if (selectedFilter === "Brand") {
      sortedTransactions = sortedTransactions.filter((item) => item.brand === selectedSubFilter);
    }

    if (selectedFilter === "Category") {
      sortedTransactions = sortedTransactions.filter((item) => item.category === selectedSubFilter);
    }

    if (selectedFilter === "Product Status") {
      sortedTransactions = sortedTransactions.filter((item) => item.status === selectedSubFilter);
    }

    if (selectedFilter === "Product Name") {
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Ascending"
          ? a.productName.localeCompare(b.productName)
          : b.productName.localeCompare(a.productName)
      );
    }

    if (selectedFilter === "Price") {
      const getPrice = (price) => {
        if (!price) return 0;
        return parseFloat(price.toString().replace(/[^\d.]/g, ""));
      }
      
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Low to High"
          ? getPrice(a.price) - getPrice(b.price)
          : getPrice(b.price) - getPrice(a.price)
      );
    }

    if (selectedFilter === "Date added") {
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Ascending"
          ? new Date(a.dateAdded) - new Date(b.dateAdded)
          : new Date(b.dateAdded) - new Date(a.dateAdded)
      );
    }

    return sortedTransactions;
  }; 

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
 


  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="relative w-80">
                <input
                  type="text"
                  placeholder="Search product, category, item code"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <DropdownMenuSubTrigger>Product Name</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Name", "Ascending")}>
                          Ascending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Name", "Descending")}>
                          Descending
                        </DropdownMenuItem>
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
                      <DropdownMenuSubTrigger>Price</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Price", "Low to High")}>
                          Low to High
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Price", "High to Low")}>
                          High to Low
                        </DropdownMenuItem>
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

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Date added</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Date added", "Ascending")}>
                          Ascending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Date added", "Descending")}>
                          Descending
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
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
          <h1 className="text-gray-600 font-bold">Products</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Stock amount</TableHead>
                  <TableHead>Last Restock Date and Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {getFilteredTransactions().filter(item =>
                (item.productName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())                
              ).map((item) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
    </SidebarProvider>
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
