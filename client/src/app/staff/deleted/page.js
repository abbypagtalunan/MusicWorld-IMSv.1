"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/staff-sidebar"
import { SidebarProvider} from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Search, ListFilter, Download, Trash2, Ellipsis, RotateCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

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
  { dateAdded: "11/12/22", transactionID: "9090", productCode: "188090", receiptNum: "110090", product: "AD W/ W Case", totalPrice: "₱15,995" },
  { dateAdded: "11/12/22", transactionID: "9091", productCode: "188091", receiptNum: "111091",  product: "Maple Snare Drum", totalPrice: "₱4,500"},
  { dateAdded: "11/12/22", transactionID: "9092", productCode: "188092", receiptNum: "112092",  product: "Cymbal Straight Stand", totalPrice: "₱1,995"},
  { dateAdded: "11/12/22", transactionID: "9093", productCode: "188093", receiptNum: "113093",  product: "Alice Violin String", totalPrice: "₱29,995"},
  { dateAdded: "11/12/22", transactionID: "9094", productCode: "188094", receiptNum: "114094",  product: "Bee Harmonica", totalPrice: "₱125"},
  { dateAdded: "11/12/22", transactionID: "9095", productCode: "188095", receiptNum: "115095",  product: "Cort Acoustic Guitar", totalPrice: "₱2,595"},
  { dateAdded: "11/12/22", transactionID: "9096", productCode: "188096", receiptNum: "116096",  product: "AD W/ W Case", totalPrice: "₱395"},
  { dateAdded: "11/12/22", transactionID: "9097", productCode: "188097", receiptNum: "117097",  product: "Maple Snare Drum", totalPrice: "₱295"},
  { dateAdded: "11/12/22", transactionID: "9098", productCode: "188098", receiptNum: "118098",  product: "Cymbal Straight Stand", totalPrice: "₱15,995"}, 
];

export default function DeletedPage() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);

  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex space-x-2">
            <Button className="bg-blue-400 text-white">
                <Download className="w-4 h-4"/>
              </Button>
            </div>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
          <h1 className="text-gray-600 font-bold">Deleted Transactions</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Retrieve/Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {transactions.map((transaction) => {
                  const product = products.find((p) => p.productCode === transaction.productCode) || {};
                  const deliveries = delivery.find((d) => d.deliveryNum === transaction.productCode) || {};
                  return (
                  <TableRow key={transaction.transactionID}>
                    <TableCell>{transaction.dateAdded}</TableCell>
                    <TableCell>{transaction.transactionID}</TableCell>
                    <TableCell>{transaction.productCode}</TableCell>
                    <TableCell>{transaction.receiptNum}</TableCell>
                    <TableCell>{transaction.product}</TableCell>
                    <TableCell>{transaction.totalPrice}</TableCell>
                {/*Details toggle button with modal pop-up */}              
                    <TableCell>              
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <Ellipsis size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-6">
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
                                <TableHead>Total</TableHead>
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
                                <TableCell>{transaction.totalPrice}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          ) : (
                            <p className="text-gray-500">Product details not found.</p>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    {/* For retrieving transactions */}
                    <TableCell className="flex items-center">           
                      <Dialog>
                        <DialogTrigger asChild> 
                          <span className="cursor-pointer text-gray-500 hover:text-blue-600">
                            <RotateCcw size={16} />
                          </span>
                        </DialogTrigger> 
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure you want to retrieve this transaction?</DialogTitle>
                            <DialogDescription>
                              This action will restore the transaction and update the sales report.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              className="bg-blue-400 text-white hover:bg-blue-700"
                              onClick={() => handleRetrieve(transaction.transactionID)}
                            >
                              Confirm
                            </Button>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
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
                              <span className="text-lg text-gray-400 font-normal italic">{transaction.transactionID}</span></DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <p className='text-sm text-gray-800 mt-2 pl-4'> Warning: This action will permanently remove the transaction from your records. Enter the admin password to continue. </p>
                          <div className="flex items-center gap-4 mt-4 pl-10">          
                            <div className="flex-1">
                              <label htmlFor={`password-${transaction.transactionID}`} className="text-base font-medium text-gray-700 block mb-2">
                                Admin Password
                              </label>
                              <Input type="password" id={`password-${transaction.transactionID}`} required
                                placeholder="Enter valid password"  className="w-full" 
                              />
                            </div>
          
                            <Button 
                              className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                              onClick={() => handleDelete(transaction.transactionID, 
                                document.getElementById(`password-${transaction.transactionID}`).value)}
                            >
                              DELETE TRANSACTION
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
