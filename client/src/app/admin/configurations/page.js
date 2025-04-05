// TEST CONFIGURATION

"use client";

import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FilePen } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ConfigurationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierData, setSupplierData] = useState([]);
  const [ , setActiveTab] = useState("add-suplier");

  const filteredSuppliers = supplierData.filter((supplier) =>
    supplier.S_supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.S_supplierID.includes(searchTerm)
  );  

  useEffect(() => {
    fetch("http://localhost:8080/fetchSupplier")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setSupplierData(data);
    })
    .catch((error) => console.error("Error fetching supplier data:", error));
  }, []);
  

  const [values, setValues] = useState({
    S_supplierName: "",
    S_supplierID: "",
  });

  function handleSubmit(e){
    e.preventDefault();
    axios.post('/add_config', values)
      .then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log(err);
      });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full">
          <h1 className="text-lg font-medium text-gray-600 mt-4 mb-6">Configurations</h1>

          <Tabs defaultValue="add-supplier" className="w-full mb-4" onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start bg-white shadow-md rounded-md px-6 py-6 mb-4">
              <TabsTrigger value="add-supplier" className="data-[state=active]:text-indigo-600 hover:text-black">ADD SUPPLIER</TabsTrigger>
            </TabsList>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Content */}
              <div className="w-full lg:w-2/3 flex flex-col">
                <TabsContent value="add-supplier">
                  <Card className="flex flex-col flex-grow">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search supplier"
                          className="pl-9 py-2 text-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      {/* TABLE */}
                      <div className="overflow-x-auto max-h-[60vh]">
                        <Table>
                          <TableBody>
                            {filteredSuppliers.map((supplier) => (
                              <TableRow key={supplier.id} className="hover:bg-gray-50">
                                
                                {/* DATA */}
                                <TableCell className="py-2">
                                  <div className="font-medium text-sm">{supplier.S_supplierName}</div>
                                  <div className="text-xs text-gray-500">Code: {supplier.S_supplierID}</div>
                                </TableCell>

                                {/* EDIT */}
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
              </div>

              {/* Right Content */}
              <div className="w-full lg:w-1/3 h-fit">
                <TabsContent value="add-supplier">
                  <Card>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-center text-xl">Add Supplier</CardTitle>
                    </CardHeader>
                    {/* TEST */}
                    <CardContent className="p-4 flex flex-col flex-1 justify-between-4">
                      <div className="space-y-3">
                        <form onSubmit={handleSubmit}>
                          <div>
                            <Label className="text-sm">Supplier</Label>
                            <input
                              type="text"
                              name="S_supplierName"
                              placeholder="Enter supplier"
                              onChange={(e) => setValues({...values, S_supplierName: e.target.value})}
                              className="border border-gray-300 p-2 rounded text-sm w-full"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Code</Label>
                            <input
                              type="text"
                              name="S_supplierID"
                              placeholder="Enter code"
                              onChange={(e) => setValues({...values, S_supplierID: e.target.value})}
                              className="border border-gray-300 p-2 rounded text-sm w-full"
                            />
                          </div>
                          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">ADD</Button>
                        </form>
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
