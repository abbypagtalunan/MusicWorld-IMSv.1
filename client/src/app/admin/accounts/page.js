"use client";

import { useState } from "react";
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
import axios from "axios";
import { toast } from "react-hot-toast"; // For toast notifications

export default function ManageAccountsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("my-account");

  // Admin Account Info
  const admin = {
    firstName: "Juan",
    lastName: "Dela Cruz",
    role: "Admin",
    code: "100001",
    password: "adminpass123",
    dateCreated: "23-04-2025",
  };

  // Staff List
  const [staffs, setStaffs] = useState([
    { firstName: "Angelica", lastName: "Dizon", role: "Staff", code: "100002", dateCreated: "2023-09-01" },
    { firstName: "Abigail", lastName: "Pagtalunan", role: "Admin", code: "100003", dateCreated: "2023-09-10" },
    { firstName: "Kenneth", lastName: "Aguilar", role: "Staff", code: "100004", dateCreated: "2023-09-15" },
    { firstName: "Jowel", lastName: "Arriola", role: "Admin", code: "100005", dateCreated: "2023-09-03" },
    { firstName: "Hannah", lastName: "Ramos", role: "Staff", code: "100006", dateCreated: "2023-09-01" },
    { firstName: "Aaron", lastName: "Zaballa", role: "Admin", code: "100007", dateCreated: "2023-09-05" },
  ]);

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);

  // Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedStaff, setEditedStaff] = useState({ firstName: "", lastName: "", role: "" });
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStaff, setResetStaff] = useState(null);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  // Bulk Selection & Deletion
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [adminPW, setAdminPW] = useState("");

  // Handle Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(admin.code).then(() => {
      console.log("Copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy: ", err);
    });
  };

  // Reset Password
  const handleResetPassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log(`Resetting password for ${resetStaff?.code}...`);

    // Example Axios call
    axios.post(`http://localhost:8080/api/users/staff/${resetStaff.accountID}/reset-password`, {}, {
      headers: {
        Authorization: `Bearer dummy-token-for-now`
      }
    })
    .then(() => {
      toast.success("Password reset successfully");
      setIsResetOpen(false);
      setResetStaff(null);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    })
    .catch((err) => {
      toast.error(err.response?.data?.message || "Failed to reset password");
    });
  };

  // Edit Staff
  const handleUpdateStaff = async (updated) => {
    try {
      await axios.put(`http://localhost:8080/api/users/staff/${updated.accountID}`, {
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role
      }, {
        headers: {
          Authorization: `Bearer dummy-token-for-now`
        }
      });

      toast.success("Staff updated successfully");
      setIsEditOpen(false);
      fetchStaffList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update staff");
    }
  };

  // Delete Single Staff
  const handleDeleteStaff = async (code, adminPassword) => {
    try {
      await axios.delete(`http://localhost:8080/api/users/staff/${code}`, {
        data: { adminPassword },
        headers: {
          Authorization: `Bearer dummy-token-for-now`,
          'Content-Type': 'application/json'
        }
      });

      toast.success("Staff deleted successfully");
      fetchStaffList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete staff");
    }
  };

  // Delete Multiple Staff
  const handleMultiDelete = async (adminPassword) => {
    try {
      await axios.delete("http://localhost:8080/api/users/staff/bulk", {
        data: { codes: selectedStaff },
        headers: {
          Authorization: `Bearer dummy-token-for-now`,
          'Content-Type': 'application/json'
        }
      });

      toast.success("Selected staff deleted successfully");
      fetchStaffList();
      setSelectedStaff([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete staff");
    }
  };

  // Filter Logic
  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  const getFilteredStaffs = () => {
    let sorted = [...staffs];
    if (!selectedFilter || !selectedSubFilter) return sorted;

    if (selectedFilter === "Name") {
      sorted.sort((a, b) => {
        const aName = `${a.firstName} ${a.lastName}`;
        const bName = `${b.firstName} ${b.lastName}`;
        return selectedSubFilter === "Ascending" ? aName.localeCompare(bName) : bName.localeCompare(aName);
      });
    }

    if (selectedFilter === "Role") {
      sorted = sorted.filter((staff) => staff.role === selectedSubFilter);
    }

    if (selectedFilter === "User Code") {
      sorted.sort((a, b) => {
        const codeA = parseInt(a.code, 10);
        const codeB = parseInt(b.code, 10);
        return selectedSubFilter === "Low to High" ? codeA - codeB : codeB - codeA;
      });
    }

    if (selectedFilter === "Date Created") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.dateCreated);
        const dateB = new Date(b.dateCreated);
        return selectedSubFilter === "Oldest" ? dateA - dateB : dateB - dateA;
      });
    }

    return sorted;
  };

  // Checkbox Handlers
  const handleSelectStaff = (code) => {
    setSelectedStaff(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCodes = getFilteredStaffs().map(s => s.code);
      setSelectedStaff(allCodes);
    } else {
      setSelectedStaff([]);
    }
  };

  // Fetch Staff Data (replace with real API call later)
  const fetchStaffList = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/users/staff");
      setStaffs(res.data.map(staff => ({
        ...staff,
        code: staff.email.split("@")[0],
        dateCreated: new Date(staff.dateCreated).toLocaleDateString()
      })));
    } catch (err) {
      toast.error("Failed to load staff list");
    }
  };

  // Add Staff Handler
  const handleAddStaff = async () => {
    const firstName = document.getElementById("add-first-name").value;
    const lastName = document.getElementById("add-last-name").value;
    const role = document.getElementById("add-role").value;
    const code = document.getElementById("add-code").value;
    const password = document.getElementById("add-password").value;
    const confirmPassword = document.getElementById("add-confirm-password").value;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/users/staff", {
        firstName,
        lastName,
        email: `${code}@example.com`,
        role,
        password
      }, {
        headers: {
          Authorization: `Bearer dummy-token-for-now`
        }
      });

      toast.success("Staff added successfully");
      fetchStaffList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add staff");
    }
  };

  // Change Password Handler
  const handleChangePassword = async () => {
    if (passwordData.oldPassword === "") {
      toast.error("Please enter your old password.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await axios.put("http://localhost:8080/api/users/me/password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: {
          Authorization: `Bearer dummy-token-for-now`
        }
      });

      toast.success("Password changed successfully");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
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
            {/* Tab Navigation */}
            <div className="w-full z-10 sticky">
              <TabsList className="w-full flex justify-start bg-white rounded-md shadow-md px-6 py-6 space-x-4">
                <TabsTrigger value="my-account" className="data-[state=active]:text-indigo-600 hover:text-black">
                  MY ACCOUNT
                </TabsTrigger>
                <TabsTrigger value="staff" className="data-[state=active]:text-indigo-600 hover:text-black">
                  STAFF
                </TabsTrigger>
              </TabsList>
            </div>

            {/* My Account Tab */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <TabsContent value="my-account" className="mt-0">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                  {/* Account Information Card */}
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
                          <p className="text-base font-medium text-gray-800">{new Date(admin.dateCreated).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Edit Account Dialog */}
                      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-400 text-white">Edit Account</Button>
                        </DialogTrigger>
                        <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle className="text-blue-400 text-xl font-bold">
                              Edit Account Information
                            </DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <div className="flex flex-col gap-4 mt-4 text-gray-700">
                            <Label>Date Created</Label>
                            <Input value={admin.dateCreated} disabled />

                            <Label>First Name</Label>
                            <Input
                              type="text"
                              defaultValue={admin.firstName}
                              onChange={(e) => setEditedStaff(prev => ({ ...prev, firstName: e.target.value }))}
                            />

                            <Label>Last Name</Label>
                            <Input
                              type="text"
                              defaultValue={admin.lastName}
                              onChange={(e) => setEditedStaff(prev => ({ ...prev, lastName: e.target.value }))}
                            />

                            <Label>Role</Label>
                            <Select
                              value={editedStaff.role || admin.role}
                              onValueChange={(value) => setEditedStaff(prev => ({ ...prev, role: value }))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter className="mt-6">
                            <Button className="bg-blue-400 text-white w-full" onClick={() => handleUpdateStaff(editedStaff)}>
                              Save Edit
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  {/* Login Details Card */}
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

                      {/* Change Password Dialog */}
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
                            <Input
                              type="password"
                              placeholder="Enter your old password"
                              value={passwordData.oldPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                oldPassword: e.target.value
                              })}
                            />
                            <Label>New Password</Label>
                            <Input
                              type="password"
                              placeholder="Enter your new password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value
                              })}
                            />
                            <Label>Confirm New Password</Label>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value
                              })}
                            />
                          </div>
                          <DialogFooter>
                            <Button className="bg-blue-400 text-white w-full" onClick={handleChangePassword}>
                              Update Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Staff Management Tab */}
              <TabsContent value="staff" className="mt-0">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Staff ({getFilteredStaffs().length})</h2>
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
                    {/* Add Staff Dialog */}
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
                              <Input id="add-first-name" type="text" placeholder="Enter first name" />
                            </div>
                            <div className="flex-1">
                              <Label>Last Name</Label>
                              <Input id="add-last-name" type="text" placeholder="Enter last name" />
                            </div>
                          </div>
                          <div>
                            <Label>Role</Label>
                            <input type="hidden" id="add-role" />
                            <Select onValueChange={(value) => document.getElementById("add-role").value = value}>
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
                            <Input id="add-code" type="text" placeholder="Enter user code" />
                          </div>
                          <div>
                            <Label>Password</Label>
                            <Input id="add-password" type="password" placeholder="Enter password" />
                          </div>
                          <div>
                            <Label>Confirm Password</Label>
                            <Input id="add-confirm-password" type="password" placeholder="Confirm password" />
                          </div>
                        </div>
                        <DialogFooter className="mt-6">
                          <Button className="bg-blue-400 text-white w-full" onClick={handleAddStaff}>
                            Submit
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Selected Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-red-500 text-white" disabled={selectedStaff.length === 0}>
                          Delete Selected
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                        <DialogHeader>
                          <DialogTitle>
                            <span className="text-lg text-red-900">Delete Multiple Staff</span>
                            <span className="text-lg text-gray-400 font-normal italic ml-2">
                              ({selectedStaff.length} items)
                            </span>
                          </DialogTitle>
                          <DialogClose />
                        </DialogHeader>
                        <p className="text-sm text-gray-800 mt-2 pl-4">
                          Deleting these staff accounts is permanent. Enter the admin password to confirm.
                        </p>
                        <div className="flex gap-4 mt-4 pl-4">
                          <div className="flex-1">
                            <Label htmlFor="admin-password" className="text-base font-medium block mb-2">
                              Admin Password
                            </Label>
                            <Input
                              id="admin-password"
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
                            onClick={() => handleMultiDelete(adminPW)}
                          >
                            DELETE STAFF
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Staff Table */}
                <Card className="w-full">
                  <CardContent className="p-4 flex flex-col justify-between flex-grow">
                    <div className="flex flex-col overflow-auto max-h-[60vh] w-full">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-white">
                          <TableRow>
                            <TableHead>
                              <input type="checkbox" onChange={handleSelectAll} checked={selectedStaff.length === getFilteredStaffs().length && selectedStaff.length > 0} />
                            </TableHead>
                            <TableHead>Date Created</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>User Code</TableHead>
                            <TableHead>Reset Password</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredStaffs().map((staff, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedStaff.includes(staff.code)}
                                  onChange={() => handleSelectStaff(staff.code)}
                                />
                              </TableCell>
                              <TableCell>{new Date(staff.dateCreated).toLocaleDateString()}</TableCell>
                              <TableCell>{`${staff.firstName} ${staff.lastName}`}</TableCell>
                              <TableCell>{staff.role}</TableCell>
                              <TableCell>{staff.code}</TableCell>
                              <TableCell>
                                <Button variant="outline" onClick={() => {
                                  setIsResetOpen(true);
                                  setResetStaff(staff);
                                }}>
                                  Reset
                                </Button>
                              </TableCell>
                              <TableCell className="flex space-x-2">
                                {/* Edit Dialog */}
                                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-500 hover:text-blue-400"
                                      onClick={() => {
                                        setEditedStaff(staff);
                                        setIsEditOpen(true);
                                      }}
                                    >
                                      <FilePen size={16} />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                                    <DialogHeader>
                                      <DialogTitle className="text-blue-400 text-xl font-bold">Edit Staff</DialogTitle>
                                      <DialogClose />
                                    </DialogHeader>
                                    <div className="flex flex-col gap-4 mt-4 text-gray-700">
                                      <div>
                                        <Label>Date Created</Label>
                                        <Input value={editedStaff.dateCreated} disabled />
                                      </div>
                                      <div>
                                        <Label>First Name</Label>
                                        <Input
                                          type="text"
                                          value={editedStaff.firstName}
                                          onChange={(e) => setEditedStaff({ ...editedStaff, firstName: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label>Last Name</Label>
                                        <Input
                                          type="text"
                                          value={editedStaff.lastName}
                                          onChange={(e) => setEditedStaff({ ...editedStaff, lastName: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label>Role</Label>
                                        <Select
                                          value={editedStaff.role}
                                          onValueChange={(value) => setEditedStaff({ ...editedStaff, role: value })}
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
                                        <Input value={editedStaff.code} disabled />
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

                                {/* Delete Dialog */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                                      <Trash2 size={16} />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                                    <DialogHeader>
                                      <DialogTitle>
                                        <span className="text-lg text-red-900">Delete Staff</span>
                                        <span className="text-lg text-gray-400 font-normal italic ml-2">{staff.code}</span>
                                      </DialogTitle>
                                      <DialogClose />
                                    </DialogHeader>
                                    <p className="text-sm text-gray-800 mt-2 pl-4">
                                      Deleting this staff account is permanent. Enter the admin password to confirm.
                                    </p>
                                    <div className="flex items-center gap-4 mt-4 pl-4">
                                      <div className="flex-1">
                                        <Label htmlFor={`password-${staff.code}`} className="text-base font-medium block mb-2">
                                          Admin Password
                                        </Label>
                                        <Input
                                          id={`password-${staff.code}`}
                                          type="password"
                                          required
                                          placeholder="Enter valid password"
                                          className="w-full"
                                        />
                                      </div>
                                      <DialogFooter className="mt-6">
                                        <Button
                                          className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                                          onClick={() => handleDeleteStaff(staff.code, document.getElementById(`password-${staff.code}`).value)}
                                        >
                                          DELETE STAFF
                                        </Button>
                                      </DialogFooter>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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