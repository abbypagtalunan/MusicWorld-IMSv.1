"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import { Search, ListFilter, Download, Trash2, Ellipsis, RotateCcw } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

export default function DeletedPage() {
  const config = {
    deleted: {
      label: "Deleted",
      deletedID: "DT_deletedID",
      codeField: "P_productCode",
      receiptField: "O_receiptNumber",
      nameField: "P_productName",
      sellingpriceField: "P_sellingPrice",
      TdateField: "T_transactionDate",
      supplierField: "P_supplier",
      supplierID: "P_supplierID",
      brandField: "P_brand",
      brandID: "P_brandID",
      categoryField: "P_category",
      categoryID: "P_categoryID",
      unitpriceField: "OD_unitPrice",
      quantityField: "OD_quantity",
      api: {
        fetch: "http://localhost:8080/deleted", 
        add: "http://localhost:8080/deleted",  
        update: "http://localhost:8080/deleted", 
        delete: "http://localhost:8080/deleted",
      },
    },
    
    product: {
      label: "Product",
      idField: "ProductID",
      nameField: "ProductName",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/products",
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
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [values, setValues] = useState({
    [config.deleted.codeField]: "",
    [config.deleted.receiptField]: "",    
    [config.deleted.nameField]: "",
    [config.deleted.sellingpriceField]: "",
    [config.deleted.TdateField]: "",
    [config.deleted.supplierField]: "",
    [config.deleted.brandField]: "",
    [config.deleted.categoryField]: "",
    [config.deleted.quantityField]: "",
  });

  const normalizedData = (deleted) => deleted.data.map((item) => ({
    productCode: item.P_productCode,
    receiptNum: item.O_receiptNumber,
    productName: item.P_productName,
    sellingPrice: item.P_sellingPrice,
    Tdate: item.T_transactionDate,
    supplier: item.supplier || "",
    supplierID: item.S_supplierID,
    brand: item.brand || "",
    brandID: item.B_brandID,
    category: item.category || "",
    categoryID: item.C_categoryID,
    price: item.P_unitPrice,
    quantity: item.OD_quantity,
    uniqueKey: `${item.O_orderID}-${item.P_productCode}`
  }));

  // Fetch
  useEffect(() => {
    axios
      .get(config.deleted.api.fetch)
      .then((res) => setData(normalizedData(res)))
      .catch((error) => console.error("Error fetching data:", error));
      
      setValues({
        [config.deleted.DdateField]: "",
        [config.deleted.transactionField]: "",
        [config.deleted.codeField]: "",
        [config.deleted.receiptField]: "",    
        [config.deleted.nameField]: "",
        [config.deleted.sellingpriceField]: "",
        [config.deleted.TdateField]: "",
        [config.deleted.supplierField]: "",
        [config.deleted.brandField]: "",
        [config.deleted.categoryField]: "",
        [config.deleted.quantityField]: "",
      });
  
    setSearchTerm("");
  }, []);

  const refreshTable = () => {
    axios
      .get(config.deleted.api.fetch)
      .then((res) => setData(normalizedData(res)))
      .catch((error) => console.error("Error fetching data:", error));
  };

  // Search
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);

  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  const getFilteredTransactions = () => {
    let sortedTransactions = [...data];
    if (!selectedFilter || !selectedSubFilter) return sortedTransactions;
  
    if (selectedFilter === "Receipt Number") {
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Ascending"
          ? String(a.receiptNum || "").localeCompare(String(b.receiptNum || ""))
          : String(b.receiptNum || "").localeCompare(String(a.receiptNum || ""))
      );
    }

    if (selectedFilter === "Product Name") {
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Ascending"
          ? a.productName.localeCompare(b.productName)
          : b.productName.localeCompare(a.productName)
      );
    }
  
    if (selectedFilter === "Price") {
      const getPrice = (price) => parseFloat(price.replace(/[^\d.]/g, ""));
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Low to High"
          ? getPrice(a.sellingPrice) - getPrice(b.sellingPrice)
          : getPrice(b.sellingPrice) - getPrice(a.sellingPrice)
      );
    }

    return sortedTransactions;
  };  

  // Multiple Delete
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const handleSelectTransaction = (uniqueKey) => {
    setSelectedTransactions((prev) =>
      prev.includes(uniqueKey)
        ? prev.filter((code) => code !== uniqueKey)
        : [...prev, uniqueKey]
    );
  };
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allKeys = getFilteredTransactions().map((item) => item.uniqueKey);
      setSelectedTransactions(allKeys);
    } else {
      setSelectedTransactions([]);
    }
  };

  // Delete
    const [adminPW, setAdminPW] = useState("");
    const [isDDOpen, setDDOpen] = useState("");
    const [isMDDOpen, setMDDOpen] = useState("");
    const handleDelete = (uniqueKey, adminPWInput) => {
      if (typeof uniqueKey !== 'string' || !uniqueKey.includes('-')) {
        console.error('Invalid unique key:', uniqueKey);
        toast.error('Invalid item selected for deleting');
        return;
      }
      
      const [transactionID] = uniqueKey.split("-");

      axios({
        method: 'delete',
        url: `http://localhost:8080/deleted/${transactionID}`,
        data: { transactionID, adminPW: adminPWInput }, 
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
 
  // Multiple delete
  const handleMultiDelete = (password) => {
    if (!password) return toast.error("Password is required.");
    Promise.all(
      selectedTransactions.map((uniqueKey) => {
        const [transactionID] = uniqueKey.split("-");

        return axios({
          method: 'delete',
          url: `${config.deleted.api.delete}/${transactionID}`,
          data: { transactionID, adminPW: password /*adminPWInput */ }, 
          headers: {
            'Content-Type': 'application/json',
          }
        })
      })
    )
      .then(() => {
        toast.success("Selected products deleted.");
        refreshTable();
        setAdminPW("");
        setMDDOpen(false);
      })
      .catch(() => toast.error("Error deleting selected products."));

      useEffect(() => {
        setSelectedTransactions([]);
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
                  placeholder="Search transaction, id, product"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <ListFilter className="w-4 h-4" />
                    <span>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Receipt Number</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleFilterSelect("Receipt Number", "Ascending")}>
                        Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterSelect("Receipt Number", "Descending")}>
                        Descending
                      </DropdownMenuItem>
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

                  <DropdownMenuItem 
                    onClick={() => handleFilterSelect(null, null)} 
                    className="text-red-500 font-medium"
                    >
                    Reset Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-blue-400 text-white">
                <Download className="w-4 h-4" />
              </Button>

              <Dialog open={isMDDOpen} onOpenChange={(open) => {
                setMDDOpen(open);
                if (!open) {
                  setSelectedTransactions([]);
                  setAdminPW("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-red-500 text-white" disabled={selectedTransactions.length === 0}>
                    Delete Selected
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                  <DialogHeader>
                    <DialogTitle>
                      <span className="text-lg text-red-900">Delete Multiple Transactions</span>
                      <span className="text-lg text-gray-400 font-normal italic ml-2">({selectedTransactions.length} items)</span>
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
            <h1 className="text-gray-600 font-bold">Deleted Transactions</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedTransactions.length === getFilteredTransactions().length && selectedTransactions.length > 0} />
                  </TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Retrieve/Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {getFilteredTransactions().filter(item =>
                (String(item.productName || "").toLowerCase()).includes(searchTerm.toLowerCase()) ||
                (String(item.transactionID || "").toLowerCase()).includes(searchTerm.toLowerCase()) ||
                (String(item.receiptNum || "").toLowerCase()).includes(searchTerm.toLowerCase())                
              ).map((item) => (
                    <TableRow key={item.uniqueKey}>                   
                      <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(item.uniqueKey)}
                        onChange={() => handleSelectTransaction(item.uniqueKey)}
                      />
                      </TableCell>
                      <TableCell>{item.productCode}</TableCell>
                      <TableCell>{item.receiptNum}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.sellingPrice}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                              <Ellipsis size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[90vw] max-w-3xl sm:max-w-lg md:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
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
                                  <TableHead>Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell>{new Date(item.Tdate).toLocaleDateString()}</TableCell>
                                  <TableCell>{item.productCode}</TableCell>
                                  <TableCell>{item.supplier}</TableCell>
                                  <TableCell>{item.brand}</TableCell>
                                  <TableCell>{item.category}</TableCell>
                                  <TableCell>{item.productName}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{item.price}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="flex items-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <span className="cursor-pointer text-gray-500 hover:text-blue-600">
                              <RotateCcw size={16} />
                            </span>
                          </DialogTrigger>
                          <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                            <DialogHeader>
                              <DialogTitle>Are you sure you want to retrieve this transaction?</DialogTitle>
                              <DialogDescription>
                                This action will restore the transaction and update the sales report.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-4 mt-4">
                              <Button
                                className="bg-blue-400 text-white hover:bg-blue-700"
                                onClick={() => handleRetrieve(item.uniqueKey)}
                              >
                                Confirm
                              </Button>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                                <span className="text-lg text-gray-400 font-normal italic">{item.transactionID}</span>
                              </DialogTitle>
                              <DialogClose />
                            </DialogHeader>
                            <p className='text-sm text-gray-800 mt-2 pl-4'>
                              Warning: This action will permanently remove the transaction from your records. Enter the admin password to continue.
                            </p>
                            <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
                              <div className="flex-1">
                                <label htmlFor={`password-${item.transactionID}`} className="text-base font-medium text-gray-700 block mb-2">
                                  Admin Password
                                </label>
                                <Input
                                  type="password" value={adminPW} required placeholder="Enter valid password" className="w-full"
                                  onChange={(e) =>
                                    setAdminPW(e.target.value)
                                  }/>
                              </div>
                              <Button
                                className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                onClick={() => handleDelete(item.uniqueKey, adminPW)}
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
          </div>
        </div>
      </div>
    <Toaster position="top-center"/>
    </SidebarProvider>
  );
}
