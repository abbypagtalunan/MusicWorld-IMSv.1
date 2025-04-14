"use client";
import { AppSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,   DialogFooter,} from "@/components/ui/dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FilePen, Trash } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ConfigurationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierData, setSupplierData] = useState([]);
  const [ , setActiveTab] = useState("add-suplier");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSupplierID, setSelectedSupplierID] = useState(null);
  const filteredSuppliers = supplierData.filter((supplier) =>
    supplier.S_supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.S_supplierID.includes(searchTerm)
  );  
  const [values, setValues] = useState({
    S_supplierName: "",
    S_supplierID: "",
  });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const editSupplier = (supplier) => {
    // Populate form with selected supplier's data
    setEditingSupplier(supplier);
    setValues({ S_supplierID: supplier.S_supplierID, S_supplierName: supplier.S_supplierName });
  }

  // Fetch supplier data
  const refreshTable = () => {
    axios
      .get("http://localhost:8080/fetchSupplier")
      .then((res) => {
        setSupplierData(res.data); // Update the supplier data state
      })
      .catch((error) => {
        console.error("Error fetching supplier data:", error);
      });
  };

  // Initial fetch on page load
  useEffect(() => {
    refreshTable(); 
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if(editingSupplier) {
      axios
      .put(`http://localhost:8080/updateSupplier/${editingSupplier.id}`, values)
      .then((res) => {
        console.log('Successfully updated Supplier:', res);
        toast.success('Supplier updated successfully');
        setEditingSupplier(null); // Clear edit mode after success
        refreshTable()
        setValues({ S_supplierID: '', S_supplierName: '' });
      })
      .catch((err) => {
        toast.error('Error updating supplier');
        console.error("Error updating supplier:", err);
      });

    } else {
      axios
      .post("http://localhost:8080/addSupplier", values)
      .then((res) => {
        console.log('Successfully added Supplier:', res);
        toast.success('Supplier added successfully');
        refreshTable()
        .catch((error) => {
          console.error("Error fetching supplier data after adding:", error);
        });
        setValues({ S_supplierID: ' ', S_supplierName: ' ' }); 
      })
      
      .catch((err) => {
        if(err.response?.status === 409) {
          toast.error('Supplier ID already exists');
          setValues({ S_supplierID: '', S_supplierName: '' }); 
        }else {
          toast.error('Error adding supplier');
          console.error("Error fetching supplier data:", err);
        }
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen inert">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col w-full inert">
          <h1 className="text-lg font-medium text-gray-600 mt-4 mb-6">Configurations</h1>

          <Tabs defaultValue="add-supplier" className="w-full mb-4" onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start bg-white shadow-md rounded-md px-6 py-6 mb-4">
              <TabsTrigger value="add-supplier" className="data-[state=active]:text-indigo-600 hover:text-black">ADD SUPPLIER</TabsTrigger>
            </TabsList>

            <div className="flex flex-col lg:flex-row gap-6 inert">
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
                      <div className="overflow-x-auto max-h-[60vh] inert">
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
                                  <Button variant="ghost" size="sm" className="h-8 w-8"  onClick={() => editSupplier(supplier)}>
                                    <FilePen size={16} />
                                  </Button>
                                </TableCell>

                                {/* DELETE */}
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => {
                                        setSelectedSupplierID(supplier.S_supplierID);
                                        setOpenDialog(true);
                                      }}>
                                    <Trash size={16}/>
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

                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Delete</DialogTitle>
                            </DialogHeader>
                            <p>Are you sure you want to delete this supplier?</p>
                            <DialogFooter className="mt-4">
                              <Button variant="secondary" onClick={() => setOpenDialog(false)}>Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (!selectedSupplierID) {
                                    toast.error("No supplier selected for deletion.");
                                    return;
                                  }
                                  axios
                                    .delete(`http://localhost:8080/deleteSupplier/${selectedSupplierID}`)
                                    .then((res) => {
                                      toast.success("Supplier deleted successfully");
                                      refreshTable(); // Refresh data after deletion
                                      setOpenDialog(false); // Close dialog
                                    })
                                    .catch((err) => {
                                      const errorMessage =
                                        err.response?.data?.message || "Error deleting supplier";
                                      toast.error(errorMessage);
                                      console.error("Error deleting supplier:", err);
                                    });
                                }}
                              >
                                Delete
                              </Button>

                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
                    <Toaster position="top-center" />
                    <CardContent className="p-4 flex flex-col flex-1 justify-between-4">
                      <div className="space-y-3">
                        <form onSubmit={handleSubmit}>
                          <div>
                            <Label className="text-sm">Supplier</Label>
                            <input
                              type="text"
                              name="S_supplierName"
                              placeholder="Enter supplier"
                              value={values.S_supplierName}  
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
                              value={values.S_supplierID}
                              onChange={(e) => setValues({...values, S_supplierID: e.target.value})}
                              className="border border-gray-300 p-2 rounded text-sm w-full"
                            />
                          </div>
                          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">{editingSupplier ? "UPDATE" : "ADD"}</Button>
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
