// "use client";

// import { useState } from "react";
// import { AppSidebar } from "@/components/admin-sidebar"
// import { SidebarProvider} from "@/components/ui/sidebar"
// import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableFooter } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";
// import { Search, ListFilter, Download, Trash2, Ellipsis } from "lucide-react";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

// // sample product data
// const products = [
//   { productCode: "188090", brand: "Cort", category: "Guitar", quantity: 2 },
//   { productCode: "188091", brand: "Lazer", category: "Drum", quantity: 1 },
//   { productCode: "188092", brand: "Lazer", category: "Drum", quantity: 3 },
//   { productCode: "188093", brand: "Alice", category: "Violin String", quantity: 0 },
//   { productCode: "188094", brand: "Bee", category: "Harmonica", quantity: 0 },
//   { productCode: "188095", brand: "Cort", category: "Guitar", quantity: 2 },
//   { productCode: "188096", brand: "Cort", category: "Guitar", quantity: 2 },
//   { productCode: "188097", brand: "Lazer", category: "Drum", quantity: 1 },
//   { productCode: "188098", brand: "Lazer", category: "Drum", quantity: 3 },
// ];

// // sample deliveries data
// const delivery = [
//   { deliveryNum: "188090", supplier: "Lazer" },
//   { deliveryNum: "188091", supplier: "Lazer" },
//   { deliveryNum: "188092", supplier: "Lazer" },
//   { deliveryNum: "188093", supplier: "Mirbros" },
//   { deliveryNum: "188094", supplier: "Mirbros" },
//   { deliveryNum: "188095", supplier: "Mirbros" },
//   { deliveryNum: "188096", supplier: "Lazer" },
//   { deliveryNum: "188097", supplier: "Lazer" },
//   { deliveryNum: "188098", supplier: "Lazer" },
// ];

// // sample transaction data
// const transactions = [
//   { dateAdded: "11/12/22", transactionID: "9090", productCode: "188090", receiptNum: "110090", product: "AD W/ W Case", totalPrice: "₱15,995", discountedPrice: "₱14,995" },
//   { dateAdded: "11/12/22", transactionID: "9091", productCode: "188091", receiptNum: "111091",  product: "Maple Snare Drum", totalPrice: "₱4,500", discountedPrice: "₱3,500" },
//   { dateAdded: "11/12/22", transactionID: "9092", productCode: "188092", receiptNum: "112092",  product: "Cymbal Straight Stand", totalPrice: "₱1,995", discountedPrice: "₱1,495" },
//   { dateAdded: "11/12/22", transactionID: "9093", productCode: "188093", receiptNum: "113093",  product: "Alice Violin String", totalPrice: "₱29,995", discountedPrice: "₱28,995" },
//   { dateAdded: "11/12/22", transactionID: "9094", productCode: "188094", receiptNum: "114094",  product: "Bee Harmonica", totalPrice: "₱125", discountedPrice: "₱95" },
//   { dateAdded: "11/12/22", transactionID: "9095", productCode: "188095", receiptNum: "115095",  product: "Cort Acoustic Guitar", totalPrice: "₱2,595", discountedPrice: "₱1,995" },
//   { dateAdded: "11/12/22", transactionID: "9096", productCode: "188096", receiptNum: "116096",  product: "AD W/ W Case", totalPrice: "₱395", discountedPrice: "₱295" },
//   { dateAdded: "11/12/22", transactionID: "9097", productCode: "188097", receiptNum: "117097",  product: "Maple Snare Drum", totalPrice: "₱295", discountedPrice: "₱195" },
//   { dateAdded: "11/12/22", transactionID: "9098", productCode: "188098", receiptNum: "118098",  product: "Cymbal Straight Stand", totalPrice: "₱15,995", discountedPrice: "₱14,995" }, 
// ];

// export default function DiscountsPage() {
//   const totalDiscountedSales = transactions.reduce((total, transaction) => {
//     const amount = parseFloat(transaction.discountedPrice.replace("₱", "").replace(",", "")) || 0;
//     return total + amount;
//   }, 0);

//   const [selectedFilter, setSelectedFilter] = useState(null);
//   const [selectedSubFilter, setSelectedSubFilter] = useState(null);
  
//   const handleFilterSelect = (filter, subFilter = null) => {
//     setSelectedFilter(filter);
//     setSelectedSubFilter(subFilter);
//   };

//   const getFilteredTransactions = () => {
//     let sortedTransactions = [...transactions];
  
//     if (!selectedFilter || !selectedSubFilter) return sortedTransactions;
  
//     if (selectedFilter === "Receipt Number") {
//       sortedTransactions.sort((a, b) =>
//         selectedSubFilter === "Ascending"
//           ? a.receiptNum.localeCompare(b.receiptNum)
//           : b.receiptNum.localeCompare(a.receiptNum)
//       );
//     }
  
//     if (selectedFilter === "Product Name") {
//       sortedTransactions.sort((a, b) =>
//         selectedSubFilter === "Ascending"
//           ? a.product.localeCompare(b.product)
//           : b.product.localeCompare(a.product)
//       );
//     }
  
//     if (selectedFilter === "Price") {
//       const getPrice = (price) => parseFloat(price.replace(/[^\d.]/g, ""));
//       sortedTransactions.sort((a, b) =>
//         selectedSubFilter === "Low to High"
//           ? getPrice(a.discountedPrice) - getPrice(b.discountedPrice)
//           : getPrice(b.discountedPrice) - getPrice(a.discountedPrice)
//       );
//     }
  
//     return sortedTransactions;
//   };  

//   // Multiple Delete
//   const [selectedProducts, setSelectedProducts] = useState([]);

//   const handleSelectProduct = (productCode) => {
//     setSelectedProducts((prev) =>
//       prev.includes(productCode)
//         ? prev.filter((code) => code !== productCode)
//         : [...prev, productCode]
//     );
//   };
  
//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       const allCodes = getFilteredTransactions().map((item) => item.productCode);
//       setSelectedProducts(allCodes);
//     } else {
//       setSelectedProducts([]);
//     }
//   };

//   // Delete
//     const [adminPW, setAdminPW] = useState("");
//     const [isDDOpen, setDDOpen] = useState("");
//     const [isMDDOpen, setMDDOpen] = useState("");
//     const handleDelete = (productCode, adminPWInput) => {
//       axios({
//         method: 'delete',
//         url: `http://localhost:8080/products/${productCode}`,
//         data: { adminPW: adminPWInput }, 
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       })
//         .then(() => {
//           toast.success("Product deleted successfully");
//           refreshTable();
//           setAdminPW("");
//           setDDOpen(false);
//         })
//         .catch(err => {
//           console.error("Delete error:", err.response?.data || err);
//           toast.error(err.response?.data?.message || "Error deleting product");
//         });
//     };
 
//   // Multiple delete
//   const handleMultiDelete = (password) => {
//     if (!password) return toast.error("Password is required.");
//     Promise.all(
//       selectedProducts.map((code) =>
//         axios({
//           method: 'delete',
//           url: `${config.product.api.delete}/${code}`,
//           data: { adminPW: password /*adminPWInput */ }, 
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         })
//       )
//     )
//       .then(() => {
//         toast.success("Selected products deleted.");
//         refreshTable();
//         setAdminPW("");
//         setMDDOpen(false);
//       })
//       .catch(() => toast.error("Error deleting selected products."));
//   };  

//   return (
//     <SidebarProvider>
//       <div className="flex h-screen w-screen">
//         <AppSidebar />
//         <div className="flex-1 p-4 flex flex-col w-full">
//           <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-lg">
//             <div className="flex items-center space-x-2">
//               <div className="relative w-80">
//                 {/* Search */}
//                 <Input
//                   type="text"
//                   placeholder="Search transaction, id, product"
//                   className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <div className="absolute left-3 top-2.5 text-gray-500">
//                   <Search className="w-5 h-5" />
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="outline" className="flex items-center space-x-2">
//                       <ListFilter className="w-4 h-4" />
//                       <span>Filter</span>
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="start">
//                     <DropdownMenuSub>
//                       <DropdownMenuSubTrigger>Receipt Number</DropdownMenuSubTrigger>
//                       <DropdownMenuSubContent>
//                         <DropdownMenuItem onClick={() => handleFilterSelect("Receipt Number", "Ascending")}>
//                           Ascending
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handleFilterSelect("Receipt Number", "Descending")}>
//                           Descending
//                         </DropdownMenuItem>
//                       </DropdownMenuSubContent>
//                     </DropdownMenuSub>
                    
//                     <DropdownMenuSub>
//                     <DropdownMenuSubTrigger>Product Name</DropdownMenuSubTrigger>
//                       <DropdownMenuSubContent>
//                         <DropdownMenuItem onClick={() => handleFilterSelect("Product Name", "Ascending")}>
//                           Ascending
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handleFilterSelect("Product Name", "Descending")}>
//                           Descending
//                         </DropdownMenuItem>
//                       </DropdownMenuSubContent>
//                     </DropdownMenuSub>

//                     <DropdownMenuSub>
//                       <DropdownMenuSubTrigger>Price</DropdownMenuSubTrigger>
//                       <DropdownMenuSubContent>
//                         <DropdownMenuItem onClick={() => handleFilterSelect("Price", "Low to High")}>
//                           Low to High
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handleFilterSelect("Price", "High to Low")}>
//                           High to Low
//                         </DropdownMenuItem>
//                       </DropdownMenuSubContent>
//                     </DropdownMenuSub>
    
//                     <DropdownMenuItem 
//                       onClick={() => handleFilterSelect(null, null)} 
//                       className="text-red-500 font-medium"
//                       >
//                         Reset Filters
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//             <div className="flex space-x-2">
//             <Button className="bg-blue-400 text-white">
//                 <Download className="w-4 h-4"/>
//               </Button>

//               <Dialog open={isMDDOpen} onOpenChange={setMDDOpen}>
//                 <DialogTrigger asChild>
//                   <Button className="bg-red-500 text-white" disabled={selectedProducts.length === 0}>
//                     Delete Selected
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
//                   <DialogHeader>
//                     <DialogTitle>
//                       <span className="text-lg text-red-900">Delete Multiple Transactions</span>
//                       <span className="text-lg text-gray-400 font-normal italic ml-2">({selectedProducts.length} items)</span>
//                     </DialogTitle>
//                     <DialogClose />
//                   </DialogHeader>
//                   <p className="text-sm text-gray-800 mt-2 pl-4">
//                     Deleting these transactions will reflect on Void Transactions. Enter the admin password to delete the selected products.
//                   </p>
//                   <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
//                     <div className="flex-1">
//                       <label htmlFor="password" className="text-base font-medium text-gray-700 block mb-2">
//                         Admin Password
//                       </label>
//                       <Input
//                         type="password"
//                         required
//                         placeholder="Enter admin password"
//                         className="w-full"
//                         value={adminPW}
//                         onChange={(e) => setAdminPW(e.target.value)}
//                       />
//                     </div>
//                     <Button
//                       className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
//                       onClick={() =>
//                         handleMultiDelete(adminPW)
//                       }
//                     >
//                       DELETE TRANSACTIONS
//                     </Button>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           </div>
//           <div className="p-4 bg-white shadow-md rounded-lg flex flex-col overflow-auto w-full">
//           <h1 className="text-gray-600 font-bold">Discounts</h1>
//             <Table>
//               <TableHeader className="sticky top-0 bg-white z-10">
//                 <TableRow>
//                   <TableHead>
//                     <input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.length === getFilteredTransactions().length && selectedProducts.length > 0} />
//                   </TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Transaction ID</TableHead>
//                   <TableHead>Product Code</TableHead>
//                   <TableHead>Receipt Number</TableHead>
//                   <TableHead>Product</TableHead>
//                   <TableHead>Price</TableHead>
//                   <TableHead>Discounted Price</TableHead>
//                   <TableHead>Details</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//               {getFilteredTransactions().map((transaction) => {
//                   const product = products.find((p) => p.productCode === transaction.productCode) || {};
//                   const deliveries = delivery.find((d) => d.deliveryNum === transaction.productCode) || {};
//                   return (
//                   <TableRow key={transaction.transactionID}>
//                     <TableCell>
//                       <input
//                         type="checkbox"
//                         checked={selectedProducts.includes(transaction.productCode)}
//                         onChange={() => handleSelectProduct(transaction.productCode)}
//                       />
//                     </TableCell>
//                     <TableCell>{transaction.dateAdded}</TableCell>
//                     <TableCell>{transaction.transactionID}</TableCell>
//                     <TableCell>{transaction.productCode}</TableCell>
//                     <TableCell>{transaction.receiptNum}</TableCell>
//                     <TableCell>{transaction.product}</TableCell>
//                     <TableCell>{transaction.totalPrice}</TableCell>
//                     <TableCell>{transaction.discountedPrice}</TableCell>
//                 {/*Details toggle button with modal pop-up */}              
//                     <TableCell className="flex space-x-2">              
//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
//                             <Ellipsis size={16} />
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="w-[90vw] max-w-3xl sm:max-w-lg md:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
//                         <DialogHeader>
//                             <DialogTitle>Transaction Details</DialogTitle>
//                             <DialogClose />
//                           </DialogHeader>
//                           {products && deliveries ? (
//                           <Table>
//                             <TableHeader>
//                               <TableRow>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>Product Code</TableHead>
//                                 <TableHead>Supplier</TableHead>
//                                 <TableHead>Brand</TableHead>
//                                 <TableHead>Category</TableHead>
//                                 <TableHead>Product</TableHead>
//                                 <TableHead>Quantity</TableHead>
//                                 <TableHead>Price</TableHead>
//                               </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                               <TableRow>
//                                 <TableCell>{transaction.dateAdded}</TableCell>
//                                 <TableCell>{transaction.productCode}</TableCell>
//                                 <TableCell>{deliveries.supplier}</TableCell>
//                                 <TableCell>{product.brand}</TableCell>
//                                 <TableCell>{product.category}</TableCell>
//                                 <TableCell>{transaction.product}</TableCell>
//                                 <TableCell>{product.quantity}</TableCell>
//                                 <TableCell>{transaction.totalPrice}</TableCell>
//                               </TableRow>
//                             </TableBody>
//                           </Table>
//                           ) : (
//                             <p className="text-gray-500">Product details not found.</p>
//                           )}
//                         </DialogContent>
//                       </Dialog>
                      
//                       {/* For deleting transactions */}
//                       <Dialog>
//                         <DialogTrigger asChild>
//                       <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
//                         <Trash2 size={16} />
//                       </Button>
//                         </DialogTrigger>
//                         <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
//                         <DialogHeader>
//                             <DialogTitle>
//                               <span className="text-lg text-red-900">Delete Transaction</span>{" "}
//                               <span className="text-lg text-gray-400 font-normal italic">{transaction.transactionID}</span></DialogTitle>
//                             <DialogClose />
//                           </DialogHeader>
//                           <p className='text-sm text-gray-800 mt-2 pl-4'> Deleting this transaction will reflect on Void Transactions. Enter the admin password to delete this transaction. </p>
//                           <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">        
//                             <div className="flex-1">
//                               <label htmlFor={`password-${transaction.transactionID}`} className="text-base font-medium text-gray-700 block mb-2">
//                                 Admin Password
//                               </label>
//                               <Input type="password" id={`password-${transaction.transactionID}`} required
//                                 placeholder="Enter valid password"  className="w-full" 
//                               />
//                             </div>
          
//                             <Button 
//                               className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
//                               onClick={() => handleDelete(transaction.transactionID, 
//                                 document.getElementById(`password-${transaction.transactionID}`).value)}
//                             >
//                               DELETE TRANSACTION
//                             </Button>
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                     </TableCell>
//                   </TableRow>
//                   );
//                 })}
//               </TableBody>
//               <TableFooter>
//                 <TableRow className="bg-white">  
//                   <TableCell colSpan={6} className="text-right font-bold">Total Discounted Sales:</TableCell>
//                   <TableCell className="font-bold">₱{totalDiscountedSales.toLocaleString()}</TableCell>
//                   <TableCell></TableCell>
//                 </TableRow>
//               </TableFooter>
//             </Table>
//           </div>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// }
