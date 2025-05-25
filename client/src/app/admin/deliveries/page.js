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
import { Search, ListFilter, Trash2, Eye, FilePen, PackagePlus, Save, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

export default function DeliveriesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  
  // State for all dynamic data
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryProducts, setDeliveryProducts] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({});
  const [modifiedPayments, setModifiedPayments] = useState({}); 
  const [suppliers, setSuppliers] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);

  // API config
  const config = {
    deliveries: {
      fetch: "http://localhost:8080/deliveries",
      searchByDate: "http://localhost:8080/deliveries/search-by-date",
      markDeleted: "http://localhost:8080/deliveries",
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
      fetch: "http://localhost:8080/deliveries/payment-types",
    },
    paymentModes: {
      fetch: "http://localhost:8080/deliveries/mode-of-payment",
    },
    paymentStatuses: {
      fetch: "http://localhost:8080/deliveries/payment-status",
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
          const grouped = groupDeliveryProducts(res.data || []);
          setDeliveryProducts(grouped);
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
              paymentType:   item.D_paymentTypeID.toString(),
              paymentMode:   item.D_modeOfPaymentID !== null ? item.D_modeOfPaymentID.toString() : "",
              paymentStatus: item.D_paymentStatusID.toString(),
              dateDue:       formatDateForInput(item.DPD_dateOfPaymentDue),
              datePayment1:  formatDateForInput(item.DPD_dateOfPayment1),
              dateDue2:      formatDateForInput(item.DPD_dateOfPaymentDue2) || "",
              datePayment2:  formatDateForInput(item.DPD_dateOfPayment2)   || "",
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
      rawDate:    formatDateForInput(item.D_deliveryDate),
      supplier: "",
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
  
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayDate = getTodayDate();

  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);

    // when filtering by supplier, set selectedSupplier accordingly;
    // otherwise clear it
    if (filter === "Supplier") {
      setSelectedSupplier(subFilter);
    } else {
      setSelectedSupplier("");
    }
  };
  
   // Sort
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [productSortConfig, setProductSortConfig] = useState({ key: null, direction: "ascending" });

  const handleProductSort = (key) => {
    setProductSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "ascending" ? "descending" : "ascending",
        };
      }
      return { key, direction: "ascending" };
    });
  };
  
  const getSortedProducts = (deliveryNumber) => {
    const items = deliveryProducts[deliveryNumber] || [];
    if (!productSortConfig.key) return items;
    return [...items].sort((a, b) => {
      const valA = a[productSortConfig.key];
      const valB = b[productSortConfig.key];
      // Try numeric compare first
      const numA = parseFloat(valA.toString().replace(/[₱,]/g, ""));
      const numB = parseFloat(valB.toString().replace(/[₱,]/g, ""));
      if (!isNaN(numA) && !isNaN(numB)) {
        return productSortConfig.direction === "ascending" ? numA - numB : numB - numA;
      }
      // Fallback to string compare
      return productSortConfig.direction === "ascending"
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });
  };

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

  function SortIcon({ column, sortConfig }) {
    if (sortConfig.key !== column) {
      return <ChevronsUpDown className="inline ml-1 w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="inline ml-1 w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="inline ml-1 w-4 h-4 text-blue-500" />
    );
  }

  const getFilteredTransactions = () => {
    // ① If the user has typed a value, filter by substring match first
    let filteredTransactions = [...deliveries];
    if (searchValue) {
      filteredTransactions = filteredTransactions.filter(item =>
        item.deliveryNum.includes(searchValue)
      );
    }
    
    if (searchResult !== null) {
      return searchResult;
    }

    // Apply supplier filter if one is chosen
    if (selectedSupplier) {
      filteredTransactions = filteredTransactions.filter(d =>
        (deliveryProducts[d.deliveryNum]?.[0]?.supplier || "Unknown") === selectedSupplier
      );
    }

    // ③ Apply existing filter/sort logic to the already-filtered list
    let sortedTransactions = [...filteredTransactions];

    if (selectedFilter && selectedSubFilter) {
      if (selectedFilter === "Delivery Number") {
        sortedTransactions.sort((a, b) => {
          const numA = parseInt(a.deliveryNum);
          const numB = parseInt(b.deliveryNum);
          return selectedSubFilter === "Ascending" ? numA - numB : numB - numA;
        });
      }

      if (selectedFilter === "Supplier") {
        sortedTransactions = sortedTransactions.filter((item) => 
          (deliveryProducts[item.deliveryNum]?.[0]?.supplier || "Unknown") === selectedSubFilter
        );
      }

      if (selectedFilter === "Price") {
        sortedTransactions.sort((a, b) => {
          const getPrice = (str) => parseFloat(str.replace(/[^\d.]/g, ""));
          return selectedSubFilter === "Low to High"
            ? getPrice(a.totalCost) - getPrice(b.totalCost)
            : getPrice(b.totalCost) - getPrice(a.totalCost);
        });
      }

      if (selectedFilter === "Date") {
        sortedTransactions.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return selectedSubFilter === "Oldest"
            ? dateA - dateB
            : dateB - dateA;
        });
      }
    } else if (sortConfig.key) {
      
      sortedTransactions.sort((a, b) => {
        const valA = a[sortConfig.key] ?? "";
        const valB = b[sortConfig.key] ?? "";

        const numA = parseFloat(valA.toString().replace(/[₱,]/g, ""));
        const numB = parseFloat(valB.toString().replace(/[₱,]/g, ""));

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortConfig.direction === "ascending" ? numA - numB : numB - numA;
        }

        if (!isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))) {
          return sortConfig.direction === "ascending"
            ? new Date(valA) - new Date(valB)
            : new Date(valB) - new Date(valA);
        }

        return sortConfig.direction === "ascending"
          ? valA.toString().localeCompare(valB.toString())
          : valB.toString().localeCompare(valA.toString());
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

    setIsLoading(true);

    const payload = {
      // required first-payment fields
      D_paymentTypeID:    parseInt(detail.paymentType, 10),
      D_modeOfPaymentID:  parseInt(detail.paymentMode, 10),
      D_paymentStatusID:  parseInt(detail.paymentStatus, 10),
      DPD_dateOfPaymentDue: detail.dateDue,
      DPD_dateOfPayment1:   detail.datePayment1,

      // second-payment fields (will be null if not applicable)
      D_modeOfPaymentID2:   detail.paymentMode2  ? parseInt(detail.paymentMode2, 10)  : null,
      D_paymentStatusID2:   detail.paymentStatus2 ? parseInt(detail.paymentStatus2, 10) : null,
      DPD_dateOfPaymentDue2: detail.dateDue2    || null,
      DPD_dateOfPayment2:   detail.datePayment2 || null,
    };

    axios
      .put(
        // note the added “/payment-details”
        `${config.paymentDetails.update}/${deliveryNum}/payment-details`,
        payload
      )
      .then(() => {
        toast.success("Payment details updated successfully!");
        setModifiedPayments(prev => ({
          ...prev,
          [deliveryNum]: false
        }));
      })
      .catch(err => {
        console.error("Error updating payment details:", err.response?.data || err);
        toast.error("Failed to update payment details");
      })
      .finally(() => {
        setIsLoading(false);
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
  
  // when user clicks the date-search button
  const handleSearchDate = async () => {
    if (!searchDate) {
      setSearchResult(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.deliveries.searchByDate}?date=${searchDate}`
      );
      setSearchResult(normalizeDeliveryData(res.data));
    } catch (err) {
      console.error('Date search error:', err);
      toast.error('Error searching by date');
    } finally {
      setIsLoading(false);
    }
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
    setModifiedPayments(prev => ({
      ...prev,
      [deliveryNum]: true
    }));
  };

  // Delete
  const [adminPW, setAdminPW] = useState("");
  const [isDDOpen, setDDOpen] = useState("");
  
  const handleDelete = (deliveryNumber, adminPWInput) => {
    setIsLoading(true); // Show spinner
    
    axios.put(
      `${config.deliveries.markDeleted}/${deliveryNumber}/mark-deleted`,
      { adminPW: adminPWInput },
      { headers: { 'Content-Type': 'application/json' } }
    )
      .then(() => {
        toast.success("Delivery marked as deleted");
        return loadAllData();
      })
      .then(() => {
        setAdminPW("");
        setDDOpen(false);
      })
      .catch(err => {
        console.error("Delete error:", err.response?.data || err);
        toast.error(err.response?.data?.message || "Error marking delivery");
      })
      .finally(() => {
        setIsLoading(false); // hide spinner
      });
  };
    
  // Place this above the DeliveriesPage component
  const handleSearchChange = (e) => {
    let val = e.target.value;
    // Strip out anything that is not a digit
    val = val.replace(/\D/g, '');
    setSearchValue(val);
  };
  
  // ① Compute suppliers only from the first DeliveryProductDetail ([0]) of each delivery
  const firstProductSuppliers = Array.from(
    new Set(
      deliveries.map(d =>
        deliveryProducts[d.deliveryNum]?.[0]?.supplier || "Unknown"
      )
    )
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 bg-white shadow-sm p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center space-x-2 w-64">
                <div className="relative flex-1">
                  {/* Search */}
                  <Input
                    type="text"
                    id="deliverySearch"
                    name="deliverySearch"
                    value={searchValue}
                    onChange={handleSearchChange}           // ← use sanitized change handler
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    autoComplete="off"
                    placeholder="Search by delivery number"
                    className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <span className="pr-5"></span>
              
              {/* ——— Date Search ——— */}
              <div className="relative flex items-center space-x-2 ml-4">
                <Input
                  type="date"
                  id="deliveryDateSearch"
                  value={searchDate}
                  onChange={e => setSearchDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-100 text-gray-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSearchDate}
                  className="flex items-center space-x-1 bg-blue-100"
                >
                  <Search className="w-4 h-4" />
                  <span>Go</span>
                </Button>
                {searchDate && searchResult && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-blue-600"
                    onClick={() => {
                      setSearchResult(null);
                      setSearchDate("");
                    }}
                  >
                    Exit Search
                  </Button>
                )}
              </div>
              <span className="pr-5"></span>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2 bg-green-500 text-white">
                      <ListFilter className="w-4 h-4" />
                      <span>Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {/* Filter by Supplier */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Supplier</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {firstProductSuppliers.map(name => (
                          <DropdownMenuItem 
                            key={name}
                            onClick={() => handleFilterSelect("Supplier", name)}
                          >
                            {name}
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
            
            {/* Button to navigate to Add Delivery form page */}
            <div className="flex space-x-2">
              <Button className="bg-blue-400 text-white" onClick={() => router.push("./deliveries-add-delivery")}>
                <PackagePlus size={16} className="mr-2" />
                Add Delivery
              </Button>
            </div>
          </div>

          <h1 className="text-2xl mb-4 p-4 rounded-sm text-blue-50 bg-blue-950 font-bold">Deliveries</h1>
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
            {/* Deliveries Table */}
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead onClick={() => handleSort("dateAdded")} className="pl-10 cursor-pointer select-none">
                    Date <SortIcon column="dateAdded" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead onClick={() => handleSort("deliveryNum")} className="pl-6 cursor-pointer select-none">
                    Delivery Number <SortIcon column="deliveryNum" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead onClick={() => handleSort("supplier")} className="pl-0 cursor-pointer select-none">
                    Supplier <SortIcon column="supplier" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead onClick={() => handleSort("totalCost")} className="pl-10 cursor-pointer select-none">
                    Total Cost <SortIcon column="totalCost" sortConfig={sortConfig} />
                  </TableHead>
                  <TableHead className="pl-0">View Details</TableHead>
                  <TableHead className="pl-0">Edit Payment</TableHead>
                  <TableHead className="pl-6">Delete</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {getFilteredTransactions().map((d) => (
                  <TableRow key={d.deliveryNum}>
                    <TableCell className="pl-10">{d.dateAdded}</TableCell>
                    <TableCell className="pl-6">{`DR-${d.deliveryNum}`}</TableCell>
                    <TableCell className="pl-0">
                      {deliveryProducts[d.deliveryNum]?.[0]?.supplier || "Unknown"}
                    </TableCell>
                    <TableCell className="pl-10">{d.totalCost}</TableCell>
                    
                    {/* View delivery products */}
                    <TableCell className="pl-6">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-blue-600"
                            onClick={() => loadDeliveryProducts(d.deliveryNum)}
                          >
                            <Eye size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[90vw] sm:w-[600px] md:w-[750px] lg:w-[900px] xl:w-[1100px] max-w-[95vw] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle>Delivery Product Details</DialogTitle>
                            <DialogDescription>View delivery products</DialogDescription>
                            <DialogClose />
                          </DialogHeader>
                          
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
                            
                            {/* Products table header (static) */}
                            <Table className="min-w-full table-fixed">
                              <colgroup>
                                <col className="w-[14.2857%]" />
                                <col className="w-[14.2857%]" />
                                <col className="w-[14.2857%]" />
                                <col className="w-[14.2857%]" />
                                <col className="w-[14.2857%]" />
                                <col className="w-[14.2857%]" />
                                <col className="w-[14.2857%]" />
                              </colgroup>
                              <TableHeader className="bg-white">
                                <TableRow className="border-b border-gray-200">
                                  <TableHead
                                    onClick={() => handleProductSort("productCode")}
                                    className="cursor-pointer select-none"
                                  >
                                    Code <SortIcon column="productCode" sortConfig={productSortConfig} />
                                  </TableHead>
                                  <TableHead
                                    onClick={() => handleProductSort("supplier")}
                                    className="cursor-pointer select-none"
                                  >
                                    Supplier <SortIcon column="supplier" sortConfig={productSortConfig} />
                                  </TableHead>
                                  <TableHead
                                    onClick={() => handleProductSort("brand")}
                                    className="cursor-pointer select-none"
                                  >
                                    Brand <SortIcon column="brand" sortConfig={productSortConfig} />
                                  </TableHead>
                                  <TableHead
                                    onClick={() => handleProductSort("product")}
                                    className="cursor-pointer select-none"
                                  >
                                    Product <SortIcon column="product" sortConfig={productSortConfig} />
                                  </TableHead>
                                  <TableHead
                                    onClick={() => handleProductSort("quantity")}
                                    className="cursor-pointer select-none text-center"
                                  >
                                    Quantity
                                  </TableHead>
                                  <TableHead
                                    onClick={() => handleProductSort("unitPrice")}
                                    className="cursor-pointer select-none text-center"
                                  >
                                    Unit Price
                                  </TableHead>
                                  <TableHead
                                    onClick={() => handleProductSort("total")}
                                    className="cursor-pointer select-none text-center"
                                  >
                                    Total <SortIcon column="total" sortConfig={productSortConfig} />
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                            </Table>

                            {/* Products table body */}
                            <div className="relative w-full max-h-[60vh] overflow-y-auto overflow-x-auto">
                              <Table className="min-w-full table-fixed">
                                <colgroup>
                                  <col className="w-[14.2857%]" />
                                  <col className="w-[14.2857%]" />
                                  <col className="w-[14.2857%]" />
                                  <col className="w-[14.2857%]" />
                                  <col className="w-[14.2857%]" />
                                  <col className="w-[14.2857%]" />
                                  <col className="w-[14.2857%]" />
                                </colgroup>
                                <TableBody>
                                  {(getSortedProducts(d.deliveryNum).length) > 0
                                    ? getSortedProducts(d.deliveryNum).map((item, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell className="px-2 text-left pl-10">{item.productCode}</TableCell>
                                          <TableCell className="px-2 text-sm pl-6">{item.supplier}</TableCell>
                                          <TableCell className="px-2 text-sm">{item.brand}</TableCell>
                                          <TableCell className="px-2 text-sm">{item.product}</TableCell>
                                          <TableCell className="px-2 text-center text-sm">{item.quantity}</TableCell>
                                          <TableCell className="px-2 text-center text-sm">{item.unitPrice}</TableCell>
                                          <TableCell className="px-2 text-center text-sm">{item.total}</TableCell>
                                        </TableRow>
                                      ))
                                    : (
                                      <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-500">
                                          No products found for this delivery
                                        </TableCell>
                                      </TableRow>
                                    )
                                  }
                                </TableBody>
                              </Table>
                            </div>
                            
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>

                    {/* Delivery payment details */}
                    <TableCell className="p1-6">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <FilePen size={16} />
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="w-[60vw] max-w-[60vw] p-4 sm:p-6">
                          <DialogHeader>
                            <DialogTitle>Delivery Payment Details</DialogTitle>
                            <DialogClose />
                          </DialogHeader>

                          {/* always-shown: delivery number, amount, payment-type */}
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3">
                              <Label htmlFor="paymentDeliveryNumber" className="mb-1 block">Delivery Number</Label>
                              <Input
                                id="paymentDeliveryNumber"
                                value={`DR-${d.deliveryNum}`}
                                className="bg-gray-200 text-center"
                                readOnly
                              />
                            </div>
                            <div className="col-span-3">
                              <Label htmlFor="paymentType" className="mb-1 block">Payment Type</Label>
                              {/* make payment type uneditable */}
                              <Select
                                value={paymentDetails[d.deliveryNum]?.paymentType || ""}
                                onValueChange={(v) => updatePaymentDetail(d.deliveryNum, 'paymentType', v)}
                                name="paymentType"
                                disabled={true}
                              >
                                <SelectTrigger id="paymentType">
                                  <SelectValue placeholder="Select payment type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {paymentTypes.map(pt => (
                                    <SelectItem key={pt.D_paymentTypeID} value={pt.D_paymentTypeID.toString()} className="hover:bg-gray-100 data-[highlighted]:bg-gray-100">
                                      {pt.D_paymentName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {paymentDetails[d.deliveryNum]?.paymentType !== '3' ? (
                              <>
                                <div className="col-span-3"></div>
                                <div className="col-span-3"></div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentAmount" className="mb-1 block">Amount</Label>
                                  <Input
                                    id="paymentAmount"
                                    value={d.totalCost.replace('₱', '')}
                                    className="bg-red-800 text-white text-center"
                                    readOnly
                                  />
                                </div>
                              </>
                              ) : (
                              <> </>
                            )}
                              
                          </div>

                          {/* determine if two-time (ID '3') or one-time/full */}
                          {paymentDetails[d.deliveryNum]?.paymentType === '3' ? (
                            <>
                              {/* 1st payment section */}
                              <div className="grid grid-cols-12 gap-4 mt-0">
                                <h3 className="col-span-12 text-lg font-semibold mt-6">1st payment</h3>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentAmount" className="mb-1 block">Amount</Label>
                                  <Input
                                    id="paymentAmount"
                                    value={(parseFloat(d.totalCost.replace('₱', '')) / 2).toFixed(2)}
                                    className="bg-red-800 text-white text-center"
                                    readOnly
                                  />
                                </div>
                                <div className="col-span-3"></div>
                                <div className="col-span-3"></div>
                                <div className="col-span-3"></div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentMode" className="mb-1 block">Mode of Payment</Label>
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentMode || ""}
                                    onValueChange={(v) => updatePaymentDetail(d.deliveryNum, 'paymentMode', v)}
                                    name="paymentMode"
                                  >
                                    <SelectTrigger id="paymentMode">
                                      <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentModes.map(mode => (
                                        <SelectItem
                                          key={mode.D_modeOfPaymentID}
                                          value={mode.D_modeOfPaymentID.toString()}
                                          className="hover:bg-gray-100 data-[highlighted]:bg-gray-100"
                                        >
                                          {mode.D_mopName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentStatus" className="mb-1 block">Payment Status</Label>
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentStatus || ""}
                                    onValueChange={v => updatePaymentDetail(d.deliveryNum, 'paymentStatus', v)}
                                    name="paymentStatus"
                                    disabled={paymentDetails[d.deliveryNum]?.paymentType === '1'}
                                  >
                                    <SelectTrigger id="paymentStatus">
                                      <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentStatuses.map(status => (
                                        <SelectItem
                                          key={status.D_paymentStatusID}
                                          value={status.D_paymentStatusID.toString()}
                                          className="hover:bg-gray-100 data-[highlighted]:bg-gray-100"
                                        >
                                          {status.D_statusName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentDateDue" className="mb-1 block">Date of Payment Due</Label>
                                  {/* ⑤ Date of Payment Due fields should be uneditable */}
                                  <Input
                                    id="paymentDateDue"
                                    type="date"
                                    value={paymentDetails[d.deliveryNum]?.dateDue || ""}
                                    placeholder="mm/dd/yyyy"
                                    disabled={true}
                                  />
                                </div>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment</Label>
                                  <Input
                                    id="paymentDate1"
                                    type="date"
                                    value={paymentDetails[d.deliveryNum]?.datePayment1 || ""}
                                    onChange={(e) => updatePaymentDetail(d.deliveryNum, 'datePayment1', e.target.value)}
                                    /* ② only allow selection between delivery date and due date */
                                    min={d.rawDate}
                                    max={todayDate}
                                    /* ③ disable when status is unpaid */
                                    disabled={
                                      paymentStatuses.find(s => s.D_paymentStatusID.toString() === paymentDetails[d.deliveryNum]?.paymentStatus)
                                        ?.D_statusName.toLowerCase() === 'unpaid'
                                    }
                                  />
                                </div>
                              </div>

                              {/* 2nd payment section */}
                              <div className="grid grid-cols-12 gap-4 mt-0">
                                <h3 className="col-span-12 text-lg font-semibold mt-6">2nd payment</h3>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentAmount" className="mb-1 block">Amount</Label>
                                  <Input
                                    id="paymentAmount"
                                    value={(parseFloat(d.totalCost.replace('₱', '')) / 2).toFixed(2)}
                                    className="bg-red-800 text-white text-center"
                                    readOnly
                                  />
                                </div>
                                <div className="col-span-3"></div>
                                <div className="col-span-3"></div>
                                <div className="col-span-3"></div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentMode2" className="mb-1 block">Mode of Payment</Label>
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentMode2 || ""}
                                    onValueChange={v => updatePaymentDetail(d.deliveryNum, 'paymentMode2', v)}
                                    name="paymentMode2"
                                    disabled={
                                      paymentStatuses.find(s => s.D_paymentStatusID.toString() === paymentDetails[d.deliveryNum]?.paymentStatus)
                                        ?.D_statusName.toLowerCase() === 'unpaid'
                                    }
                                  >
                                    <SelectTrigger id="paymentMode2">
                                      <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentModes.map(mode => (
                                        <SelectItem
                                          key={mode.D_modeOfPaymentID}
                                          value={mode.D_modeOfPaymentID.toString()}
                                          className="hover:bg-gray-100 data-[highlighted]:bg-gray-100"
                                        >
                                          {mode.D_mopName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentStatus2" className="mb-1 block">Payment Status</Label>
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentStatus2 || ""}
                                    onValueChange={v => updatePaymentDetail(d.deliveryNum, 'paymentStatus2', v)}
                                    name="paymentStatus2"
                                    disabled={
                                      paymentStatuses.find(s => s.D_paymentStatusID.toString() === paymentDetails[d.deliveryNum]?.paymentStatus)
                                        ?.D_statusName.toLowerCase() === 'unpaid'
                                    }
                                  >
                                    <SelectTrigger id="paymentStatus2">
                                      <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentStatuses.map(status => (
                                        <SelectItem
                                          key={status.D_paymentStatusID}
                                          value={status.D_paymentStatusID.toString()}
                                          className="hover:bg-gray-100 data-[highlighted]:bg-gray-100"
                                        >
                                          {status.D_statusName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentDateDue2" className="mb-1 block">Date of Payment Due</Label>
                                  <Input
                                    id="paymentDateDue2"
                                    type="date"
                                    value={paymentDetails[d.deliveryNum]?.dateDue2 || ""}
                                    disabled={true}
                                  />
                                </div>

                                <div className="col-span-3">
                                  <Label htmlFor="paymentDate2" className="mb-1 block">Date of Payment</Label>
                                  <Input
                                    id="paymentDate2"
                                    type="date"
                                    value={paymentDetails[d.deliveryNum]?.datePayment2 || ""}
                                    onChange={(e) => updatePaymentDetail(d.deliveryNum, 'paymentDate2', e.target.value)}
                                    min={d.rawDate}
                                    max={todayDate}
                                    disabled={
                                      paymentStatuses.find(s => s.D_paymentStatusID.toString() === paymentDetails[d.deliveryNum]?.paymentStatus)
                                        ?.D_statusName.toLowerCase() === 'unpaid'
                                      ||
                                      paymentStatuses.find(s => s.D_paymentStatusID.toString() === paymentDetails[d.deliveryNum]?.paymentStatus2)
                                        ?.D_statusName.toLowerCase() === 'unpaid'
                                    }
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* one-time/full upfront */}
                              <div className="grid grid-cols-12 gap-4 mt-4">
                                <div className="col-span-3">
                                  <Label htmlFor="paymentMode" className="mb-1 block">Mode of Payment</Label>
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentMode || ""}
                                    onValueChange={v => updatePaymentDetail(d.deliveryNum, 'paymentMode', v)}
                                    name="paymentMode"
                                    disabled={paymentDetails[d.deliveryNum]?.paymentType === '1'}
                                  >
                                    <SelectTrigger id="paymentMode">
                                      <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentModes.map(mode => (
                                        <SelectItem
                                          key={mode.D_modeOfPaymentID}
                                          value={mode.D_modeOfPaymentID.toString()}
                                          className="hover:bg-gray-100 data-[highlighted]:bg-gray-100"
                                        >
                                          {mode.D_mopName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentStatus1" className="mb-1 block">Payment Status</Label>
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentStatus || ""}
                                    onValueChange={v => updatePaymentDetail(d.deliveryNum, 'paymentStatus', v)}
                                    name="paymentStatus"
                                    disabled={paymentDetails[d.deliveryNum]?.paymentType === '1'}
                                  >
                                    <SelectTrigger id="paymentStatus1">
                                      <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {paymentStatuses.map(status => (
                                        <SelectItem
                                          key={status.D_paymentStatusID}
                                          value={status.D_paymentStatusID.toString()}
                                          className="hover:bg-gray-100 data-[highlighted]:bg-gray-100"
                                        >
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
                                    value={paymentDetails[d.deliveryNum]?.dateDue || ""}
                                    disabled={true}
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment</Label>
                                  <Input
                                    id="paymentDate1"
                                    type="date"
                                    value={paymentDetails[d.deliveryNum]?.datePayment1 || ""}
                                    onChange={e => updatePaymentDetail(d.deliveryNum, 'datePayment1', e.target.value)}
                                    min={d.rawDate}
                                    max={todayDate}
                                    disabled={
                                      paymentDetails[d.deliveryNum]?.paymentType === '1' ||
                                      paymentStatuses.find(s => s.D_paymentStatusID.toString() === paymentDetails[d.deliveryNum]?.paymentStatus)
                                        ?.D_statusName.toLowerCase() === 'unpaid'
                                    }
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          <div className="mt-4 flex justify-end space-x-2">
                            <Button
                              disabled={!modifiedPayments[d.deliveryNum]}         // disabled until a change
                              onClick={() => handleSavePaymentDetails(d.deliveryNum)}
                            >
                              <Save size={16} className="mr-2" />
                              Save
                            </Button>
                          </div>
                        </DialogContent>

                      </Dialog>
                    </TableCell>

                    
                    {/* For deleting transactions */}
                    <TableCell className="pl-0 pr-8">
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
                              <span className="text-lg text-gray-400 font-normal italic">{d.deliveryNum}</span>
                            </DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                          <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">        
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
