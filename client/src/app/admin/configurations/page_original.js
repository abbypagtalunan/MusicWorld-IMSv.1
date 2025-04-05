"use client";

import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, FilePen } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"


const supplierData = [
  { id: 1, name: "LAZER", code: "1" },
  { id: 2, name: "CORT", code: "2" }
];

export default function ConfigurationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBrand, setSearchBrand] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchPaymentType, setSearchPaymentType] = useState("");
  const [ , setActiveTab] = useState("add-supplier");

  const filteredSuppliers = supplierData.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code.includes(searchTerm)
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <h1 className="text-lg font-medium text-gray-600 mt-4 mb-6">Configurations</h1>

          {/* Tab switch */}
          <Tabs defaultValue="add-supplier" className="w-full mb-4" onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start bg-white shadow-md rounded-md px-6 py-6 mb-4">
              <TabsTrigger value="add-supplier" className="data-[state=active]:text-indigo-600 hover:text-black">ADD SUPPLIER</TabsTrigger>
              <TabsTrigger value="add-brand" className="data-[state=active]:text-indigo-600 hover:text-black">ADD BRAND</TabsTrigger>
              <TabsTrigger value="add-category" className="data-[state=active]:text-indigo-600 hover:text-black">ADD CATEGORY</TabsTrigger>
              <TabsTrigger value="add-product-status" className="data-[state=active]:text-indigo-600 hover:text-black">ADD PRODUCT STATUS</TabsTrigger>
              <TabsTrigger value="add-payment-type" className="data-[state=active]:text-indigo-600 hover:text-black">  ADD TYPE OF PAYMENT</TabsTrigger>
            </TabsList>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* ------------ Left Panel Content on each Tab Switch ------------ */}
              <div className="w-full lg:w-2/3 flex flex-col">
              {/* Add Supplier Tab */}
                <TabsContent value="add-supplier">
                  <Card className="flex flex-col flex-grow">
                    <CardContent className="p-4">
                      {/* Search filter function */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search supplier"
                          className="pl-9 py-2 text-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="overflow-x-auto max-h-[60vh]">
                        {/* Table for Add Supplier Tab */}
                        <Table>
                          <TableBody>
                            {filteredSuppliers.map((supplier) => (
                              <TableRow key={supplier.id} className="hover:bg-gray-50">
                                <TableCell className="py-2">
                                  <div className="font-medium text-sm">{supplier.name}</div>
                                  <div className="text-xs text-gray-500">Code: {supplier.code}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" className="h-8 w-8">
                                    <FilePen size={16} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {filteredSuppliers.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                                  No suppliers found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Add Brand Tab */}
                <TabsContent value="add-brand">
                  <Card className="flex flex-col flex-grow">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search brand"
                          className="pl-9 py-2 text-sm"
                          value={searchBrand}
                          onChange={(e) => setSearchBrand(e.target.value)}
                        />
                      </div>
                      {/* where Table for Add Brand Tab goes */}
                      <div className="text-sm text-gray-500">Brand content here...</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Add Category Tab */}
                <TabsContent value="add-category">
                  <Card className="flex flex-col flex-grow">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search category"
                          className="pl-9 py-2 text-sm"
                          value={searchCategory}
                          onChange={(e) => setSearchCategory(e.target.value)}
                        />
                      </div>
                      {/* where Table for Add Category Tab goes */}                  
                      <div className="text-sm text-gray-500">Category content here...</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Add Product Status Tab */}
                <TabsContent value="add-product-status">
                  <Card className="flex flex-col flex-grow">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search status"
                          className="pl-9 py-2 text-sm"
                          value={searchStatus}
                          onChange={(e) => setSearchStatus(e.target.value)}
                        />
                      </div>
                      {/* where Table for Add Product Status Tab goes */}                      
                      <div className="text-sm text-gray-500">Product status content here...</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Add Type of Payment Tab */}    
                <TabsContent value="add-payment-type">
                  <Card className="flex flex-col flex-grow">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search payment type"
                          className="pl-9 py-2 text-sm"
                          value={searchPaymentType}
                          onChange={(e) => setSearchPaymentType(e.target.value)}
                        />
                      </div>
                      {/* where Table for Type of Payment Tab goes */}   
                      <div className="text-sm text-gray-500">Payment type content here...</div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>

              {/* ------------ Right Panel Form on each Tab Switch ------------ */}
              <div className="w-full lg:w-1/3 h-fit">
              {/* Card Modal for Supplier */}
                <TabsContent value="add-supplier">
                  <Card>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-center text-xl">Add Supplier</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col flex-1 justify-between-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Supplier</Label>
                          <Input id="supplier" placeholder="Enter supplier" className="col-span-3" />
                        </div>
                        <div>
                          <Label className="text-sm">Code</Label>
                          <Input id="supplier-code" placeholder="Enter code" className="col-span-3" />
                        </div>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">ADD</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Card Modal for Brand */}
                <TabsContent value="add-brand">
                  <Card>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-center text-xl">Add Brand</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">Brand Name</Label>
                          <Input id="brand" placeholder="Enter brand" className="col-span-3" />
                        </div>
                        <div>
                          <Label className="text-sm">Code</Label>
                          <Input id="brand-code" placeholder="Enter code" className="col-span-3" />
                        </div>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">ADD</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Card Modal for Category */}                
                <TabsContent value="add-category">
                  <Card>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-center text-xl">Add Category</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">Category Name</Label>
                          <Input id="category" placeholder="Enter category" className="col-span-3" />
                        </div>
                        <div>
                          <Label className="text-sm">Code</Label>
                          <Input id="category-code" placeholder="Enter code" className="col-span-3" />
                        </div>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">ADD</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Card Modal for Product Status */}
                <TabsContent value="add-product-status">
                  <Card>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-center text-xl">Add Product Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">Product Status</Label>
                          <Input id="product-status" placeholder="Enter product status" className="col-span-3" />
                        </div>
                        <div>
                          <Label className="text-sm">Code</Label>
                          <Input id="product-status-code" placeholder="Enter code" className="col-span-3" />
                        </div>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">ADD</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Card Modal for Payment Type */}
                <TabsContent value="add-payment-type">
                  <Card>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-center text-xl">Add Type of Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">Payment Type</Label>
                          <Input id="payment-type" placeholder="Enter payment type" className="col-span-3" />
                        </div>
                        <div>
                          <Label className="text-sm">Code</Label>
                          <Input id="payment-type-code" placeholder="Enter code" className="col-span-3" />
                        </div>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">ADD</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </SidebarProvider>
  );
}
