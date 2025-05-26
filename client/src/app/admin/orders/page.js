"use client";
import { useEffect, useState, useMemo } from "react";
import { AppSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Search,
  ListFilter,
  Trash2,
  CalendarDays,
  Download,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import MinimumScreenGuard from "@/components/MinimumScreenGuard";

export default function OrdersPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);

  // Date filter states
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Order and Order Details
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedOrderID, setSelectedOrderID] = useState(null);

  // Return order states
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isReturnDialogOpen, setReturnDialogOpen] = useState(false);
  const [itemReturnReasons, setItemReturnReasons] = useState({});
  const [returnTypes, setReturnTypes] = useState([]);
  const [selectedReturnType, setSelectedReturnType] = useState("");

  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  // Client-side hydration fix
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // handleFilterSelect function
  const handleFilterSelect = (filter, subFilter) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  // Eye Toggle - Show Password
  const [showPassword, setShowPassword] = useState(false);

  // Return order handler functions:

  // for single or multiple selects
  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  // Row click handler 
  const handleRowClick = (transactionId, event) => {
    // Prevent row click when clicking directly on checkbox or input elements
    if (event.target.type === 'checkbox' || event.target.tagName === 'INPUT') {
      return;
    }
    handleSelectTransaction(transactionId);
  };

  // when selected all
  const handleSelectAll = () => {
    const currentOrderDetails = orderDetails.filter(
      (detail) => detail.orderID === selectedOrderID
    );
    const allTransactionIds = currentOrderDetails.map(
      (detail) => `${detail.orderID}-${detail.orderDetailID}`
    );

    if (
      selectedTransactions.length === allTransactionIds.length &&
      selectedTransactions.length > 0
    ) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(allTransactionIds);
    }
  };

  const getFilteredTransactions = () => {
    return orderDetails.filter((detail) => detail.orderID === selectedOrderID);
  };

  // Handle return with individual item reasons
  const handleReturnOrder = () => {
    if (selectedTransactions.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    if (!selectedReturnType) {
      toast.error("Please select a return type");
      return;
    }

    const missingReasons = selectedTransactions.filter((transactionId) =>
      !itemReturnReasons[transactionId]?.trim()
    );

    if (missingReasons.length > 0) {
      toast.error("Please provide a reason for all selected items");
      return;
    }

    const returnItems = selectedTransactions.map((transactionId) => {
      const [orderID, orderDetailID] = transactionId.split("-");
      const detail = orderDetails.find(
        (d) => d.orderDetailID.toString() === orderDetailID
      );

      return {
        P_productCode: detail.productCode,
        R_returnTypeID: parseInt(selectedReturnType),
        R_reasonOfReturn: itemReturnReasons[transactionId],
        R_dateOfReturn: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        R_returnQuantity: detail.quantity,
        R_discountAmount: detail.discountAmount || 0,
        R_TotalPrice: detail.itemTotal, 
        D_deliveryNumber: "1",
        S_supplierName: detail.supplierName
      };
    });

 axios
  .post("http://localhost:8080/returns", { returnItems })
  .then((response) => {
    toast.success("Returns processed successfully!");
    resetReturnDialog();

    // Get the current order details
    const currentDetails = [...orderDetails];

    // Extract orderDetailIDs of returned items
    const returnedDetailIDs = selectedTransactions.map(id => {
      const [_, detailId] = id.split("-");
      return parseInt(detailId);
    });

    // Filter out only the returned items
    const updatedOrderDetails = currentDetails.filter(
      detail => !returnedDetailIDs.includes(detail.orderDetailID)
    );

    // Update state to remove returned items
    setOrderDetails(updatedOrderDetails);

    // Optional: Check if there are no items left in the order
    const remainingItems = updatedOrderDetails.filter(
      detail => detail.orderID === selectedOrderID
    );

    if (remainingItems.length === 0) {
      // No items left, delete the order
      handleDelete(selectedOrderID, true, true);
    }

  })
  .catch((error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    toast.error(`Failed to process returns: ${errorMessage}`);
  });
  }

  const updateItemReturnReason = (transactionId, reason) => {
    let filtered = reason.replace(/[^a-zA-Z\s]/g, "");
    if (filtered.length > 50) {
      filtered = filtered.substring(0, 50);
    }
    setItemReturnReasons((prev) => ({
      ...prev,
      [transactionId]: filtered,
    }));
  };

  const resetReturnDialog = () => {
    setReturnDialogOpen(false);
    setItemReturnReasons({});
    setSelectedReturnType(""); // Reset after submission
  };

  // Amount filters
  const [amountRanges, setAmountRanges] = useState({
    totalAmount: { min: "", max: "" },
    totalProductDiscount: { min: "", max: "" },
    wholeOrderDiscount: { min: "", max: "" },
    originalTotal: { min: "", max: "" },
    payment: { min: "", max: "" },
  });

  const [amountErrors, setAmountErrors] = useState({
    totalAmount: false,
    totalProductDiscount: false,
    wholeOrderDiscount: false,
    originalTotal: false,
    payment: false,
  });

  const [aboveOnly, setAboveOnly] = useState({
    totalAmount: false,
    totalProductDiscount: false,
    wholeOrderDiscount: false,
    originalTotal: false,
    payment: false,
  });

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
          originalTotal: o.O_originalTotal,
          isDel: o.isTemporarilyDeleted,
        }));
        setOrders(mappedOrders);
        setFilteredOrders(mappedOrders);
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
          sellingPrice: o.OD_sellingPrice,
          discountAmount: o.OD_discountAmount,
          itemTotal: o.OD_netSale,
          itemGross: o.OD_grossSale,
          itemGrossProfit: o.OD_grossProfit,
          brandName: o.B_brandName,
          supplierName: o.S_supplierName,
          supplierID: o.S_supplierID,
        }));
        setOrderDetails(mappedOrderDetails);
      })
      .catch((err) =>
        console.error("Failed to fetch order details:", err)
      );
  }, []);

  // Fetch Return Types
  useEffect(() => {
    axios
      .get("http://localhost:8080/returnTypes")
      .then((res) => {
        const mappedReturnTypes = res.data.map((type) => ({
          id: type.RT_returnTypeID,
          name: type.RT_returnTypeDescription,
          description: type.RT_returnTypeDescription || "",
        }));
        setReturnTypes(mappedReturnTypes);
      })
      .catch((err) => console.error("Failed to fetch return types:", err));
  }, []);

  // Apply search and filters to orders
  useEffect(() => {
    let result = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderID.toString().toLowerCase().includes(query) ||
          (order.receiptNo !== null &&
            order.receiptNo !== undefined &&
            order.receiptNo.toString().toLowerCase().includes(query))
      );
    }

    if (fromDate || toDate) {
      const from = fromDate
        ? new Date(fromDate).setHours(0, 0, 0, 0)
        : null;
      const to = toDate
        ? new Date(toDate).setHours(23, 59, 59, 999)
        : null;

      result = result.filter((order) => {
        const transactionTime = new Date(order.transacDate).getTime();
        if (from && to) return transactionTime >= from && transactionTime <= to;
        if (from) return transactionTime >= from;
        if (to) return transactionTime <= to;
        return true;
      });
    }

    Object.entries(amountRanges).forEach(([key, range]) => {
      const min = parseFloat(range.min);
      const max = parseFloat(range.max);
      if (amountErrors[key]) return;

      result = result.filter((order) => {
        const value = parseFloat(order[key]);
        if (!isNaN(min) && !isNaN(max)) {
          return value >= min && value <= max;
        }
        if (!isNaN(min) && aboveOnly[key]) {
          return value >= min;
        }
        if (!isNaN(min)) {
          return value >= min;
        }
        if (!isNaN(max)) {
          return value <= max;
        }
        return true;
      });
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] ?? "";
        const valB = b[sortConfig.key] ?? "";
        const dateA = new Date(valA);
        const dateB = new Date(valB);

        if (!isNaN(dateA) && !isNaN(dateB)) {
          return sortConfig.direction === "ascending"
            ? dateA - dateB
            : dateB - dateA;
        }

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortConfig.direction === "ascending" ? numA - numB : numB - numA;
        }

        return sortConfig.direction === "ascending"
          ? valA.toString().localeCompare(valB.toString())
          : valB.toString().localeCompare(valA.toString());
      });
    }

    setFilteredOrders(result);
  }, [
    orders,
    searchQuery,
    selectedFilter,
    selectedSubFilter,
    fromDate,
    toDate,
    sortConfig,
    amountRanges,
    amountErrors,
  ]);

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

  function SortIcon({ column }) {
    if (sortConfig.key !== column)
      return <ChevronsUpDown className="inline ml-1 w-4 h-4 text-gray-400" />;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="inline ml-1 w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="inline ml-1 w-4 h-4 text-blue-500" />
    );
  }

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

  // Handle date range selection
  const handleFromDateChange = (date) => {
    setFromDate(date);
    if (toDate && date > toDate) {
      setToDate(null);
    }
  };

  const handleToDateChange = (date) => {
    if (!fromDate || date >= fromDate) {
      setToDate(date);
    }
  };

  // Delete Transaction
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminPW, setAdminPW] = useState("");
  const [isDDOpen, setDDOpen] = useState(false);

 const handleDelete = (orderID, bypassPassword = false) => {
  const url = bypassPassword 
    ? `http://localhost:8080/orders/${orderID}?bypassPassword=true`
    : `http://localhost:8080/orders/${orderID}`;

  axios
    .delete(url, { data: bypassPassword ? {} : { adminPW } }) // Only send adminPW if needed
    .then((response) => {
      if (!bypassPassword) {
        toast.success("Item deleted successfully");
      }
      refreshTable();
      setDDOpen(false);
      setAdminPW("");
      setSelectedOrderID([]);
    })
    .catch((err) => {
      if (err.response?.status === 403) {
        toast.error("Invalid admin password");
      } else {
        toast.error(
          "Deletion failed: " +
            (err.response?.data?.message || err.message)
        );
      }
      setDDOpen(false);
      setAdminPW("");
      setSelectedOrderID([]);
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
          originalTotal: o.O_originalTotal,
          isDel: o.isTemporarilyDeleted,
        }));
        setOrders(mappedOrders);
      })
      .catch((err) => console.error("Error fetching orders:", err));

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
          sellingPrice: o.OD_sellingPrice,
          discountAmount: o.OD_discountAmount,
          itemTotal: o.OD_netSale,
          itemGross: o.OD_grossSale,
          itemGrossProfit: o.OD_grossProfit,
          brandName: o.B_brandName,
          supplierName: o.S_supplierName,
          supplierID: o.S_supplierID,
        }));
        setOrderDetails(mappedOrderDetails);
      })
      .catch((err) =>
        console.error("Failed to fetch order details:", err)
      );
  };

  // Download CSV
  const [isDownloadConfirmOpen, setDownloadConfirmOpen] = useState("");
  const handleDownloadCSV = () => {
    const now = new Date();
    const phLocale = "en-PH";
    const phTimeZone = "Asia/Manila";
    const formattedDate = now
      .toLocaleString(phLocale, { timeZone: phTimeZone })
      .replace(/[/:, ]/g, "-")
      .replace(/--+/g, "-");

    const downloadTimestamp = `Downloaded At:, "${now.toLocaleString(phLocale, {
      timeZone: phTimeZone,
    })}"`;

    const headers = [
      "Receipt Number",
      "Order ID",
      "Transaction Date",
      "Order Payment",
      "Total Amount",
      "Whole Order Discount",
      "Total Product Discount",
      "Original Total Amount",
      "Product Name",
      "Product Code",
      "Brand",
      "Supplier",
      "Quantity",
      "Unit Price",
      "Selling Price",
      "Discount Type",
      "Discount Amount",
      "Item Gross Sale",
      "Item Net Sale",
      "Item Gross Profit",
    ];

    const rows = [];

    filteredOrders.forEach((order) => {
      const detailsForOrder = orderDetails.filter(
        (detail) => detail.orderID === order.orderID
      );

      if (detailsForOrder.length === 0) {
        rows.push([
          order.receiptNo,
        order.orderID,
        order.transacDate,
        order.orderPayment,
        order.totalAmount,
        order.wholeOrderDiscount,
        order.totalProductDiscount,
        "", "", "", "", "", "", "", "", "", "", "", ""
        ]);
      } else {
        detailsForOrder.forEach((detail) => {
          rows.push([
            order.receiptNo,
            order.orderID,
            order.transacDate,
            order.orderPayment,
            order.totalAmount,
            order.wholeOrderDiscount,
            order.totalProductDiscount,
            order.originalTotal,
            detail.productName,
            detail.productCode,
            detail.brandName,
            detail.supplierName,
            detail.quantity,
            detail.unitPrice,
            "",
            detail.discountType,
            detail.discountAmount,
            detail.itemGross,
            detail.itemTotal,
            detail.itemGrossProfit,
          ]);
        });
      }
    });

    const csvContent = [
      downloadTimestamp,
      headers.join(","),
      ...rows.map((row) =>
        row.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Orders_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <MinimumScreenGuard>
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col overflow-x-hidden">
          {/* Your full table and dialog JSX here */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4 bg-white shadow-sm p-4 rounded-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search order id, receipt number"
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <Search className="w-5 h-5" />
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4" />
                    <span>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Original Amount</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-4 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min ₱"
                          type="number"
                          value={amountRanges.originalTotal.min}
                          onChange={(e) => {
                            const newMin = e.target.value;
                            const max = amountRanges.originalTotal.max;
                            setAmountRanges((prev) => ({
                              ...prev,
                              originalTotal: { ...prev.originalTotal, min: newMin },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              originalTotal: max && parseFloat(newMin) > parseFloat(max),
                            }));
                          }}
                          className={
                            amountErrors.originalTotal ? "border-red-500" : ""
                          }
                        />
                        <Input
                          placeholder="Max ₱"
                          type="number"
                          value={amountRanges.originalTotal.max}
                          onChange={(e) => {
                            const newMax = e.target.value;
                            const min = amountRanges.originalTotal.min;
                            setAmountRanges((prev) => ({
                              ...prev,
                              originalTotal: { ...prev.originalTotal, max: newMax },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              originalTotal: min && parseFloat(min) > parseFloat(newMax),
                            }));
                          }}
                          className={
                            amountErrors.originalTotal ? "border-red-500" : ""
                          }
                        />
                      </div>
                      {amountErrors.originalTotal && (
                        <p className="text-red-500 text-sm">
                          Min cannot be greater than Max.
                        </p>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Total Product Discount</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-4 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min ₱"
                          type="number"
                          value={amountRanges.totalProductDiscount.min}
                          onChange={(e) => {
                            const newMin = e.target.value;
                            const max = amountRanges.totalProductDiscount.max;
                            setAmountRanges((prev) => ({
                              ...prev,
                              totalProductDiscount: {
                                ...prev.totalProductDiscount,
                                min: newMin,
                              },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              totalProductDiscount:
                                max && parseFloat(newMin) > parseFloat(max),
                            }));
                          }}
                          className={
                            amountErrors.totalProductDiscount
                              ? "border-red-500"
                              : ""
                          }
                        />
                        <Input
                          placeholder="Max ₱"
                          type="number"
                          value={amountRanges.totalProductDiscount.max}
                          onChange={(e) => {
                            const newMax = e.target.value;
                            const min = amountRanges.totalProductDiscount.min;
                            setAmountRanges((prev) => ({
                              ...prev,
                              totalProductDiscount: {
                                ...prev.totalProductDiscount,
                                max: newMax,
                              },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              totalProductDiscount:
                                min && parseFloat(min) > parseFloat(newMax),
                            }));
                          }}
                          className={
                            amountErrors.totalProductDiscount
                              ? "border-red-500"
                              : ""
                          }
                        />
                      </div>
                      {amountErrors.totalProductDiscount && (
                        <p className="text-red-500 text-sm">
                          Min cannot be greater than Max.
                        </p>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Whole Order Discount</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-4 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min ₱"
                          type="number"
                          value={amountRanges.wholeOrderDiscount.min}
                          onChange={(e) => {
                            const newMin = e.target.value;
                            const max = amountRanges.wholeOrderDiscount.max;
                            setAmountRanges((prev) => ({
                              ...prev,
                              wholeOrderDiscount: {
                                ...prev.wholeOrderDiscount,
                                min: newMin,
                              },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              wholeOrderDiscount:
                                max && parseFloat(newMin) > parseFloat(max),
                            }));
                          }}
                          className={
                            amountErrors.wholeOrderDiscount
                              ? "border-red-500"
                              : ""
                          }
                        />
                        <Input
                          placeholder="Max ₱"
                          type="number"
                          value={amountRanges.wholeOrderDiscount.max}
                          onChange={(e) => {
                            const newMax = e.target.value;
                            const min = amountRanges.wholeOrderDiscount.min;
                            setAmountRanges((prev) => ({
                              ...prev,
                              wholeOrderDiscount: {
                                ...prev.wholeOrderDiscount,
                                max: newMax,
                              },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              wholeOrderDiscount:
                                min && parseFloat(min) > parseFloat(newMax),
                            }));
                          }}
                          className={
                            amountErrors.wholeOrderDiscount
                              ? "border-red-500"
                              : ""
                          }
                        />
                      </div>
                      {amountErrors.wholeOrderDiscount && (
                        <p className="text-red-500 text-sm">
                          Min cannot be greater than Max.
                        </p>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Payment</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-4 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min ₱"
                          type="number"
                          value={amountRanges.payment.min}
                          onChange={(e) => {
                            const newMin = e.target.value;
                            const max = amountRanges.payment.max;
                            setAmountRanges((prev) => ({
                              ...prev,
                              payment: { ...prev.payment, min: newMin },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              payment: max && parseFloat(newMin) > parseFloat(max),
                            }));
                          }}
                          className={amountErrors.payment ? "border-red-500" : ""}
                        />
                        <Input
                          placeholder="Max ₱"
                          type="number"
                          value={amountRanges.payment.max}
                          onChange={(e) => {
                            const newMax = e.target.value;
                            const min = amountRanges.payment.min;
                            setAmountRanges((prev) => ({
                              ...prev,
                              payment: { ...prev.payment, max: newMax },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              payment: min && parseFloat(min) > parseFloat(newMax),
                            }));
                          }}
                          className={amountErrors.payment ? "border-red-500" : ""}
                        />
                      </div>
                      {amountErrors.payment && (
                        <p className="text-red-500 text-sm">
                          Min cannot be greater than Max.
                        </p>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Total Amount</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-4 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min ₱"
                          type="number"
                          value={amountRanges.totalAmount.min}
                          onChange={(e) => {
                            const newMin = e.target.value;
                            const max = amountRanges.totalAmount.max;
                            setAmountRanges((prev) => ({
                              ...prev,
                              totalAmount: { ...prev.totalAmount, min: newMin },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              totalAmount:
                                max && parseFloat(newMin) > parseFloat(max),
                            }));
                          }}
                          className={
                            amountErrors.totalAmount ? "border-red-500" : ""
                          }
                        />
                        <Input
                          placeholder="Max ₱"
                          type="number"
                          value={amountRanges.totalAmount.max}
                          onChange={(e) => {
                            const newMax = e.target.value;
                            const min = amountRanges.totalAmount.min;
                            setAmountRanges((prev) => ({
                              ...prev,
                              totalAmount: { ...prev.totalAmount, max: newMax },
                            }));
                            setAmountErrors((prev) => ({
                              ...prev,
                              totalAmount:
                                min && parseFloat(min) > parseFloat(newMax),
                            }));
                          }}
                          className={
                            amountErrors.totalAmount ? "border-red-500" : ""
                          }
                        />
                      </div>
                      {amountErrors.totalAmount && (
                        <p className="text-red-500 text-sm">
                          Min cannot be greater than Max.
                        </p>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex items-center gap-2 w-[150px] border rounded-md font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {fromDate
                      ? format(fromDate, "MMM dd, yyyy")
                      : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fromDate}
                    onSelect={handleFromDateChange}
                    initialFocus
                  />
                  {fromDate && (
                    <div className="p-2 border-t flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFromDate(null)}
                        className="text-red-500"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex items-center gap-2 w-[150px] border rounded-md font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "MMM dd, yyyy") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={toDate}
                    onSelect={handleToDateChange}
                    initialFocus
                    disabled={(date) => fromDate && date < fromDate}
                  />
                  {toDate && (
                    <div className="p-2 border-t flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setToDate(null)}
                        className="text-red-500"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
                className="text-sm border-gray-300 hover:text-red-600"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                <span>Reset Date</span>
              </Button>
            </div>

            {/* DOWNLOAD BUTTON */}
            <div className="flex justify-end">
              <Dialog
                open={isDownloadConfirmOpen}
                onOpenChange={(open) => {
                  setDownloadConfirmOpen(open);
                }}
              >
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
                        (Orders.csv)
                      </span>
                    </DialogTitle>
                    <DialogClose />
                  </DialogHeader>
                  <p className="text-medium text-gray-800 mt-2 pl-4">
                    You are about to download the Orders.csv file. Click below to proceed.
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
            </div>
          </div>

          {/* TABLE */}
          <h1 className="text-2xl mb-4 p-4 rounded-sm text-blue-50 bg-blue-950 font-bold">
            Customer Orders
          </h1>

          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm border-b">
                <TableRow>
                  <TableHead
                    onClick={() => handleSort("orderID")}
                    className="cursor-pointer select-none"
                  >
                    {" "}
                    Order ID{" "}
                    <SortIcon column="orderID" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("transacDate")}
                    className="cursor-pointer select-none"
                  >
                    {" "}
                    Date{" "}
                    <SortIcon column="transacDate" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("transacDate")}
                    className="cursor-pointer select-none"
                  >
                    {" "}
                    Time{" "}
                    <SortIcon column="transacDate" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("receiptNo")}
                    className="cursor-pointer select-none"
                  >
                    {" "}
                    Receipt Number{" "}
                    <SortIcon column="receiptNo" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("originalTotal")}
                    className="cursor-pointer select-none"
                  >
                    Original Total{" "}
                    <SortIcon column="originalTotal" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("totalProductDiscount")}
                    className="cursor-pointer select-none"
                  >
                    {" "}
                    Total Product Discount{" "}
                    <SortIcon column="totalProductDiscount" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("wholeOrderDiscount")}
                    className="cursor-pointer select-none"
                  >
                    {" "}
                    Whole Order Discount{" "}
                    <SortIcon column="wholeOrderDiscount" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("orderPayment")}
                    className="cursor-pointer select-none"
                  >
                    {" "}
                    Payment{" "}
                    <SortIcon column="orderPayment" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("totalAmount")}
                    className="cursor-pointer select-none"
                  >
                    {" "}
                    Total Amount{" "}
                    <SortIcon column="totalAmount" />
                  </TableHead>
                  <TableHead>Manage</TableHead>
                  <TableHead>Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  return (
                    <TableRow key={order.orderID}>
                      <TableCell>{order.orderID}</TableCell>
                      <TableCell>{formatDate(order.transacDate)}</TableCell>
                      <TableCell>{formatTime(order.transacDate)}</TableCell>
                      <TableCell>{order.receiptNo || "0"}</TableCell>
                      <TableCell>{formatPeso(order.originalTotal)}</TableCell>
                      <TableCell>{formatPeso(order.totalProductDiscount)}</TableCell>
                      <TableCell>{formatPeso(order.wholeOrderDiscount)}</TableCell>
                      <TableCell>{formatPeso(order.orderPayment)}</TableCell>
                      <TableCell>{formatPeso(order.totalAmount)}</TableCell>
                      {/* View/Return toggle button with modal pop-up */}{" "}
                      <TableCell className="flex justify-center items-center">
                        <Dialog
                          onOpenChange={(open) => {
                            if (!open) {
                              // Reset selection when dialog closes
                              setSelectedTransactions([]);
                              setSelectedOrderID(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-900 hover:text-white hover:bg-blue-900 border-blue-900 transition-colors duration-200 flex items-center gap-2"
                              onClick={() => setSelectedOrderID(order.orderID)}
                            >
                              <span className="hidden sm:inline">View/Return</span>
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
                                    {/* checkbox select ALL function for customer returns */}
                                    <TableHead className="sticky top-0 z-10 bg-white">
                                      <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={
                                          selectedTransactions.length ===
                                            getFilteredTransactions().length &&
                                          selectedTransactions.length > 0
                                        }
                                      />
                                    </TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Order Detail ID</TableHead>
                                    <TableHead>Product Code</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Selling Price</TableHead>
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
                                    .filter(
                                      (detail) => detail.orderID === selectedOrderID
                                    )
                                    .map((detail) => {
                                      const transactionId = `${detail.orderID}-${detail.orderDetailID}`;
                                      const isSelected = selectedTransactions.includes(transactionId);
                                      
                                      return (
                                        // Enhanced clickable row
                                        <TableRow 
                                          key={detail.orderDetailID}
                                          onClick={(e) => handleRowClick(transactionId, e)}
                                          className={cn(
                                            "cursor-pointer transition-all duration-200 select-none",
                                            isSelected 
                                              ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm" 
                                              : "hover:bg-gray-50 hover:shadow-sm"
                                          )}
                                        >
                                          <TableCell>
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() => handleSelectTransaction(transactionId)}
                                              className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                          </TableCell>
                                          <TableCell className="font-medium">{detail.orderID}</TableCell>
                                          <TableCell>{detail.orderDetailID}</TableCell>
                                          <TableCell className="font-mono text-sm">{detail.productCode}</TableCell>
                                          <TableCell className="font-medium">{detail.productName}</TableCell>
                                          <TableCell>{detail.supplierName}</TableCell>
                                          <TableCell>{detail.brandName}</TableCell>
                                          <TableCell className="font-medium"> {formatPeso(detail.unitPrice)}
                                          </TableCell>
                                          <TableCell className="font-medium">
                                            {detail.sellingPrice == 0.00
                                              ? <span className="text-green-600 font-semibold">Freebie</span>
                                              : formatPeso(detail.sellingPrice)}
                                          </TableCell>
                                          <TableCell className="text-center font-medium">{detail.quantity}</TableCell>
                                          <TableCell>{detail.discountType || <span className="text-gray-400">---</span>}</TableCell>
                                          <TableCell>{formatPeso(detail.discountAmount)}</TableCell>
                                          <TableCell className="font-medium">{formatPeso(detail.itemTotal)}</TableCell>
                                          <TableCell>{formatPeso(detail.itemGross)}</TableCell>
                                          <TableCell className="font-medium">{formatPeso(detail.itemGrossProfit)}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-gray-500">
                                Product details not found.
                              </p>
                            )}
                            {/* Return items function */}
                            <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600">
                                {selectedTransactions.length > 0 ? (
                                  <span className="font-medium text-blue-600">
                                    {selectedTransactions.length} item(s) selected for return
                                  </span>
                                ) : (
                                  <span className="text-gray-500">
                                    Click on rows or checkboxes to select items for return
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                className="bg-indigo-500 hover:bg-indigo-700 hover:text-white text-white transition-colors duration-200"
                                onClick={() => {
                                  setItemReturnReasons("");
                                  setReturnDialogOpen(true);
                                }}
                                disabled={selectedTransactions.length === 0}
                              >
                                Return Selected Items
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      {/* For delete button */}
                      <TableCell>
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

            {/* Return Dialog */}
            <Dialog
              open={isReturnDialogOpen}
              onOpenChange={(open) => {
                if (!open) resetReturnDialog();
                setReturnDialogOpen(open);
              }}
            >
              <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                  <DialogTitle>
                    <span className="text-lg text-indigo-900">
                      Return Order Items
                    </span>
                    <span className="text-lg text-gray-400 font-normal italic ml-2">
                      ({selectedTransactions.length} item/s)
                    </span>
                  </DialogTitle>
                  <DialogClose />
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-800">
                    You are about to return{" "}
                    <strong>{selectedTransactions.length}</strong> item/s from{" "}
                    <strong>Order ID: {selectedOrderID}</strong>
                  </p>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Return Type *
                    </label>
                   <select
                    className="w-full p-2 border rounded text-sm"
                    value={selectedReturnType}
                    onChange={(e) => setSelectedReturnType(e.target.value)}
                    required
                  >
                    <option value="">-- Select Return Type --</option>
                    {returnTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name === type.description
                          ? type.name 
                          : `${type.name} (${type.description})`}
                      </option>
                    ))}
                  </select>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm mb-2">
                      Return Reasons for Each Item:
                    </h4>
                    <div className="max-h-96 overflow-y-auto space-y-4 border rounded p-4">
                      {selectedTransactions.map((transactionId) => {
                        const [orderID, orderDetailID] = transactionId.split("-");
                        const detail = orderDetails.find(
                          (d) =>
                            d.orderDetailID.toString() === orderDetailID
                        );
                        return (
                          <div
                            key={transactionId}
                            className="border-b pb-4 last:border-b-0"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-800">
                                  {detail?.productName}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Detail ID: {detail?.orderDetailID} | Code:{" "}
                                  {detail?.productCode} | Qty: {detail?.quantity}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Price:{" "}
                                  {detail?.unitPrice === 0.0
                                    ? "Freebie"
                                    : formatPeso(detail?.unitPrice)}{" "}
                                  | Brand: {detail?.brandName} | Supplier:{" "}
                                  {detail?.supplierName}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <label className="text-sm font-medium text-red-600 block mb-1">
                                Return Reason *
                              </label>
                              <Input
                                required
                                type="text"
                                placeholder="Provide a reason for returning this item..."
                                className="w-full p-2 border rounded text-sm"
                                value={itemReturnReasons[transactionId] || ""}
                                onChange={(e) =>
                                  updateItemReturnReason(
                                    transactionId,
                                    e.target.value
                                  )
                                }
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {(itemReturnReasons[transactionId] || "").length}/50 characters
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-3">
                  <Button variant="outline" onClick={resetReturnDialog}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    onClick={handleReturnOrder}
                    disabled={
                      selectedTransactions.length === 0 ||
                      !selectedReturnType ||
                      selectedTransactions.some(
                        (id) => !itemReturnReasons[id]?.trim()
                      )
                    }
                  >
                    Process Return ({selectedTransactions.length} items)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
              open={isDDOpen}
              onOpenChange={(open) => {
                setDDOpen(open);
                if (!open) setAdminPW("");
              }}
            >
              <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                  <DialogTitle>
                    <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                    <span className="text-lg text-gray-400 font-normal italic">
                      {selectedProduct?.orderID}
                    </span>
                  </DialogTitle>
                  <DialogClose />
                </DialogHeader>
                <p className="text-sm text-gray-800 mt-2 pl-4">
                  Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction.
                </p>
                <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
                  <div className="w-full">
                    <label className="text-base font-medium text-gray-700 block mb-2">
                      Admin Password
                    </label>
                    <div className="relative w-full">
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter valid password"
                        className="w-full pr-10"
                        value={adminPW}
                        onChange={(e) => setAdminPW(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                    onClick={() => handleDelete(selectedProduct?.orderID)}
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
    </MinimumScreenGuard>
  );
}