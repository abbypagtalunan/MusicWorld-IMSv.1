"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { AppSidebar } from "@/components/staff-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Search, ListFilter, Trash2, Eye, PackagePlus, ChevronsUpDown, ChevronUp, ChevronDown, EyeOff, ChevronLeft, ChevronRight} from "lucide-react";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import MinimumScreenGuard from "@/components/MinimumScreenGuard";
import React from "react";

// Sample data mapping for deliveries with their associated products
const deliveryProducts = {
  "12345": [{ productCode: "188090", supplier: "Lazer", brand: "Cort", product: "AD 890 NS W/ BAG", quantity: "2 pcs", unitPrice: "15,995", total: "31,990" }],
  "12346": [{ productCode: "188091", supplier: "Lazer", brand: "Lazer", product: "Mapex Drumset", quantity: "1 set", unitPrice: "4,500", total: "4,500" }],
  "12347": [{ productCode: "188092", supplier: "Lazer", brand: "Cort", product: "Guitar Strings", quantity: "3 pcs", unitPrice: "665", total: "1,995" }],
  "12348": [{ productCode: "188093", supplier: "Mirbros", brand: "Yamaha", product: "Digital Piano", quantity: "1 pc", unitPrice: "29,995", total: "29,995" }],
  "12349": [{ productCode: "188094", supplier: "Mirbros", brand: "Lazer", product: "Guitar Pick", quantity: "5 pcs", unitPrice: "25", total: "125" }],
  "12350": [{ productCode: "188095", supplier: "Mirbros", brand: "Cort", product: "Guitar Capo", quantity: "1 pc", unitPrice: "2,595", total: "2,595" }],
  "12351": [{ productCode: "188096", supplier: "Lazer", brand: "Lazer", product: "Drum Sticks", quantity: "1 pair", unitPrice: "395", total: "395" }],
  "12352": [{ productCode: "188097", supplier: "Lazer", brand: "Lazer", product: "Guitar Strap", quantity: "1 pc", unitPrice: "295", total: "295" }],
  "12353": [{ productCode: "188098", supplier: "Lazer", brand: "Cort", product: "Acoustic Guitar", quantity: "1 pc", unitPrice: "15,995", total: "15,995" }]
};

// sample data for deliveries
const delivery = [
  { dateAdded: "11/12/22", deliveryNum: "12345", supplier: "Lazer", totalCost: "₱31,990" },
  { dateAdded: "11/12/22", deliveryNum: "12346", supplier: "Lazer", totalCost: "₱4,500" },
  { dateAdded: "11/12/22", deliveryNum: "12347", supplier: "Lazer", totalCost: "₱1,995" },
  { dateAdded: "11/12/22", deliveryNum: "12348", supplier: "Mirbros", totalCost: "₱29,995" },
  { dateAdded: "11/12/22", deliveryNum: "12349", supplier: "Mirbros", totalCost: "₱125" },
  { dateAdded: "11/12/22", deliveryNum: "12350", supplier: "Mirbros", totalCost: "₱2,595" },
  { dateAdded: "11/16/22", deliveryNum: "12351", supplier: "Lazer", totalCost: "₱395" },
  { dateAdded: "11/15/22", deliveryNum: "12352", supplier: "Lazer", totalCost: "₱295" },
  { dateAdded: "11/13/22", deliveryNum: "12353", supplier: "Lazer", totalCost: "₱15,995" },
];

export default function DeliveriesPage() {
  const router = useRouter(); 
  
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  // Sort
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  // Eye Toggle
  const [showPassword, setShowPassword] = useState(false);

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
      if (sortConfig.key !== column) return <ChevronsUpDown className="inline ml-1 w-4 h-4 text-gray-400" />;
      return sortConfig.direction === "ascending" ? (
        <ChevronUp className="inline ml-1 w-4 h-4 text-blue-500" />
      ) : (
        <ChevronDown className="inline ml-1 w-4 h-4 text-blue-500" />
      );
  }

  // Updated filter function to handle search and filters properly
  const getFilteredDeliveries = () => {
    let filteredDeliveries = [...delivery];
    
    // Apply search filter first
    if (searchValue) {
      filteredDeliveries = filteredDeliveries.filter(item =>
        item.deliveryNum.includes(searchValue) ||
        item.supplier.toLowerCase().includes(searchValue.toLowerCase()) ||
        (deliveryProducts[item.deliveryNum]?.[0]?.product || "").toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    // If there's a search result, use that instead
    if (searchResult !== null) {
      return searchResult;
    }

    // Apply supplier filter
    if (selectedFilter === "Supplier" && selectedSubFilter) {
      filteredDeliveries = filteredDeliveries.filter(d => 
        d.supplier === selectedSubFilter
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredDeliveries.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // For totalCost: strip currency symbol and commas
        if (sortConfig.key === "totalCost") {
          valA = parseFloat(valA.replace(/[₱,]/g, ""));
          valB = parseFloat(valB.replace(/[₱,]/g, ""));
        }

        if (sortConfig.direction === "ascending") {
          return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
          return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
      });
    }

    return filteredDeliveries;
  };

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = getFilteredDeliveries();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filteredData = getFilteredDeliveries();
    return Math.ceil(filteredData.length / itemsPerPage);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, searchResult, selectedFilter, selectedSubFilter, sortConfig]);

  // Handle search
  const handleSearch = () => {
    if (!searchValue.trim()) {
      setSearchResult(null);
      return;
    }
    
    // Simple search implementation for staff page
    const results = delivery.filter(item =>
      item.deliveryNum.includes(searchValue) ||
      item.supplier.toLowerCase().includes(searchValue.toLowerCase()) ||
      (deliveryProducts[item.deliveryNum]?.[0]?.product || "").toLowerCase().includes(searchValue.toLowerCase())
    );
    
    setSearchResult(results);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    let val = e.target.value;
    setSearchValue(val);
    // Clear search result when user modifies search
    if (searchResult !== null) {
      setSearchResult(null);
    }
  };

  // Get unique suppliers for filter
  const uniqueSuppliers = [...new Set(delivery.map(d => d.supplier))];

  // Pagination component
  const PaginationControls = () => {
    const totalPages = getTotalPages();
    const totalItems = getFilteredDeliveries().length;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startItem} to {endItem} of {totalItems} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[2.5rem] ${
                    currentPage === page 
                      ? "bg-blue-500 text-white" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <MinimumScreenGuard>
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col overflow-x-hidden">
          <div className="flex flex-wrap gap-4 justify-between mb-4 bg-white shadow-sm p-4 rounded-lg">
            <div className="flex flex-wrap items-center gap-2 min-w-[250px]">
              <div className="relative w-80">
                <Input
                  type="text"
                  placeholder="Search delivery number, supplier, or product"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <Search className="w-5 h-5" />
                </div>
              </div>

              {searchValue && (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearch}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Search
                  </Button>
                  {searchResult && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-blue-600"
                      onClick={() => {
                        setSearchResult(null);
                        setSearchValue("");
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}

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
                      <DropdownMenuSubTrigger>Supplier</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {uniqueSuppliers.map(supplier => (
                          <DropdownMenuItem key={supplier} onClick={() => handleFilterSelect("Supplier", supplier)}>
                            {supplier}
                          </DropdownMenuItem>
                        ))}
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
            <div className="flex justify-end">
              <Button className="bg-blue-400 text-white" onClick={() => router.push("./deliveries-add-delivery")}>
                <PackagePlus size={16} />
                  Add Delivery
              </Button>
            </div>
          </div>
          <h1 className="text-2xl mb-4 p-4 rounded-sm text-blue-50 bg-blue-950 font-bold">Deliveries</h1>
          <div className="bg-white shadow-md rounded-lg flex flex-col w-full flex-1 min-h-0">
            <div className="overflow-auto flex-1 relative p-4">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead onClick={() => handleSort("dateAdded")} className="cursor-pointer">Date <SortIcon column="dateAdded" /></TableHead>
                    <TableHead onClick={() => handleSort("deliveryNum")} className="cursor-pointer">Delivery Number <SortIcon column="deliveryNum" /></TableHead>
                    <TableHead onClick={() => handleSort("supplier")} className="cursor-pointer">Supplier <SortIcon column="supplier" /></TableHead>
                    <TableHead onClick={() => handleSort("totalCost")} className="cursor-pointer">Total Cost <SortIcon column="totalCost" /></TableHead>
                    <TableHead>View/Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData().map((d) => (
                    <TableRow key={d.deliveryNum}>
                      <TableCell>{d.dateAdded}</TableCell>
                      <TableCell>{d.deliveryNum}</TableCell>
                      <TableCell>{d.supplier}</TableCell>
                      <TableCell>{d.totalCost}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                              <Eye size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[90vw] sm:w-[600px] md:w-[750px] lg:w-[900px] xl:w-[1100px] max-w-[95vw] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>Delivery Details</DialogTitle>
                              <DialogClose />
                            </DialogHeader>
                            
                            {/* Main content layout within dialog */}
                            <div className="flex flex-col gap-6">
                              {/* Basic Delivery Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Date of Delivery</label>
                                  <Input type="date" defaultValue={d.dateAdded}  disabled/>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Delivery Number</label>
                                  <Input value= {`DR-${d.deliveryNum}`} className="text-center" readOnly />
                                </div>
                              </div>
                              
                              {/* Product items table - showing single product per delivery */}
                              <div className="w-full">
                               <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader className="bg-gray-100 sticky top-0">
                                      <TableRow>
                                        <TableHead>Product Code</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {deliveryProducts[d.deliveryNum] && deliveryProducts[d.deliveryNum].map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{item.productCode}</TableCell>
                                          <TableCell>{item.supplier}</TableCell>
                                          <TableCell>{item.brand}</TableCell>
                                          <TableCell>{item.product}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{item.unitPrice}</TableCell>
                                          <TableCell>{item.total}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                              
                              {/* Delivery Payment Details Section */}
                              <DialogHeader>
                                <DialogTitle>Delivery Payment Details</DialogTitle>
                                  <DialogClose />
                              </DialogHeader>
                              <div className="flex w-full">
                                <div className="grid grid-cols-12 gap-4">
                                  {/* First row */}
                                  <div className="col-span-3">
                                    <Label htmlFor="paymentDeliveryNumber" className="mb-1 block">Delivery Number</Label>
                                    <Input id="paymentDeliveryNumber" value={`DR-${d.deliveryNum}`} className="bg-gray-200 text-center" readOnly title="Auto-generated" />
                                  </div>
                                  <div className="col-span-3">
                                    <Label htmlFor="paymentAmount" className="mb-1 block">Amount</Label>
                                    <Input id="paymentAmount" value={d.totalCost.replace('₱', '')} className="bg-red-800 text-white text-center" readOnly />
                                  </div>
                                  <div className="col-span-3">
                                    <Label htmlFor="paymentType" className="mb-1 block">Payment Type</Label>
                                    <Select disabled>
                                      <SelectTrigger id="paymentType">
                                        <SelectValue/>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="one-time">One-time, Full</SelectItem>
                                        <SelectItem value="1 month">1 month installment</SelectItem>
                                        <SelectItem value="2 months">2 months installment</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-3">
                                    <Label htmlFor="paymentMode" className="mb-1 block">Mode of Payment</Label>
                                    <Select disabled> 
                                      <SelectTrigger id="paymentMode">
                                        <SelectValue/>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="check">Check</SelectItem>
                                        <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Second row */}
                                  <div className="col-span-3 flex justify-end mt-6">
                                    <Label htmlFor="paymentStatus" className="mb-1 block">Payment Status</Label>
                                    <Select disabled>
                                      <SelectTrigger id="paymentStatus">
                                        <SelectValue/>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="paid">PAID</SelectItem>
                                        <SelectItem value="unpaid">UNPAID</SelectItem>
                                        <SelectItem value="partial1">1ST MONTH INSTALLMENT</SelectItem>
                                        <SelectItem value="partial2">PAID: 2ND MONTH</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="col-span-3">
                                    <Label htmlFor="paymentDateDue" className="mb-1 block">Date of Payment Due</Label>
                                    <Input id="paymentDateDue" type="date" defaultValue="2024-03-01"/>
                                  </div>
                                  <div className="col-span-3">
                                    <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment 1</Label>
                                    <Input id="paymentDate1" type="date" defaultValue="2024-03-01" />
                                  </div>
                                  <div className="col-span-3">
                                    <Label htmlFor="paymentDate2" className="mb-1 block">Date of Payment 2</Label>
                                    <Input id="paymentDate2" type="date" defaultValue="2024-03-01" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* For deleting transactions */}
                        <Dialog>
                          <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                              <DialogTitle>
                                <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                                <span className="text-lg text-gray-400 font-normal italic">{d.deliveryNum}</span></DialogTitle>
                              <DialogClose />
                            </DialogHeader>
                            <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                            <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">      
                              <div className="flex-1">
                                <label htmlFor={`password-${d.deliveryNum}`} className="text-base font-medium text-gray-700 block mb-2">
                                  Admin Password
                                </label>
                                <div className="relative w-full">
                                <Input type={showPassword ? "text" : "password"} id={`password-${d.deliveryNum}`} required
                                  placeholder="Enter valid password"  className="w-full" 
                                /> <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                    tabIndex={-1}
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
                                onClick={() => console.log('Delete functionality would go here')}
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
            
            {/* Pagination Controls */}
            <div className="border-t border-gray-200 bg-white">
              <PaginationControls />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  </MinimumScreenGuard>
  );
}