"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import { Search, ListFilter, Download, FilePen, Trash2, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { useRef } from "react";

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
        add: "http://localhost:8080/products",  
        update: "http://localhost:8080/products", 
        delete: "http://localhost:8080/products",
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

  const [selectedProduct, setSelectedProduct] = useState(null);

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
  const [isAddSheetOpen, setAddSheetOpen] = useState(false);

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

  const isAddValid =
      values[config.product.categoryField] &&    
      values[config.product.nameField] &&
      values[config.product.brandField] &&
      values[config.product.supplierField] &&
      values[config.product.stockField] &&
      values[config.product.unitpriceField] &&
      values[config.product.sellingpriceField];

  const isUpdateValid =
      values[config.product.codeField] &&
      values[config.product.sellingpriceField] !== "" &&
      !isNaN(parseFloat(values[config.product.sellingpriceField])) &&
      parseFloat(values[config.product.sellingpriceField]) > 0;

  

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

  const refreshTable = (callback) => {
    axios
      .get(config.product.api.fetch)
      .then((res) => {
        const newData = normalizedData(res);
        setData(newData);
        if (callback) callback(newData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  const openEditSheet = (item) => {
    const selectedSupplier = suppliers.find(s => s.S_supplierName === item.supplier);
    const selectedBrand = brands.find(b => b.B_brandName === item.brand);
    const selectedCategory = categories.find(c => c.C_categoryName === item.category);
    const selectedStatus = pStatus.find(p => p.P_productStatusName === item.status);
  
    setValues({
      [config.product.codeField]: item.productCode,
      [config.product.categoryField]: selectedCategory?.C_categoryID?.toString() || "",
      [config.product.nameField]: item.productName,
      [config.product.brandField]: selectedBrand?.B_brandID?.toString() || "",
      [config.product.supplierField]: selectedSupplier?.S_supplierID?.toString() || "",
      [config.product.stockField]: item.stockNumber,
      [config.product.lastRestockField]: item.lastRestock,
      [config.product.unitpriceField]: item.price,
      [config.product.sellingpriceField]: item.sellingPrice,
      [config.product.statusID]: selectedStatus?.P_productStatusID?.toString() || "",
      [config.product.dateField]: item.dateAdded,
    });
  
    setSelectedProduct(item);
    setEditSheetOpen(true);
  };

  // Search
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);

  // Sort
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  // Row references for highlighting
  const rowRefs = useRef({});

  // Highlight selected row
  const [highlightedCode, setHighlightedCode] = useState(null);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "ascending") {
          return { key, direction: "descending" };
        } else if (prev.direction === "descending") {
          return { key: null, direction: null }; // reset
        }
      }
      return { key, direction: "ascending" };
    });
  };


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
 
  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      C_categoryID: values[config.product.categoryField],
      P_productName: values[config.product.nameField],
      B_brandID: values[config.product.brandField],
      S_supplierID: values[config.product.supplierField],
      P_stockNum: values[config.product.stockField],
      P_unitPrice: values[config.product.unitpriceField],
      P_sellingPrice: values[config.product.sellingpriceField],
      P_productStatusID: 1
    };

    axios
      .post(config.product.api.add, payload)
      .then(() => {
        toast.success(`${config.product.label} added successfully`);
        refreshTable((updatedData) => {
            // Find the product with the latest dateAdded
            const newest = [...updatedData].sort((a, b) =>
              new Date(b.dateAdded) - new Date(a.dateAdded)
            )[0];

            if (newest?.productCode) {
              setHighlightedCode(newest.productCode);

              // Scroll into view if the row ref exists
              setTimeout(() => {
                const row = rowRefs.current[newest.productCode];
                if (row) {
                  row.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }, 300);
            }
          });

        resetForm();
        setAddSheetOpen(false);
      })
      .catch((err) => {
        console.error("Error response:", err.response);

        if (err.response?.data?.message?.includes('.PRIMARY')) {
          toast.error(`${config.product.label} with given code already exists. Code must be unique.`);
        }
        
        if (err.response?.status === 409 || err.response?.data?.message?.includes('unique_name')) {
          toast.error(`${config.product.label} with given name already exists. Name must be unique.`);
        } 
        else {
          toast.error(`Error adding ${config.product.label}`);
        }
      });
  };

  const resetForm = (customFields = {}) => {
    setValues({
      [config.product.categoryField]: "",   
      [config.product.nameField]: "",
      [config.product.brandField]: "",
      [config.product.supplierField]: "",
      [config.product.stockField]: "",
      [config.product.unitpriceField]: "",
      [config.product.sellingpriceField]: "",
      [config.product.statusField]: "",
      ...customFields
    });
  };

  // Edit  
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  const handleEdit = () => {
    const payload = { 
      C_categoryID: values[config.product.categoryField] || selectedProduct.categoryID,
      P_productName: values[config.product.nameField] || selectedProduct.productName,
      B_brandID: values[config.product.brandField] || selectedProduct.brandID,
      S_supplierID: values[config.product.supplierField] || selectedProduct.supplierID,
      P_stockNum: values[config.product.stockField] ?? selectedProduct.stockNumber,
      P_unitPrice: values[config.product.unitpriceField] || selectedProduct.unitPrice,
      P_sellingPrice: values[config.product.sellingpriceField] || selectedProduct.sellingPrice
    };

    axios
      .put(`${config.product.api.update}/${values[config.product.codeField]}`, payload)
      .then(() => {
        toast.success(`${config.product.label} edited successfully`);
        refreshTable();
        setEditSheetOpen(false);
        setHighlightedCode(values[config.product.codeField]);
      })
      .catch((err) => {
        console.error("Error response:", err.response);
        
        if (err.response?.status === 409 || err.response?.data?.message?.includes('unique_name')) {
          toast.error(`${config.product.label} with given name already exists. Name must be unique.`);
        } 
        else {
          toast.error(`Error editing ${config.product.label}`);
        }
      });
  };

  // Price edit
  const [openProduct, setOpenProduct] = useState(false);
  const [PSearchTerm, setPSearchTerm] = useState("");
  const [selectProductforPU, setSelectedProductforPU] = useState(null);
  const [isPDOpen, setPDopen] = useState(false);
  const handlePriceUpdate = async () => {
    const productCode = values[config.product.codeField];;
    const P_sellingPrice = values[config.product.sellingpriceField];

    if (!productCode) {
      toast.error("No product selected");
      return;
    }

    if (!P_sellingPrice || P_sellingPrice <= 0) {
      toast.error("No price entered");
      return;
    }

    axios
      .put(`http://localhost:8080/products/update-price/${productCode}`, { P_sellingPrice })
      .then(() => {
        toast.success("Price updated");
        refreshTable();
        resetForm({
          [config.product.codeField]: "",
          [config.product.sellingpriceField]: "",
        });
        setPSearchTerm("");
        setSelectedProductforPU(null);
        setPDopen(false);
        setHighlightedCode(productCode);
      })  
      .catch((err) => {
        console.error("Update error:", err?.response?.data || err.message || err);
        toast.error("Failed to update price");
      });
  };

  // Delete
  const [adminPW, setAdminPW] = useState("");
  const [isDDOpen, setDDOpen] = useState("");
  const handleDelete = (productCode) => {
    axios.delete(`${config.product.api.delete}/${productCode}`, {
      data: {adminPW}
    })
    .then((response) => {
      if (response.data.affectedRows > 0) {
        toast.success("Item deleted successfully");
        refreshTable();
        setDDOpen(false);
        setAdminPW("");
        setSelectedProducts([]);
      } else {
        toast.error("Product not found or already deleted");
      }
    })
    .catch(err => {
      if(err.response) {
        if (err.response.status === 403) {
          toast.error("Invalid admin password");
        } else if (err.response.status === 404) {
          toast.error("Product not found");
        } else {
          toast.error("Deletion failed: " + (err.response?.data?.message || err.message));
        }
      } else {
        toast.error("Delete request error");
      }
    })
    .finally(() => {
      setAdminPW("");
      setMDDOpen(false);
      setSelectedProducts([]);
    });
  };  
 
  useEffect(() => {
    setSelectedProducts([]);
  }, [selectedFilter, selectedSubFilter]); 

  // Multiple Delete
  const [selectedProducts, setSelectedProducts] = useState([]);
  const filteredProducts = getFilteredTransactions();
  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.includes(p.productCode));

  const handleSelectProduct = (productCode) => {
    setSelectedProducts((prev) =>
      prev.includes(productCode)
        ? prev.filter((code) => code !== productCode)
        : [...prev, productCode]
    );
  };
  
  const handleSelectAll = (e) => {
    const filtered = getFilteredTransactions().map(p => p.productCode);
    if (e.target.checked) {
      const unique = Array.from(new Set([...selectedProducts, ...filtered]));
      setSelectedProducts(unique);
    } else {
      setSelectedProducts(prev => prev.filter(p => !filtered.includes(p)));
    }
  };

  const [isMDDOpen, setMDDOpen] = useState("");
  const handleMultiDelete = (password) => {
    if (!password) {
      toast.error("Password is required.");
      return;
    }
  
    if (selectedProducts.length === 0) {
      toast.error("No products selected.");
      setDDOpen(false);
      setAdminPW("");
      setSelectedProducts([]);
      return;
    }

    let PWError = false;
  
    Promise.all(
      selectedProducts.map((productCode) =>
        axios.delete(`${config.product.api.delete}/${productCode}`, {
          data: { adminPW: password },
        }).catch(err => {
          if (err.response.status === 403 && !PWError) {
            PWError = true;
          } else if (err.response.status === 404) {
            toast.error("Product not found");
          } else {
            toast.error("Deletion failed: " + (err.response?.data?.message || err.message));
          }
          return err;
        })
      )
    )
      .then((responses) => {
        const successCount = responses.filter(
          (res) => res.data?.affectedRows > 0
        ).length;
        if (successCount > 0) {
          toast.success(`Deleted ${successCount} product(s) successfully`);
        } 
      })
      .catch((err) => {
        toast.error("Error deleting selected products");
      })
      .finally(() => {
        setAdminPW("");
        setMDDOpen(false);
        setSelectedProducts([]);
      });
  };

  // Download
  const [isDownloadConfirmOpen, setDownloadConfirmOpen] = useState("");
  const handleDownloadCSV = (data) => {
  const headers = [
    "Product Code",
    "Product Name",
    "Category",
    "Supplier",
    "Brand",
    "Stock Number",
    "Last Restock",
    "Unit Price",
    "Selling Price",
    "Status",
    "Date Product Added",
    "Last Edited"
  ];

  const rows = data.map(item => [
    item.productCode,
    item.productName,
    item.category,
    item.supplier,
    item.brand,
    item.stockNumber,
    item.lastRestock,
    item.price,
    item.sellingPrice,
    item.status,
    item.dateAdded,
    item.lastEdit
  ]);

  // Format Philippine Time
  const now = new Date();
  const phLocale = "en-PH";
  const phTimeZone = "Asia/Manila";
  const formattedPHDate = now.toLocaleString(phLocale, { timeZone: phTimeZone });

  // Determine Filter Display
  const filterLabel = selectedFilter && selectedSubFilter
    ? `${selectedFilter} - ${selectedSubFilter}`
    : "All";

  const csvContent = [
    `Products: ${filterLabel}`,
    `Downloaded At:, "${formattedPHDate}"`,
    selectedFilter && selectedSubFilter ? `Filter Applied:, "${filterLabel}"` : "Filter Applied:, None",
    searchTerm ? `Search Term:, "${searchTerm}"` : "",
    "",
    headers.join(","),
    ...rows.map(row => row.map(val => `"${val}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeFilter = selectedFilter && selectedSubFilter
  ? `${selectedFilter}-${selectedSubFilter}`.replace(/\s+/g, "-")
  : "All";

  const fileName = `Products_${safeFilter}.csv`;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

  // Highlight Timeout
  useEffect(() => {
    if (highlightedCode) {
      const timeout = setTimeout(() => setHighlightedCode(null), 8000);
      return () => clearTimeout(timeout);
    }
  }, [highlightedCode]);

  useEffect(() => {
    if (highlightedCode && rowRefs.current[highlightedCode]) {
      rowRefs.current[highlightedCode].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedCode]);


  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 bg-white shadow-sm p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="relative w-80">
                {/* Search */}
                <Input
                  type="text"
                  placeholder="Search product code, product, category"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              
              {/* Filter Content */}
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

            {/* Addd Product Sheet */}
            <div className="flex space-x-2">
              <Sheet open={isAddSheetOpen} onOpenChange={setAddSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-blue-400 text-white">Add Product</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] h-full flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="text-blue-400 text-xl font-bold">Add New Product</SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto flex flex-col space-y-4">
                    <Label>Category</Label>
                    <Select onValueChange={(value) => setValues({ ...values, [config.product.categoryField]: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category"/>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.C_categoryID}
                            value={category.C_categoryID.toString()}>
                            {category.C_categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label>Product Name</Label>
                    <Input placeholder="Enter product name" required onChange={(e) => setValues({ ...values, [config.product.nameField]: e.target.value })}/>

                    <Label>Brand</Label>
                    <Select onValueChange={(value) => setValues({ ...values, [config.product.brandField]: value })}>
                      <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem
                            key={brand.B_brandID}
                            value={brand.B_brandID.toString()}>
                            {brand.B_brandName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label>Supplier</Label>
                    <Select onValueChange={(value) => setValues({ ...values, [config.product.supplierField]: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.S_supplierID}
                            value={supplier.S_supplierID.toString()}>
                            {supplier.S_supplierName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label>Stock amount</Label>
                    <Input  
                      type="number" 
                      placeholder="Enter stock amount" 
                      required
                      min="0"
                      onKeyDown={(e) => {
                        if(e.key === 'e' || e.key === '-' || e.key === '+') {
                          e.preventDefault();
                        }
                      }} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if(!isNaN(value) && value >= 0) {
                          setValues({...values, [config.product.stockField]:value});
                        } else if (e.target.value === '') {
                          setValues({...values, [config.product.stockField]:''});    
                        }
                      }}
                    />

                    <Label>Price</Label>
                    <Input  
                      type="number" 
                      placeholder="Enter price" 
                      required
                      min="0.01"
                      step="0.01"
                      onKeyDown={(e) => {
                        if(e.key === 'e' || e.key === '-' || e.key === '+') {
                          e.preventDefault();
                        }
                      }} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if(!isNaN(value) && value > 0) {
                          setValues({...values, [config.product.unitpriceField]:value});
                        } else if (e.target.value === '') {
                          setValues({...values, [config.product.unitpriceField]:''});    
                        }
                      }}
                    />

                    <Label>Selling Price</Label>
                    <Input  
                      type="number" 
                      placeholder="Enter selling price" 
                      required
                      min="0.01"
                      step="0.01"
                      onKeyDown={(e) => {
                        if(e.key === 'e' || e.key === '-' || e.key === '+') {
                          e.preventDefault();
                        }
                      }} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if(!isNaN(value) && value > 0) {
                          setValues({...values, [config.product.sellingpriceField]:value});
                        } else if (e.target.value === '') {
                          setValues({...values, [config.product.sellingpriceField]:''});    
                        }
                      }}
                    />

                    <Button 
                      className="bg-blue-400 text-white w-full mt-4" 
                      onClick={handleSubmit}
                      disabled={!isAddValid}
                    >Add Product</Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Update Price  */}
              <Dialog 
                open={isPDOpen} 
                onOpenChange={(open) => {
                  setPDopen(open);
                  if(!open) {
                    setPSearchTerm("");
                    setValues({
                      ...values,
                      [config.product.codeField]: "",
                      [config.product.sellingpriceField]: "",
                    });
                  }
                }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-400 text-white">Update Price</Button>
                </DialogTrigger>
                <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                  <DialogHeader>
                    <DialogTitle className="text-blue-400 text-xl font-bold mb-4">Product Price Update</DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-col gap-4 mt-4 text-gray-700">
                    <Label>Product Code</Label>
                    <Input disabled placeholder="Auto-filled" className="bg-gray-300" value={values[config.product.codeField] ?? ""}/>

                    <Label>Product </Label>
                    <div className="relative">
                      <Input
                        placeholder="Search product"
                        value={PSearchTerm}
                        onChange={(e) => {
                          setPSearchTerm(e.target.value);
                          if(e.target.value === "") {
                            setValues({
                              ...values,
                              [config.product.codeField]: "",
                              [config.product.sellingpriceField]: "",
                            });
                          }
                        }}
                        className="w-full pr-8"
                      />
                      <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400"/>
                    </div>
                    <div className="border rounded-md max-h-60 overflow-y-auto">
                      {data
                        .filter(product => {
                          if(!PSearchTerm) return true;
                          const search = PSearchTerm.toLowerCase();

                          const productName = String(product.productName || '').toLowerCase();
                          const productCode = String(product.productCode || '').toLowerCase();
                          const supplier = String(product.supplier || '').toLowerCase();
                          const brand = String(product.brand || '').toLowerCase();
                      
                          return(
                            productName.toLowerCase().includes(search) ||
                            productCode.toLowerCase().includes(search) ||
                            supplier.toLowerCase().includes(search) ||
                            brand.toLowerCase().includes(search) 
                          );
                        })
                        .map((product) => (
                          <div
                            key={product.productCode}
                            className={`p-2 hover:bg-gray-100 cursor-pointer ${
                              values[config.product.codeField] === product.productCode ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              setValues({
                                ...values,
                                [config.product.codeField]: product.productCode,
                                [config.product.sellingpriceField]: product.sellingPrice,
                              });
                              setPSearchTerm(`${product.productName} (${product.productCode})`);
                            }}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">{product.productName}</span>
                              <span className="text-gray-500">{product.productCode}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Supplier: {product.supplier}</span>
                              <span>Brand: {product.brand}</span>
                              <span>Price: {product.sellingPrice}</span>
                            </div>
                          </div>
                        ))}
                    </div> 

                    <Label>Price</Label>
                    <Input disabled placeholder={values[config.product.sellingpriceField] ?? ""} className="bg-gray-300" />

                    <Label>Updated Price</Label>
                    <Input  
                      type="number" 
                      placeholder="Enter selling price" 
                      required
                      min="0.01"
                      step="0.01"
                      onKeyDown={(e) => {
                        if(e.key === 'e' || e.key === '-' || e.key === '+') {
                          e.preventDefault();
                        }
                      }} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if(!isNaN(value) && value > 0) {
                          setValues({...values, [config.product.sellingpriceField]:value});
                        } else if (e.target.value === '') {
                          setValues({...values, [config.product.sellingpriceField]:''});    
                        }
                      }}
                    />
                  </div>

                  <DialogFooter className="mt-6">
                    <Button className="bg-blue-500 text-white w-full" onClick={handlePriceUpdate} disabled={!isUpdateValid}>Update Product Price </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* DOWNLOAD */}
              <Dialog open={isDownloadConfirmOpen} onOpenChange={(open) => {
                setDownloadConfirmOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-400 text-white">
                    <Download className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                  <DialogHeader>
                    <DialogTitle>
                      <span className="text-lg text-blue-900">Confirm Download?</span>
                      <span className="text-lg text-gray-400 font-normal italic ml-2">
                        (Products.csv)
                      </span>
                    </DialogTitle>
                    <DialogClose />
                  </DialogHeader>
                  <p className="text-medium text-gray-800 mt-2 pl-4">
                    You are about to download the Products.csv file. Click the button below to proceed.
                  </p>
                  <div className="flex justify-end mt-4 text-gray-700 items-center pl-4">
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-700 text-white uppercase text-sm font-medium whitespace-nowrap"
                      onClick={() => {
                        handleDownloadCSV(getFilteredTransactions());
                        toast.success("Downloaded successfully!");
                        setDownloadConfirmOpen(false);
                      }}
                    >
                      DOWNLOAD FILE
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isMDDOpen} onOpenChange={(open) => {
                setMDDOpen(open);
                if (!open) {
                  setSelectedProducts([]);
                  setAdminPW("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-red-500 text-white" disabled={selectedProducts.length === 0}>
                    Delete Selected
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                  <DialogHeader>
                    <DialogTitle>
                      <span className="text-lg text-red-900">Delete Multiple Transactions</span>
                      <span className="text-lg text-gray-400 font-normal italic ml-2">({selectedProducts.length} items)</span>
                    </DialogTitle>
                    <DialogClose />
                  </DialogHeader>
                  <p className="text-sm text-gray-800 mt-2 pl-4">
                    Deleting these transactions will reflect on Void Transactions. Enter the admin password to delete the selected products.
                  </p>
                  <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
                    <div className="flex-1">
                      <label htmlFor="password" className="text-base font-medium text-gray-700 block mb-2">
                        Admin Password
                      </label>
                      <Input
                        type="password"
                        required
                        placeholder="Enter admin password"
                        className="w-full"
                        value={adminPW}
                        onChange={(e) => setAdminPW(e.target.value)}
                      />
                    </div>
                    <Button
                      className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                      onClick={() =>
                        handleMultiDelete(adminPW)
                      }
                    >
                      DELETE TRANSACTIONS
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <h1 className="text-2xl mb-4 p-4 rounded-sm text-blue-50 bg-blue-950 font-bold">Products</h1>
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>
                  <input type="checkbox" onChange={handleSelectAll} checked={allFilteredSelected}/>
                  </TableHead>
                  <TableHead onClick={() => handleSort("productCode")} className="cursor-pointer select-none">Product Code <SortIcon column="productCode" /></TableHead>
                  <TableHead onClick={() => handleSort("category")} className="cursor-pointer select-none">Category <SortIcon column="category" /></TableHead>
                  <TableHead onClick={() => handleSort("productName")} className="cursor-pointer select-none">Product <SortIcon column="productName" /></TableHead>
                  <TableHead onClick={() => handleSort("brand")} className="cursor-pointer select-none">Brand <SortIcon column="brand" /></TableHead>
                  <TableHead onClick={() => handleSort("supplier")} className="cursor-pointer select-none">Supplier <SortIcon column="supplier" /></TableHead>
                  <TableHead onClick={() => handleSort("stockNumber")} className="cursor-pointer select-none">Stock amount <SortIcon column="stockNumber" /></TableHead>
                  <TableHead onClick={() => handleSort("lastRestock")} className="cursor-pointer select-none">Last Restock<SortIcon column="lastRestock" /></TableHead>
                  <TableHead onClick={() => handleSort("price")} className="cursor-pointer select-none">Price <SortIcon column="price" /></TableHead>
                  <TableHead onClick={() => handleSort("sellingPrice")} className="cursor-pointer select-none">Selling Price <SortIcon column="sellingPrice" /></TableHead>
                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer select-none">Status <SortIcon column="status" /></TableHead>
                  <TableHead onClick={() => handleSort("dateAdded")} className="cursor-pointer select-none">Date Added <SortIcon column="dateAdded" /></TableHead>
                  <TableHead onClick={() => handleSort("lastEdit")} className="cursor-pointer select-none">Last Edited<SortIcon column="lastEdit" /></TableHead>
                  <TableHead>View/Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {getFilteredTransactions().filter(item =>
                (item.productName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (item.productCode?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase())        
              ).map((item) => (
                  <TableRow
                    key={item.productCode}
                    ref={(el) => (rowRefs.current[item.productCode] = el)}
                    className={`${getStatusColor(item.status)} ${item.productCode === highlightedCode ? 'bg-blue-200 animate-pulse' : ''}`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(item.productCode)}
                        onChange={() => handleSelectProduct(item.productCode)}
                      />
                    </TableCell>
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
                    <TableCell className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" onClick={() => openEditSheet(item)}>
                        <FilePen size={16} />
                      </Button>
                      {/* For deleting transactions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => {
                          setSelectedProduct(item);
                          setDDOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      <Sheet open={isEditSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent side="right" className="w-[400px] h-full flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-blue-400 text-xl font-bold">Edit Product Details</SheetTitle>
          </SheetHeader>
          {selectedProduct && (
            <div className="overflow-y-auto flex flex-col space-y-4">
              <label className="text-black font-semibold text-sm">Product Code</label>
              <Input value={selectedProduct.productCode} disabled className="bg-gray-200" />

              <label className="text-black font-semibold text-sm">Category</label>
              <Select value={values[config.product.categoryField]} onValueChange={(value) => setValues({ ...values, [config.product.categoryField]: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.C_categoryID}
                      value={category.C_categoryID.toString()}>
                      {category.C_categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Product Name</label>
              <Input value={values[config.product.nameField]  ?? ""} onChange={(e) => setValues({ ...values, [config.product.nameField]: e.target.value })}/>

              <label className="text-black font-semibold text-sm">Brand</label>
              <Select value={values[config.product.brandField]} onValueChange={(value) => setValues({ ...values, [config.product.brandField]: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem
                      key={brand.B_brandID}
                      value={brand.B_brandID.toString()}>
                      {brand.B_brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Supplier</label>
              <Select value={values[config.product.supplierField]} onValueChange={(value) => setValues({ ...values, [config.product.supplierField]: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem
                      key={supplier.S_supplierID}
                      value={supplier.S_supplierID.toString()}>
                      {supplier.S_supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Stock amount</label>
              <Input 
                type="number" 
                value={values[config.product.stockField]  ?? ""} 
                required
                min="0"
                onKeyDown={(e) => {
                  if(e.key === 'e' || e.key === '-' || e.key === '+') {
                    e.preventDefault();
                  }
                }} 
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if(!isNaN(value) && value >= 0) {
                    setValues({...values, [config.product.stockField]:value});
                  } else if (e.target.value === '') {
                    setValues({...values, [config.product.stockField]:''});    
                  }
                }}
              />

              <label className="text-black font-semibold text-sm">Price</label>
              <Input 
                type="number" 
                value={values[config.product.unitpriceField]  ?? ""}
                required
                min="0.01"
                step="0.01"
                onKeyDown={(e) => {
                  if(e.key === 'e' || e.key === '-' || e.key === '+') {
                    e.preventDefault();
                  }
                }} 
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if(!isNaN(value) && value > 0) {
                    setValues({...values, [config.product.unitpriceField]:value});
                  } else if (e.target.value === '') {
                    setValues({...values, [config.product.unitpriceField]:''});    
                  }
                }}
              />

              <label className="text-black font-semibold text-sm">Selling Price</label>
              <Input 
                type="number" 
                value={values[config.product.sellingpriceField] ?? ""} 
                required
                min="0.01"
                step="0.01"
                onKeyDown={(e) => {
                  if(e.key === 'e' || e.key === '-' || e.key === '+') {
                    e.preventDefault();
                  }
                }} 
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if(!isNaN(value) && value > 0) {
                    setValues({...values, [config.product.sellingpriceField]:value});
                  } else if (e.target.value === '') {
                    setValues({...values, [config.product.sellingpriceField]:''});    
                  }
                }}
              />

              <label className="text-black font-semibold text-sm">Date Added</label>
              <Input value={selectedProduct.dateAdded} disabled className="bg-gray-200" />

              <Button className="bg-blue-400 text-white w-full mt-4" onClick={handleEdit}>Save Edit</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isDDOpen} onOpenChange={(open) => {
        setDDOpen(open);
        if (!open) {
          setAdminPW("");
        }
      }}>
        <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>
              <span className="text-lg text-red-900">Delete Transaction</span>{" "}
              <span className="text-lg text-gray-400 font-normal italic">
                {selectedProduct?.productCode}
              </span>
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <p className="text-sm text-gray-800 mt-2 pl-4">
            Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction.
          </p>
          <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
            <div className="flex-1">
              <label className="text-base font-medium text-gray-700 block mb-2">
                Admin Password
              </label>
              <Input
                type="password"
                required
                placeholder="Enter valid password"
                className="w-full"
                value={adminPW}
                onChange={(e) => setAdminPW(e.target.value)}
              />
            </div>

            <Button
              className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
              onClick={() => {
                handleDelete(selectedProduct?.productCode);
                setDDOpen(false);
                setAdminPW("");
              }}
            >
              DELETE TRANSACTION
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
    <Toaster position="top-center"/>
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
