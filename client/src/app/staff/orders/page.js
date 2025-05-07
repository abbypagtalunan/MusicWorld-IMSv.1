"use client";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/staff-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Search, ListFilter, Trash2, Ellipsis } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

export default function OrdersPage() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);
  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  // Order and Order Details
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedOrderID, setSelectedOrderID] = useState(null);

  // Fetch Orders
  useEffect(() => {
    axios
      .get("http://localhost:8080/orders")
      .then((res) => {
        const mappedOrders = res.data.map((o) => ({
          orderID: o.O_orderID,
          receiptNo: o.O_receiptNumber,
          totalAmount: o.T_totalAmount,
          wholeOrderDiscount: o.D_wholeOrderDiscount,
          totalProductDiscount: o.D_totalProductDiscount,
          transacDate: o.T_transactionDate,
          orderPayment: o.O_orderPayment,
          isDel: o.isTemporarilyDeleted,
        }));
        setOrders(mappedOrders);
      })
      .catch((err) => console.error("Failed to fetch orders:", err));
  }, []);

  // Fetch Order Details
  useEffect(() => {
    axios
      .get("http://localhost:8080/orderDetails")
      .then((res) => {
        const mappedOrderDetails = res.data.map((o) => ({
          orderDetailID: o.OD_detailID,
          orderID: o.O_orderID,
          productCode: o.P_productCode,
          productName: o.P_productName,
          discountType: o.D_discountType,
          quantity: o.OD_quantity,
          unitPrice: o.OD_unitPrice,
          discountAmount: o.OD_discountAmount,
          itemTotal: o.OD_netSale,
          itemGross: o.OD_grossSale,
          itemGrossProfit: o.OD_grossProfit,
          brandName: o.B_brandName,
          supplierName: o.S_supplierName,
        }));
        setOrderDetails(mappedOrderDetails);
      })
      .catch((err) => console.error("Failed to fetch order details:", err));
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const pad = (n) => n.toString().padStart(2, "0");
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const paddedHours = hours.toString().padStart(2, "0");
    return `${paddedHours}:${minutes}:${seconds} ${ampm}`;
  };

  const formatPeso = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "₱0.00" : `₱${num.toFixed(2)}`;
  };

  // Delete
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminPW, setAdminPW] = useState("");
  const [isDDOpen, setDDOpen] = useState(false);

  const config = {
    order: {
      label: "Order",
      idField: "orderID",
      api: {
        fetch: "http://localhost:8080/orders",
        delete: "http://localhost:8080/orders", // URL for deleting orders
      },
    },
  };

  const handleDelete = (orderID) => {
    axios
      .delete(`${config.order.api.delete}/${orderID}`, {
        data: { adminPW },
      })
      .then((response) => {
        if (response.data.affectedRows > 0) {
          toast.success("Order deleted successfully");
          refreshTable();
          setDDOpen(false);
          setAdminPW("");
          setSelectedProduct(null);
        } else {
          toast.error("Order not found or already deleted");
        }
      })
      .catch((err) => {
        console.error("Delete error:", err.response?.data || err.message);
        if (err.response?.status === 403) {
          toast.error("Invalid admin password");
        } else {
          toast.error("Deletion failed: " + (err.response?.data?.message || err.message));
        }
        setDDOpen(false);
        setAdminPW("");
        setSelectedProduct(null);
      });
  };

  const refreshTable = () => {
    axios
      .get("http://localhost:8080/orders")
      .then((res) => {
        const mappedOrders = res.data.map((o) => ({
          orderID: o.O_orderID,
          receiptNo: o.O_receiptNumber,
          totalAmount: o.T_totalAmount,
          wholeOrderDiscount: o.D_wholeOrderDiscount,
          totalProductDiscount: o.D_totalProductDiscount,
          transacDate: o.T_transactionDate,
          orderPayment: o.O_orderPayment,
          isDel: o.isTemporarilyDeleted,
        }));
        setOrders(mappedOrders);
      })
      .catch((err) => console.error("Error fetching orders:", err));
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
                      <DropdownMenuSubTrigger>Transaction Type</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Transaction Type", "Sales")}>
                          Sales
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Transaction Type", "Return")}>
                          Return
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
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

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Date added</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Date added", "Low to High")}>
                          Low to High
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Date added", "High to Low")}>
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
            </div>
          </div>

          {/* TABLE */}
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
          <h1 className="text-gray-600 font-bold">Customer Orders</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Total Product Discount</TableHead>
                  <TableHead>Whole Order Discount</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {orders.map((order) => {
                  return (
                  <TableRow>
                    <TableCell>{order.orderID}</TableCell>
                    <TableCell>{formatDate(order.transacDate)}</TableCell>
                    <TableCell>{formatTime(order.transacDate)}</TableCell>
                    <TableCell>{order.receiptNo || "0"}</TableCell>
                    <TableCell>{formatPeso(order.totalAmount)}</TableCell>
                    <TableCell>{formatPeso(order.totalProductDiscount)}</TableCell>
                    <TableCell>{formatPeso(order.wholeOrderDiscount)}</TableCell>
                    <TableCell>{formatPeso(order.orderPayment)}</TableCell>

                {/*Details toggle button with modal pop-up */}              
                    <TableCell className="flex space-x-2">              
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" onClick={() => setSelectedOrderID(order.orderID)} >
                            <Ellipsis size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-full max-w-screen-lg sm:max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl max-h-[95vh] overflow-y-auto p-6">
                        <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          {orders ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Order Detail ID</TableHead>
                                <TableHead>Product Code</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Discount Type</TableHead>
                                <TableHead>Discount Amount</TableHead>
                                <TableHead>NET Sale</TableHead>
                                <TableHead>Gross Sale</TableHead>
                                <TableHead>Gross Profit</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                            {orderDetails
                              .filter((detail) => detail.orderID === selectedOrderID)
                              .map((detail) => (
                              <TableRow>
                                <TableCell>{detail.orderID}</TableCell>
                                <TableCell>{detail.orderDetailID}</TableCell>
                                <TableCell>{detail.productCode}</TableCell>
                                <TableCell>{detail.productName}</TableCell>
                                <TableCell>{detail.supplierName}</TableCell>
                                <TableCell>{detail.brandName}</TableCell>
                                <TableCell>{detail.unitPrice === 0.00 ? "Freebie" : formatPeso(detail.unitPrice)}</TableCell>
                                <TableCell>{detail.quantity}</TableCell>
                                <TableCell>{detail.discountType || "---"}</TableCell>
                                <TableCell>{formatPeso(detail.discountAmount)}</TableCell>
                                <TableCell>{formatPeso(detail.itemTotal)}</TableCell>
                                <TableCell>{formatPeso(detail.itemGross)}</TableCell>
                                <TableCell>{formatPeso(detail.itemGrossProfit)}</TableCell>
                            </TableRow>                            
                              ))}
                            </TableBody>
                          </Table>
                          ) : (
                            <p className="text-gray-500">Product details not found.</p>
                          )}
                        </DialogContent>
                      </Dialog>            

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => {
                          setSelectedProduct(order);
                          setDDOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
      <Toaster position="top-center" />
    </SidebarProvider>
  );
}
