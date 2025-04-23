"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
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
      dateField: "P_dateAdded",
      supplierField: "P_supplier",
      supplierID: "P_supplierID",
      brandField: "P_brand",
      brandID: "P_brandID",
      categoryField: "P_category",
      categoryID: "P_categoryID",
      nameField: "P_productName",
      skuField: "P_SKU",
      stockField: "P_stock",
      stockID: "P_StockDetailsID",
      unitpriceField: "P_unitPrice",
      sellingpriceField: "P_sellingPrice",
      statusField: "P_productStatusName",
      statusId: "P_productStatusID",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/products", 
        add: "http://localhost:8080/products",  
        update: "http://localhost:8080/products", 
        delete: "http://localhost:8080/products",
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

    brand: {
      label: "Brand",
      idField: "BrandID",
      nameField: "BrandName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/brands",
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

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [data, setData] = useState([]);
  const [values, setValues] = useState({
    [config.product.codeField]: "",
    [config.product.dateField]: "",
    [config.product.supplierField]: "",
    [config.product.brandField]: "",
    [config.product.categoryField]: "",
    [config.product.nameField]: "",
    [config.product.quantityField]: "",
    [config.product.unitpriceField]: "",
    [config.product.sellingpriceField]: "",
    [config.product.statusField]: "",
  });

  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPID, setSelectedPID] = useState(null);

  const normalizedData = (products) => products.data.map((item) => ({
    productCode: item.P_productCode,
    dateAdded: item.P_dateAdded,
    supplier: item.supplier || "",
    supplierID: item.S_supplierID,
    brand: item.brand || "",
    brandID: item.B_brandID,
    category: item.category || "",
    categoryID: item.C_categoryID,
    productName: item.P_productName,
    SKU: item.P_SKU,
    stockNumber: item.stock || 0,
    price: item.P_unitPrice,
    sellingPrice: item.P_sellingPrice,
    status: item.status 
  }));

  // Fetch
  useEffect(() => {
    axios
      .get(config.product.api.fetch)
      .then((res) => setData(normalizedData(res)))
      .catch((error) => console.error("Error fetching data:", error));
    
      setValues({
      [config.product.codeField]: "",
      [config.product.dateField]: "",
      [config.product.supplierField]: "",
      [config.product.brandField]: "",
      [config.product.categoryField]: "",
      [config.product.nameField]: "",
      [config.product.quantityField]: "",
      [config.product.unitpriceField]: "",
      [config.product.sellingpriceField]: "",
      [config.product.statusField]: "",
    });

    setEditingItem(null);
    setSearchTerm("");
  }, []);

  const refreshTable = () => {
    axios
      .get(config.product.api.fetch)
      .then((res) => setData(normalizedData(res)))
      .catch((error) => console.error("Error fetching data:", error));
  };

  const openEditSheet = (data) => {
    setSelectedProduct(data);
    setSheetOpen(true);
  };

  // Search
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);

  const getFilteredTransactions = () => {
    const filteredItems =
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

      if (selectedFilter === "Date Added") {
        sortedTransactions.sort((a, b) =>
          selectedSubFilter === "Ascending"
            ? a.dateAdded.localeCompare(b.dateAdded)
            : b.dateAdded.localeCompare(a.dateAdded)
        );
      }
      
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Low to High"
          ? getPrice(a.price) - getPrice(b.price)
          : getPrice(b.price) - getPrice(a.price)
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
  const supplierIDMap = suppliers.reduce((map, supplier) => {
    map[supplier.SupplierName] = supplier.SupplierID;
    return map;
  }, {});
  const[brands, setBrands] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8080/brands")
      .then(res => setBrands(res.data))
      .catch((err) => console.error("Failed to fetch brand options:", err));
  }, []);
  const brandIDMap = brands.reduce((map, brand) => {
    map[brand.BrandName] = brand.BrandID;
    return map;
  }, {});
  const[categories, setCategories] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8080/categories")
      .then(res => setCategories(res.data))
      .catch((err) => console.error("Failed to fetch category options:", err));
  }, []);
  const categoryIDMap = categories.reduce((map, category) => {
    map[category.CategoryName] = category.CategoryID;
    return map;
  }, {});
  const[pStatus, setPStatus] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8080/productStatus")
      .then(res => setPStatus(res.data))
      .catch((err) => console.error("Failed to fetch product status options:", err));
  }, []);
  const pStatusIDMap = pStatus.reduce((map, pstatus) => {
    map[pstatus.PStatusName] = pstatus.PStatusID;
    return map;
  }, {});
 
  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      P_productCode: values[config.product.codeField],
      P_productName: values[config.product.nameField],
      P_SKU: values[config.product.skuField],
      P_StockDetailsID: stockIDMap[values[config.product.stockField]],
      P_unitPrice: values[config.product.unitpriceField],
      P_sellingPrice: values[config.product.sellingpriceField],
      P_dateAdded: values[config.product.dateField],
      P_productStatus: values[config.product.statusField],
      S_supplierID: supplierIDMap[values[config.product.supplierField]] || "",
      B_brandID: brandIDMap[values[config.product.brandField]] || "",
      C_categoryID: categoryIDMap[values[config.product.categoryField]] || ""
    };

    axios
      .post(config.product.api.add, payload)
      .then(() => {
        toast.success(`${config.product.label} updated successfully`);
        refreshTable();
        resetForm();
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
          toast.error(`Error adding ${config.label}`);
        }
      });
  };

  const resetForm = () => {
    setValues({
      [config.product.codeField]: "",
      [config.product.dateField]: "",
      [config.product.supplierField]: "",
      [config.product.brandField]: "",
      [config.product.categoryField]: "",
      [config.product.nameField]: "",
      [config.product.quantityField]: "",
      [config.product.unitpriceField]: "",
      [config.product.sellingpriceField]: "",
      [config.product.statusField]: "",
    });
    setEditingItem(null);
  };

  // Edit
  const handleEdit = (item) => {
    const selectedSupplier = suppliers.find(
      (supplier) => supplier.SupplierName === item[config.supplierField]
    );
    const supplierID = selectedSupplier ? selectedSupplier.SupplierID : "";
  
    const selectedBrand = brands.find(
      (brand) => brand.BrandName === item[config.brandField]
    );
    const brandID = selectedBrand ? selectedBrand.BrandID : "";

    const selectedCategory = categories.find(
      (category) => category.CategoryName === item[config.categoryField]
    );
    const categoryID = selectedCategory ? selectedCategory.CategoryID : "";
  
    const selectedStatus = pStatus.find(
      (pstatus) => pstatus.PStatusName === item[config.statusField]
    );
    const pstatusID = selectedStatus ? selectedStatus.PStatusID : "";

    setValues({
      [config.supplierField]: supplierID,
      [config.brandField]: brandID,
      [config.categoryField]: categoryID,
      [config.nameField]: item[config.nameField],
      [config.quantityField]: item[config.quantityFieldField],
      [config.unitpriceField]: item[config.unitpriceFieldField],
      [config.sellingpriceField]: item[config.sellingpriceField],
      [config.statusField]: pstatusID,
    });  
    setEditingItem(item);
  };

  // Price edit
  const handlePriceEdit = (item) => {
    const selectedSupplier = suppliers.find(
      (supplier) => supplier.SupplierName === item[config.supplierField]
    );
    const supplierID = selectedSupplier ? selectedSupplier.SupplierID : "";
  
    setValues({
      [config.supplierField]: supplierID,
      [config.nameField]: item[config.nameField],
      [config.sellingpriceField]: item[config.sellingpriceField],
    });  
    setEditingItem(item);
  };

  // Delete
  const [adminPW, setAdminPW] = useState("");
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
      })
      .catch(err => {
        console.error("Delete error:", err.response?.data || err);
        toast.error(err.response?.data?.message || "Error deleting product");
      });
  };
  

  // Multiple Delete
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleSelectProduct = (productCode) => {
    setSelectedProducts((prev) =>
      prev.includes(productCode)
        ? prev.filter((code) => code !== productCode)
        : [...prev, productCode]
    );
  };
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCodes = getFilteredTransactions().map((item) => item.productCode);
      setSelectedProducts(allCodes);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleMultiDelete = (password) => {
    if (!password) return toast.error("Password is required.");
    Promise.all(
      selectedProducts.map((code) =>
        axios.delete(`${config.product.api.delete}/${code}`, {
          data: { adminPW },
        })
      )
    )
      .then(() => {
        toast.success("Selected products deleted.");
        refreshTable();
      })
      .catch(() => toast.error("Error deleting selected products."));
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
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Product Status</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Active")}>
                          Active
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
            <div className="flex space-x-2">
              <Sheet>
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

                    <Label>Date Added</Label>
                    <Input type="date" name="Pdateadded"  required onChange={(e) => setValues({ ...values, [config.product.dateField]: e.target.value })}/>

                    <Label>Supplier</Label>
                    <Select onValueChange={(value) => setValues({ ...values, [config.product.supplierField]: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.S_supplierID}
                            value={supplier.S_supplierName}>
                            {supplier.S_supplierName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label>Brand</Label>
                    <Select onValueChange={(value) => setValues({ ...values, [config.product.brandField]: value })}>
                      <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem
                            key={brand.B_brandID}
                            value={brand.B_brandName}>
                            {brand.B_brandName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label>Category</Label>
                    <Select onValueChange={(value) => setValues({ ...values, [config.product.categoryField]: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category"/>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.C_categoryID}
                            value={category.C_categoryName}>
                            {category.C_categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label>Product Name</Label>
                    <Input placeholder="Enter product name" required onChange={(e) => setValues({ ...values, [config.product.nameField]: e.target.value })}/>
                    
                    <Label>SKU</Label>
                    <Input placeholder="Enter stock keeping unit" required onChange={(e) => setValues({ ...values, [config.product.skuField]: e.target.value })}/>

                    <Label>Quantity</Label>
                    <Input type="number" placeholder="Enter quantity" required onChange={(e) => setValues({ ...values, [config.product.quantityField]: e.target.value })}/>

                    <Label>Price</Label>
                    <Input placeholder="Enter price"  type="number" required onChange={(e) => setValues({ ...values, [config.product.unitpriceField]: e.target.value })}/>

                    <Label>Selling Price</Label>
                    <Input placeholder="Enter selling price"  type="number" required onChange={(e) => setValues({...values, [config.product.sellingpriceField]: e.target.value,})}/>

                    <Label>Product Status</Label>
                    <Select onValueChange={(value) => setValues({ ...values, [config.product.statusField]: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-blue-400 text-white w-full mt-4" onClick={handleSubmit}>Add Product</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-400 text-white">Update Price</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-blue-400 text-xl font-bold mb-4">Product Price Update</DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-col space-y-3">
                    <Label>Product Name</Label>
                    <Input placeholder="Enter product name" />

                    <Label>Supplier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.S_supplierID}
                            value={supplier.S_supplierName}>
                            {supplier.S_supplierName}
                          </SelectItem>
                        ))}
                      </SelectContent>  
                    </Select>

                    <Label>Product Code</Label>
                    <Input disabled placeholder="Auto-filled" className="bg-gray-300" />

                    <Label>Price</Label>
                    <Input disabled placeholder="Auto-filled" className="bg-gray-300" />

                    <Label>Updated Price</Label>
                    <Input type="text" placeholder="Enter new price" />
                  </div>

                  <DialogFooter>
                    <Button className="bg-blue-500 text-white w-full">Update Product Price</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button className="bg-blue-400 text-white">
                <Download className="w-4 h-4" />
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-red-500 text-white" disabled={selectedProducts.length === 0}>
                    Delete Selected
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-7 text-gray-700">
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
                  <div className="flex items-center gap-4 mt-4 pl-10">
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
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.length === getFilteredTransactions().length && selectedProducts.length > 0} />
                  </TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU (Stock Keeping Unit)</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{new Date(item.dateAdded).toLocaleDateString()}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.quantity} pcs</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.sellingPrice}</TableCell>
                    <TableCell className={`font-semibold ${getStatusTextColor(item.status)}`}>{item.status}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" onClick={() => openEditSheet(product)}>
                        <FilePen size={16} />
                      </Button>
                      {/* For deleting transactions */}
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
                                <span className="text-lg text-gray-400 font-normal italic">{item.productCode}</span></DialogTitle>
                              <DialogClose />
                            </DialogHeader>
                            <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                            <div className="flex items-center gap-4 mt-4 pl-10">          
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
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[400px] h-full flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-blue-400 text-xl font-bold">Edit Product Details</SheetTitle>
          </SheetHeader>
          {selectedProduct && (
            <div className="overflow-y-auto flex flex-col space-y-4">
              <label className="text-black font-semibold text-sm">Product Code</label>
              <Input value={selectedProduct.productCode} disabled className="bg-gray-200" />

              <label className="text-black font-semibold text-sm">Date Added</label>
              <Input value={selectedProduct.dateAdded} disabled className="bg-gray-200" />

              <label className="text-black font-semibold text-sm">Supplier</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem
                      key={supplier.S_supplierID}
                      value={supplier.S_supplierName}>
                      {supplier.S_supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Brand</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem
                      key={brand.B_brandID}
                      value={brand.B_brandName}>
                      {brand.B_brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.C_categoryID}
                      value={category.C_categoryName}>
                      {category.C_categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Product Name</label>
              <Input placeholder={selectedProduct.product} />

              <label className="text-black font-semibold text-sm">SKU</label>
              <Input placeholder={selectedProduct.SKU} />

              <label className="text-black font-semibold text-sm">Quantity</label>
              <Input type="number" defaultValue={selectedProduct.quantity} />

              <label className="text-black font-semibold text-sm">Price</label>
              <Input type="text" defaultValue={selectedProduct.price} />

              <label className="text-black font-semibold text-sm">Selling Price</label>
              <Input type="text" defaultValue={selectedProduct.sellingPrice} />

              <label className="text-black font-semibold text-sm">Product Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={selectedProduct.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-blue-400 text-white w-full mt-4">Save Edit</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
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