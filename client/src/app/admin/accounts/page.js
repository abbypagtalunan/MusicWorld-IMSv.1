"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, Copy, FilePen, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";

export default function ManageAccountsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("my-account");

  // Admin account (hardcoded for now)
  const admin = {
    firstName: "Juan",
    lastName: "Dela Cruz",
    role: "Admin",
    code: "100001",
    password: "adminpass123",
    dateCreated: "23-04-2025",
  };

  // Staff accounts (fetched from API)
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedStaff, setEditedStaff] = useState({});

  // Reset password modal
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStaff, setResetStaff] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adminPW, setAdminPW] = useState("");

  // Fetch staff data on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/accounts");
        setStaffs(response.data);
      } catch (error) {
        console.error("Error fetching staff data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);

const handleAccountDelete = (accountCode) => {
  if (!accountCode || !adminPW) {
    alert("Admin password is required.");
    return;
  }

  axios
    .delete(`http://localhost:8080/accounts/${accountCode}`, {
      data: { adminPW },
    })
    .then(() => {
      toast.success("Account deleted successfully");
      setStaffs(staffs.filter((s) => s.code !== accountCode));
      setIsDeleteAccountDialogOpen(false);
      setDeleteTarget(null);
      setAdminPW("");
    })
    .catch((err) => {
      console.error("Delete error:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        toast.error("Invalid admin password");
      } else {
        toast.error("Failed to delete account");
      }
      setIsDeleteAccountDialogOpen(false);
      setDeleteTarget(null);
      setAdminPW("");
    });
};


  // Handle copying user code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(admin.code).catch((err) => {
      console.error("Failed to copy:", err);
    });
  };

  // Reset password handler
  const handleResetPassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log(`Resetting password for ${resetStaff?.code}...`);
    setIsResetOpen(false);
    setResetStaff(null);
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };


  // Handle filter selection
  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  // Get filtered/sorted staff list
  const getFilteredStaffs = () => {
    let sorted = staffs.map(staff => ({ ...staff }));
    if (!selectedFilter || !selectedSubFilter) return sorted;

    switch (selectedFilter) {
      case "Name":
        sorted.sort((a, b) => {
          const aName = `${a.firstName} ${a.lastName}`;
          const bName = `${b.firstName} ${b.lastName}`;
          return selectedSubFilter === "Ascending"
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName);
        });
        break;

      case "Role":
        sorted = sorted.filter((s) => s.role === selectedSubFilter);
        break;

      case "User Code":
        sorted.sort((a, b) => {
          const codeA = parseInt(a.code, 10);
          const codeB = parseInt(b.code, 10);
          return selectedSubFilter === "Low to High" ? codeA - codeB : codeB - codeA;
        });
        break;

      case "Date Created":
        sorted.sort((a, b) => {
          const dateA = new Date(a.dateCreated);
          const dateB = new Date(b.dateCreated);
          return selectedSubFilter === "Oldest" ? dateA - dateB : dateB - dateA;
        });
        break;

      default:
        break;
    }

    return sorted;
  };

  // Placeholder for update logic
  const handleUpdateStaff = (updatedStaff) => {
    setStaffs(
      staffs.map((s) => (s.code === updatedStaff.code ? updatedStaff : s))
    );
    setIsEditOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          <div className="z-10 sticky top-0 mb-4 bg-white p-4 rounded-lg">
            <h1 className="text-lg text-gray-600 font-medium">Manage Accounts</h1>
          </div>

          <Tabs defaultValue="my-account" onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="w-full z-10 sticky">
              <TabsList className="w-full flex justify-start bg-white rounded-md shadow-md px-6 py-6 space-x-4">
                <TabsTrigger value="my-account" className="data-[state=active]:text-indigo-600 hover:text-black">MY ACCOUNT</TabsTrigger>
                <TabsTrigger value="staff" className="data-[state=active]:text-indigo-600 hover:text-black">STAFF</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <TabsContent value="my-account" className="mt-0">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                  <Card className="w-full lg:w-2/3 text-gray-700 content-center">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-xl text-center">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm text-gray-500">First Name</Label>
                          <p className="text-base font-medium text-gray-800">{admin.firstName}</p>
                          <Label className="text-sm text-gray-500 mt-3 block">Role</Label>
                          <p className="text-base font-medium text-gray-800">{admin.role}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Last Name</Label>
                          <p className="text-base font-medium text-gray-800">{admin.lastName}</p>
                          <Label className="text-sm text-gray-500 mt-3 block">Date Created</Label>
                          <p className="text-base font-medium text-gray-800">{admin.dateCreated}</p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-400 text-white">Edit Account</Button>
                        </DialogTrigger>
                        <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle className="text-blue-400 text-xl font-bold">Edit Account Information</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-4 mt-4 text-gray-700">
                            <Label>Date Created</Label>
                            <Input value={admin.dateCreated} disabled />
                            <Label>First Name</Label>
                            <Input type="text" defaultValue={admin.firstName} placeholder="Enter first name" />
                            <Label>Last Name</Label>
                            <Input type="text" defaultValue={admin.lastName} placeholder="Enter last name" />
                            <Label>Role</Label>
                            <Select defaultValue={admin.role.toLowerCase()}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter className="mt-6">
                            <Button className="bg-blue-400 text-white w-full">Save Edit</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                  <Card className="w-full lg:w-1/3 text-gray-700">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-xl text-center">Login Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label>User Code</Label>
                        <div className="flex items-center gap-2">
                          <Input value={admin.code} disabled />
                          <Button size="icon" variant="ghost" onClick={handleCopyCode}>
                            <Copy size={16} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Password</Label>
                        <div className="flex items-center gap-2">
                          <Input type={showPassword ? "text" : "password"} value={admin.password} disabled />
                          <Button size="icon" variant="ghost" onClick={() => setShowPassword(!showPassword)}>
                            <Eye size={16} />
                          </Button>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-400 text-white">Change Password</Button>
                        </DialogTrigger>
                        <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle className="text-blue-400 text-xl font-bold">Change Password</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-4 mt-4 text-gray-700">
                            <Label>Old Password</Label>
                            <Input type="password" placeholder="Enter your old password" />
                            <Label>New Password</Label>
                            <Input type="password" placeholder="Enter your new password" />
                            <Label>Confirm New Password</Label>
                            <Input type="password" placeholder="Confirm new password" />
                          </div>
                          <DialogFooter>
                            <Button className="bg-blue-400 text-white w-full">Update Password</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* STAFF TAB */}
              <TabsContent value="staff" className="mt-0">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Staff ({staffs.length})</h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex gap-2 flex-1">
                    <Input placeholder="Search staff..." className="w-full sm:w-auto" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center space-x-2">
                          <ListFilter className="w-4 h-4" />
                          <span>Filter</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Date Created</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleFilterSelect("Date Created", "Oldest")}>
                              Oldest First
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterSelect("Date Created", "Newest")}>
                              Newest First
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
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
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Role</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleFilterSelect("Role", "Admin")}>Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterSelect("Role", "Staff")}>Staff</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>User Code</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleFilterSelect("User Code", "Low to High")}>
                              Low to High
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFilterSelect("User Code", "High to Low")}>
                              High to Low
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
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-400 text-white">Add Staff</Button>
                      </DialogTrigger>
                      <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                        <DialogHeader>
                          <DialogTitle className="text-blue-400 text-xl font-bold">Add Staff</DialogTitle>
                          <DialogClose />
                        </DialogHeader>
                        <div className="flex flex-col gap-4 mt-4 text-gray-700">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <Label>First Name</Label>
                              <Input type="text" placeholder="Enter first name" />
                            </div>
                            <div className="flex-1">
                              <Label>Last Name</Label>
                              <Input type="text" placeholder="Enter last name" />
                            </div>
                          </div>
                          <div>
                            <Label>Role</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>User Code</Label>
                            <Input type="text" placeholder="Enter user code" />
                          </div>
                          <div>
                            <Label>Password</Label>
                            <Input type="password" placeholder="Enter password" />
                          </div>
                          <div>
                            <Label>Confirm Password</Label>
                            <Input type="password" placeholder="Confirm password" />
                          </div>
                        </div>
                        <DialogFooter className="mt-6">
                          <Button className="bg-blue-400 text-white w-full">Submit</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Card className="w-full">
                  <CardContent className="p-4 flex flex-col justify-between flex-grow">
                    <div className="flex flex-col overflow-auto max-h-[60vh] w-full">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-white">
                          <TableRow>
                            <TableHead>Date Created</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>User Code</TableHead>
                            <TableHead>Reset Password</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredStaffs().map((staff) => (
                            <TableRow key={staff.code}>
                              <TableCell className="text-center">{new Date(staff.dateCreated).toLocaleDateString()}</TableCell>
                              <TableCell>{`${staff.firstName} ${staff.lastName}`}</TableCell>
                              <TableCell>{staff.roleID}</TableCell>
                              <TableCell>{staff.accountID}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsResetOpen(true);
                                    setResetStaff(staff);
                                  }}
                                >
                                  Reset
                                </Button>
                              </TableCell>
                              
                              <TableCell className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-500 hover:text-blue-600"
                                  onClick={() => {
                                    setEditedStaff(staff);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <FilePen size={16} />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-500 hover:text-red-600"
                                  onClick={() => {
                                    setDeleteTarget(staff);
                                    setIsDeleteAccountDialogOpen(true);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </TableCell>

                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle className="text-blue-400 text-xl font-bold">
                              Edit Staff - {editedStaff?.firstName} {editedStaff?.lastName}
                            </DialogTitle>
                            <DialogClose />
                          </DialogHeader>

                          <div className="flex flex-col gap-4 mt-4 text-gray-700">
                            <div>
                              <Label>Date Created</Label>
                              <Input value={editedStaff?.dateCreated || ""} disabled />
                            </div>
                            <div>
                              <Label>First Name</Label>
                              <Input
                                value={editedStaff?.firstName || ""}
                                onChange={(e) =>
                                  setEditedStaff({ ...editedStaff, firstName: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Last Name</Label>
                              <Input
                                value={editedStaff?.lastName || ""}
                                onChange={(e) =>
                                  setEditedStaff({ ...editedStaff, lastName: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label>Role</Label>
                              <Select
                                value={editedStaff?.role || ""}
                                onValueChange={(value) =>
                                  setEditedStaff({ ...editedStaff, role: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Admin">Admin</SelectItem>
                                  <SelectItem value="Staff">Staff</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>User Code</Label>
                              <Input value={editedStaff?.code || ""} disabled />
                            </div>
                          </div>

                          <DialogFooter className="mt-6">
                            <Button
                              className="w-full bg-blue-400 text-white"
                              onClick={() => handleUpdateStaff(editedStaff)}
                            >
                              Update Staff
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                        <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle className="text-blue-400 text-xl font-bold">
                              Reset Password for {resetStaff?.firstName} {resetStaff?.lastName}
                            </DialogTitle>
                            <DialogClose />
                          </DialogHeader>

                          <div className="flex flex-col gap-4 mt-4 text-gray-700">
                            <Label>New Password</Label>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                              }
                            />
                            <Label>Confirm New Password</Label>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                              }
                            />
                          </div>

                          <DialogFooter className="mt-6">
                            <Button
                              className="w-full bg-blue-400 text-white"
                              onClick={handleResetPassword}
                            >
                              Reset Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
                        <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle>
                              <span className="text-lg text-red-900">Delete Account</span>{" "}
                              <span className="text-lg text-gray-400 font-normal italic">
                                {deleteTarget?.code}
                              </span>
                            </DialogTitle>
                            <DialogClose />
                          </DialogHeader>

                          <p className="text-sm text-gray-800 mt-2 pl-4">
                            Deleting this account is permanent. Enter the admin password to confirm deletion.
                          </p>

                          <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
                            <div className="flex-1">
                              <label
                                htmlFor="admin-password"
                                className="text-base font-medium text-gray-700 block mb-2"
                              >
                                Admin Password
                              </label>
                              <Input
                                type="password"
                                required
                                placeholder="Enter admin password"
                                className="w-full"
                                value={adminPW}
                                onChange={(e) => setAdminPW(e.target.value)}
                              />
                            </div>

                            <Button
                              className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                              onClick={() => handleAccountDelete(deleteTarget?.code)}
                            >
                              DELETE ACCOUNT
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </SidebarProvider>
  );
}