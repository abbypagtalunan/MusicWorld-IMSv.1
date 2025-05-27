"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, ListFilter, FilePen, Trash } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import MinimumScreenGuard from "@/components/MinimumScreenGuard";

export default function ConfigurationsPage() {
  const configMap = {
    supplier: {
      label: "Supplier",
      idField: "S_supplierID",
      nameField: "S_supplierName",
      statusField: "S_supplierStatus",
      statusId: "S_supplierStatusID",
      isAutoInc: false,
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
      statusField: "B_brandStatus",
      statusId: "B_brandStatusID",
      isAutoInc: false,
      api: {
        fetch: "http://localhost:8080/brands",
        add: "http://localhost:8080/brands",
        update: "http://localhost:8080/brands",
        delete: "http://localhost:8080/brands",
      },
    },

    category: {
      label: "Category",
      idField: "C_categoryID",
      nameField: "C_categoryName",
      statusField: "C_categoryStatus",
      statusId: "C_categoryStatusID",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/categories",
        add: "http://localhost:8080/categories",
        update: "http://localhost:8080/categories",
        delete: "http://localhost:8080/categories",
      },
    },

    returnType: {
      label: "Return Type",
      idField: "RT_returnTypeID",
      nameField: "RT_returnTypeDescription",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/returnTypes",
        add: "http://localhost:8080/returnTypes",
        update: "http://localhost:8080/returnTypes",
        delete: "http://localhost:8080/returnTypes",
      },
    },
  };

  const [activeTab, setActiveTab] = useState("supplier");
  const config = configMap[activeTab];
  const [data, setData] = useState([]);
  const [values, setValues] = useState({
    [configMap.idField]: "",
    [configMap.nameField]: "",
    [configMap.statusField]: "",
  });

  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemID, setSelectedItemID] = useState(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeFilterValue, setActiveFilterValue] = useState(null);

  // Set tabs that only have the filter function
  const showFilter = ["supplier", "brand", "category", "returnType"].includes(activeTab);

  // Fetch
  useEffect(() => {
    const currentConfig = configMap[activeTab];
    if (!currentConfig) return;
  
    axios
      .get(currentConfig.api.fetch)
      .then((res) => setData(res.data))
      .catch((error) => console.error("Error fetching data:", error));
  
    // Reset form fields
    setValues({
      [currentConfig.idField]: "",
      [currentConfig.nameField]: "",
      [currentConfig.statusField]: "",
    });
  
    setEditingItem(null);
    setSearchTerm("");
    // Reset filters on tab switch
    setActiveFilter(null);
    setActiveFilterValue(null);
  }, [activeTab]); 

  // Refresh Table upon changes
  const refreshTable = () => {
    axios
      .get(config.api.fetch)
      .then((res) => setData(res.data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  // Handle Filter Selection 
  const handleFilterSelect = (filterType, value) => {
    setActiveFilter(filterType);
    setActiveFilterValue(value);
  };

  // Search
  // Apply filtering and sorting logic
  const filteredItems = (() => {
    let result = [...data];

    // Search Term Filter
    if (searchTerm) {
      result = result.filter(
        (item) =>
          (item[config.nameField]?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (item[config.idField]?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }

    // Status Filter (only applicable for supplier, brand, category)
    if (activeFilter === "Status" && activeFilterValue !== null) {
      result = result.filter((item) => item[config.statusField] === activeFilterValue);
    }

    // Sort by Name, Code, or Status
    if (activeFilter && activeFilterValue) {
      const keyMap = {
        Name: config.nameField,
        "Code No.": config.idField,
        Status: config.statusField,
      };

      const sortKey = keyMap[activeFilter];
      if (sortKey) {
        result.sort((a, b) => {
          const valA = a[sortKey]?.toString().toLowerCase() ?? "";
          const valB = b[sortKey]?.toString().toLowerCase() ?? "";

          if (activeFilterValue === "Ascending") {
            return valA > valB ? 1 : -1;
          } else if (activeFilterValue === "Descending") {
            return valA < valB ? 1 : -1;
          }
          return 0;
        });
      }
    }

    return result;
    })();

  // For status dropdown
  const [statusOptions, setStatusOptions] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8080/supBrdCatStatus")
      .then((res) => setStatusOptions(res.data))
      .catch((err) => console.error("Failed to fetch status options:", err));
  }, []);

  const statusIdMap = statusOptions.reduce((map, status) => {
    map[status.SupBrdCatStatusName] = status.SupBrdCatStatusID;
    return map;
  }, {});

    useEffect(() => {
  axios
    .get("http://localhost:8080/returnTypes")
    .then((res) => {
      const mappedReturnTypes = res.data.map((type) => ({
        id: type.RT_returnTypeID,
        name: type.RT_returnTypeDescription,
        description: type.RT_returnTypeDescription || "",
      }));
      setReturnTypes(mappedReturnTypes);
    })
    .catch((err) => console.error("Failed to fetch return types:", err));
}, []);

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    let payload;
    if (config.label === "Category") {
      payload = {
        C_categoryName: values.C_categoryName,
        C_categoryStatusID: values.C_categoryStatusID
      };
    } else {
      payload = { ...values };
    }

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
          console.error("Error response:", err.response);

          if (err.response?.data?.message?.includes('.PRIMARY')) {
            toast.error(`${config.label} with given code already exists. Code must be unique.`);
          }
          
          if (err.response?.status === 409 || err.response?.data?.message?.includes('unique_name')) {
            toast.error(`${config.label} with given name already exists. Name must be unique.`);
          } 
          else {
            toast.error(`Error adding ${config.label}`);
          }
        });
    }
  };  

  // Edit
  const handleEdit = (item) => {
    const selectedStatus = statusOptions.find(
      (status) => status.SupBrdCatStatusName === item[config.statusField]
    );
  
    const statusId = selectedStatus ? selectedStatus.SupBrdCatStatusID : "";
  
    setValues({
      [config.idField]: item[config.idField],
      [config.nameField]: item[config.nameField],
      [config.statusId]: statusId,
    });  
    setEditingItem(item);
  };
  

  // Delete
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

  // Make card add if cardclick
  const handleCardClick = (e) => {
    const target = e.target;
    if (
      target.tagName !== "INPUT" &&
      target.tagName !== "BUTTON" &&
      target.closest("input") === null
    ) {
      setEditingItem(null);
      setValues({
        [config.idField]: "",
        [config.nameField]: "",
        [config.statusField]: "",
      });
    }
  };

  // Reset
  const resetForm = () => {
    setValues({
      [config.idField]: "",
      [config.nameField]: "",
      [config.statusField]: "",
    });
    setEditingItem(null);
  };

  return (
    <MinimumScreenGuard>
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col" onClick={handleCardClick}>
          <Toaster position="top-center" />
          <h1 className="text-lg font-medium text-gray-600 mt-4 mb-6">
            Configurations
          </h1>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start bg-white shadow-md rounded-md px-6 py-6 mb-4">
              {Object.entries(configMap).map(([key, cfg]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:text-indigo-600"
                >
                  {`${cfg.label.toUpperCase()}`}
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
                      <div className="flex items-center space-x-2">
                        <div className="relative w-80">
                          {/* Search */}
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder={`Search ${cfg.label.toLowerCase()}`}
                            className="w-full pl-10 pr-4 py-2 "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        {/* Filter */}
                        {["supplier", "brand", "category", "returnType"].includes(key) && (
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center space-x-2">
                                  <ListFilter className="w-4 h-4" />
                                  <span>Filter/Sort</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {/* Name Filter */}
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>Name</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleFilterSelect("Name", "Ascending")}>
                                      Ascending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterSelect("Name", "Descending")}>
                                      Descending
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                {/* Code No. Filter */}
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>Code No.</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleFilterSelect("Code No.", "Ascending")}>
                                      Ascending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterSelect("Code No.", "Descending")}>
                                      Descending
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                {/* Status Filter (Only if not returnType) */}
                                {key !== "returnType" && (
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                      <DropdownMenuItem onClick={() => handleFilterSelect("Status", "Active")}>
                                        Active
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleFilterSelect("Status", "Discontinued")}>
                                        Discontinued
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleFilterSelect("Status", "Archived")}>
                                        Archived
                                      </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                )}

                                <DropdownMenuItem 
                                  onClick={() => handleFilterSelect(null, null)} 
                                  className="text-red-500 font-medium"
                                >
                                  Reset Filters
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                      </div>

                        <Table>
                          <TableBody>
                            {filteredItems.length > 0 ? (
                              filteredItems.map((item) => (
                                <TableRow
                                  key={item[cfg.idField]}
                                  className="hover:bg-gray-50"
                                >
                                  <TableCell className="py-2">
                                    <div className="font-medium text-sm">
                                      {item[cfg.nameField]}
                                    </div>

                                    <div className="text-xs text-gray-500">
                                      Code: {item[cfg.idField]}
                                    </div>

                                    {config.statusField && (
                                      <div className="text-xs text-gray-500">
                                        Status: {item[cfg.statusField]}
                                      </div>
                                    )}
                                  </TableCell>

                                  {/* Edit - Delete */}
                                  <TableCell className="text-right w-[100px]">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(item)}
                                      >
                                        <FilePen size={16} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedItemID(item[cfg.idField]);
                                          setOpenDialog(true);
                                        }}
                                      >
                                        <Trash size={16} />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  className="text-center text-gray-500 py-4"
                                >
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
                        <CardTitle className="text-center text-xl">
                          {editingItem
                            ? `Edit ${cfg.label}`
                            : `Add ${cfg.label}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit}>
                          <div className="mb-4">
                            <Label>{cfg.label} Name</Label>
                            <Input
                              value={values[config.nameField]}
                              onChange={(e) =>
                                setValues({
                                  ...values,
                                  [config.nameField]: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          {!config.isAutoInc && (
                            <div className="mb-4">
                              <Label>{cfg.label} Code</Label>
                              <Input
                                value={values[config.idField]}
                                onChange={(e) =>
                                  setValues({
                                    ...values,
                                    [config.idField]: e.target.value,
                                  })
                                }
                                required
                                disabled={editingItem} // Disable only when editing
                              />
                            </div>
                          )}

                          {config.statusField &&
                          ["supplier", "brand", "category"].includes(
                            activeTab
                          ) ? (
                            <div className="mb-4">
                              <Label>Status</Label>
                              <Select
                                value={
                                  statusOptions.find(
                                    (s) =>
                                      s.SupBrdCatStatusID ===
                                      values[config.statusId]
                                  )?.SupBrdCatStatusName || ""
                                }
                                onValueChange={(value) => {
                                  setValues({
                                    ...values,
                                    [config.statusId]: statusIdMap[value],
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem
                                      key={status.SupBrdCatStatusID}
                                      value={status.SupBrdCatStatusName}
                                    >
                                      {status.SupBrdCatStatusName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : config.statusField ? (
                            <div className="mb-4">
                              <Label>Status</Label>
                              <Input
                                value={values[config.statusField]}
                                onChange={(e) =>
                                  setValues({
                                    ...values,
                                    [config.statusField]: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          ) : null}

                          <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-2"
                          >
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
          <p>
            Are you sure you want to delete this {config.label.toLowerCase()}?
          </p>
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
    </MinimumScreenGuard>
  );
}

