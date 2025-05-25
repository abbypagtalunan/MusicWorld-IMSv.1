"use client";

import { useState, useEffect, act } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/staff-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Eye, X, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";

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
      codeField: "P_productCode",
      receiptField: "O_receiptNumber",
      nameField: "P_productName",
      totalamtField: "T_totalAmount",
      dateField: "T_transactionDate",
      supplierField: "supplier",
      brandField: "brand",
      categoryField: "category",
      quantityField: "OD_quantity",
      sellingpriceField: "OD_unitPrice",
      itemtotalField: "OD_itemTotal",
      setter: setDeletedOrders,
      api: {
        fetch: "http://localhost:8080/deletedOrders",
      },
    },

    return: {
      label: "Returns",
      idField: "R_returnID",
      codeField: "P_productCode",
      typeField: "RT_returnTypeDescription",
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
      },
    },

    product: {
      label: "Products",
      idField: "P_productCode",
      codeField: "P_productCode",
      categoryField: "category",
      skuField: "P_SKU",
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


  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState([]);

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
    if (key && sortConfig.direction !== null) {
      result.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // Normalize null/undefined
        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        // Remove ₱ or commas (e.g. ₱1,000)
        const currencyRegex = /[₱,]/g;
        if (typeof valA === "string" && valA.match(currencyRegex)) {
          valA = parseFloat(valA.replace(currencyRegex, ""));
          valB = parseFloat(valB.replace(currencyRegex, ""));
        }

        // Number comparison
        if (!isNaN(valA) && !isNaN(valB)) {
          valA = Number(valA);
          valB = Number(valB);
        }

        // Date comparison
        else if (!isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))) {
          valA = new Date(valA);
          valB = new Date(valB);
        }

        // Case-insensitive string compare
        else {
          valA = String(valA);
          valB = String(valB);

          return sortConfig.direction === "ascending"
            ? valA.localeCompare(valB, undefined, { sensitivity: "base" })
            : valB.localeCompare(valA, undefined, { sensitivity: "base" });
        }

        // For numbers or dates
        return sortConfig.direction === "ascending"
          ? valA - valB
          : valB - valA;
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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="z-10 sticky top-0 mb-4 bg-blue-950 p-4 rounded-sm">
            <h1 className="text-2xl text-blue-50 font-bold">Deleted Transaction</h1>
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
            <div className="flex flex-col w-full h-full gap-4 items-stretch">
              {Object.entries(configMap).map(([key, cfg]) => (
                <TabsContent key={key} value={key} className="h-full">
                  {/* Table */}
                    <Card className="w-full h-full flex flex-col overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto relative">
                      <CardContent className="p-0 overflow">
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
                          </div>

                      <div className="sticky top-[72px] z-10 bg-white">
                          <Table className="min-w-full">
                          <TableHeader className="sticky top-[72px] z-10 bg-white shadow-sm">
                              <TableRow>
                              {activeTab === "order" && (
                                <>
                                  <TableHead onClick={() => handleSort(config.idField)} className="cursor-pointer">
                                    Order ID <SortIcon column={config.idField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.codeField)} className="cursor-pointer">
                                    Product Code <SortIcon column={config.codeField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.receiptField)} className="cursor-pointer">
                                    Receipt Number <SortIcon column={config.receiptField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.nameField)} className="cursor-pointer">
                                    Product <SortIcon column={config.nameField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.totalamtField)} className="cursor-pointer">
                                    Order Total Amount <SortIcon column={config.totalamtField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.dateField)} className="cursor-pointer">
                                    Order Date <SortIcon column={config.dateField} />
                                  </TableHead>
                                  <TableHead>View Details</TableHead>
                                </>
                              )}
                              {activeTab === "return" && (
                                <>
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
                                  <TableHead>View Details</TableHead>
                                </>
                              )}
                              {activeTab === "delivery" && (
                                <>
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
                                  <TableHead>View Details</TableHead>
                                </>
                              )}
                              {activeTab === "product" && (
                                <>
                                  <TableHead onClick={() => handleSort(config.codeField)} className="cursor-pointer">
                                    Product Code <SortIcon column={config.codeField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.categoryField)} className="cursor-pointer">
                                    Category <SortIcon column={config.categoryField} />
                                  </TableHead>
                                  <TableHead onClick={() => handleSort(config.skuField)} className="cursor-pointer">
                                    SKU <SortIcon column={config.skuField} />
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
                                    <TableCell>{item[config.idField]}</TableCell>
                                    <TableCell>{item[config.codeField]}</TableCell>
                                    <TableCell>{item[config.receiptField]}</TableCell>
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
                                        <DialogContent className="w-[90vw] max-w-3xl sm:max-w-lg md:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
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
                                                <TableHead>Selling Price</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Item total</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              <TableRow>
                                                <TableCell>{item[config.codeField]}</TableCell>
                                                <TableCell>{item[config.supplierField]}</TableCell>
                                                <TableCell>{item[config.brandField]}</TableCell>
                                                <TableCell>{item[config.brandField]}</TableCell>
                                                <TableCell>{item[config.nameField]}</TableCell>
                                                <TableCell>{item[config.sellingpriceField]}</TableCell>
                                                <TableCell>{item[config.quantityField]}</TableCell>
                                                <TableCell>{item[config.itemtotalField]}</TableCell>
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                  </>
                                )}
                                {activeTab === "return" && (
                                  <>
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
                                  </>
                                )}
                                {activeTab === "delivery" && (
                                  <>
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
                                  </>
                                )}
                                {activeTab === "product" && (
                                    <>
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
