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
import { Search, Ellipsis, X } from "lucide-react";
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

  // Search  
  const getFilteredTransactions = () => {
    let sortedTransactions = [...getCurrentTabData()];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      sortedTransactions = sortedTransactions.filter(item => {

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
    return sortedTransactions;
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
                          </div>

                      <div className="sticky top-[72px] z-10 bg-white">
                          <Table className="min-w-full">
                          <TableHeader className="sticky top-[72px] z-10 bg-white shadow-sm">
                              <TableRow>
                              {activeTab === "order" && (
                                <>
                                  <TableHead>Order ID</TableHead>
                                  <TableHead>Product Code</TableHead>
                                  <TableHead>Receipt Number</TableHead>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Order Total Amount</TableHead>
                                  <TableHead>Order Date</TableHead>
                                  <TableHead>Details</TableHead>
                                </>
                              )}
                              {activeTab === "return" && (
                                <>
                                  <TableHead>Return ID</TableHead>
                                  <TableHead>Product Code</TableHead>
                                  <TableHead>Reason of Return</TableHead>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Return Total Amount</TableHead>
                                  <TableHead>Return Date</TableHead>
                                  <TableHead>Details</TableHead>
                                </>
                              )}
                              {activeTab === "delivery" && (
                                <>
                                  <TableHead>Delivery ID</TableHead>
                                  <TableHead>Product Code</TableHead>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Supplier</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Delivery date</TableHead>
                                  <TableHead>Details</TableHead>
                                </>
                              )}
                              {activeTab === "product" && (
                                <>
                                  <TableHead>Product Code</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Brand</TableHead>
                                  <TableHead>Supplier</TableHead>
                                  <TableHead>Stock amount</TableHead>
                                  <TableHead>Unit Price</TableHead>
                                  <TableHead>Selling Price</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Date added</TableHead>
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
                                            <Ellipsis size={16} />
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
                                            <Ellipsis size={16} />
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
