"use client";

import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider} from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";
import { Search, CalendarDays, Download, Ellipsis } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

// sample product data
const products = [
  { productCode: "188090", brand: "Cort", category: "Guitar", quantity: 2 },
  { productCode: "188091", brand: "Lazer", category: "Drum", quantity: 1 },
  { productCode: "188092", brand: "Lazer", category: "Drum", quantity: 3 },
  { productCode: "188093", brand: "Alice", category: "Violin String", quantity: 0 },
  { productCode: "188094", brand: "Bee", category: "Harmonica", quantity: 0 },
  { productCode: "188095", brand: "Cort", category: "Guitar", quantity: 2 },
  { productCode: "188096", brand: "Cort", category: "Guitar", quantity: 2 },
  { productCode: "188097", brand: "Lazer", category: "Drum", quantity: 1 },
  { productCode: "188098", brand: "Lazer", category: "Drum", quantity: 3 },
];

// sample deliveries data
const delivery = [
  { deliveryNum: "188090", supplier: "Lazer" },
  { deliveryNum: "188091", supplier: "Lazer" },
  { deliveryNum: "188092", supplier: "Lazer" },
  { deliveryNum: "188093", supplier: "Mirbros" },
  { deliveryNum: "188094", supplier: "Mirbros" },
  { deliveryNum: "188095", supplier: "Mirbros" },
  { deliveryNum: "188096", supplier: "Lazer" },
  { deliveryNum: "188097", supplier: "Lazer" },
  { deliveryNum: "188098", supplier: "Lazer" },
];

// sample transaction data
const transactions = [
  { dateAdded: "11/12/22", transactionID: "9090", productCode: "188090", receiptNum: "110090", product: "AD W/ W Case", price: "₱15,995", sales: "₱15,995", cogs: "₱14,995" , net: "₱1,000" },
  { dateAdded: "11/12/22", transactionID: "9091", productCode: "188091", receiptNum: "111091",  product: "Maple Snare Drum", price: "₱15,995", sales: "₱4,500", cogs: "₱3,500", net: "₱1,000" },
  { dateAdded: "11/12/22", transactionID: "9092", productCode: "188092", receiptNum: "112092",  product: "Cymbal Straight Stand", price: "₱15,995", sales: "₱1,995", cogs: "₱1,495", net: "₱500" },
  { dateAdded: "11/12/22", transactionID: "9093", productCode: "188093", receiptNum: "113093",  product: "Alice Violin String", price: "₱15,995", sales: "₱29,995", cogs: "₱28,995", net: "₱1,000" },
  { dateAdded: "11/12/22", transactionID: "9094", productCode: "188094", receiptNum: "114094",  product: "Bee Harmonica", price: "₱15,995", sales: "₱125", cogs: "₱95", net: "₱30" },
  { dateAdded: "11/12/22", transactionID: "9095", productCode: "188095", receiptNum: "115095",  product: "Cort Acoustic Guitar", price: "₱15,995", sales: "₱2,595", cogs: "₱1,995", net: "₱600" },
  { dateAdded: "11/12/22", transactionID: "9096", productCode: "188096", receiptNum: "116096",  product: "AD W/ W Case", price: "₱15,995", sales: "₱395", cogs: "₱295", net: "₱100" },
  { dateAdded: "11/12/22", transactionID: "9097", productCode: "188097", receiptNum: "117097",  product: "Maple Snare Drum", price: "₱15,995", sales: "₱295", cogs: "₱195", net: "₱100" },
  { dateAdded: "11/12/22", transactionID: "9098", productCode: "188098", receiptNum: "118098",  product: "Cymbal Straight Stand", price: "₱15,995", sales: "₱15,995", cogs: "₱14,995", net: "₱1,000" }, 
];

export default function ReportsPage() {
  const totalSales = transactions.reduce((total, transaction) => {
    const amount = parseFloat(transaction.sales.replace("₱", "").replace(",", "")) || 0;
    return total + amount;
  }, 0);

  const totalCogs = transactions.reduce((total, transaction) => {
    const amount = parseFloat(transaction.cogs.replace("₱", "").replace(",", "")) || 0;
    return total + amount;
  }, 0);

  const totalNet = transactions.reduce((total, transaction) => {
    const amount = parseFloat(transaction.net.replace("₱", "").replace(",", "")) || 0;
    return total + amount;
  }, 0);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  
  const handleFromDateChange = (date) => {
    setFromDate(date);
    if (toDate && date > toDate) {
      setToDate(null); // Reset if invalid
    }
  };

  const handleToDateChange = (date) => {
    if (!fromDate || date >= fromDate) {
      setToDate(date);
    }
  };

  // Multiple Delete
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleSelectProduct = (productCode) => {
    setSelectedProducts((prev) =>
      prev.includes(productCode)
        ? prev.filter((code) => code !== productCode)
        : [...prev, productCode]
    );
  };
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCodes = transactions.map((transactions) => transactions.productCode);
      setSelectedProducts(allCodes);
    } else {
      setSelectedProducts([]);
    }
  };

  // Delete
    const [adminPW, setAdminPW] = useState("");
    const [isDDOpen, setDDOpen] = useState("");
    const [isMDDOpen, setMDDOpen] = useState("");
    const handleDelete = (productCode, adminPWInput) => {
      axios({
        method: 'delete',
        url: `http://localhost:8080/products/${productCode}`,
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
        });
    };
 
  // Multiple delete
  const handleMultiDelete = (password) => {
    if (!password) return toast.error("Password is required.");
    Promise.all(
      selectedProducts.map((code) =>
        axios({
          method: 'delete',
          url: `${config.product.api.delete}/${code}`,
          data: { adminPW: password /*adminPWInput */ }, 
          headers: {
            'Content-Type': 'application/json',
          }
        })
      )
    )
      .then(() => {
        toast.success("Selected products deleted.");
        refreshTable();
        setAdminPW("");
        setMDDOpen(false);
      })
      .catch(() => toast.error("Error deleting selected products."));
  };  

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="relative w-80">
                {/* Search */}
                <Input
                  type="text"
                  placeholder="Search transaction, id, product"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] flex items-center justify-between px-3 py-2 border rounded-md font-normal", !fromDate && "text-muted-foreground")}> 
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>From</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Calendar mode="single" selected={fromDate} onSelect={handleFromDateChange} initialFocus />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={!fromDate} className={cn("w-[180px] flex items-center justify-between px-3 py-2 border rounded-md font-normal", !toDate && "text-muted-foreground")}> 
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>To</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Calendar mode="single" selected={toDate} onSelect={handleToDateChange} initialFocus disabled={(date) => fromDate && date < fromDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-blue-400 text-white">
                <Download className="w-4 h-4"/>
              </Button>

              <Dialog open={isMDDOpen} onOpenChange={setMDDOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-500 text-white" disabled={selectedProducts.length === 0}>
                    Delete Selected
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                  <DialogHeader>
                    <DialogTitle>
                      <span className="text-lg text-red-900">Delete Multiple Transactions</span>
                      <span className="text-lg text-gray-400 font-normal italic ml-2">({selectedProducts.length} items)</span>
                    </DialogTitle>
                    <DialogClose />
                  </DialogHeader>
                  <p className="text-sm text-gray-800 mt-2 pl-4">
                    Deleting these transactions will reflect on Void Transactions. Enter the admin password to delete the selected products.
                  </p>
                  <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
                    <div className="flex-1">
                      <label htmlFor="password" className="text-base font-medium text-gray-700 block mb-2">
                        Admin Password
                      </label>
                      <Input
                        type="password"
                        required
                        placeholder="Enter admin password"
                        className="w-full"
                        value={adminPW}
                        onChange={(e) => setAdminPW(e.target.value)}
                      />
                    </div>
                    <Button
                      className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                      onClick={() =>
                        handleMultiDelete(adminPW)
                      }
                    >
                      DELETE TRANSACTIONS
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
          <h1 className="text-gray-600 font-bold">Reports</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.length === transactions.length && selectedProducts.length > 0} />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>COGS</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {transactions.map((transaction) => {
                  const product = products.find((p) => p.productCode === transaction.productCode) || {};
                  const deliveries = delivery.find((d) => d.deliveryNum === transaction.productCode) || {};
                  return (
                  <TableRow key={transaction.transactionID}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(transaction.productCode)}
                        onChange={() => handleSelectProduct(transaction.productCode)}
                      />
                    </TableCell>
                    <TableCell>{transaction.dateAdded}</TableCell>
                    <TableCell>{transaction.transactionID}</TableCell>
                    <TableCell>{transaction.productCode}</TableCell>
                    <TableCell>{transaction.receiptNum}</TableCell>
                    <TableCell>{transaction.product}</TableCell>
                    <TableCell>{transaction.sales}</TableCell>
                    <TableCell>{transaction.cogs}</TableCell>
                    <TableCell>{transaction.net}</TableCell>

                {/*Details toggle button with modal pop-up */}              
                    <TableCell className="flex space-x-2">              
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
                          {products && deliveries ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Product Code</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>{transaction.dateAdded}</TableCell>
                                <TableCell>{transaction.productCode}</TableCell>
                                <TableCell>{deliveries.supplier}</TableCell>
                                <TableCell>{product.brand}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{transaction.product}</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>{transaction.price}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          ) : (
                            <p className="text-gray-500">Product details not found.</p>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-white">  
                  <TableCell colSpan={6} className="text-right font-bold">Total:</TableCell>
                  <TableCell className="font-bold">₱{totalSales.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">₱{totalCogs.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">₱{totalNet.toLocaleString()}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
