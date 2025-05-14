"use client";

import { useState, useEffect, act } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Download, Eye, X, ChevronsUpDown, ChevronUp, ChevronDown  } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import RDaction from "@/components/deleted-actions";

export default function DeletedPage() {
  const [activeTab, setActiveTab] = useState("order");
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [deletedReturns, setDeletedReturns] = useState([]);
  const [deletedDeliveries, setDeletedDeliveries] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);  

  const configMap = {
    order: {
      label: "Orders",
      idField: "O_orderID",
      idDetail: "OD_detailID",
      codeField: "P_productCode",
      receiptField: "O_receiptNumber",
      nameField: "P_productName",
      totalamtField: "T_totalAmount",
      paymentField: "O_orderPayment",
      dateField: "T_transactionDate",
      supplierField: "supplier",
      brandField: "brand",
      categoryField: "category",
      quantityField: "OD_quantity",
      sellingpriceField: "OD_unitPrice",
      itemtotalField: "OD_netSale",
      discAmtField: "OD_discountAmount",
      setter: setDeletedOrders,
      api: {
        fetch: "http://localhost:8080/deletedOrders", 
        retrieve: "http://localhost:8080/deletedOrders", 
        delete: "http://localhost:8080/deletedOrders",
      },
    },

    return: {
      label: "Returns",
      idField: "R_returnID",
      codeField: "P_productCode",
      typeField: "R_reasonOfReturn",
      nameField: "P_productName",
      totalamtField: "R_TotalPrice",
      dateField: "R_dateOfReturn",
      supplierField: "supplier",
      brandField: "brand",
      categoryField: "category",
      quantityField: "R_returnQuantity",
      discountField: "R_discountAmount",
      setter: setDeletedReturns,
      api: {
        fetch: "http://localhost:8080/deletedReturns",
        retrieve: "http://localhost:8080/deletedReturns",
        delete: "http://localhost:8080/deletedReturns",
      },
    },

    delivery: {
      label: "Deliveries",
      idField: "D_deliveryNumber",
      codeField: "P_productCode",
      nameField: "P_productName",
      dateField: "D_deliveryDate",
      supplierField: "supplier",
      brandField: "brand",
      categoryField: "category",
      quantityField: "DPD_quantity",
      setter: setDeletedDeliveries,
      api: {
        fetch: "http://localhost:8080/deletedDeliveries", 
        retrieve: "http://localhost:8080/deletedDeliveries", 
        delete: "http://localhost:8080/deletedDeliveries",
      },
    },

    product: {
      label: "Products",
      idField: "P_productCode",
      codeField: "P_productCode",
      categoryField: "category",
      nameField: "P_productName",
      brandField: "brand",
      supplierField: "supplier",
      stockField: "stockAmt",
      stockID: "P_StockDetailsID",
      unitpriceField: "P_unitPrice",
      sellingpriceField: "P_sellingPrice",
      statusField: "P_productStatusName",
      statusId: "P_productStatusID",
      dateField: "P_dateAdded",
      setter: setDeletedProducts,
      api: {
        fetch: "http://localhost:8080/deletedProducts", 
        retrieve: "http://localhost:8080/deletedProducts", 
        delete: "http://localhost:8080/deletedProducts",
      },
    },
  };

    
  const config = configMap[activeTab] || {};  

  const getCurrentTabData = () => {
    switch(activeTab) {
      case "order":
        return deletedOrders;
      case "return":
        return deletedReturns;
      case "delivery":
        return deletedDeliveries;
      case "product":
        return deletedProducts;
      default:
        return [];
    }
  };

  // Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentConfig = configMap[activeTab]
        const res = await axios.get(currentConfig.api.fetch);
        config.setter(res.data);
      } catch (err) {
        console.error("Failed to fetch deleted data:", err);
      }
    }

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  const refreshTable = () => {
    axios
      .get(config.api.fetch)
      .then((res) => config.setter(res.data))
      .catch((error) => console.error("Error fetching data:", error));
  };  

  const [searchTerm, setSearchTerm] = useState("");

  // Search
  const [selectedFilter] = useState(null);
  const [selectedSubFilter] = useState(null);
  // Sort
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "ascending" ? "descending" : "ascending",
        };
      }
      return { key, direction: "ascending" };
    });
  };

  // Search  
  const getFilteredTransactions = () => {
    let result = [...getCurrentTabData()];

    // Filter logic
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(item => {
        const matches = [];

        switch(activeTab) {
          case "order":
            matches.push(
              String(item[config.idField] || '').toLowerCase().includes(search),
              String(item[config.nameField] || '').toLowerCase().includes(search)
            );
            break;
          case "return":
            matches.push(
              String(item[config.idField] || '').toLowerCase().includes(search),
              String(item[config.nameField] || '').toLowerCase().includes(search),
              String(item[config.typeField] || '').toLowerCase().includes(search)
            );
            break;
          case "delivery":
            matches.push(
              String(item[config.codeField] || '').toLowerCase().includes(search),
              String(item[config.nameField] || '').toLowerCase().includes(search),
              String(item[config.supplierField] || '').toLowerCase().includes(search)
            );
            break;
          case "product":
            matches.push(
              String(item[config.codeField] || '').toLowerCase().includes(search),
              String(item[config.nameField] || '').toLowerCase().includes(search),
              String(item[config.categoryField] || '').toLowerCase().includes(search),
              String(item[config.brandField] || '').toLowerCase().includes(search),
              String(item[config.supplierField] || '').toLowerCase().includes(search)
            );
            break;
        }
        return matches.some(match => match);
      });
    }

  // Sort logic
  const key = sortConfig.key;
    if (key) {
      result.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // Handle numeric strings with ₱ or commas
        if (typeof valA === "string" && valA.includes("₱")) {
          valA = parseFloat(valA.replace(/[₱,]/g, ""));
          valB = parseFloat(valB.replace(/[₱,]/g, ""));
        }

        // Handle dates
        if (!isNaN(Date.parse(valA))) {
          valA = new Date(valA);
          valB = new Date(valB);
        }

        if (sortConfig.direction === "ascending") {
          return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
          return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
      });
    }

    return result;
  };
  
  function SortIcon({ column }) {
    if (sortConfig.key !== column)
      return <ChevronsUpDown className="inline ml-1 w-4 h-4 text-gray-400" />;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="inline ml-1 w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="inline ml-1 w-4 h-4 text-blue-500" />
    );
  } 

  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const handleSelectTransaction = (uniqueKey) => {
    setSelectedTransactions((prev) =>
      prev.includes(uniqueKey)
        ? prev.filter((code) => code !== uniqueKey)
        : [...prev, uniqueKey]
    );
  };
  
  const handleSelectAll = (e) => {
    const filteredData = getFilteredTransactions();
    if (e.target.checked) {
      const allKeys = filteredData.map((item) => `${item[config.idField]}-${item[config.codeField]}`);
      setSelectedTransactions(allKeys);
    } else {
      setSelectedTransactions([]);
    }
  };

  // Retrieve
  const handleRetrieve = (uniqueKey) => {
    const [id] = uniqueKey.split('-');

    axios.post(`${config.api.retrieve}/${id}`)
      .then(() => {
        toast.success("Item restored");
        refreshTable();
        setRDDOpen(false);
        setSelectedTransactions([]);
      })
      .catch(() => {
        toast.error("Restore failed");
        setRDDOpen(false);
        setSelectedTransactions([]);
      });
  };  

  useEffect(() => {
    setSelectedTransactions([]);
  }, [selectedFilter, selectedSubFilter]);

// Multiple Retrieve
const [isRDDOpen, setRDDOpen] = useState("");
const handleMultiRetrieve = () => {
  Promise.all(
    selectedTransactions.map((uniqueKey) => {
      const [id] = uniqueKey.split("-");
      return axios.post(`${config.api.retrieve}/${id}`)
    })
  )
    .then(() => {
      toast.success("Selected items restored.");
      refreshTable();
      setRDDOpen(false);
      setSelectedTransactions([]);
    })
    .catch(() => {
      toast.error("Error restoring selected items.");
      setRDDOpen(false);
      setSelectedTransactions([]);
    });
}

// Download
const [isDownloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
const handleDownloadCSV = (data) => {
  const currentTabD = getFilteredTransactions();

  let headers = [];
  let rows = [];
  
  switch(activeTab) {
    case "order":
      headers = [
        "Receipt Number",
        "Order ID",
        "Transaction Date",
        "Product Name",
        "Product Code",
        "Quantity",
        "Total Amount",
        "Order Detail ID",
        "Supplier",
        "Brand",
        "Category",
        "Selling Price",
        "Discount Amount"
      ];
      rows = currentTabD.map(item => [
        item[config.receiptField],
        item[config.idField],
        new Date(item[config.dateField]).toLocaleDateString(),
        item[config.nameField],
        item[config.codeField],
        item[config.quantityField],
        item[config.idDetail],
        item[config.supplierField],
        item[config.brandField],
        item[config.categoryField],
        item[config.sellingpriceField],
        item[config.discAmtField]
      ]);
      break;

    case "return":
      headers = [
        "Return ID",
        "Product Code",
        "Reason of Return",
        "Product Name",
        "Return Total Amount",
        "Return Date",
        "Supplier",
        "Brand",
        "Category",
        "Quantity",
        "Discount Amount"
      ];
      rows = currentTabD.map(item => [
        item[config.idField],
        item[config.codeField],
        item[config.typeField],
        item[config.nameField],
        item[config.totalamtField],
        new Date(item[config.dateField]).toLocaleDateString(),
        item[config.supplierField],
        item[config.brandField],
        item[config.categoryField],
        item[config.quantityField],
        item[config.discountField]
      ]);
      break;

    case "delivery":
      headers = [
        "Delivery ID",
        "Product Code",
        "Product Name",
        "Supplier",
        "Quantity",
        "Delivery Date",
        "Brand",
        "Category"
      ];
      rows = currentTabD.map(item => [
        item[config.idField],
        item[config.codeField],
        item[config.nameField],
        item[config.supplierField],
        item[config.quantityField],
        new Date(item[config.dateField]).toLocaleDateString(),
        item[config.brandField],
        item[config.categoryField]
      ]);
      break;

    case "product":
        headers = [
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
          "Date Product Added"
        ];
        rows = currentTabD.map(item => [
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
          new Date(item[config.dateField]).toLocaleDateString()
        ]);
        break;
  }

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(val => `"${val}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${config.label}-Deleted.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

  // Delete
  const [adminPW, setAdminPW] = useState("");
  const [isMDDOpen, setMDDOpen] = useState("");
  const handleDelete = (uniqueKey, adminPWInput) => {
    if (typeof uniqueKey !== 'string' || !uniqueKey.includes('-')) {
      console.error('Invalid unique key:', uniqueKey);
      toast.error('Invalid item selected for deleting');
      return;
  }
      
  const [id] = uniqueKey.split("-");

    axios({
      method: 'delete',
      url: `${config.api.delete}/${id}`,
      data: { id, adminPW: adminPWInput, type:activeTab }, 
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(() => {
        toast.success("Transaction deleted successfully");
        refreshTable();
        setMDDOpen(false);
        setAdminPW("");
        setSelectedTransactions([]);
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
          "Unknown error deleting transaction";
        
        toast.error(msg);
        setMDDOpen(false);
        setAdminPW("");
        setSelectedTransactions([]);
      });
    };
 
  // Multiple delete 
  const handleMultiDelete = (password) => {
    if (!password) return toast.error("Password is required.");
    Promise.all(
      selectedTransactions.map((uniqueKey) => {
        const [id] = uniqueKey.split("-");
        return axios({
          method: 'delete',
          url: `${config.api.delete}/${id}`,
          data: { id, adminPW: password, type:activeTab }, 
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
        setSelectedTransactions([]);
      })
      .catch(() => { 
        toast.error("Error deleting selected products.");
        setMDDOpen(false);
        setSelectedTransactions([]);
      });
  };  


  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="z-10 sticky top-0 mb-4 bg-white p-4 rounded-lg">
            <h1 className="text-gray-600 font-bold">Deleted Transactions</h1>
          </div>

          <Tabs defaultValue="order" onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="w-full z-10 sticky">
              <TabsList className="w-full flex justify-start bg-white rounded-md shadow-md px-6 py-6 space-x-4">
                {Object.entries(configMap).map(([key, cfg]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="data-[state=active]:text-indigo-600"
                  >
                    {`${cfg.label.toUpperCase()}`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {Object.entries(configMap).map(([key, cfg]) => (
                <TabsContent key={key} value={key}>
                  {/* Table */}
                    <Card className="overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto relative">
                      <CardContent className="p-0">
                        {/* Search */}
                        <div className=" bg-white p-4 flex justify-between items-center">
                            <div className="relative w-80">
                              <Input
                                type="text"
                                placeholder={`Search ${config.label}...`}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                  setSearchTerm(e.target.value);
                                  setSelectedTransactions([]);
                                }}
                              />
                              <div className="absolute left-3 top-2.5 text-gray-500">
                                <Search className="w-5 h-5" variant="outline"/>
                              </div>
                              {searchTerm && (
                                <div
                                  className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                                  onClick={() => {
                                    setSearchTerm("");
                                    setSelectedTransactions([]);
                                  }}
                                >
                                  <X className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Dialog open={isRDDOpen} onOpenChange={(open) => {
                                setRDDOpen(open);
                                if (!open) {
                                  setSelectedTransactions([]);
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button className="bg-blue-500 text-white" disabled={selectedTransactions.length === 0}>
                                    Retrieve Selected
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                                  <DialogHeader>
                                      <DialogTitle>Are you sure you want to retrieve these transactions?</DialogTitle>
                                      <DialogDescription>This action will restore the transactions and update the sales report.</DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end gap-4 mt-4">
                                    <Button
                                      className="bg-blue-400 text-white hover:bg-blue-700"
                                      onClick={() => handleMultiRetrieve()}
                                    >
                                    Confirm
                                    </Button>
                                    <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                </div>  
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
                                      ({config.label}-Deleted.cs)
                                    </span>
                                  </DialogTitle>
                                  <DialogClose />
                                </DialogHeader>
                                <p className="text-medium text-gray-800 mt-2 pl-4">
                                  You are about to download the {config.label}-Deleted.csv file. Click the button below to proceed.
                                </p>
                                <div className="flex justify-end mt-4 text-gray-700 items-center pl-4">
                                  <Button
                                    className="bg-emerald-500 hover:bg-emerald-700 text-white uppercase text-sm font-medium whitespace-nowrap"
                                    onClick={() => {
                                      handleDownloadCSV();
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
                                      <label htmlFor="password" className="text-base font-medium text-gray-700 block mb-2">Admin Password</label>
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
                          

                      <div className="sticky top-[72px] z-10 bg-white">
                          <Table className="min-w-full">
                          <TableHeader className="sticky top-[72px] z-10 bg-white shadow-sm">
                              <TableRow>
                              {activeTab === "order" && (
                                <>
                                  <TableHead className="px-4 py-2">
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedTransactions.length === getFilteredTransactions().length && selectedTransactions.length > 0} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.dateField)} className="cursor-pointer">
                                    Date <SortIcon column={config.dateField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.idField)} className="cursor-pointer">
                                    Order ID <SortIcon column={config.idField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.receiptField)} className="cursor-pointer">
                                    Receipt Number <SortIcon column={config.receiptField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.codeField)} className="cursor-pointer">
                                    Product Code <SortIcon column={config.codeField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.nameField)} className="cursor-pointer">
                                    Product <SortIcon column={config.nameField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.quantityField)} className="cursor-pointer">
                                    Quantity <SortIcon column={config.quantityField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.totalamtField)} className="cursor-pointer">
                                    Item Total <SortIcon column={config.totalamtField} />
                                  </TableHead>
                                  <TableHead>Retrieve/Delete</TableHead>
                                </>
                              )}
                              {activeTab === "return" && (
                                <>
                                  <TableHead>
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedTransactions.length === getFilteredTransactions().length && selectedTransactions.length > 0} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.idField)} className="cursor-pointer">
                                    Return ID <SortIcon column={config.idField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.codeField)} className="cursor-pointer">
                                    Product Code <SortIcon column={config.codeField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.typeField)} className="cursor-pointer">
                                    Reason of Return <SortIcon column={config.typeField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.nameField)} className="cursor-pointer">
                                    Product <SortIcon column={config.nameField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.totalamtField)} className="cursor-pointer">
                                    Return Total Amount <SortIcon column={config.totalamtField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.dateField)} className="cursor-pointer">
                                    Return Date <SortIcon column={config.dateField} />
                                  </TableHead>
                                  <TableHead>Retrieve/Delete</TableHead>
                                </>
                              )}
                              {activeTab === "delivery" && (
                                <>
                                  <TableHead>
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedTransactions.length === getFilteredTransactions().length && selectedTransactions.length > 0} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.idField)} className="cursor-pointer">
                                    Delivery ID <SortIcon column={config.idField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.codeField)} className="cursor-pointer">
                                    Product Code <SortIcon column={config.codeField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.nameField)} className="cursor-pointer">
                                    Product <SortIcon column={config.nameField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.supplierField)} className="cursor-pointer">
                                    Supplier <SortIcon column={config.supplierField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.quantityField)} className="cursor-pointer">
                                    Quantity <SortIcon column={config.quantityField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.dateField)} className="cursor-pointer">
                                    Delivery Date <SortIcon column={config.dateField} />
                                  </TableHead>
                                  <TableHead>Details</TableHead>
                                  <TableHead>Retrieve/Delete</TableHead>
                                </>
                              )}
                              {activeTab === "product" && (
                                <>
                                  <TableHead>
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedTransactions.length === getFilteredTransactions().length && selectedTransactions.length > 0} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.codeField)} className="cursor-pointer">
                                    Product Code <SortIcon column={config.codeField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.categoryField)} className="cursor-pointer">
                                    Category <SortIcon column={config.categoryField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.nameField)} className="cursor-pointer">
                                    Name <SortIcon column={config.nameField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.brandField)} className="cursor-pointer">
                                    Brand <SortIcon column={config.brandField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.supplierField)} className="cursor-pointer">
                                    Supplier <SortIcon column={config.supplierField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.stockField)} className="cursor-pointer">
                                    Stock Amount <SortIcon column={config.stockField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.unitpriceField)} className="cursor-pointer">
                                    Unit Price <SortIcon column={config.unitpriceField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.sellingpriceField)} className="cursor-pointer">
                                    Selling Price <SortIcon column={config.sellingpriceField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.statusField)} className="cursor-pointer">
                                    Status <SortIcon column={config.statusField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.dateField)} className="cursor-pointer">
                                    Date Added <SortIcon column={config.dateField} />
                                  </TableHead>
                                  <TableHead>Retrieve/Delete</TableHead>
                                </>
                              )}
                            </TableRow>
                          </TableHeader>
                          </Table>
                          </div>

                        <div className="overflow-y-auto max-h-[450px]">
                      <Table className="min-w-full">
                          <TableBody>
                          {getCurrentTabData().length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                No deleted transactions found.
                              </TableCell>
                            </TableRow>
                          ):(
                            getFilteredTransactions().map((item, index) => (
                              <TableRow key={index}>
                                {activeTab === "order" && (
                                  <>
                                    <TableCell>
                                      <input
                                        type="checkbox"
                                        checked={selectedTransactions.includes(`${item[config.idField]}-${item[config.codeField]}`)}
                                        onChange={() => handleSelectTransaction(`${item[config.idField]}-${item[config.codeField]}`)}
                                      />
                                    </TableCell> 
                                    <TableCell>{new Date(item[config.dateField]).toLocaleDateString()}</TableCell>
                                    <TableCell>{item[config.idField]}</TableCell>
                                    <TableCell>{item[config.receiptField]}</TableCell>
                                    <TableCell>{item[config.codeField]}</TableCell>
                                    <TableCell>{item[config.nameField] + " " + item[config.supplierField] + " " + item[config.brandField]}</TableCell>
                                    <TableCell>{item[config.quantityField]}</TableCell>
                                    <TableCell>{item[config.totalamtField]}</TableCell>
                                    <TableCell>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                            <Eye size={16} />
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
                                                <TableHead>Order Detail ID</TableHead>
                                                <TableHead>Product Code</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>Brand</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Selling Price</TableHead>
                                                <TableHead>Discount Amount</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Item total</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              <TableRow>
                                              <TableCell>{item[config.idDetail]}</TableCell>
                                                <TableCell>{item[config.codeField]}</TableCell>
                                                <TableCell>{item[config.supplierField]}</TableCell>
                                                <TableCell>{item[config.brandField]}</TableCell>
                                                <TableCell>{item[config.brandField]}</TableCell>
                                                <TableCell>{item[config.nameField]}</TableCell>
                                                <TableCell>{item[config.sellingpriceField]}</TableCell>
                                                <TableCell>{item[config.discAmtField]}</TableCell>
                                                
                                                <TableCell>{item[config.quantityField]}</TableCell>
                                                <TableCell>{item[config.totalamtField]}</TableCell>
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                    <TableCell className="flex items-center">
                                      <RDaction
                                        item={item}
                                        handleRetrieve={handleRetrieve}
                                        handleDelete={handleDelete}           
                                        idField={config.idField}
                                        codeField={config.codeField}
                                      />
                                    </TableCell>
                                  </>
                                )}
                                {activeTab === "return" && (
                                  <>
                                    <TableCell>
                                      <input
                                        type="checkbox"
                                        checked={selectedTransactions.includes(`${item[config.idField]}-${item[config.codeField]}`)}
                                        onChange={() => handleSelectTransaction(`${item[config.idField]}-${item[config.codeField]}`)}
                                      />
                                    </TableCell>
                                    <TableCell>{item[config.idField]}</TableCell>
                                    <TableCell>{item[config.codeField]}</TableCell>
                                    <TableCell>{item[config.typeField]}</TableCell>
                                    <TableCell>{item[config.nameField]}</TableCell>
                                    <TableCell>{item[config.totalamtField]}</TableCell>
                                    <TableCell>{new Date(item[config.dateField]).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                            <Eye size={16} />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl p-6">
                                          <DialogHeader>
                                            <DialogTitle>Transaction Details</DialogTitle>
                                            <DialogClose />
                                          </DialogHeader>
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Product Code</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>Brand</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Discount amount</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              <TableRow>
                                                <TableCell>{item[config.codeField]}</TableCell>
                                                <TableCell>{item[config.supplierField]}</TableCell>
                                                <TableCell>{item[config.brandField]}</TableCell>
                                                <TableCell>{item[config.brandField]}</TableCell>
                                                <TableCell>{item[config.nameField]}</TableCell>
                                                <TableCell>{item[config.quantityField]}</TableCell>
                                                <TableCell>{item[config.discountField]}</TableCell>
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                    <TableCell>
                                      <RDaction
                                        item={item}
                                        handleRetrieve={handleRetrieve}
                                        handleDelete={handleDelete}           
                                        idField={config.idField}
                                        codeField={config.codeField}
                                      />
                                    </TableCell>
                                  </>
                                )}
                                {activeTab === "delivery" && (
                                  <>
                                    <TableCell>
                                      <input
                                        type="checkbox"
                                        checked={selectedTransactions.includes(`${item[config.idField]}-${item[config.codeField]}`)}
                                        onChange={() => handleSelectTransaction(`${item[config.idField]}-${item[config.codeField]}`)}
                                      />
                                    </TableCell>
                                    <TableCell>{item[config.idField]}</TableCell>
                                    <TableCell>{item[config.codeField]}</TableCell>
                                    <TableCell>{item[config.nameField]}</TableCell>
                                    <TableCell>{item[config.supplierField]}</TableCell>
                                    <TableCell>{item[config.quantityField]}</TableCell>
                                    <TableCell>{new Date(item[config.dateField]).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                            <Eye size={16} />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl p-6">
                                          <DialogHeader>
                                            <DialogTitle>Transaction Details</DialogTitle>
                                            <DialogClose />
                                          </DialogHeader>
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Product Code</TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>Brand</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Quantity</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              <TableRow>
                                                <TableCell>{item[config.codeField]}</TableCell>
                                                <TableCell>{item[config.supplierField]}</TableCell>
                                                <TableCell>{item[config.brandField]}</TableCell>
                                                <TableCell>{item[config.brandField]}</TableCell>
                                                <TableCell>{item[config.nameField]}</TableCell>
                                                <TableCell>{item[config.quantityField]}</TableCell>
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                    <TableCell>
                                      <RDaction
                                        item={item}
                                        handleRetrieve={handleRetrieve}
                                        handleDelete={handleDelete}           
                                        idField={config.idField}
                                        codeField={config.codeField}
                                      />
                                    </TableCell>
                                  </>
                                )}
                                {activeTab === "product" && (
                                    <>
                                    <TableCell>
                                      <input
                                        type="checkbox"
                                        checked={selectedTransactions.includes(`${item[config.idField]}-${item[config.codeField]}`)}
                                        onChange={() => handleSelectTransaction(`${item[config.idField]}-${item[config.codeField]}`)}
                                      />
                                    </TableCell>
                                    <TableCell>{item[config.codeField]}</TableCell>
                                    <TableCell>{item[config.categoryField]}</TableCell>
                                    <TableCell>{item[config.skuField]}</TableCell>
                                    <TableCell>{item[config.nameField]}</TableCell>
                                    <TableCell>{item[config.brandField]}</TableCell>
                                    <TableCell>{item[config.supplierField]}</TableCell>
                                    <TableCell>{item[config.stockField]}</TableCell>
                                    <TableCell>{item[config.unitpriceField]}</TableCell>
                                    <TableCell>{item[config.sellingpriceField]}</TableCell>
                                    <TableCell>{item[config.statusField]}</TableCell>
                                    <TableCell>{new Date(item[config.dateField]).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <RDaction
                                        item={item}
                                        handleRetrieve={handleRetrieve}
                                        handleDelete={handleDelete}           
                                        idField={config.idField}
                                        codeField={config.codeField}
                                      />
                                    </TableCell>
                                  </>
                                )}
                            </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                      </div>
                    </CardContent>
                    </div>
                  </Card>
                </TabsContent>                            
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    <Toaster position="top-center"/>
    </SidebarProvider>
  );
}
