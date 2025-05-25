"use client";

import React, { useState, useEffect, act } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/staff-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Eye, X, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

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
      idField: "P_productCode",
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
      idField: "P_productCode",
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
      idField: "P_productCode",
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
      label: "Product",
      idField: "P_productCode",
      categoryField: "category",
      nameField: "P_productName",
      brandField: "brand",
      supplierField: "supplier",
      stockField: "stock",
      lastRestockField: "P_lastRestockDateTime",
      lastUpdateField: "P_lastEditedDateTime",
      unitpriceField: "P_unitPrice",
      sellingpriceField: "P_sellingPrice",
      statusField: "status",
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
    setCurrentPage(1);
  }, [activeTab]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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

  // Search and filter logic
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
              String(item[config.nameField] || '').toLowerCase().includes(search),
              String(item[config.idField] || '').toLowerCase().includes(search)
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
              String(item[config.idField] || '').toLowerCase().includes(search),
              String(item[config.nameField] || '').toLowerCase().includes(search),
              String(item[config.supplierField] || '').toLowerCase().includes(search)
            );
            break;
          case "product":
            matches.push(
              String(item[config.idField] || '').toLowerCase().includes(search),
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

  // Pagination logic functions
  const getPaginatedData = () => {
    const filteredData = getFilteredTransactions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredTransactions().length / itemsPerPage);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedTransactions([]);
    setCurrentPage(1); // Reset to first page
  };
   
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="z-10 sticky top-0 mb-4 bg-blue-950 p-4 rounded-sm">
            <h1 className="text-2xl text-blue-50 font-bold">Deleted Transaction</h1>
          </div>

          <Tabs defaultValue="order" onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full flex justify-start bg-white rounded-md shadow-md px-6 py-3 space-x-4 flex-shrink-0 h-16">
              {Object.entries(configMap).map(([key, cfg]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:text-indigo-600 h-10"
                >
                  {`${cfg.label.toUpperCase()}`}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 flex flex-col overflow-hidden">
              {Object.entries(configMap).map(([key, cfg]) => (
                <TabsContent key={key} value={key} className="flex-1 flex-col overflow-hidden m-0 data-[state=active]:flex data-[state=inactive]:hidden">
                  <Card className="w-full flex-1 flex flex-col overflow-hidden">
                    <div className="p-0 flex-1 flex flex-col overflow-hidden min-h-0">
                      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden min-h-0">
                        {/* Search - Fixed height */}
                        <div className="bg-white p-4 flex justify-between items-center border-b flex-shrink-0">
                          <div className="relative w-80">
                            <Input
                              type="text"
                              placeholder={`Search ${config.label}...`}
                              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={searchTerm}
                              onChange={handleSearchChange}
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
                                  setCurrentPage(1);
                                }}
                              >
                                <X className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Table Container - Flexible height with sticky headers */}
                        <div className="flex-1 overflow-hidden relative min-h-0">
                          <div className="h-full overflow-y-auto overflow-x-auto">
                            <Table className="min-w-full w-full relative">
                              <TableHeader className="sticky top-0 z-30 bg-white shadow-md border-b-2 border-gray-200">
                                <TableRow className="bg-white">
                                  {activeTab === "order" && (
                                    <>
                                      <TableHead onClick={() => handleSort(config.idField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Order ID <SortIcon column={config.idField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.idField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Product Code <SortIcon column={config.idField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.receiptField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Receipt Number <SortIcon column={config.receiptField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.nameField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Product <SortIcon column={config.nameField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.totalamtField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Order Total Amount <SortIcon column={config.totalamtField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.dateField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Order Date <SortIcon column={config.dateField} />
                                      </TableHead>
                                      <TableHead className="sticky top-0 z-30 bg-white px-4 py-3 font-semibold text-gray-900">View Details</TableHead>
                                    </>
                                  )}
                                  {activeTab === "return" && (
                                    <>
                                      <TableHead onClick={() => handleSort(config.idField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Return ID <SortIcon column={config.idField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.idField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Product Code <SortIcon column={config.idField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.typeField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Reason of Return <SortIcon column={config.typeField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.nameField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Product <SortIcon column={config.nameField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.totalamtField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Return Total Amount <SortIcon column={config.totalamtField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.dateField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Return Date <SortIcon column={config.dateField} />
                                      </TableHead>
                                      <TableHead className="sticky top-0 z-30 bg-white px-4 py-3 font-semibold text-gray-900">View Details</TableHead>
                                    </>
                                  )}
                                  {activeTab === "delivery" && (
                                    <>
                                      <TableHead onClick={() => handleSort(config.idField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Delivery ID <SortIcon column={config.idField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.idField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Product Code <SortIcon column={config.idField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.nameField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Product <SortIcon column={config.nameField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.supplierField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Supplier <SortIcon column={config.supplierField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.quantityField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Quantity <SortIcon column={config.quantityField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.dateField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Delivery Date <SortIcon column={config.dateField} />
                                      </TableHead>
                                      <TableHead className="sticky top-0 z-30 bg-white px-4 py-3 font-semibold text-gray-900">View Details</TableHead>
                                    </>
                                  )}
                                  {activeTab === "product" && (
                                    <>
                                      <TableHead onClick={() => handleSort(config.idField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Product Code <SortIcon column={config.idField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.categoryField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Category <SortIcon column={config.categoryField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.nameField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Name <SortIcon column={config.nameField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.brandField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Brand <SortIcon column={config.brandField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.supplierField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Supplier <SortIcon column={config.supplierField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.stockField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Stock Amount <SortIcon column={config.stockField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.unitpriceField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Unit Price <SortIcon column={config.unitpriceField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.sellingpriceField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Selling Price <SortIcon column={config.sellingpriceField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.statusField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Status <SortIcon column={config.statusField} />
                                      </TableHead>
                                      <TableHead onClick={() => handleSort(config.dateField)} className="sticky top-0 z-30 bg-white cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50">
                                        Date Added <SortIcon column={config.dateField} />
                                      </TableHead>
                                    </>
                                  )}
                                </TableRow>
                              </TableHeader>
                              
                              <TableBody>
                                {getPaginatedData().length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={activeTab === "product" ? 11 : (activeTab === "order" ? 7 : (activeTab === "return" ? 7 : 7))} className="text-center py-8">
                                      No deleted transactions found.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  getPaginatedData().map((item, index) => (
                                    <TableRow key={index} className="hover:bg-gray-50">
                                      {activeTab === "order" && (
                                        <>
                                          <TableCell className="px-4 py-3">{item[config.idField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.idField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.receiptField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.nameField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.totalamtField]}</TableCell>
                                          <TableCell className="px-4 py-3">{new Date(item[config.dateField]).toLocaleDateString()}</TableCell>
                                          <TableCell className="px-4 py-3">
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
                                                      <TableCell>{item[config.idField]}</TableCell>
                                                      <TableCell>{item[config.supplierField]}</TableCell>
                                                      <TableCell>{item[config.brandField]}</TableCell>
                                                      <TableCell>{item[config.categoryField]}</TableCell>
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
                                          <TableCell className="px-4 py-3">{item[config.idField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.idField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.typeField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.nameField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.totalamtField]}</TableCell>
                                          <TableCell className="px-4 py-3">{new Date(item[config.dateField]).toLocaleDateString()}</TableCell>
                                          <TableCell className="px-4 py-3">
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                                  <Eye size={16} />
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="w-[90vw] max-w-3xl sm:max-w-lg md:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                                                <DialogHeader>
                                                  <DialogTitle>Return Details</DialogTitle>
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
                                                      <TableCell>{item[config.idField]}</TableCell>
                                                      <TableCell>{item[config.supplierField]}</TableCell>
                                                      <TableCell>{item[config.brandField]}</TableCell>
                                                      <TableCell>{item[config.categoryField]}</TableCell>
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
                                          <TableCell className="px-4 py-3">{item[config.idField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.idField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.nameField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.supplierField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.quantityField]}</TableCell>
                                          <TableCell className="px-4 py-3">{new Date(item[config.dateField]).toLocaleDateString()}</TableCell>
                                          <TableCell className="px-4 py-3">
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                                  <Eye size={16} />
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="w-[90vw] max-w-3xl sm:max-w-lg md:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                                                <DialogHeader>
                                                  <DialogTitle>Delivery Details</DialogTitle>
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
                                                      <TableCell>{item[config.idField]}</TableCell>
                                                      <TableCell>{item[config.supplierField]}</TableCell>
                                                      <TableCell>{item[config.brandField]}</TableCell>
                                                      <TableCell>{item[config.categoryField]}</TableCell>
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
                                          <TableCell className="px-4 py-3">{item[config.idField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.categoryField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.nameField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.brandField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.supplierField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.stockField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.unitpriceField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.sellingpriceField]}</TableCell>
                                          <TableCell className="px-4 py-3">{item[config.statusField]}</TableCell>
                                          <TableCell className="px-4 py-3">{new Date(item[config.dateField]).toLocaleDateString()}</TableCell>
                                        </>
                                      )}
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex-shrink-0 bg-white border-t px-4 py-3 flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Showing {getPaginatedData().length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, getFilteredTransactions().length)} of {getFilteredTransactions().length} results
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPreviousPage}
                              disabled={currentPage === 1}
                              className="px-3 py-1"
                            >
                              Previous
                            </Button>
                            
                            <div className="flex space-x-1">
                              {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                                .filter(page => {
                                  // Show first page, last page, current page, and pages around current
                                  return page === 1 || 
                                        page === getTotalPages() || 
                                        Math.abs(page - currentPage) <= 1;
                                })
                                .map((page, index, arr) => {
                                  // Add ellipsis if there's a gap
                                  const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                                  return (
                                    <React.Fragment key={page}>
                                      {showEllipsis && (
                                        <span className="px-2 py-1 text-gray-500">...</span>
                                      )}
                                      <Button
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-1 ${currentPage === page ? 'bg-blue-500 text-white' : ''}`}
                                      >
                                        {page}
                                      </Button>
                                    </React.Fragment>
                                  );
                                })}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextPage}
                              disabled={currentPage === getTotalPages()}
                              className="px-3 py-1"
                            >
                              Next
                            </Button>
                          </div>
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