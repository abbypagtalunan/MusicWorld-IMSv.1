"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FilePen, Trash } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';

export default function ConfigurationsPage() {
  const configMap = {
    supplier: {
      label: "Supplier",
      idField: "S_supplierID",
      nameField: "S_supplierName",
      statusField: "S_supplierStatus",
      api: {
        fetch: "http://localhost:8080/suppliers", 
        add: "http://localhost:8080/suppliers",
        update: "http://localhost:8080/suppliers", 
        delete: "http://localhost:8080/suppliers",
      },
    },
    brand: {
      label: "Brand",
      idField: "B_brandID",
      nameField: "B_brandName",
      api: {
        fetch: "http://localhost:8080/brands", 
        add: "http://localhost:8080/brands",  
        update: "http://localhost:8080/brands", 
        delete: "http://localhost:8080/brands",  
      },
    },

    category: {
      label: "Category",
      idField: "B_brandID",
      nameField: "B_brandName",
      api: {
        fetch: "http://localhost:8080/brands", 
        add: "http://localhost:8080/brands",  
        update: "http://localhost:8080/brands", 
        delete: "http://localhost:8080/brands",  
      },
    },

    productStatus: {
      label: "Product Status",
      idField: "B_brandID",
      nameField: "B_brandName",
      api: {
        fetch: "http://localhost:8080/brands", 
        add: "http://localhost:8080/brands",  
        update: "http://localhost:8080/brands", 
        delete: "http://localhost:8080/brands",  
      },
    },
  };

  const [activeTab, setActiveTab] = useState("supplier");
  const config = configMap[activeTab];
  const [data, setData] = useState([]);
  const [values, setValues] = useState({
    [config.idField]: "",
    [config.nameField]: "",
    [config.statusField]: ""
  });

  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemID, setSelectedItemID] = useState(null);
  const NoSSR = dynamic(() => import('@/components/no-ssr.js'), { ssr: false });

  useEffect(() => {
    refreshTable();
    setValues({
      [config.idField]: "",
      [config.nameField]: "",
      [config.statusField]: ""
    });
    setEditingItem(null);
    setSearchTerm("");
  }, [activeTab]);

  // Refresh Table upon changes
  const refreshTable = () => {
    axios
      .get(config.api.fetch)
      .then((res) => setData(res.data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  const filteredItems = data.filter((item) =>
    item[config.nameField].toLowerCase().includes(searchTerm.toLowerCase()) ||
    item[config.idField].includes(searchTerm)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...values };

    if (editingItem) {
      axios
        .put(`${config.api.update}/${editingItem[config.idField]}`, payload)
        .then(() => {
          toast.success(`${config.label} updated successfully`);
          refreshTable();
          resetForm();
        })
        .catch(() => toast.error(`Error updating ${config.label}`));
    } else {
      axios
        .post(config.api.add, payload)
        .then(() => {
          toast.success(`${config.label} added successfully`);
          refreshTable();
          resetForm();
        })
        .catch((err) => {
          if (err.response?.status === 409) {
            toast.error(`${config.label} ID already exists`);
          } else {
            toast.error(`Error adding ${config.label}`);
          }
        });
    }
  };

  const handleEdit = (item) => {
    setValues({
      [config.idField]: item[config.idField],
      [config.nameField]: item[config.nameField],
      [config.statusField]: item[config.statusField],
    });
    setEditingItem(item);
  };

  const handleDelete = () => {
    axios
      .delete(`${config.api.delete}/${selectedItemID}`)
      .then(() => {
        toast.success(`${config.label} deleted`);
        refreshTable();
      })
      .catch(() => toast.error(`Error deleting ${config.label}`))
      .finally(() => setOpenDialog(false));
  };

  const handleCardClick = (e) => {
    const target = e.target;
    if (
      target.tagName !== "INPUT" &&
      target.tagName !== "BUTTON" &&
      target.closest("input") === null
    ) {
      setEditingItem(null); 
      setValues({ [config.idField]: "", [config.nameField]: "", [config.statusField]: "" }); 
    }
  };

  const resetForm = () => {
    setValues({
      [config.idField]: "",
      [config.nameField]: "",
      [config.statusField]: ""
    });
    setEditingItem(null);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col" onClick={handleCardClick}>
          <Toaster position="top-center" />
          <h1 className="text-lg font-medium text-gray-600 mt-4 mb-6">Configurations</h1>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start bg-white shadow-md rounded-md px-6 py-6 mb-4">
              {Object.entries(configMap).map(([key, cfg]) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:text-indigo-600">
                  {`ADD ${cfg.label.toUpperCase()}`}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(configMap).map(([key, cfg]) => (
              <TabsContent key={key} value={key}>
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Table */}
                  <div className="w-full lg:w-2/3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                         
                         {/* Search */}
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder={`Search ${cfg.label.toLowerCase()}`}
                            className="pl-9 py-2 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>

                        <Table>
                          <TableBody>
                            {filteredItems.length > 0 ? (
                              filteredItems.map((item) => (
                                <TableRow key={item[cfg.idField]} className="hover:bg-gray-50">
                                  <TableCell className="py-2">
                                    <div className="font-medium text-sm">{item[cfg.nameField]}</div>
                                    <div className="text-xs text-gray-500">Code: {item[cfg.idField]}</div>
                                    <div className="text-xs text-gray-500">Status: {item[cfg.statusField]}</div>
                                  </TableCell>

                                  {/* Edit - Delete */}
                                  <TableCell className="text-right w-[100px]">
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                        <FilePen size={16} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedItemID(item[cfg.idField]);
                                          setOpenDialog(true);
                                        }} >
                                        <Trash size={16} />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                                  No {cfg.label.toLowerCase()}s found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Form */} 
                  <div className="w-full lg:w-1/3 h-fit">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-center text-xl">{editingItem ? `Edit ${cfg.label}` : `Add ${cfg.label}`}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit}>
                          <div className="mb-4">
                            <Label>{cfg.label} Name</Label>
                            <Input
                              value={values[config.nameField]}
                              onChange={(e) => setValues({ ...values, [config.nameField]: e.target.value })}
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <Label>{cfg.label} Code</Label>
                            <Input
                              value={values[config.idField]}
                              onChange={(e) => setValues({ ...values, [config.idField]: e.target.value })}
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <Label>Status</Label>
                            <Input
                              value={values[config.statusField]}
                              onChange={(e) => setValues({ ...values, [config.statusField]: e.target.value })}
                              required
                            />
                          </div>

                          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4">
                            {editingItem ? "Update" : "Add"} {cfg.label}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete this {config.label.toLowerCase()}?</p>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
