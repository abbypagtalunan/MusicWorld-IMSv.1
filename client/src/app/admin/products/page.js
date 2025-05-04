"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import { Search, ListFilter, Download, FilePen, Trash2 } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

export default function ProductsPage() {
  const config = {
    product: {
      label: "Product",
      codeField: "P_productCode",
      categoryField: "P_category",
      categoryID: "P_categoryID",
      skuField: "P_SKU",
      nameField: "P_productName",
      brandField: "P_brand",
      brandID: "P_brandID",
      supplierField: "P_supplier",
      supplierID: "P_supplierID",
      stockField: "stockAmt",
      stockID: "P_StockDetailsID",
      unitpriceField: "P_unitPrice",
      sellingpriceField: "P_sellingPrice",
      statusField: "P_productStatusName",
      statusId: "P_productStatusID",
      dateField: "P_dateAdded",
      isAutoInc: false,
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

    productStock: {
      label: "Product Stock",
      idField: "PStockID",
      amtField: "PStockNum",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/productStocks",
      },
    },
  };

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [data, setData] = useState([]);
  const [values, setValues] = useState({
    [config.product.codeField]: "",
    [config.product.categoryField]: "",
    [config.product.skuField]: "",    
    [config.product.nameField]: "",
    [config.product.brandField]: "",
    [config.product.supplierField]: "",
    [config.product.stockField]: "",
    [config.product.unitpriceField]: "",
    [config.product.sellingpriceField]: "",
    [config.product.statusField]: "",
    [config.product.dateField]: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSheetOpen, setAddSheetOpen] = useState(false);

  const normalizedData = (products) => products.data.map((item) => ({
    productCode: item.P_productCode,
    category: item.category || "",
    categoryID: item.C_categoryID,
    SKU: item.P_SKU,
    productName: item.P_productName,
    brand: item.brand || "",
    brandID: item.B_brandID,
    supplier: item.supplier || "",
    supplierID: item.S_supplierID,
    stockNumber: item.stock || 0,
    stockID: item.P_StockDetailsID,
    price: item.P_unitPrice,
    sellingPrice: item.P_sellingPrice,
    status: item.status,
    dateAdded: item.P_dateAdded
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
        [config.product.skuField]: "",    
        [config.product.nameField]: "",
        [config.product.brandField]: "",
        [config.product.supplierField]: "",
        [config.product.stockField]: "",
        [config.product.unitpriceField]: "",
        [config.product.sellingpriceField]: "",
        [config.product.statusField]: "",
        [config.product.dateField]: "",
    });

    setSearchTerm("");
  }, []);

  const refreshTable = () => {
    axios
      .get(config.product.api.fetch)
      .then((res) => setData(normalizedData(res)))
      .catch((error) => console.error("Error fetching data:", error));
  };

  const openEditSheet = (item) => {
    const selectedSupplier = suppliers.find(s => s.S_supplierName === item.supplier);
    const selectedBrand = brands.find(b => b.B_brandName === item.brand);
    const selectedCategory = categories.find(c => c.C_categoryName === item.category);
    const selectedStatus = pStatus.find(p => p.P_productStatusName === item.status);
    const selectedStock = pStock.find(
      (s) => s?.PS_StockDetailsID?.toString() === item.stockID?.toString()
    );
    const stockAmt =
      selectedStock?.P_stockNum?.toString() ||
      item.stockNumber?.toString() || "";
  
    setValues({
      [config.product.codeField]: item.productCode,
      [config.product.categoryField]: selectedCategory?.C_categoryID?.toString() || "",
      [config.product.skuField]: item.SKU,
      [config.product.nameField]: item.productName,
      [config.product.brandField]: selectedBrand?.B_brandID?.toString() || "",
      [config.product.supplierField]: selectedSupplier?.S_supplierID?.toString() || "",
      [config.product.stockField]: stockAmt,
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
  const[pStock, setPStock] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8080/productStocks")
      .then(res => setPStock(res.data))
      .catch((err) => console.error("Failed to fetch product status options:", err));
  }, []);
 
  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      P_productCode: values[config.product.codeField],
      C_categoryID: values[config.product.categoryField],
      P_SKU: values[config.product.skuField],
      P_productName: values[config.product.nameField],
      B_brandID: values[config.product.brandField],
      S_supplierID: values[config.product.supplierField],
      stockAmt: values[config.product.stockField],
      P_unitPrice: values[config.product.unitpriceField],
      P_sellingPrice: values[config.product.sellingpriceField],
      P_productStatusID: values[config.product.statusID],
      P_dateAdded: values[config.product.dateField]
    };

    axios
      .post(config.product.api.add, payload)
      .then(() => {
        toast.success(`${config.product.label} added successfully`);
        refreshTable();
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
      [config.product.codeField]: "",
      [config.product.categoryField]: "",
      [config.product.skuField]: "",    
      [config.product.nameField]: "",
      [config.product.brandField]: "",
      [config.product.supplierField]: "",
      [config.product.stockField]: "",
      [config.product.unitpriceField]: "",
      [config.product.sellingpriceField]: "",
      [config.product.statusField]: "",
      [config.product.dateField]: "",
      ...customFields
    });
  };

  // Edit  
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  const handleEdit = () => {
    const payload = { 
      C_categoryID: values[config.product.categoryField] || selectedProduct.categoryID,
      P_SKU: values[config.product.skuField] || selectedProduct.SKU,
      P_productName: values[config.product.nameField] || selectedProduct.productName,
      B_brandID: values[config.product.brandField] || selectedProduct.brandID,
      S_supplierID: values[config.product.supplierField] || selectedProduct.supplierID,
      stockAmt: values[config.product.stockField] || selectedProduct.stockAmount,
      P_unitPrice: values[config.product.unitpriceField] || selectedProduct.unitPrice,
      P_sellingPrice: values[config.product.sellingpriceField] || selectedProduct.sellingPrice,
      P_productStatusID: values[config.product.statusID] || selectedProduct.statusID
    };

    axios
      .put(`${config.product.api.update}/${values[config.product.codeField]}`, payload)
      .then(() => {
        toast.success(`${config.product.label} edited successfully`);
        refreshTable();
        setEditSheetOpen(false);
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
  const [isPDOpen, setPDopen] = useState(false);
  const handlePriceUpdate = async () => {
    const productCode = values[config.product.codeField];;
    const P_sellingPrice = values[config.product.sellingpriceField];

    axios
      .put(`http://localhost:8080/products/update-price/${productCode}`, { P_sellingPrice })
      .then(() => {
        toast.success("Price updated");
        refreshTable();
        resetForm({
          [config.product.codeField]: "",
          [config.product.nameField]: "",
          [config.product.supplierField]: "",
          [config.product.sellingpriceField]: "",
        });
        setPDopen(false);
      })  
      .catch((err) => {
        console.error("Update error:", err?.response?.data || err.message || err);
        toast.error("Failed to update price");
      });
  };

  // Delete
  const [adminPW, setAdminPW] = useState("");
  const [isDDOpen, setDDOpen] = useState("");
  const [isMDDOpen, setMDDOpen] = useState("");
  const handleDelete = (productCode, adminPWInput) => {
    axios({
      method: 'delete',
      url: `http://localhost:8080/products/${productCode}`,
      data: { adminPW: adminPWInput }, 
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(() => {
        toast.success("Product deleted successfully");
        refreshTable();
        setAdminPW("");
        setDDOpen(false);
      })
      .catch(err => {
        console.error("Delete error:", {
          message: err.message,
          response: err.response,
          data: err.response?.data,
          status: err.response?.status
        });
      
        const msg =
          err.response?.data?.message ||
          err.response?.statusText ||
          err.message ||
          "Unknown error deleting product";
      
        toast.error(msg);
      });
  };
  

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

  const handleMultiDelete = (password) => {
    if (!password) return toast.error("Password is required.");
    Promise.all(
      selectedProducts.map((code) =>
        axios({
          method: 'delete',
          url: `${config.product.api.delete}/${code}`,
          data: { adminPW: password /*adminPWInput */ }, 
          headers: {
            'Content-Type': 'application/json',
          }
        })
      )
    )
      .then(() => {
        toast.success("Selected products deleted.");
        refreshTable();
        setAdminPW("");
        setMDDOpen(false);
      })
      .catch(() => toast.error("Error deleting selected products."));

      useEffect(() => {
        setSelectedProducts([]);
      }, [selectedFilter, selectedSubFilter]);
  };  

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
                    <Label className>Product Code</Label>
                    <Input placeholder="Enter product code" type="number" required onChange={(e) => setValues({...values, [config.product.codeField]: e.target.value})} />

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
                    
                    <Label>SKU</Label>
                    <Input placeholder="Enter stock keeping unit" required onChange={(e) => setValues({ ...values, [config.product.skuField]: e.target.value })}/>

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
                    <Input type="number" placeholder="Enter Stock amount" required onChange={(e) => setValues({ ...values, [config.product.stockField]: e.target.value })}/>

                    <Label>Price</Label>
                    <Input placeholder="Enter price"  type="number" required onChange={(e) => setValues({ ...values, [config.product.unitpriceField]: e.target.value })}/>

                    <Label>Selling Price</Label>
                    <Input placeholder="Enter selling price"  type="number" required onChange={(e) => setValues({...values, [config.product.sellingpriceField]: e.target.value,})}/>

                    <Label>Product Status</Label>
                    <Select onValueChange={(value) => setValues({ ...values, [config.product.statusID]: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status"/>
                      </SelectTrigger>
                      <SelectContent>
                        {pStatus.map((pstatus) => (
                          <SelectItem
                            key={pstatus.P_productStatusID}
                            value={pstatus.P_productStatusID.toString()}>
                            {pstatus.P_productStatusName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label>Date Added</Label>
                    <Input type="date" name="Pdateadded"  required onChange={(e) => setValues({ ...values, [config.product.dateField]: e.target.value })}/>
                    <Button className="bg-blue-400 text-white w-full mt-4" onClick={handleSubmit}>Add Product</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Dialog open={isPDOpen} onOpenChange={setPDopen}>
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
                    
                    <Label>Product Name</Label>
                    <Select onValueChange={(value) => {
                      const selected = data.find(p => p.productCode === value);
                      if (selected) {
                        setValues({
                          ...values,
                          [config.product.codeField]: selected.productCode,
                          [config.product.nameField]: selected.productName,
                          [config.product.supplierField]: selected.supplierID.toString(),
                          [config.product.sellingpriceField]: selected.sellingPrice,
                        });
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.map((product) => (
                          <SelectItem
                            key={product.productCode}
                            value={product.productCode}>
                            {product.productName}
                          </SelectItem>
                        ))}
                      </SelectContent>  
                    </Select>

                    <Label>Supplier</Label>
                    <Select value = {values[config.product.supplierField] ?? ""}>
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

                    <Label>Price</Label>
                    <Input disabled placeholder="Auto-filled" className="bg-gray-300" value={values[config.product.sellingpriceField] ?? ""}/>

                    <Label>Updated Price</Label>
                    <Input type="number" placeholder="Enter new price" required onChange={(e) => setValues({...values, [config.product.sellingpriceField]: e.target.value,})}/>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button className="bg-blue-500 text-white w-full" onClick={handlePriceUpdate}>Update Product Price </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button className="bg-blue-400 text-white">
                <Download className="w-4 h-4" />
              </Button>

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
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
          <h1 className="text-gray-600 font-bold">Products</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>
                  <input type="checkbox" onChange={handleSelectAll} checked={allFilteredSelected}/>
                  </TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU (Stock Keeping Unit)</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Stock amount</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>View/Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {getFilteredTransactions().filter(item =>
                (item.productName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (item.productCode?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())                
              ).map((item) => (
                  <TableRow key={item.productCode} className={getStatusColor(item.status)}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(item.productCode)}
                        onChange={() => handleSelectProduct(item.productCode)}
                      />
                    </TableCell>
                    <TableCell>{item.productCode}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.SKU}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.stockNumber} pcs</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.sellingPrice}</TableCell>
                    <TableCell className={`font-semibold ${getStatusTextColor(item.status)}`}>{item.status}</TableCell>
                    <TableCell>{new Date(item.dateAdded).toLocaleDateString()}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" onClick={() => openEditSheet(item)}>
                        <FilePen size={16} />
                      </Button>
                      {/* For deleting transactions */}
                      <Dialog open={isDDOpen} onOpenChange={(open) => {
                        setDDOpen(open);
                        if (!open) setAdminPW("");
                      }}>
                          <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                              <DialogTitle>
                                <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                                <span className="text-lg text-gray-400 font-normal italic">{item.productCode}</span></DialogTitle>
                              <DialogClose />
                            </DialogHeader>
                            <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                            <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">         
                              <div className="flex-1">
                                <label htmlFor={`password-${item.productCode}`} className="text-base font-medium text-gray-700 block mb-2">
                                  Admin Password
                                </label>
                                <Input type="password" required placeholder="Enter valid password" className="w-full" value={adminPW}
                                    onChange={(e) =>
                                      setAdminPW(e.target.value)
                                    }
                                />
                              </div>
            
                              <Button 
                                className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                onClick={() => handleDelete(
                                  item.productCode,
                                  adminPW
                                )}
                              >
                                DELETE TRANSACTION
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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

              <label className="text-black font-semibold text-sm">SKU</label>
              <Input value={values[config.product.skuField] ?? ""} onChange={(e) => setValues({ ...values, [config.product.skuField]: e.target.value })}/>

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
              <Input type="number" value={values[config.product.stockField]  ?? ""} /*defaultValue={selectedProduct.quantity}*/ onChange={(e) => setValues({ ...values, [config.product.stockField]: e.target.value })}/>

              <label className="text-black font-semibold text-sm">Price</label>
              <Input type="text" value={values[config.product.unitpriceField]  ?? ""} /*defaultValue={selectedProduct.price}*/ onChange={(e) => setValues({ ...values, [config.product.unitpriceField]: e.target.value })}/>

              <label className="text-black font-semibold text-sm">Selling Price</label>
              <Input type="text" value={values[config.product.sellingpriceField] ?? ""} /*defaultValue={selectedProduct.sellingPrice}*/ onChange={(e) => setValues({...values, [config.product.sellingpriceField]: e.target.value,})}/>

              <label className="text-black font-semibold text-sm">Product Status</label>
              <Select value={values[config.product.statusID]} onValueChange={(value) => setValues({ ...values, [config.product.statusID]: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status"/>
                </SelectTrigger>
                <SelectContent>
                  {pStatus.map((pstatus) => (
                    <SelectItem
                      key={pstatus.P_productStatusID}
                      value={pstatus.P_productStatusID.toString()}>
                      {pstatus.P_productStatusName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Date Added</label>
              <Input value={selectedProduct.dateAdded} disabled className="bg-gray-200" />

              <Button className="bg-blue-400 text-white w-full mt-4" onClick={handleEdit}>Save Edit</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
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