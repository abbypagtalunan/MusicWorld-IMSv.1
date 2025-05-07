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
import {
  Search,
  CalendarDays,
  Download,
  Ellipsis,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
                      "w-[180px] flex items-center justify-between px-3 py-2 border rounded-md font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>From</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={handleFromDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!fromDate}
                    className={cn(
                      "w-[180px] flex items-center justify-between px-3 py-2 border rounded-md font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>To</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={handleToDateChange}
                    initialFocus
                    disabled={(date) => fromDate && date < fromDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
            <h1 className="text-gray-600 font-bold mb-4">Reports</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Detail ID</TableHead>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Discount Given</TableHead>
                  <TableHead>NET Sale</TableHead>
                  <TableHead>Gross Sale</TableHead>
                  <TableHead>Gross Profit</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData.map((order) => (
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
