"use client";

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ListFilter, Trash2, Ellipsis, PackagePlus, Save } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

// Sample data for deliveries
const delivery = [
  { dateAdded: "11/12/22", deliveryNum: "12345", supplier: "Lazer", totalCost: "₱31,990" },
  { dateAdded: "11/12/22", deliveryNum: "12346", supplier: "Lazer", totalCost: "₱4,500" },
  { dateAdded: "11/12/22", deliveryNum: "12347", supplier: "Lazer", totalCost: "₱1,995" },
  { dateAdded: "11/12/22", deliveryNum: "12348", supplier: "Mirbros", totalCost: "₱29,995" },
  { dateAdded: "11/12/22", deliveryNum: "12349", supplier: "Mirbros", totalCost: "₱125" },
  { dateAdded: "11/12/22", deliveryNum: "12350", supplier: "Mirbros", totalCost: "₱2,595" },
  { dateAdded: "11/12/22", deliveryNum: "12351", supplier: "Lazer", totalCost: "₱395" },
  { dateAdded: "11/12/22", deliveryNum: "12352", supplier: "Lazer", totalCost: "₱295" },
  { dateAdded: "11/12/22", deliveryNum: "12353", supplier: "Lazer", totalCost: "₱15,995" },
];

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

// Initial payment details for each delivery
const initialPaymentDetails = {
  "12345": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12346": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12347": { paymentType: "1 month", paymentMode: "check", paymentStatus: "partial1", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12348": { paymentType: "2 months", paymentMode: "bank transfer", paymentStatus: "unpaid", dateDue: "2024-03-01", datePayment1: "", datePayment2: "" },
  "12349": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12350": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12351": { paymentType: "2 months", paymentMode: "bank transfer", paymentStatus: "partial2", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "2024-04-01" },
  "12352": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" },
  "12353": { paymentType: "one-time", paymentMode: "cash", paymentStatus: "paid", dateDue: "2024-03-01", datePayment1: "2024-03-01", datePayment2: "" }
};

export default function DeliveriesPage() {
  const router = useRouter(); 
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);
  
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  
  // State to manage payment details for each delivery
  const [paymentDetails, setPaymentDetails] = useState(initialPaymentDetails);

  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  const getFilteredTransactions = () => {
    if (searchResult !== null) {
      return searchResult;
    }
    let sortedTransactions = [...delivery];
  
    if (!selectedFilter || !selectedSubFilter) return sortedTransactions;
  
    if (selectedFilter === "Delivery Number") {
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Ascending"
          ? a.deliveryNum.localeCompare(b.deliveryNum)
          : b.deliveryNum.localeCompare(a.deliveryNum)
      );
    }
  
    if (selectedFilter === "Supplier") {
      sortedTransactions = sortedTransactions.filter((item) => item.supplier === selectedSubFilter);
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
    // In a real app, you would send this data to your backend
    console.log(`Saving payment details for delivery #${deliveryNum}:`, 
      paymentDetails[deliveryNum]);
    
    // Show success message
    alert("Payment details updated successfully!");
  };

  // Handle deletion of transactions
  const handleDelete = (deliveryNum, password) => {
    // In a real app, you would validate the password and then delete
    if (password) {
      alert(`Transaction ${deliveryNum} would be deleted with proper authentication`);
    } else {
      alert("Please enter an admin password");
    }
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
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const result = delivery.find((d) => d.deliveryNum === searchValue.trim());
                        setSearchResult(result ? [result] : []);
                      }
                    }}
                    placeholder="Search delivery number"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-500">
                    <Search className="w-5 h-5" />
                  </div>
                </div>

                {searchValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600"
                    onClick={() => {
                      setSearchValue("");
                      setSearchResult(null);
                    }}
                  >
                    Clear
                  </Button>
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
                        <DropdownMenuItem onClick={() => handleFilterSelect("Supplier", "Cort")}>
                          Cort
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Supplier", "Lazer")}>
                          Lazer
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Filter by Total Cost */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger> Total Cost</DropdownMenuSubTrigger>
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
              <Button className="bg-blue-400 text-white" onClick={() => router.push("./deliveries-add-delivery")}>
                <PackagePlus size={16} />
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
                    <TableCell>{d.deliveryNum}</TableCell>
                    <TableCell>{d.supplier}</TableCell>
                    <TableCell>{d.totalCost}</TableCell>
                    {/* Delivery Details dialog */}
                    <TableCell className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <Ellipsis size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[90vw] sm:w-[600px] md:w-[750px] lg:w-[900px] xl:w-[1100px] max-w-[95vw] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle>Delivery Details</DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          
                          {/* Main content layout within Delivery Details dialog */}
                          <div className="flex flex-col gap-6">
                            {/* Basic Delivery Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Date of Delivery</label>
                                <Input type="date" defaultValue={d.dateAdded} disabled/>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Delivery Number</label>
                                <Input value= {`DR-${d.deliveryNum}`} className="text-center" readOnly />
                              </div>
                            </div>                            
                            {/* TOP CONTENT: Product items table - showing single product per delivery */}
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
                                                    
                            {/* BOTTOM CONTENT: Delivery Payment Details Section */}
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
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentType || ""}
                                    onValueChange={(value) => setPaymentDetails({
                                      ...paymentDetails,
                                      [d.deliveryNum]: {
                                        ...paymentDetails[d.deliveryNum],
                                        paymentType: value
                                      }
                                    })}
                                  >
                                    <SelectTrigger id="paymentType">
                                      <SelectValue placeholder="Select payment type" />
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
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentMode || ""}
                                    onValueChange={(value) => setPaymentDetails({
                                      ...paymentDetails,
                                      [d.deliveryNum]: {
                                        ...paymentDetails[d.deliveryNum],
                                        paymentMode: value
                                      }
                                    })}
                                  > 
                                    <SelectTrigger id="paymentMode">
                                      <SelectValue placeholder="Select payment mode" />
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
                                  <Select
                                    value={paymentDetails[d.deliveryNum]?.paymentStatus || ""}
                                    onValueChange={(value) => setPaymentDetails({
                                      ...paymentDetails,
                                      [d.deliveryNum]: {
                                        ...paymentDetails[d.deliveryNum],
                                        paymentStatus: value
                                      }
                                    })}
                                  >
                                    <SelectTrigger id="paymentStatus">
                                      <SelectValue placeholder="Select status" />
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
                                  <Input 
                                    id="paymentDateDue" 
                                    type="date" 
                                    value={paymentDetails[d.deliveryNum]?.dateDue || ""}
                                    onChange={(e) => setPaymentDetails({
                                      ...paymentDetails,
                                      [d.deliveryNum]: {
                                        ...paymentDetails[d.deliveryNum],
                                        dateDue: e.target.value
                                      }
                                    })}
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment 1</Label>
                                  <Input 
                                    id="paymentDate1" 
                                    type="date" 
                                    value={paymentDetails[d.deliveryNum]?.datePayment1 || ""}
                                    onChange={(e) => setPaymentDetails({
                                      ...paymentDetails,
                                      [d.deliveryNum]: {
                                        ...paymentDetails[d.deliveryNum],
                                        datePayment1: e.target.value
                                      }
                                    })}
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Label htmlFor="paymentDate2" className="mb-1 block">Date of Payment 2</Label>
                                  <Input 
                                    id="paymentDate2" 
                                    type="date" 
                                    value={paymentDetails[d.deliveryNum]?.datePayment2 || ""}
                                    onChange={(e) => setPaymentDetails({
                                      ...paymentDetails,
                                      [d.deliveryNum]: {
                                        ...paymentDetails[d.deliveryNum],
                                        datePayment2: e.target.value
                                      }
                                    })}
                                  />
                                </div>
                                
                                {/* Save button for payment details */}
                                <div className="col-span-12 mt-6 flex justify-end">
                                  <Button 
                                    onClick={() => handleSavePaymentDetails(d.deliveryNum)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Payment Details
                                  </Button>
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
                              <span className="text-lg text-gray-400 font-normal italic">{d.deliveryNum}</span></DialogTitle>
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
    </SidebarProvider>
  );
}