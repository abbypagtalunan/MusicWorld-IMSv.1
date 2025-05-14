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
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { CalendarDays, Download, ChevronsUpDown, ChevronUp, ChevronDown} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

export default function ReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [selectedOrderID, setSelectedOrderID] = useState(null);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/orderDetails/reports")
      .then((res) => {
        const mappedData = res.data.map((r) => ({
          orderID: r.O_orderID,
          receiptNumber: r.O_receiptNumber,
          transactionDate: r.T_transactionDate,
          detailID: r.OD_detailID,
          productCode: r.P_productCode,
          productName: r.P_productName,
          discountAmount: r.OD_discountAmount,
          netSale: r.OD_netSale,
          grossSale: r.OD_grossSale,
          grossProfit: r.OD_grossProfit,
          brandName: r.B_brandName,
          supplierName: r.S_supplierName,
        }));
        setReportData(mappedData);
      })
      .catch((err) => {
        console.error("Failed to fetch reports:", err);
      });
  }, []);

  const filteredData = useMemo(() => {
    return reportData.filter((item) => {
      const transactionTime = new Date(item.transactionDate).getTime();
      const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const to = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

      if (from && to) return transactionTime >= from && transactionTime <= to;
      if (from) return transactionTime >= from;
      if (to) return transactionTime <= to;
      return true;
    });
  }, [reportData, fromDate, toDate]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, curr) => {
        acc.discountAmount += parseFloat(curr.discountAmount || 0);
        acc.netSale += parseFloat(curr.netSale || 0);
        acc.grossSale += parseFloat(curr.grossSale || 0);
        acc.grossProfit += parseFloat(curr.grossProfit || 0);
        return acc;
      },
      { discountAmount: 0, netSale: 0, grossSale: 0, grossProfit: 0 }
    );
  }, [filteredData]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const pad = (n) => n.toString().padStart(2, "0");
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatPeso = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "₱0.00" : `₱${num.toFixed(2)}`;
  };

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

  const getSortedData = () => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Handle date explicitly
      if (sortConfig.key === "transactionDate") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      // Handle numeric values
      else if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      // Default string comparison
      else {
        valA = (valA ?? "").toString().toLowerCase();
        valB = (valB ?? "").toString().toLowerCase();
      }

      if (sortConfig.direction === "ascending") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg">
            <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[150px] flex items-center justify-between px-3 py-2 border rounded-md font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : <span>From</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
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
                        "w-[150px] flex items-center justify-between px-3 py-2 border rounded-md font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : <span>To</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
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
            </div>

              {/* DOWNLOAD */}
            <div className="flex space-x-2">
              <Dialog>
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
                        (Reports.csv)
                      </span>
                    </DialogTitle>
                    <DialogClose />
                  </DialogHeader>
                  <p className="text-medium text-gray-800 mt-2 pl-4">
                    You are about to download the Reports.csv file. Click the button below to proceed.
                  </p>
                  <div className="flex justify-end mt-4 text-gray-700 items-center pl-4">
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-700 text-white uppercase text-sm font-medium whitespace-nowrap"
                      onClick={() => {
                        toast.success("Downloaded successfully!");
                      }}
                    >
                      DOWNLOAD FILE
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
          </div>

          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
            <h1 className="text-gray-600 font-bold mb-4">Reports</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead onClick={() => handleSort("transactionDate")} className="cursor-pointer">
                    Date <SortIcon column="transactionDate" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("orderID")} className="cursor-pointer">
                    Order ID <SortIcon column="orderID" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("detailID")} className="cursor-pointer">
                    Order Detail ID <SortIcon column="detailID" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("receiptNumber")} className="cursor-pointer">
                    Receipt Number <SortIcon column="receiptNumber" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("productCode")} className="cursor-pointer">
                    Product Code <SortIcon column="productCode" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("productName")} className="cursor-pointer">
                    Product <SortIcon column="productName" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("discountAmount")} className="cursor-pointer">
                    Discount Given <SortIcon column="discountAmount" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("netSale")} className="cursor-pointer">
                    NET Sale <SortIcon column="netSale" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("grossSale")} className="cursor-pointer">
                    Gross Sale <SortIcon column="grossSale" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("grossProfit")} className="cursor-pointer">
                    Gross Profit <SortIcon column="grossProfit" />
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {getSortedData().map((order) => (
                  <TableRow key={`${order.orderID}-${order.productCode}`}>
                    <TableCell>{formatDate(order.transactionDate)}</TableCell>
                    <TableCell>{order.orderID}</TableCell>
                    <TableCell>{order.detailID}</TableCell>
                    <TableCell>{order.receiptNumber}</TableCell>
                    <TableCell>{order.productCode}</TableCell>
                    <TableCell>
                      {order.productName}-{order.supplierName}-
                      {order.brandName}
                    </TableCell>
                    <TableCell>{formatPeso(order.discountAmount)}</TableCell>
                    <TableCell>{formatPeso(order.netSale)}</TableCell>
                    <TableCell>{formatPeso(order.grossSale)}</TableCell>
                    <TableCell>{formatPeso(order.grossProfit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="bg-white font-bold text-blue-500">
                  <TableCell colSpan={6} className="text-right">
                    TOTAL:
                  </TableCell>
                  <TableCell>{formatPeso(totals.discountAmount)}</TableCell>
                  <TableCell>{formatPeso(totals.netSale)}</TableCell>
                  <TableCell>{formatPeso(totals.grossSale)}</TableCell>
                  <TableCell>{formatPeso(totals.grossProfit)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
