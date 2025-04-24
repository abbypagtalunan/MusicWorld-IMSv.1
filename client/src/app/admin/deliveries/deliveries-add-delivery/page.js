"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppSidebar } from "@/components/admin-sidebar"
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

export default function BatchDeliveriesPage() {
  const router = useRouter();
  
  // State for product items in the table
  const [productItems, setProductItems] = useState([
    { productCode: "188090", supplier: "Lazer", brand: "Cort", product: "AD 890 NS W/ BAG", quantity: "2 pcs", unitPrice: "15,995", total: "31,990" },
    { productCode: "188091", supplier: "Lazer", brand: "Lazer", product: "Mapex Drumset (2 sets)", quantity: "2 sets", unitPrice: "4,995", total: "9,990" },
  ]);
  
  // State for new product form
  const [newProduct, setNewProduct] = useState({
    product: "",
    supplier: "",
    brand: "",
    unitPrice: "",
    quantity: ""
  });

  // Function to calculate total value of all products
  const calculateTotal = () => {
    return productItems.reduce((sum, item) => {
      const numericTotal = parseFloat(item.total.replace(/,/g, ''));
      return sum + numericTotal;
    }, 0);
  };
  
  // Format total for display
  const formattedTotal = calculateTotal().toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  });

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewProduct({
      ...newProduct,
      [field]: value
    });
  };

  // Generate a unique product code
  const generateProductCode = () => {
    // Simple logic to generate a sequential product code
    const lastCode = productItems.length > 0 
      ? parseInt(productItems[productItems.length - 1].productCode)
      : 188091;
    return (lastCode + 1).toString();
  };

  // Add new product to the list
  const handleAddProduct = () => {
    // Validate form inputs
    if (!newProduct.product || !newProduct.supplier || !newProduct.brand || !newProduct.unitPrice || !newProduct.quantity) {
      alert("Please fill in all fields");
      return;
    }

    // Format the values
    const quantity = `${newProduct.quantity} ${parseInt(newProduct.quantity) > 1 ? 'pcs' : 'pc'}`;
    const unitPrice = parseInt(newProduct.unitPrice).toLocaleString();
    const total = (parseInt(newProduct.unitPrice) * parseInt(newProduct.quantity)).toLocaleString();

    // Create new product object
    const productToAdd = {
      productCode: generateProductCode(),
      supplier: newProduct.supplier,
      brand: newProduct.brand,
      product: newProduct.product,
      quantity: quantity,
      unitPrice: unitPrice,
      total: total
    };

    // Add to product items list
    setProductItems([...productItems, productToAdd]);

    // Clear form fields
    setNewProduct({
      product: "",
      supplier: "",
      brand: "",
      unitPrice: "",
      quantity: ""
    });
  };

  // Handle deleting a product
  const handleDeleteProduct = (index) => {
    const updatedItems = [...productItems];
    updatedItems.splice(index, 1);
    setProductItems(updatedItems);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl text-gray-600 font-medium">Batching of Deliveries</h1>
            </div>
            <div>
              <Button className="bg-blue-400 text-white" onClick={() => router.push("./")}>
                <Undo2 size={16} className="mr-2" />
                <span>Return to Deliveries</span>
              </Button>
            </div>
          </div>

          {/* Filter Card */}
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
                    <Input id="deliveryNumber" placeholder="DR-12354" className="text-center"/>
                  </div>
                  <div className="flex items-end">
                    <Button className="bg-blue-500 text-white">
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
                <div className="overflow-x-auto max-h-[60vh] flex-grow">
                  <Table>
                    <TableHeader className="bg-gray-100 sticky top-0">
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteProduct(index)}
                            >
                              <Trash2 size={16} />
                            </Button>
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
                {/* Dialogue box for deleting transactions */}                
                <div className="flex justify-end gap-2 mt-6">
                  <Button className="bg-green-600 text-white">
                    SAVE DELIVERY
                  </Button>
                  <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="outline" className="bg-gray-400 text-white">
                        DELETE DELIVERY
                      </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-7 text-gray-700">
                        <DialogHeader>
                            <DialogTitle>
                              <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                              <span className="text-lg text-gray-400 font-normal italic">{"DR-12354"}</span></DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                          <div className="flex items-center gap-4 mt-4 pl-10">          
                            <div className="flex-1">
                              <label htmlFor={`password-${"DR-12354"}`} className="text-base font-medium text-gray-700 block mb-2">
                                Admin Password
                              </label>
                              <Input type="password" id={`password-${"DR-12354"}`} required
                                placeholder="Enter valid password"  className="w-full" 
                              />
                            </div>       
                            <Button 
                              className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                              onClick={() => handleDelete("DR-12354", 
                                document.getElementById(`password-${"DR-12354"}`).value)}
                            >
                              DELETE TRANSACTION
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Right side - Add product form */}
            <Card className="w-full lg:w-1/3 flex flex-col justify-between text-gray-700">
              <CardHeader className="pb-0">
                <CardTitle className="text-center text-xl">Add Product to Delivery Batch</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-1 justify-between">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Select onValueChange={(value) => handleInputChange('product', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4/4 Lazer Bow">4/4 Lazer Bow</SelectItem>
                        <SelectItem value="Bee Harmonica (small)">Bee Harmonica (small)</SelectItem>
                        <SelectItem value="Blueridge G12 Capo (Black)">Blueridge G12 Capo (Black)</SelectItem>
                        <SelectItem value="Blueridge G12 Capo (Green)">Blueridge G12 Capo (Green)</SelectItem>
                        <SelectItem value="Blueridge G12 Capo (Red)">Blueridge G12 Capo (Red)</SelectItem>
                        <SelectItem value="Blueridge Guitar Amp">Blueridge Guitar Amp</SelectItem>
                        <SelectItem value="Blueridge Guitar Capo">Blueridge Guitar Capo</SelectItem>
                        <SelectItem value="C40 Yamaha Classical Guitar">C40 Yamaha Classical Guitar</SelectItem>
                        <SelectItem value="Cort Acoustic Guitar AD180E - TOKS">Cort Acoustic Guitar AD180E - TOKS</SelectItem>
                        <SelectItem value="Cort Acoustic Guitar AD810 - OP">Cort Acoustic Guitar AD810 - OP</SelectItem>
                        <SelectItem value="Cort Acoustic Guitar AD880 - CE - BK">Cort Acoustic Guitar AD880 - CE - BK</SelectItem>
                        <SelectItem value="Aegean Violin String">Aegean Violin String</SelectItem>
                        <SelectItem value="Cort Acoustic Guitar AD880 - MS">Cort Acoustic Guitar AD880 - MS</SelectItem>
                        <SelectItem value="Cort AD 810 E BKS w/ bag">Cort AD 810 E BKS w/ bag</SelectItem>
                        <SelectItem value="Cort AD 880 CE BK w/ bag">Cort AD 880 CE BK w/ bag</SelectItem>
                        <SelectItem value="Cort AD 880 NS w/ bag">Cort AD 880 NS w/ bag</SelectItem>
                        <SelectItem value="Cort CM15R">Cort CM15R</SelectItem>
                        <SelectItem value="Cort CM15R Amp">Cort CM15R Amp</SelectItem>
                        <SelectItem value="Cort CM30R">Cort CM30R</SelectItem>
                        <SelectItem value="Cort G110 Electric Guitar (OPBC)">Cort G110 Electric Guitar (OPBC)</SelectItem>
                        <SelectItem value="Cort G110 Electric Guitar (OPBK)">Cort G110 Electric Guitar (OPBK)</SelectItem>
                        <SelectItem value="Cort Mix5">Cort Mix5</SelectItem>
                        <SelectItem value="Aegean Violin Strings">Aegean Violin Strings</SelectItem>
                        <SelectItem value="Cort Mix5 Multi-Purpose AMP">Cort Mix5 Multi-Purpose AMP</SelectItem>
                        <SelectItem value="Crash Cymbal Stand">Crash Cymbal Stand</SelectItem>
                        <SelectItem value="Crash Cymbal Stand M1000A">Crash Cymbal Stand M1000A</SelectItem>
                        <SelectItem value="Cymbal Stand Boom">Cymbal Stand Boom</SelectItem>
                        <SelectItem value="D'Addario XL Bass strings">D'Addario XL Bass strings</SelectItem>
                        <SelectItem value="DD75 Yamaha Digital Piano">DD75 Yamaha Digital Piano</SelectItem>
                        <SelectItem value="Drumkey">Drumkey</SelectItem>
                        <SelectItem value="Floor tom stand & screws">Floor tom stand & screws</SelectItem>
                        <SelectItem value="Flute Recorder">Flute Recorder</SelectItem>
                        <SelectItem value="Flute recorder 2">Flute recorder 2</SelectItem>
                        <SelectItem value="Alice Fret Wire & AO44 Machine Head Polish">Alice Fret Wire & AO44 Machine Head Polish</SelectItem>
                        <SelectItem value="Folk guitar Hard Case AF-1">Folk guitar Hard Case AF-1</SelectItem>
                        <SelectItem value="FX30 Yamaha Acoustic Guitar">FX30 Yamaha Acoustic Guitar</SelectItem>
                        <SelectItem value="Lazer 4/4 Violin">Lazer 4/4 Violin</SelectItem>
                        <SelectItem value="Lazer Acoustic gig bag">Lazer Acoustic gig bag</SelectItem>
                        <SelectItem value="Lazer Bass gig bag">Lazer Bass gig bag</SelectItem>
                        <SelectItem value="Lazer Drumset">Lazer Drumset</SelectItem>
                        <SelectItem value="Lazer Electric gig bag">Lazer Electric gig bag</SelectItem>
                        <SelectItem value="Lazer Soprano Straight Sax">Lazer Soprano Straight Sax</SelectItem>
                        <SelectItem value="Mapex Drum set">Mapex Drum set</SelectItem>
                        <SelectItem value="Mic Foam (black)">Mic Foam (black)</SelectItem>
                        <SelectItem value="Alice Violin strings">Alice Violin strings</SelectItem>
                        <SelectItem value="Mic Foam (red)">Mic Foam (red)</SelectItem>
                        <SelectItem value="Mooer 9V Adapter">Mooer 9V Adapter</SelectItem>
                        <SelectItem value="Musedo Sustain Pedal">Musedo Sustain Pedal</SelectItem>
                        <SelectItem value="P51 Keyboard">P51 Keyboard</SelectItem>
                        <SelectItem value="Parlights">Parlights</SelectItem>
                        <SelectItem value="Patch Cable">Patch Cable</SelectItem>
                        <SelectItem value="Pins">Pins</SelectItem>
                        <SelectItem value="Ring Mute 12 PE 0680">Ring Mute 12 PE 0680"</SelectItem>
                        <SelectItem value="Ring mute 16 PE 0680">Ring mute 16 PE 0680"</SelectItem>
                        <SelectItem value="Aquila Ukulele String">Aquila Ukulele String</SelectItem>
                        <SelectItem value="Roto Pink string">Roto Pink string</SelectItem>
                        <SelectItem value="Single Pedal Lazer">Single Pedal Lazer</SelectItem>
                        <SelectItem value="Soundking patch cable BSS213">Soundking patch cable BSS213</SelectItem>
                        <SelectItem value="Soundking str cable 5m">Soundking str cable 5m</SelectItem>
                        <SelectItem value="Strap pin">Strap pin</SelectItem>
                        <SelectItem value="Valve Oil SG Galante">Valve Oil SG Galante</SelectItem>
                        <SelectItem value="Violin 4/4 (Student)">Violin 4/4 (Student)</SelectItem>
                        <SelectItem value="Violin 4/4 30112F (Pro)">Violin 4/4 30112F (Pro)</SelectItem>
                        <SelectItem value="Violin strings #1">Violin strings #1</SelectItem>
                        <SelectItem value="B020 - HLC - Bass drum w/ harness">B020 - HLC - Bass drum w/ harness</SelectItem>
                        <SelectItem value="Yamaha Acoustic Guitar C40VC 1102">Yamaha Acoustic Guitar C40VC 1102</SelectItem>
                        <SelectItem value="Yamaha Acoustic Guitar FX310">Yamaha Acoustic Guitar FX310</SelectItem>
                        <SelectItem value="Yamaha Acoustic Guitar FY310VC">Yamaha Acoustic Guitar FY310VC</SelectItem>
                        <SelectItem value="Yamaha Adapter">Yamaha Adapter</SelectItem>
                        <SelectItem value="Yamaha APX600M">Yamaha APX600M</SelectItem>
                        <SelectItem value="Yamaha E243 Keyboard">Yamaha E243 Keyboard</SelectItem>
                        <SelectItem value="Yamaha E273 Keyboard">Yamaha E273 Keyboard</SelectItem>
                        <SelectItem value="Yamaha E373 (1)">Yamaha E373 (1)</SelectItem>
                        <SelectItem value="Yamaha E373 Keyboard (2)">Yamaha E373 Keyboard (2)</SelectItem>
                        <SelectItem value="Yamaha E373 Keyboard (3)">Yamaha E373 Keyboard (3)</SelectItem>
                        <SelectItem value="Bass Guitar Cort IE22070R96">Bass Guitar Cort IE22070R96</SelectItem>
                        <SelectItem value="Yamaha E473 Keyboard">Yamaha E473 Keyboard</SelectItem>
                        <SelectItem value="Yamaha F51 Keyboard">Yamaha F51 Keyboard</SelectItem>
                        <SelectItem value="Yamaha P125B Digital Piano">Yamaha P125B Digital Piano</SelectItem>
                        <SelectItem value="Yamaha P45 Digital Piano">Yamaha P45 Digital Piano</SelectItem>
                        <SelectItem value="16 channel Snake Cable">16 channel Snake Cable</SelectItem>
                        <SelectItem value="Bee Harmonica (big)">Bee Harmonica (big)</SelectItem>
                      </SelectContent>
                    </Select>   
                  </div>
                  
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select onValueChange={(value) => handleInputChange('supplier', value)}>
                      <SelectTrigger id="supplier" className="mt-1">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lazer">Lazer</SelectItem>
                        <SelectItem value="Mirbros">Mirbros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                                 
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select onValueChange={(value) => handleInputChange('brand', value)}>
                      <SelectTrigger id="brand" className="mt-1">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alice String">Alice String</SelectItem>
                        <SelectItem value="Mooer Audio">Mooer Audio</SelectItem>
                        <SelectItem value="Musedo">Musedo</SelectItem>
                        <SelectItem value="Roto Sound">Roto Sound</SelectItem>
                        <SelectItem value="Soundking">Soundking</SelectItem>
                        <SelectItem value="Yamaha">Yamaha</SelectItem>
                        <SelectItem value="Aegean">Aegean</SelectItem>
                        <SelectItem value="Brand1">Brand1</SelectItem>
                        <SelectItem value="Aquila">Aquila</SelectItem>
                        <SelectItem value="Bee">Bee</SelectItem>
                        <SelectItem value="Blueridge">Blueridge</SelectItem>
                        <SelectItem value="Brand">Brand</SelectItem>
                        <SelectItem value="Cort Guitars">Cort Guitars</SelectItem>
                        <SelectItem value="D'Addario">D'Addario</SelectItem>
                        <SelectItem value="Lazer Music">Lazer Music</SelectItem>
                        <SelectItem value="Mapex">Mapex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input 
                      id="unitPrice" 
                      type="number" 
                      placeholder="Enter unit price" 
                      className="mt-1"
                      value={newProduct.unitPrice}
                      onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      placeholder="Enter quantity" 
                      className="mt-1"
                      value={newProduct.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Button 
                      className="w-2/3 bg-blue-500 text-white"
                      onClick={handleAddProduct}
                    >
                      ADD PRODUCT
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Payment Details Section */}
          <div className="w-full mt-6 mb-4">
            <h2 className="text-xl text-gray-600 font-medium">Delivery Payment Details</h2>
          </div>
          
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-4">
                {/* First row */}
                <div className="col-span-3">
                  <Label htmlFor="paymentDeliveryNumber" className="mb-1 block">Delivery Number</Label>
                  <Input id="paymentDeliveryNumber" placeholder="DR-12354" className=" bg-gray-200 text-center" readOnly />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="paymentAmount" className="mb-1 block">Amount</Label>
                  <Input id="paymentAmount" value={formattedTotal.replace('₱', '')} className="bg-red-800 text-white text-center" readOnly />
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
                <Button className="bg-blue-600 text-white">
                  SAVE DETAILS
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}