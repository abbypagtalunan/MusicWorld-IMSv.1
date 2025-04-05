"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ListFilter, Download, FilePen, Trash2 } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";


// Sample product data
const product = [
  { productCode: "188090", dateAdded: "11/12/22", supplier: "Lazer", brand: "Cort", category: "Guitar", product: "AD W/ W Case", quantity: 2, price: "₱15,995", sellingprice:"1", status: "Active" },
  { productCode: "188091", dateAdded: "11/12/22", supplier: "Lazer", brand: "Lazer", category: "Drum", product: "Maple Snare Drum", quantity: 1, price: "₱4,500", sellingprice:"1", status: "Active" },
  { productCode: "188092", dateAdded: "11/12/22", supplier: "Lazer", brand: "Lazer", category: "Drum", product: "Cymbal Straight Stand", quantity: 3, price: "₱2,395", sellingprice:"1", status: "Active" },
  { productCode: "188093", dateAdded: "11/12/22", supplier: "Lazer", brand: "Alice", category: "Violin String", product: "Alice Violin String", quantity: 0, price: "₱395", sellingprice:"1", status: "Discontinued" },
  { productCode: "188094", dateAdded: "11/12/22", supplier: "Lazer", brand: "Bee", category: "Harmonica", product: "Bee Harmonica", quantity: 0, price: "₱295", sellingprice:"1", status: "Out of Stock" },
  { productCode: "188095", dateAdded: "11/12/22", supplier: "Lazer", brand: "Cort", category: "Guitar", product: "Cort Acoustic Guitar", quantity: 2, price: "₱15,995", sellingprice:"1", status: "Low Stock" },
  { productCode: "188096", dateAdded: "11/12/22", supplier: "Lazer", brand: "Cort", category: "Guitar", product: "AD W/ W Case", quantity: 2, price: "₱15,995", sellingprice:"1", status: "Active" },
  { productCode: "188097", dateAdded: "11/12/22", supplier: "Lazer", brand: "Lazer", category: "Drum", product: "Maple Snare Drum", quantity: 1, price: "₱4,500", sellingprice:"1", status: "Active" },
  { productCode: "188098", dateAdded: "11/12/22", supplier: "Lazer", brand: "Lazer", category: "Drum", product: "Cymbal Straight Stand", quantity: 3, price: "₱2,395", sellingprice:"1", status: "Active" },
];

export default function ProductTable() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openEditSheet = (product) => {
    setSelectedProduct(product);
    setSheetOpen(true);
  };

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);

  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  const getFilteredTransactions = () => {
    let sortedTransactions = [...product];
    if (!selectedFilter || !selectedSubFilter) return sortedTransactions;

    if (selectedFilter === "Supplier") {
      sortedTransactions = sortedTransactions.filter((item) => item.supplier === selectedSubFilter);
    }
  
    if (selectedFilter === "Brand") {
      sortedTransactions = sortedTransactions.filter((item) => item.brand === selectedSubFilter);
    }

    if (selectedFilter === "Product Status") {
      sortedTransactions = sortedTransactions.filter((item) => item.status === selectedSubFilter);
    }

    if (selectedFilter === "Product Name") {
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Ascending"
          ? a.product.localeCompare(b.product)
          : b.product.localeCompare(a.product)
      );
    }

    if (selectedFilter === "Price") {
      const getPrice = (price) => parseFloat(price.replace(/[^\d.]/g, ""));
      sortedTransactions.sort((a, b) =>
        selectedSubFilter === "Low to High"
          ? getPrice(a.price) - getPrice(b.price)
          : getPrice(b.price) - getPrice(a.price)
      );
    }
    return sortedTransactions;
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
                  placeholder="Search product, category, item code"
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
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Brand</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Brand", "Cort")}>
                          Cort
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Brand", "Lazer")}>
                          Lazer
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
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Product Status</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Active")}>
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Out of Stock")}>
                          Out of Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Low Stock")}>
                          Low Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterSelect("Product Status", "Discontinued")}>
                          Discontinued
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
            <div className="flex space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-blue-400 text-white">Add Product</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] h-full flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="text-blue-400 text-xl font-bold">Add New Product</SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto flex flex-col space-y-4">
                    <Label className>Product Code</Label>
                    <Input placeholder="Enter product code" />

                    <Label>Date Added</Label>
                    <Input type="date" />

                    <Label>Supplier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lazer">Lazer</SelectItem>
                        <SelectItem value="Cort">Cort</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label>Brand</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cort">Cort</SelectItem>
                        <SelectItem value="Lazer">Lazer</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Guitar">Guitar</SelectItem>
                        <SelectItem value="Drum">Drum</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label>Product Name</Label>
                    <Input placeholder="Enter product name" />

                    <Label>Quantity</Label>
                    <Input type="number" placeholder="Enter quantity" />

                    <Label>Price</Label>
                    <Input type="text" placeholder="Enter price" />

                    <Label>Selling Price</Label>
                    <Input type="text" placeholder="Enter selling price" />

                    <Label>Product Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-blue-400 text-white w-full mt-4">Add Product</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-400 text-white">Update Price</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-blue-400 text-xl font-bold mb-4">Product Price Update</DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-col space-y-3">
                    <Label>Product Name</Label>
                    <Input placeholder="Enter product name" />

                    <Label>Supplier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lazer">Lazer</SelectItem>
                        <SelectItem value="Cort">Cort</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label>Product Code</Label>
                    <Input disabled placeholder="Auto-filled" className="bg-gray-300" />

                    <Label>Price</Label>
                    <Input disabled placeholder="Auto-filled" className="bg-gray-300" />

                    <Label>Updated Price</Label>
                    <Input type="text" placeholder="Enter new price" />
                  </div>

                  <DialogFooter>
                    <Button className="bg-blue-500 text-white w-full">Update Product Price</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button className="bg-blue-400 text-white">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
          <h1 className="text-gray-600 font-bold">Products</h1>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>View/Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredTransactions().map((product) => (
                  <TableRow key={product.productCode} className={getStatusColor(product.status)}>
                    <TableCell>{product.productCode}</TableCell>
                    <TableCell>{product.dateAdded}</TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.product}</TableCell>
                    <TableCell>{product.quantity} pcs</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.sellingprice}</TableCell>
                    <TableCell className={`font-semibold ${getStatusTextColor(product.status)}`}>{product.status}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" onClick={() => openEditSheet(product)}>
                        <FilePen size={16} />
                      </Button>
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
                                <span className="text-lg text-gray-400 font-normal italic">{product.productCode}</span></DialogTitle>
                              <DialogClose />
                            </DialogHeader>
                            <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
                            <div className="flex items-center gap-4 mt-4 pl-10">          
                              <div className="flex-1">
                                <label htmlFor={`password-${product.productCode}`} className="text-base font-medium text-gray-700 block mb-2">
                                  Admin Password
                                </label>
                                <Input type="password" id={`password-${product.productCode}`} required
                                  placeholder="Enter valid password"  className="w-full" 
                                />
                              </div>
            
                              <Button 
                                className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                onClick={() => handleDelete(product.productCode, 
                                  document.getElementById(`password-${product.productCode}`).value)}
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
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[400px] h-full flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-blue-400 text-xl font-bold">Edit Product Details</SheetTitle>
          </SheetHeader>
          {selectedProduct && (
            <div className="overflow-y-auto flex flex-col space-y-4">
              <label className="text-black font-semibold text-sm">Product Code</label>
              <Input value={selectedProduct.productCode} disabled className="bg-gray-200" />

              <label className="text-black font-semibold text-sm">Date Added</label>
              <Input value={selectedProduct.dateAdded} disabled className="bg-gray-200" />

              <label className="text-black font-semibold text-sm">Supplier</label>
              <Select value={selectedProduct.supplier}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedProduct.supplier}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lazer">Lazer</SelectItem>
                  <SelectItem value="Cort">Cort</SelectItem>
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Brand</label>
              <Select value={selectedProduct.brand}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedProduct.brand}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cort">Cort</SelectItem>
                  <SelectItem value="Lazer">Lazer</SelectItem>
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Category</label>
              <Select value={selectedProduct.category}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedProduct.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Guitar">Guitar</SelectItem>
                  <SelectItem value="Drum">Drum</SelectItem>
                </SelectContent>
              </Select>

              <label className="text-black font-semibold text-sm">Product Name</label>
              <Input placeholder={selectedProduct.product} />

              <label className="text-black font-semibold text-sm">Quantity</label>
              <Input type="number" defaultValue={selectedProduct.quantity} />

              <label className="text-black font-semibold text-sm">Price</label>
              <Input type="text" defaultValue={selectedProduct.price} />

              <label className="text-black font-semibold text-sm">Selling Price</label>
              <Input type="text" defaultValue={selectedProduct.sellingprice} />

              <label className="text-black font-semibold text-sm">Product Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={selectedProduct.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-blue-400 text-white w-full mt-4">Save Edit</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
        </div>
      </div>
    </div>
    </SidebarProvider>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "Out of Stock":
      return "bg-red-100";
    case "Low Stock":
      return "bg-yellow-100";
    case "Discontinued":
      return "bg-gray-100";
    default:
      return "";
  }
}

function getStatusTextColor(status) {
  switch (status) {
    case "Active":
      return "text-green-600";
    case "Out of Stock":
      return "text-red-600";
    case "Low Stock":
      return "text-orange-600";
    case "Discontinued":
      return "text-gray-500";
  }
}