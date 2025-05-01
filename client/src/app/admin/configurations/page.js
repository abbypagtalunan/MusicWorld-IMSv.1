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
import { Search, FilePen, Trash } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function ConfigurationsPage() {
  const configMap = {
    status: {
      label: "SBC Status",
      idField: "SupBrdCatStatusID",
      nameField: "SupBrdCatStatusName",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/supBrdCatStatus",
        add: "http://localhost:8080/supBrdCatStatus",
        update: "http://localhost:8080/supBrdCatStatus",
        delete: "http://localhost:8080/supBrdCatStatus",
      },
    },

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

    productStatus: {
      label: "Product Status",
      idField: "P_productStatusID",
      nameField: "P_productStatusName",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/productStatus",
        add: "http://localhost:8080/productStatus",
        update: "http://localhost:8080/productStatus",
        delete: "http://localhost:8080/productStatus",
      },
    },

    returnType: {
      label: "Return Type",
      idField: "RT_returnTypeID",
      nameField: "RT_returnTypeDescription",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/returnType",
        add: "http://localhost:8080/returnType",
        update: "http://localhost:8080/returnType",
        delete: "http://localhost:8080/returnType",
      },
    },

    deliveryModeOfPayment: {
      label: "Delivery MOP",
      idField: "D_modeOfPaymentID",
      nameField: "D_mopName",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/deliveryMOP",
        add: "http://localhost:8080/deliveryMOP",
        update: "http://localhost:8080/deliveryMOP",
        delete: "http://localhost:8080/deliveryMOP",
      },
    },

    deliveryPaymentTypes: {
      label: "Delivery Payment Type",
      idField: "D_paymentTypeID",
      nameField: "D_paymentName",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/deliveryPayTypes",
        add: "http://localhost:8080/deliveryPayTypes",
        update: "http://localhost:8080/deliveryPayTypes",
        delete: "http://localhost:8080/deliveryPayTypes",
      },
    },

    deliveryPaymentStatus: {
      label: "Delivery Payment Status",
      idField: "D_paymentStatusID",
      nameField: "D_statusName",
      isAutoInc: true,
      api: {
        fetch: "http://localhost:8080/deliveryPayStatus",
        add: "http://localhost:8080/deliveryPayStatus",
        update: "http://localhost:8080/deliveryPayStatus",
        delete: "http://localhost:8080/deliveryPayStatus",
      },
    },
  };

  const [activeTab, setActiveTab] = useState("supplier");
  const config = configMap[activeTab];
  const [data, setData] = useState([]);
  const [values, setValues] = useState({
    [config.idField]: "",
    [config.nameField]: "",
    [config.statusField]: "",
  });

  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemID, setSelectedItemID] = useState(null);

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
  }, [activeTab]); 

  // Refresh Table upon changes
  const refreshTable = () => {
    axios
      .get(config.api.fetch)
      .then((res) => setData(res.data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  // Search
  const filteredItems =
    config?.nameField && config?.idField
      ? data.filter(
          (item) =>
            (item[config.nameField]?.toLowerCase() || "").includes(
              searchTerm.toLowerCase()
            ) || (item[config.idField] || "").includes(searchTerm)
        )
      : [];

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

  // Submit
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
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col" onClick={handleCardClick}>
          <Toaster position="top-center" />
          <div className="sticky top-0 z-10 p-4 rounded-lg">
            <div className="z-10 sticky top-0 mb-4 bg-white p-4 rounded-lg">
              <h1 className="text-lg text-gray-600 font-medium">Configuration</h1>
            </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex justify-start bg-white rounded-md shadow-md px-6 py-6 space-x-4">
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
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
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
  );
}


// Displays status but does not update in db
// {config.statusField ? (
//   ["supplier", "brand", "category"].includes(activeTab) ? (
//     <div className="mb-4">
//       <Label>Status</Label>
//       <Select
//         value={values[config.statusField]?.toString() || ""}
//         onValueChange={(selectedId) =>
//           setValues({
//             ...values,
//             [config.statusField]: parseInt(selectedId),
//           })
//         }
//       >
//         <SelectTrigger>
//           <SelectValue placeholder="Select Status" />
//         </SelectTrigger>
//         <SelectContent>
//           {statusOptions.map((status) => (
//             <SelectItem
//               key={status.SupBrdCatStatusID}
//               value={status.SupBrdCatStatusID.toString()}
//             >
//               {status.SupBrdCatStatusName}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   ) : (
//     <div className="mb-4">
//       <Label>Status</Label>
//       <Input
//         value={values[config.statusField]}
//         onChange={(e) =>
//           setValues({
//             ...values,
//             [config.statusField]: e.target.value,
//           })
//         }
//         required
//       />
//     </div>
//   )
// ) : null}
