"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/loading-spinner";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import { Search, ListFilter, Trash2, Ellipsis, PackagePlus, Save } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

export default function DeliveriesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);
  
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  
  // State for all dynamic data
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryProducts, setDeliveryProducts] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);

  // API config
  const config = {
    deliveries: {
      fetch: "http://localhost:8080/deliveries",
      delete: "http://localhost:8080/deliveries",
    },
    deliveryProducts: {
      fetch: "http://localhost:8080/deliveries/products",
      byDelivery: "http://localhost:8080/deliveries/products"
    },
    paymentDetails: {
      fetch: "http://localhost:8080/deliveries/payment-details",
      update: "http://localhost:8080/deliveries",
    },
    suppliers: {
      fetch: "http://localhost:8080/suppliers",
    },
    paymentTypes: {
      fetch: "http://localhost:8080/deliveryPaymentTypes",
    },
    paymentModes: {
      fetch: "http://localhost:8080/deliveryModeOfPayment",
    },
    paymentStatuses: {
      fetch: "http://localhost:8080/deliveryPaymentStatus",
    }
  };
  
  // Load data from DB on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Function to load all data from the remote database
  const loadAllData = () => {
    setIsLoading(true); // Show spinner before fetching data
    
    // Create an array of all fetch promises
    const fetchPromises = [
      // Fetch deliveries
      axios.get(config.deliveries.fetch)
        .then(res => {
          setDeliveries(normalizeDeliveryData(res.data));
        })
        .catch(error => {
          console.error("Error fetching deliveries:", error);
          toast.error("Failed to load deliveries");
        }),
      
      // Fetch delivery products 
      axios.get(config.deliveryProducts.fetch)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const grouped = groupDeliveryProducts(res.data);
            setDeliveryProducts(grouped);
          } else {
            setDeliveryProducts({});
          }
        })
        .catch(error => {
          console.error("Error fetching delivery products:", error);
          toast.error("Failed to load delivery products");
        }),

      // Fetch payment details
      axios.get(config.paymentDetails.fetch)
        .then(res => {
          const detailsMap = {};
          res.data.forEach(item => {
            detailsMap[item.D_deliveryNumber] = {
              paymentType: item.D_paymentTypeID,
              paymentMode: item.D_modeOfPaymentID,
              paymentStatus: item.D_paymentStatusID,
              dateDue: formatDateForInput(item.DPD_dateOfPaymentDue),
              datePayment1: formatDateForInput(item.DPD_dateOfPayment1),
              datePayment2: formatDateForInput(item.DPD_dateOfPayment2) || "",
            };
          });
          setPaymentDetails(detailsMap);
        })
        .catch(error => {
          console.error("Error fetching payment details:", error);
          toast.error("Failed to load payment details");
        }),

      // Fetch suppliers
      axios.get(config.suppliers.fetch)
        .then(res => {
          setSuppliers(res.data);
        })
        .catch(error => {
          console.error("Error fetching suppliers:", error);
        }),

      // Fetch payment types
      axios.get(config.paymentTypes.fetch)
        .then(res => {
          setPaymentTypes(res.data);
        })
        .catch(error => {
          console.error("Error fetching payment types:", error);
        }),

      // Fetch payment modes
      axios.get(config.paymentModes.fetch)
        .then(res => {
          setPaymentModes(res.data);
        })
        .catch(error => {
          console.error("Error fetching payment modes:", error);
        }),

      // Fetch payment statuses
      axios.get(config.paymentStatuses.fetch)
        .then(res => {
          setPaymentStatuses(res.data);
        })
        .catch(error => {
          console.error("Error fetching payment statuses:", error);
        }),
    ];
    
    // When all promises are settled (whether resolved or rejected)
    Promise.allSettled(fetchPromises)
      .finally(() => {
        setIsLoading(false); // Hide spinner after all fetches complete
      });
  };
  
  const normalizeDeliveryData = (data) => {
    return data.map(item => ({
      deliveryNum: item.D_deliveryNumber.toString(),
      dateAdded: formatDateForDisplay(item.D_deliveryDate),
      supplier: item.supplierName || item.S_supplierID,
      supplierID: item.S_supplierID,
      totalCost: item.totalCost ? `₱${parseFloat(item.totalCost).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : "₱0.00"
    }));
  };

  const groupDeliveryProducts = (data) => {
    const grouped = {};
    data.forEach(item => {
      if (!item || !item.D_deliveryNumber) {
        console.warn("Item missing delivery number:", item);
        return; // Skip this item
      }
      
      // Store using the delivery number without prefix
      const deliveryNumKey = item.D_deliveryNumber.toString();
      
      if (!grouped[deliveryNumKey]) {
        grouped[deliveryNumKey] = [];
      }
      
      const unitPrice = parseFloat(item.P_unitPrice) || 0;
      const quantity = parseInt(item.DPD_quantity) || 0;
      
      grouped[deliveryNumKey].push({
        productCode: item.P_productCode || "N/A",
        supplier: item.S_supplierName || item.supplierName || "Unknown",
        brand: item.B_brandName || item.brandName || "Unknown",
        product: item.P_productName || item.productName || "Unknown Product",
        quantity: quantity,
        unitPrice: `₱${unitPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        total: `₱${(unitPrice * quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      });
    });
    
    return grouped;
  };
  
  const loadDeliveryProducts = (deliveryNumber) => {
    setIsLoading(true); // Show spinner
    
    axios.get(`${config.deliveryProducts.byDelivery}/${deliveryNumber}`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Create a simplified object for direct use
          const formattedProducts = res.data.map(item => ({
            productCode: item.P_productCode || "N/A",
            supplier: item.supplierName || "Unknown",
            brand: item.brandName || "Unknown",
            product: item.productName || "Unknown Product",
            quantity: parseInt(item.DPD_quantity) || 0,
            unitPrice: `₱${parseFloat(item.P_unitPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
            total: `₱${(parseFloat(item.P_unitPrice) * parseInt(item.DPD_quantity)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
          }));
          
          // Update only the products for this specific delivery
          setDeliveryProducts(prevProducts => ({
            ...prevProducts,
            [deliveryNumber]: formattedProducts
          }));
        } else {
          // Set empty array for this delivery
          setDeliveryProducts(prevProducts => ({
            ...prevProducts,
            [deliveryNumber]: []
          }));
        }
      })
      .catch(error => {
        console.error(`Error fetching products for delivery ${deliveryNumber}:`, error);
        console.error("Error details:", error.response?.data || error.message);
        toast.error("Failed to load delivery products");
      })
      .finally(() => {
        setIsLoading(false); // Hide spinner
      });
  };

  // Helper functions for date formatting
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  const getFilteredTransactions = () => {
    if (searchResult !== null) {
      return searchResult;
    }
    let sortedTransactions = [...deliveries];
  
    if (!selectedFilter || !selectedSubFilter) return sortedTransactions;
  
    if (selectedFilter === "Delivery Number") {
      sortedTransactions.sort((a, b) => {
        const numA = parseInt(a.deliveryNum);
        const numB = parseInt(b.deliveryNum);
        return selectedSubFilter === "Ascending" ? numA - numB : numB - numA;
      });
    }
  
    if (selectedFilter === "Supplier") {
      sortedTransactions = sortedTransactions.filter((item) => 
        item.supplier === selectedSubFilter);
    }
  
    if (selectedFilter === "Price") {
      sortedTransactions.sort((a, b) => {
        const getPrice = (str) => parseFloat(str.replace(/[^\d.]/g, ""));
        return selectedSubFilter === "Low to High"
          ? getPrice(a.totalCost) - getPrice(b.totalCost)
          : getPrice(b.totalCost) - getPrice(a.totalCost);
      });
    }
  
    return sortedTransactions;
  };  

  // Function to handle saving payment details
  const handleSavePaymentDetails = (deliveryNum) => {
    const detail = paymentDetails[deliveryNum];
    if (!detail) {
      toast.error("No payment details to save");
      return;
    }
    
    setIsLoading(true); // Show spinner

    const payload = {
      D_paymentTypeID: parseInt(detail.paymentType),
      D_modeOfPaymentID: parseInt(detail.paymentMode),
      D_paymentStatusID: parseInt(detail.paymentStatus),
      DPD_dateOfPaymentDue: detail.dateDue,
      DPD_dateOfPayment1: detail.datePayment1,
      DPD_dateOfPayment2: detail.datePayment2 || null
    };

    axios.put(`${config.paymentDetails.update}/${deliveryNum}`, payload)
      .then(() => {
        toast.success("Payment details updated successfully!");
      })
      .catch(err => {
        console.error("Error updating payment details:", err.response?.data || err);
        toast.error("Failed to update payment details");
      })
      .finally(() => {
        setIsLoading(false); // Hide spinner
      });
  };

  // Handle search
  const handleSearch = () => {
    if (!searchValue.trim()) {
      setSearchResult(null);
      return;
    }
    
    setIsLoading(true); // Show spinner
    
    // Extract the numeric part whether user enters "DR-123" or just "123"
    const searchTerm = searchValue.trim();
    const deliveryNumber = searchTerm.startsWith("DR-") 
      ? searchTerm.substring(3) // Remove "DR-" prefix if present
      : searchTerm;
    
    // Only proceed with search if the remaining value is numeric
    if (!/^\d+$/.test(deliveryNumber)) {
      toast.error("Please enter a valid delivery number");
      return;
    }
    
    axios.get(`${config.deliveries.fetch}/search?deliveryNumber=${deliveryNumber}`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setSearchResult(normalizeDeliveryData(res.data));
        } else {
          setSearchResult([]);
          toast.error("No delivery found with that number");
        }
      })
      .catch(error => {
        console.error("Search error:", error);
        toast.error("Error searching for delivery");
        setSearchResult([]);
      })
      .finally(() => {
        setIsLoading(false); // Hide spinner
      });
  };

  // Handle payment detail changes
  const updatePaymentDetail = (deliveryNum, field, value) => {
    const updatedDetails = {
      ...paymentDetails,
      [deliveryNum]: {
        ...paymentDetails[deliveryNum] || {},
        [field]: value
      }
    };
    setPaymentDetails(updatedDetails);
  };

  // Delete
  const [adminPW, setAdminPW] = useState("");
  const [isDDOpen, setDDOpen] = useState("");
  
  const handleDelete = (deliveryNumber, adminPWInput) => {
    setIsLoading(true); // Show spinner
    
    axios({
      method: 'delete',
      url: `${config.deliveries.delete}/${deliveryNumber}`,
      data: { adminPW: adminPWInput }, 
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(() => {
        toast.success("Product deleted successfully");
        refreshTable();
        setAdminPW("");
        setDDOpen(false);
      })
      .catch(err => {
        console.error("Delete error:", err.response?.data || err);
        toast.error(err.response?.data?.message || "Error deleting product");
      })
      .finally(() => {
        setIsLoading(false); // Hide spinner
      });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center space-x-2 w-96">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="deliverySearch"
                    name="deliverySearch"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    autoComplete="off"
                    placeholder="Search by delivery number"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-500">
                    <Search className="w-5 h-5" />
                  </div>
                </div>

                {searchValue && (
                  <div className="flex space-x-1">
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
                        Exit Search
                      </Button>
                    )}
                  </div>
                )}
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
                    {/* Filter by Delivery Number */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Delivery Number</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Delivery Number", "Ascending")}>
                          Ascending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Delivery Number", "Descending")}>
                          Descending
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Filter by Supplier */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Supplier</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {suppliers.map(supplier => (
                          <DropdownMenuItem 
                            key={supplier.S_supplierID}
                            onClick={() => handleFilterSelect("Supplier", supplier.S_supplierName)}
                          >
                            {supplier.S_supplierName}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Filter by Total Cost */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Total Cost</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Price", "Low to High")}>
                          Low to High
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Price", "High to Low")}>
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
            
            {/* Button to navigate to Add Delivery form page */}
            <div className="flex space-x-2">
              <Button className="bg-blue-400 text-white" onClick={() => router.push("./deliveries/deliveries-add-delivery")}>
                <PackagePlus size={16} className="mr-2" />
                Add Delivery
              </Button>
            </div>
          </div>

          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
            {/* Deliveries Table */}
            <h1 className="text-gray-600 font-bold">Deliveries</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Delivery Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredTransactions().map((d) => (
                  <TableRow key={d.deliveryNum}>
                    <TableCell>{d.dateAdded}</TableCell>
                    <TableCell>{`DR-${d.deliveryNum}`}</TableCell>
                    <TableCell>{d.supplier}</TableCell>
                    <TableCell>{d.totalCost}</TableCell>
                    {/* Delivery Details dialog */}
                    <TableCell className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-blue-600"
                            onClick={() => loadDeliveryProducts(d.deliveryNum)}
                          >
                            <Ellipsis size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[90vw] sm:w-[600px] md:w-[750px] lg:w-[900px] xl:w-[1100px] max-w-[95vw] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle>Delivery Details</DialogTitle>
                            <DialogDescription>View and manage delivery information and payment details</DialogDescription>
                            <DialogClose />
                          </DialogHeader>
                          
                          {/* Main content layout within Delivery Details dialog */}
                          <div className="flex flex-col gap-6">
                            {/* Basic Delivery Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Date of Delivery</label>
                                <Input type="date" value={formatDateForInput(d.dateAdded)} disabled/>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Delivery Number</label>
                                <Input value={`DR-${d.deliveryNum}`} className="text-center" readOnly />
                              </div>
                            </div>                            
                            {/* TOP CONTENT: Product items table - showing products per delivery */}
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
                                    {/* Check if the deliveryProducts data exists for this delivery number */}
                                    {deliveryProducts[d.deliveryNum] && deliveryProducts[d.deliveryNum].length > 0 ? (
                                      deliveryProducts[d.deliveryNum].map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{item.productCode}</TableCell>
                                          <TableCell>{item.supplier}</TableCell>
                                          <TableCell>{item.brand}</TableCell>
                                          <TableCell>{item.product}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{item.unitPrice}</TableCell>
                                          <TableCell>{item.total}</TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-500">
                                          No products found for this delivery
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>    
                                                    
                            {/* BOTTOM CONTENT: Delivery Payment Details Section */}
                            <DialogHeader>
                              <DialogTitle>Delivery Payment Details</DialogTitle>
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
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentType || ""}
                                    onValueChange={(value) => updatePaymentDetail(d.deliveryNum, 'paymentType', value)}
                                    name="paymentType"
                                    disabled={true}
                                  >
                                    <SelectTrigger id="paymentType">
                                      <SelectValue placeholder="Select payment type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentTypes.map(type => (
                                        <SelectItem key={type.D_paymentTypeID} value={type.D_paymentTypeID.toString()}>
                                          {type.D_paymentName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentMode" className="mb-1 block">Mode of Payment</Label>
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentMode || ""}
                                    onValueChange={(value) => updatePaymentDetail(d.deliveryNum, 'paymentMode', value)}
                                    name="paymentMode"
                                  >
                                    <SelectTrigger id="paymentMode">
                                      <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentModes.map(mode => (
                                        <SelectItem key={mode.D_modeOfPaymentID} value={mode.D_modeOfPaymentID.toString()}>
                                          {mode.D_mopName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {/* Second row */}
                                <div className="col-span-3">
                                  <Label htmlFor="paymentStatus" className="mb-1 block">Payment Status</Label>
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentStatus || ""}
                                    onValueChange={(value) => updatePaymentDetail(d.deliveryNum, 'paymentStatus', value)}
                                    name="paymentStatus"
                                  >
                                    <SelectTrigger id="paymentStatus">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentStatuses.map(status => (
                                        <SelectItem key={status.D_paymentStatusID} value={status.D_paymentStatusID.toString()}>
                                          {status.D_statusName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentDateDue" className="mb-1 block">Date of Payment Due</Label>
                                  <Input 
                                    id="paymentDateDue" 
                                    type="date" 
                                    value={paymentDetails[d.deliveryNum]?.dateDue || "-"}
                                    readOnly
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment 1</Label>
                                  <Input 
                                    id="paymentDate1" 
                                    type="date" 
                                    value={paymentDetails[d.deliveryNum]?.datePayment1 || "-"}
                                    readOnly
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentDate2" className="mb-1 block">Date of Payment 2</Label>
                                  <Input 
                                    id="paymentDate2" 
                                    type="date" 
                                    value={paymentDetails[d.deliveryNum]?.datePayment2 || "-"}
                                    readOnly
                                  />
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
                        <DialogContent className="max-w-3xl p-7 text-gray-700">
                          <DialogHeader>
                            <DialogTitle>
                              <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                              <span className="text-lg text-gray-400 font-normal italic">{d.deliveryNum}</span>
                            </DialogTitle>
                            <DialogDescription>Confirm deletion of this delivery transaction</DialogDescription>
                            <DialogClose />
                          </DialogHeader>
                          <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                          <div className="flex items-center gap-4 mt-4 pl-10">          
                            <div className="flex-1">
                              <label htmlFor={`password-${d.deliveryNum}`} className="text-base font-medium text-gray-700 block mb-2">
                                Admin Password
                              </label>
                              <Input type="password" id={`password-${d.deliveryNum}`} required
                                placeholder="Enter valid password"  className="w-full" 
                              />
                            </div>       
                            <Button 
                              className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                              onClick={() => handleDelete(d.deliveryNum, 
                                document.getElementById(`password-${d.deliveryNum}`).value)}
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
        </div>
      </div>
      <Toaster position="top-right" />
      {isLoading && <LoadingSpinner />} 
    </SidebarProvider>
  );
}