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
import { CalendarDays, Download, ChevronsUpDown, ChevronUp, ChevronDown, ListFilter, RotateCcw} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
import MinimumScreenGuard from "@/components/MinimumScreenGuard";

export default function ReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [currentPeriodFilter, setCurrentPeriodFilter] = useState(null);

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

  // Period filter functions
  const getCurrentYear = () => new Date().getFullYear();
  
  const getPeriodDates = (period, year = null) => {
    const targetYear = year || getCurrentYear();
    
    const [periodType, periodYear] = period.includes('_') ? period.split('_') : [period, null];
    const finalYear = periodYear ? parseInt(periodYear) : targetYear;
    
    switch (periodType) {
      case 'Q1':
        return {
          from: new Date(finalYear, 0, 1), 
          to: new Date(finalYear, 2, 31)   
        };
      case 'Q2':
        return {
          from: new Date(finalYear, 3, 1),
          to: new Date(finalYear, 5, 30)   
        };
      case 'Q3':
        return {
          from: new Date(finalYear, 6, 1),
          to: new Date(finalYear, 8, 30)  
        };
      case 'Q4':
        return {
          from: new Date(finalYear, 9, 1),
          to: new Date(finalYear, 11, 31)  
        };
      case 'H1':
        return {
          from: new Date(finalYear, 0, 1), 
          to: new Date(finalYear, 5, 30)   
        };
      case 'H2':
        return {
          from: new Date(finalYear, 6, 1),  
          to: new Date(finalYear, 11, 31) 
        };
      case 'CURRENT_YEAR':
        return {
          from: new Date(getCurrentYear(), 0, 1),  
          to: new Date(getCurrentYear(), 11, 31)  
        };
      case 'PREVIOUS_YEAR':
        return {
          from: new Date(getCurrentYear() - 1, 0, 1),  
          to: new Date(getCurrentYear() - 1, 11, 31)  
        };
      case 'FULL_YEAR':
        return {
          from: new Date(finalYear, 0, 1),  
          to: new Date(finalYear, 11, 31)  
        };
      default:
        return { from: null, to: null };
    }
  };

  // Get available years from data
  const getAvailableYears = useMemo(() => {
    if (reportData.length === 0) return [];
    
    const years = [...new Set(reportData.map(item => 
      new Date(item.transactionDate).getFullYear()
    ))].sort((a, b) => b - a); // Sort descending (newest first)
    
    return years;
  }, [reportData]);

  const handlePeriodFilter = (period) => {
    const dates = getPeriodDates(period);
    setFromDate(dates.from);
    setToDate(dates.to);
    setCurrentPeriodFilter(period);
  };

  const resetAllFilters = () => {
    setFromDate(null);
    setToDate(null);
    setCurrentPeriodFilter(null);
  };


    // Download Handling
  const [isDownloadConfirmOpen, setDownloadConfirmOpen] = useState("");
  const handleDownloadCSV = () => {
    const now = new Date();
    const phLocale = "en-PH";
    const phTimeZone = "Asia/Manila";

    // Format timestamp for filename
    const formattedDate = now
      .toLocaleString(phLocale, { timeZone: phTimeZone })
      .replace(/[/:, ]/g, "-")
      .replace(/--+/g, "-");

    // CSV timestamp row
    const downloadTimestamp = `Downloaded At:, "${now.toLocaleString(phLocale, { timeZone: phTimeZone })}"`;
    const headers = [
      "Receipt Number",
      "Order ID",
      "Transaction Date",
      "Product Code",
      "Product Name",
      "Brand",
      "Supplier",
      "Discount Amount",
      "Item Gross Sale",
      "Item Net Sale",
      "Item Gross Profit"
    ];

    // Use filteredData instead of full reportData
    const rows = filteredData.map((item) => [
      item.receiptNumber,
      item.orderID,
      item.transactionDate,
      item.productCode,
      item.productName,
      item.brandName,
      item.supplierName,
      item.discountAmount,
      item.grossSale,
      item.netSale,
      item.grossProfit
    ]);

    // Add totals row
    const totalsRow = [
      "TOTAL", "", "", "", "", "", "",
      totals.discountAmount.toFixed(2),
      totals.grossSale.toFixed(2),
      totals.netSale.toFixed(2),
      totals.grossProfit.toFixed(2)
    ];

    const csvContent = [
      downloadTimestamp,
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
      totalsRow.map((val) => `"${val}"`).join(",")
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Order_Report_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


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
    setCurrentPeriodFilter(null); // Clear period filter when manually setting dates
    if (toDate && date > toDate) {
      setToDate(null);
    }
  };

  const handleToDateChange = (date) => {
    if (!fromDate || date >= fromDate) {
      setToDate(date);
      setCurrentPeriodFilter(null); // Clear period filter when manually setting dates
    }
  };

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

  const getPeriodDisplayText = () => {
    if (!currentPeriodFilter) return "Filter";
    
    const currentYear = getCurrentYear();
    const [periodType, periodYear] = currentPeriodFilter.includes('_') 
      ? currentPeriodFilter.split('_') 
      : [currentPeriodFilter, null];
    
    const displayYear = periodYear || currentYear;
    
    const periodLabels = {
      'Q1': `Q1 ${displayYear}`,
      'Q2': `Q2 ${displayYear}`, 
      'Q3': `Q3 ${displayYear}`,
      'Q4': `Q4 ${displayYear}`,
      'H1': `H1 ${displayYear}`,
      'H2': `H2 ${displayYear}`,
      'CURRENT_YEAR': `${currentYear}`,
      'PREVIOUS_YEAR': `${currentYear - 1}`,
      'FULL_YEAR': `${displayYear}`
    };
    
    return periodLabels[periodType] || "Filter";
  };

  return (
    <MinimumScreenGuard>
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col overflow-x-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4 bg-white shadow-sm p-4 rounded-lg">
            <div className="flex flex-wrap items-center gap-3">
                {/* Filter by Period */}
                <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className={cn(
                            "flex items-center space-x-2",
                            currentPeriodFilter && "bg-blue-50 border-blue-300"
                          )}
                        >
                          <ListFilter className="w-4 h-4" />
                          <span>{getPeriodDisplayText()}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Quarterly - {getCurrentYear()}</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handlePeriodFilter('Q1')}>
                              Q1 {getCurrentYear()} (Jan - Mar)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePeriodFilter('Q2')}>
                              Q2 {getCurrentYear()} (Apr - Jun)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePeriodFilter('Q3')}>
                              Q3 {getCurrentYear()} (Jul - Sep)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePeriodFilter('Q4')}>
                              Q4 {getCurrentYear()} (Oct - Dec)
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {getAvailableYears.filter(year => year !== getCurrentYear()).map(year => (
                          <DropdownMenuSub key={`quarterly-${year}`}>
                            <DropdownMenuSubTrigger>Quarterly - {year}</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => handlePeriodFilter(`Q1_${year}`)}>
                                Q1 {year} (Jan - Mar)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePeriodFilter(`Q2_${year}`)}>
                                Q2 {year} (Apr - Jun)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePeriodFilter(`Q3_${year}`)}>
                                Q3 {year} (Jul - Sep)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePeriodFilter(`Q4_${year}`)}>
                                Q4 {year} (Oct - Dec)
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ))}

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Semi-Annual - {getCurrentYear()}</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handlePeriodFilter('H1')}>
                              H1 {getCurrentYear()} (Jan - Jun)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePeriodFilter('H2')}>
                              H2 {getCurrentYear()} (Jul - Dec)
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {getAvailableYears.filter(year => year !== getCurrentYear()).map(year => (
                          <DropdownMenuSub key={`semi-${year}`}>
                            <DropdownMenuSubTrigger>Semi-Annual - {year}</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => handlePeriodFilter(`H1_${year}`)}>
                                H1 {year} (Jan - Jun)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePeriodFilter(`H2_${year}`)}>
                                H2 {year} (Jul - Dec)
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ))}

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Annual</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handlePeriodFilter('CURRENT_YEAR')}>
                              {getCurrentYear()} (Full Year)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePeriodFilter('PREVIOUS_YEAR')}>
                              {getCurrentYear() - 1} (Previous Year)
                            </DropdownMenuItem>
                            {getAvailableYears
                              .filter(year => year !== getCurrentYear() && year !== getCurrentYear() - 1)
                              .map(year => (
                                <DropdownMenuItem 
                                  key={year} 
                                  onClick={() => handlePeriodFilter(`FULL_YEAR_${year}`)}
                                >
                                  {year} (Full Year)
                                </DropdownMenuItem>
                              ))
                            }
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={resetAllFilters} 
                          className="text-red-500 font-medium"
                        >
                          Reset All Filters
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>  
              {/* Date Range Filter - From and To */}
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
                      {fromDate ? format(fromDate, "MMM dd, yyyy") : <span>From</span>}
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
                          onClick={() => {
                            setFromDate(null);
                            setCurrentPeriodFilter(null);
                          }}
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
                      {toDate ? format(toDate, "MMM dd, yyyy") : <span>To</span>}
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
                          onClick={() => {
                            setToDate(null);
                            setCurrentPeriodFilter(null);
                          }}
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
                      setCurrentPeriodFilter(null);
                    }}
                    className="text-sm border-gray-300 hover:text-red-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                      <span>Reset Date</span>
                </Button>
            </div>

              {/* DOWNLOAD */}
            <div className="flex justify-end">
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

          <h1 className="text-2xl mb-4 p-4 rounded-sm text-blue-50 bg-blue-950 font-bold">Reports</h1>
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
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
                <TableRow className="sticky bottom-0 bg-blue-50 font-bold text-blue-500">
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
    </MinimumScreenGuard>
  );
}