"use client";

import { useRouter } from 'next/navigation';
import { AppSidebar } from "@/components/staff-sidebar";
import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import { 
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell 
} from "@/components/ui/table";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Trash2, Undo2, Filter } from "lucide-react";
import MinimumScreenGuard from "@/components/MinimumScreenGuard";

// Sample product data for the batch deliveries
const productItems = [
  { productCode: "188090", supplier: "Lazer", brand: "Cort", product: "AD 890 NS W/ BAG", quantity: "2 pcs", unitPrice: "15,995", total: "31,990" },
  { productCode: "188091", supplier: "Lazer", brand: "Lazer", product: "Mapex Drumset (2 sets)", quantity: "2 sets", unitPrice: "4,995", total: "9,990" },
  { productCode: "188091", supplier: "Lazer", brand: "Lazer", product: "Mapex Drumset (2 sets)", quantity: "2 sets", unitPrice: "4,995", total: "9,990" },
];

export default function BatchDeliveriesPage() {
  const router = useRouter(); 

  const totalValue = productItems.reduce((sum, item) => {
    const numericTotal = parseFloat(item.total.replace(/,/g, ''));
    return sum + numericTotal;
  }, 0);
  
  const formattedTotal = totalValue.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  });

  return (
    <MinimumScreenGuard>
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col overflow-x-hidden">
          <div className="bg-blue-950 p-4 rounded-sm mb-2 shadow-md">
            <div className="flex items-center justify-between sticky top-2 z-10">
              <h1 className="text-2xl text-blue-50 font-bold">Batching of Deliveries</h1>
            
              <Button className="bg-blue-400 text-white" onClick={() => router.push("./deliveries")}>
                <Undo2 size={16} className="mr-2" />
                <span>Return to Deliveries</span>
              </Button>
            </div>
          </div>

          {/* Filter Card */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-1/3">
                    <Label htmlFor="deliveryDate" className="mb-1 block">Date of Delivery</Label>
                    <Input id="deliveryDate" type="date" />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="deliveryNumber" className="mb-1 block">Delivery Number</Label>
                    <Input id="deliveryNumber" placeholder="DR-12345" className="text-center"/>
                  </div>
                  <div className="flex items-end">
                    <Button className="bg-blue-400 text-white">
                      <Filter size={16} className="mr-2" />
                      Apply Filter
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main content layout */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Left side - Product items table */}
            <Card className="w-full lg:w-2/3 flex flex-col">
              <CardContent className="p-4 flex flex-col justify-between flex-grow">
                {/* Product items table with scrollable container */}
                <div className="flex flex-col overflow-auto max-h-[60vh] w-full">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow>
                        <TableHead>Product Code</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total (QxUP)</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productCode}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>{item.brand}</TableCell>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitPrice}</TableCell>
                          <TableCell>{item.total}</TableCell>
                          <TableCell>
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
                              <span className="text-lg text-gray-400 font-normal italic">{item.productCode}</span></DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                          <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">        
                            <div className="flex-1">
                              <label htmlFor={`password-${item.productCode}`} className="text-base font-medium text-gray-700 block mb-2">
                                Admin Password
                              </label>
                              <Input type="password" id={`password-${item.productCode}`} required
                                placeholder="Enter valid password"  className="w-full" 
                              />
                            </div>       
                            <Button 
                              className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                              onClick={() => handleDelete(item.productCode, 
                                document.getElementById(`password-${item.productCode}`).value)}
                            >
                              DELETE TRANSACTION
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                        <TableRow>
                          <TableCell colSpan={6} className="text-right text-gray-600 font-medium">
                            Total:
                          </TableCell>
                          <TableCell className="font-semibold text-gray-600"> {formattedTotal}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button className="bg-green-600 text-white">
                    SAVE DELIVERY
                  </Button>
                  <Button variant="outline" className="bg-gray-400 text-white">
                    DELETE DELIVERY
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right side - Add product form */}
            <Card className="w-full lg:w-1/3 flex flex-col justify-between  text-gray-700">
              <CardHeader className="pb-0">
                <CardTitle className="text-center text-xl">Add Product to Delivery Batch</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-1 justify-between">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Product A">Product A</SelectItem>
                        <SelectItem value="Product B">Product B</SelectItem>
                      </SelectContent>
                    </Select>   
                  </div>
                  
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select>
                      <SelectTrigger id="supplier" className="mt-1">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lazer">Lazer</SelectItem>
                        <SelectItem value="mirbros">Mirbros</SelectItem>
                        <SelectItem value="yamaha">Yamaha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                                 
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select>
                      <SelectTrigger id="brand" className="mt-1">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cort">Cort</SelectItem>
                        <SelectItem value="lazer">Lazer</SelectItem>
                        <SelectItem value="yamaha">Yamaha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Select>
                      <SelectTrigger id="unitPrice" className="mt-1">
                        <SelectValue placeholder="Select price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">₱1,000</SelectItem>
                        <SelectItem value="2000">₱2,000</SelectItem>
                        <SelectItem value="5000">₱5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Select>
                      <SelectTrigger id="quantity" className="mt-1">
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Button className="w-2/3 bg-blue-400 text-white">
                      ADD PRODUCT
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Payment Details Section */}
          <div className="w-full mt-6 mb-4">
            <h2 className="text-2xl text-blue-950 font-bold">Delivery Payment Details</h2>
          </div>
          
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-4">
                {/* First row */}
                <div className="col-span-3">
                  <Label htmlFor="paymentDeliveryNumber" className="mb-1 block">Delivery Number</Label>
                  <Input id="paymentDeliveryNumber" placeholder="DR-12345" className=" bg-gray-200 text-center" readOnly />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentAmount" className="mb-1 block">Amount</Label>
                  <Input id="paymentAmount" value="51,970" className="bg-red-800 text-white text-center" readOnly />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentType" className="mb-1 block">Payment Type</Label>
                  <Select>
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
                  <Select>
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
                <div className="col-span-3">
                  <Label htmlFor="paymentStatus" className="mb-1 block">Payment Status</Label>
                  <Select>
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
                  <Input id="paymentDateDue" type="date" />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentDate1" className="mb-1 block">Date of Payment 1</Label>
                  <Input id="paymentDate1" type="date" />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentDate2" className="mb-1 block">Date of Payment 2</Label>
                  <Input id="paymentDate2" type="date" />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button className="bg-blue-400 text-white">
                  SAVE DETAILS
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </SidebarProvider>
    </MinimumScreenGuard>
  );
}