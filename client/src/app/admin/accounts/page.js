"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
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
import { AppSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast, Toaster } from "react-hot-toast";

export default function ManageAccountsPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("my-account");
  const [currentUser, setCurrentUser] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    accountID: "",
    firstName: "",
    lastName: "",
    roleID: "",
    password: "",
    confirmPassword: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedStaff, setEditedStaff] = useState({});
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStaff, setResetStaff] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adminPW, setAdminPW] = useState("");
  const [editSource, setEditSource] = useState(""); // "my-account" or "staff"
  const [passwordResetSource, setPasswordResetSource] = useState("");

  // Load current user + staff data
  const fetchData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.accountID) {
        toast.error("You are not logged in.");
        router.push("/login");
        return;
      }
      const [userData, staffRes, rolesRes] = await Promise.all([
        axios.get(`http://localhost:8080/accounts/${storedUser.accountID}`),
        axios.get("http://localhost:8080/accounts"),
        axios.get("http://localhost:8080/role"),
      ]);
      setCurrentUser(userData.data);
      setStaffs(staffRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load account data.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle copying user code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser?.accountID || "").catch((err) =>
      console.error("Failed to copy:", err)
    );
    toast.success("User code copied!");
  };

  // Reset password handler
  const handleResetPassword = () => {
    if (!resetStaff || !resetStaff.accountID) {
      toast.error("Invalid user data.");
      return;
    }

    if (passwordResetSource === "my-account") {
      if (!passwordData.oldPassword) {
        toast.error("Old password is required.");
        return;
      }
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Prevent using the same old password for new one
    if (
      passwordResetSource === "my-account" &&
      passwordData.newPassword === currentUser?.password
    ) {
      toast.error("New password cannot be the same as the old password.");
      return;
    }

    axios
      .put(
        `http://localhost:8080/accounts/${resetStaff.accountID}/reset-password`,
        {
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
          ...(passwordResetSource === "my-account" && {
            oldPassword: passwordData.oldPassword,
          }),
        }
      )
      .then(() => {
        toast.success("Password reset successfully.");
        setIsResetOpen(false);
        setResetStaff(null);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Refresh data after successful action
        fetchData();
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unknown error";
        console.error("Password reset error:", errorMessage);
        toast.error(`Failed to reset password: ${errorMessage}`);
        setIsResetOpen(false);
        setResetStaff(null);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      });
  };

  // Delete handler
  const handleAccountDelete = (accountID) => {
    if (!accountID || !adminPW) {
      toast.error("Admin password is required.");
      return;
    }

    axios
      .delete(`http://localhost:8080/accounts/${accountID}`, {
        data: { adminPW },
      })
      .then(() => {
        toast.success("Account deleted successfully.");
        setIsDeleteAccountDialogOpen(false);
        setDeleteTarget(null);
        setAdminPW("");

        // Refresh data after delete
        fetchData();
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unknown error";
        console.error("Delete error:", errorMessage);
        toast.error(`Failed to delete account: ${errorMessage}`);
        setIsDeleteAccountDialogOpen(false);
        setDeleteTarget(null);
        setAdminPW("");
      });
  };

  // Handle filter selection
  const handleFilterSelect = (filter, subFilter = null) => {
    setSelectedFilter(filter);
    setSelectedSubFilter(subFilter);
  };

  // Get filtered/sorted/searched staff list
  const getFilteredStaffs = () => {
    let filtered = [...staffs];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((staff) =>
        `${staff.firstName} ${staff.lastName} ${staff.accountID}`
          .toLowerCase()
          .includes(query)
      );
    }
    if (!selectedFilter || !selectedSubFilter) return filtered;
    switch (selectedFilter) {
      case "Name":
        return filtered.sort((a, b) =>
          selectedSubFilter === "Ascending"
            ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
            : `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
        );
      case "Role":
        const selectedRole = roles.find(
          (r) => r.roleName.toLowerCase() === selectedSubFilter.toLowerCase()
        );
        if (selectedRole) {
          return filtered.filter((s) => s.roleID === selectedRole.roleID);
        } else if (selectedSubFilter === "All") {
          return [...filtered];
        }
        break;
      case "User Code":
        return filtered.sort((a, b) =>
          selectedSubFilter === "Low to High" ? a.accountID - b.accountID : b.accountID - a.accountID
        );
      case "Date Created":
        return filtered.sort((a, b) => {
          const dateA = new Date(a.dateCreated);
          const dateB = new Date(b.dateCreated);
          return selectedSubFilter === "Oldest" ? dateA - dateB : dateB - dateA;
        });
      default:
        return filtered;
    }
    return filtered;
  };

  // Submit add staff
  const handleAddStaff = async () => {
    const {
      accountID,
      firstName,
      lastName,
      roleID,
      password,
      confirmPassword,
    } = newStaff;

    if (
      !accountID ||
      !firstName ||
      !lastName ||
      !roleID ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://localhost:8080/accounts", {
        accountID,
        firstName,
        lastName,
        roleID,
        password,
      });
      toast.success("Staff added successfully.");
      setIsAddOpen(false);
      setNewStaff({
        accountID: "",
        firstName: "",
        lastName: "",
        roleID: "",
        password: "",
        confirmPassword: "",
      });

      // Refresh data after adding
      fetchData();
    } catch (err) {
      toast.error("Failed to add staff.");
      console.error(err);
    }
  };

  // Submit edit staff
  const handleUpdateStaff = async (updatedStaff) => {
    if (
      !updatedStaff.accountID ||
      !updatedStaff.firstName ||
      !updatedStaff.lastName
    ) {
      toast.error("Missing required fields.");
      return;
    }

    const payload = {
      firstName: updatedStaff.firstName,
      lastName: updatedStaff.lastName,
    };

    if (editSource === "staff") {
      payload.roleID = updatedStaff.roleID;
    }

    try {
      await axios.put(
        `http://localhost:8080/accounts/${updatedStaff.accountID}`,
        payload
      );

      if (editSource === "my-account") {
        setCurrentUser({
          ...currentUser,
          firstName: updatedStaff.firstName,
          lastName: updatedStaff.lastName,
        });
      } else {
        setStaffs(
          staffs.map((s) =>
            s.accountID === updatedStaff.accountID ? updatedStaff : s
          )
        );
      }

      toast.success("Account updated successfully.");
      setIsEditOpen(false);

      // Refresh data after update
      fetchData();
    } catch (err) {
      toast.error("Failed to update staff.");
      console.error(err);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          <div className="z-10 sticky top-0 mb-4 bg-blue-950 p-4 rounded-sm">
            <h1 className="text-2xl text-blue-50 font-bold">Manage Accounts</h1>
          </div>
          <Tabs
            defaultValue="my-account"
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* TAB LIST */}
            <div className="w-full z-10 sticky">
              <TabsList className="w-full flex justify-start bg-white rounded-md shadow-md px-6 py-6 space-x-4">
                <TabsTrigger
                  value="my-account"
                  className="data-[state=active]:text-indigo-600 hover:text-black"
                >
                  MY ACCOUNT
                </TabsTrigger>
                <TabsTrigger
                  value="staff"
                  className="data-[state=active]:text-indigo-600 hover:text-black"
                >
                  STAFF
                </TabsTrigger>
              </TabsList>
            </div>
            {/* MY ACCOUNT TAB */}
            <TabsContent value="my-account" className="mt-0">
              {currentUser ? (
                <div className="flex flex-col lg:flex-row gap-4 items-stretch p-4">
                  <Card className="w-full lg:w-2/3 text-gray-700 content-center">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-xl text-center">
                        Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm text-gray-500">
                            First Name
                          </Label>
                          <p className="text-base font-medium text-gray-800">
                            {currentUser.firstName}
                          </p>
                          <Label className="text-sm text-gray-500 mt-3 block">
                            Role
                          </Label>
                          <p className="text-base font-medium text-gray-800">
                            {roles.find((r) => r.roleID === currentUser.roleID)?.roleName || "Loading..."}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">
                            Last Name
                          </Label>
                          <p className="text-base font-medium text-gray-800">
                            {currentUser.lastName}
                          </p>
                          <Label className="text-sm text-gray-500 mt-3 block">
                            Date Created
                          </Label>
                          <p className="text-base font-medium text-gray-800">
                            {currentUser.dateCreated}
                          </p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild onClick={() => setEditedStaff(currentUser)}>
                          <Button className="bg-blue-400 text-white">Edit Account</Button>
                        </DialogTrigger>
                        <DialogContent aria-describedby="edit-account-dialog" className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle className="text-blue-400 text-xl font-bold">
                              Edit Account Information
                            </DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <div className="flex flex-col gap-4 mt-4 text-gray-700">
                            <Label>Date Created</Label>
                            <Input value={currentUser.dateCreated} disabled />
                            <Label>First Name</Label>
                            <Input
                              type="text"
                              defaultValue={currentUser.firstName}
                              placeholder="Enter first name"
                              onChange={(e) =>
                                setEditedStaff({
                                  ...editedStaff,
                                  firstName: e.target.value,
                                })
                              }
                            />
                            <Label>Last Name</Label>
                            <Input
                              type="text"
                              defaultValue={currentUser.lastName}
                              placeholder="Enter last name"
                              onChange={(e) =>
                                setEditedStaff({
                                  ...editedStaff,
                                  lastName: e.target.value,
                                })
                              }
                            />
                            {/* Remove role dropdown in My Account tab */}
                            <Label>Role</Label>
                            <Input
                              value={roles.find((role) => role.roleID === currentUser.roleID)?.roleName || "Loading..."}
                              disabled
                            />
                          </div>
                          <DialogFooter className="mt-6">
                            <Button
                              className="w-full bg-blue-400 text-white"
                              onClick={() => {
                                setEditSource("my-account");
                                handleUpdateStaff(editedStaff);
                              }}
                            >
                              Update Staff
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                  <Card className="w-full lg:w-1/3 text-gray-700">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-xl text-center">
                        Login Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label>User Code</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={currentUser.accountID || ""}
                            disabled
                          />
                          <Button size="icon" variant="ghost" onClick={handleCopyCode}>
                            <Copy size={16} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Password</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={currentUser.password}
                            disabled
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="bg-blue-400 text-white"
                            onClick={() => {
                              if (currentUser && currentUser.accountID) {
                                setIsResetOpen(true);
                                setResetStaff(currentUser);
                                setPasswordResetSource("my-account");
                              } else {
                                toast.error("User data not available.");
                              }
                            }}
                          >
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent aria-describedby="change-password-dialog" className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle className="text-blue-400 text-xl font-bold">
                              Change Password
                            </DialogTitle>
                            <DialogClose />
                          </DialogHeader>
                          <div className="flex flex-col gap-4 mt-4 text-gray-700">
                            {/* Show old password only when it's "my-account" */}
                            <Label>Old Password</Label>
                            <Input
                              type="password"
                              placeholder="Enter old password"
                              value={passwordData.oldPassword}
                              onChange={(e) =>
                                setPasswordData({ ...passwordData, oldPassword: e.target.value })
                              }
                            />
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
                          <DialogFooter>
                            <Button
                              className="w-full bg-blue-400 text-white"
                              onClick={handleResetPassword}
                            >
                              Update Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-red-500 text-center mt-4">
                  No user found. Please log in again.
                </p>
              )}
            </TabsContent>
            {/* STAFF TAB */}
            <TabsContent value="staff" className="mt-0">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Staff ({staffs.length})
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Search staff..."
                    className="w-full sm:w-auto"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center space-x-2">
                        <ListFilter className="w-4 h-4" />
                        <span>Filter/Sort</span>
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
                          <DropdownMenuItem onClick={() => handleFilterSelect("Role", "Admin")}>
                            Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilterSelect("Role", "Staff")}>
                            Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFilterSelect("Role", "All")}>
                            All
                          </DropdownMenuItem>
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
                        onClick={() => {
                          handleFilterSelect(null, null);
                          setSearchQuery("");
                        }}
                        className="text-red-500 font-medium"
                      >
                        Reset Filters
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
                            <Input
                              type="text"
                              value={newStaff.firstName}
                              onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Last Name</Label>
                            <Input
                              type="text"
                              value={newStaff.lastName}
                              onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Select
                            value={newStaff.roleID}
                            onValueChange={(value) => setNewStaff({ ...newStaff, roleID: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.roleID} value={role.roleID.toString()}>
                                  {role.roleName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>User Code</Label>
                          <Input
                            type="text"
                            value={newStaff.accountID}
                            onChange={(e) => setNewStaff({ ...newStaff, accountID: e.target.value })}
                            placeholder="Enter user code"
                          />
                        </div>
                        <div>
                          <Label>Password</Label>
                          <Input
                            type="password"
                            value={newStaff.password}
                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                            placeholder="Enter password"
                          />
                        </div>
                        <div>
                          <Label>Confirm Password</Label>
                          <Input
                            type="password"
                            value={newStaff.confirmPassword}
                            onChange={(e) => setNewStaff({ ...newStaff, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button className="w-full bg-blue-400 text-white" onClick={handleAddStaff}>
                          Submit
                        </Button>
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
                          <TableRow key={staff.accountID}>
                            <TableCell>{new Date(staff.dateCreated).toLocaleDateString()}</TableCell>
                            <TableCell>{`${staff.firstName} ${staff.lastName}`}</TableCell>
                            <TableCell>
                              {roles.find((role) => role.roleID === staff.roleID)?.roleName || "Loading..."}
                            </TableCell>
                            <TableCell>{staff.accountID}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsResetOpen(true);
                                  setResetStaff(staff);
                                  setPasswordResetSource("staff");
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
                                  setEditSource("staff");
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl font-bold">
              Edit Staff - {editedStaff?.firstName} {editedStaff?.lastName}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4 text-gray-700">
            <Label>Date Created</Label>
            <Input value={editedStaff?.dateCreated || ""} disabled />
            <Label>First Name</Label>
            <Input
              value={editedStaff?.firstName || ""}
              onChange={(e) => setEditedStaff({ ...editedStaff, firstName: e.target.value })}
            />
            <Label>Last Name</Label>
            <Input
              value={editedStaff?.lastName || ""}
              onChange={(e) => setEditedStaff({ ...editedStaff, lastName: e.target.value })}
            />
            {editSource === "staff" && (
              <>
                <Label>Role</Label>
                <Select
                  value={editedStaff?.roleID?.toString() || ""} 
                  onValueChange={(value) => setEditedStaff({ ...editedStaff, roleID: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.roleID} value={role.roleID.toString()}>
                        {role.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            <Label>User Code</Label>
            <Input value={editedStaff?.accountID || ""} disabled />
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
      {/* RESET PASSWORD MODAL */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl font-bold">
              {passwordResetSource === "my-account"
                ? "Change Your Password"
                : `Reset Password for ${resetStaff?.firstName} ${resetStaff?.lastName}`}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4 text-gray-700">
            {passwordResetSource === "my-account" && (
              <>
                <Label>Old Password</Label>
                <Input
                  type="password"
                  placeholder="Enter old password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, oldPassword: e.target.value })
                  }
                />
              </>
            )}
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
          <DialogFooter>
            <Button
              className="w-full bg-blue-400 text-white"
              onClick={handleResetPassword}
            >
              {passwordResetSource === "my-account"
                ? "Update Password"
                : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* DELETE MODAL */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>
              <span className="text-lg text-red-900">Delete Account</span>{" "}
              <span className="text-lg text-gray-400 font-normal italic">{deleteTarget?.accountID}</span>
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <p className="text-sm text-gray-800 mt-2 pl-4">
            You are about to delete <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>'s account.
            Enter your admin password below to confirm.
          </p>
          <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
            <div className="flex-1 w-full">
              <Label htmlFor="admin-password" className="block font-medium text-gray-700">
                Admin Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                required
                placeholder="Enter admin password"
                value={adminPW}
                onChange={(e) => setAdminPW(e.target.value)}
              />
            </div>
            <Button
              className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm whitespace-nowrap mt-7"
              onClick={() => handleAccountDelete(deleteTarget?.accountID)}
            >
              DELETE ACCOUNT
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </SidebarProvider>
  );
}