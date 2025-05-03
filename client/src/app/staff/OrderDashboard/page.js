"use client";

import React from 'react';
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/staff-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import getColumns from "../../../components/ui/columns";
import DataTable from "../../../components/ui/data-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const OrderDashboard = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Order
  const [products, setProducts] = useState([]);
  const [openProduct, setOpenProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [productDiscounts, setProductDiscounts] = useState([]);
  const [selectedProductDiscount, setSelectedProductDiscount] = useState(null);

  // Freebies
  const [openFreebie, setOpenFreebie] = useState(false);
  const [selectedFreebie, setSelectedFreebie] = useState(null);
  const [freebieQuantity, setFreebieQuantity] = useState(0);

  // Whole order variables
  const [hasInteractedWithPayModal, setHasInteractedWithPayModal] = useState(false);
  const [payment, setPayment] = useState(0); 
  const [wholeOrderDiscount, setWholeOrderDiscount] = useState(0);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptNumberError, setReceiptNumberError] = useState("");
  const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.Total), 0);
  const discountedTotal = Math.max(totalAmount - wholeOrderDiscount, 0);
  const parsedPayment = parseFloat(payment.toString().replace(/,/g, "")) || 0;
  const change = Math.max(parsedPayment - discountedTotal, 0);
  const isInvalidDiscount = wholeOrderDiscount > totalAmount;


  const handlePaymentConfirmation = (e) => {
    e.preventDefault();
  
    // // Validation
    // if (selectedProduct === null || selectedProduct === "") {
    //   toast.error("Please add a product order.");
    //   return;
    // }
  
    if (payment === 0) {
      toast.error("Enter payment.");
      return;
    }
    if (!receiptNumber) {
      toast.error("Enter receipt number.");
      return;
    }
  
    // Calculate total product discount
    const totalProductDiscount = data.reduce((sum, item) => {
      const discountValue = parseFloat(item["Discount Value"]) || 0;
      return sum + discountValue;
    }, 0);
  
    const transactionDate = new Date(Date.now() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
  
    // Create the Order
    const orderPayload = {
      O_receiptNumber: receiptNumber,
      T_totalAmount: discountedTotal,
      D_wholeOrderDiscount: wholeOrderDiscount || 0,
      D_totalProductDiscount: totalProductDiscount,
      T_transactionDate: transactionDate,
      isTemporarilyDeleted: false,
    };
    console.log("Order Payload:", orderPayload);
  
    axios.post("http://localhost:8080/orders", orderPayload)
      .then((response) => {
        const orderId = response.data.id;
  
        // Create each Order Detail individually (no Promise.all)
        data.forEach((item) => {
          const isFreebie = item.Product?.includes('(Freebie)');
          const price = parseFloat(item["Price"]) || 0;
          const discount = parseFloat(item["Discount"]) || 0;
          const quantity = parseInt(item["Quantity"]) || 0;
          const itemTotal = isFreebie ? 0 : (price - discount) * quantity;
  
          const detailPayload = {
            O_orderID: orderId,
            P_productCode: item["Product Code"],
            D_productDiscountID: isFreebie ? null : item["Discount ID"] || null,
            OD_quantity: quantity,
            OD_unitPrice: isFreebie ? 0.00 : price,
            OD_discountAmount: isFreebie ? 0.00 : discount,
            OD_itemTotal: itemTotal,
          };
          console.log("Order Detail Payload:", detailPayload);
  
          axios.post("http://localhost:8080/orderDetails", detailPayload)
          .catch(err => {
            console.error("Failed to save order detail:", detailPayload, err.response?.data || err.message);
          });
        });
      })
      .then(() => {
        toast.success("Payment confirmed and order successfully added!");
        setIsModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((err) => {
        console.error("Error processing payment:", err);
  
        if (
          err.response?.status === 409 ||
          err.response?.data?.message?.includes('Orders.O_receiptNumber')
        ) {
          toast.error(`Receipt Number already exists. Enter a different receipt`);
        } else {
          toast.error(`An error occurred while saving the order.`);
        }

      });
  };
  
  
  
  // Fetch data for product list
  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
      .then((res) => {
        const mappedProducts = res.data.map((p) => ({
          code: p.P_productCode,
          name: p.P_productName,
          category: p.category,
          brand: p.brand,
          supplier: p.supplier,
          supplierId: p.S_supplierID,
          price: p.P_sellingPrice,
          stock: p.stock,
          status: p.status,
          dateAdded: p.P_dateAdded,
          label: `${p.P_productName} | B${p.brand} | S${p.supplier}`,
        }));
        setProducts(mappedProducts);
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);  

  const handleProductSelect = (product) => {
    console.log("Selected Product:", product);
    setSelectedProduct(product);  
    setOpenProduct(false); 
  };

  const handleAddOrderItem = () => {
    if (!selectedProduct || orderQuantity <= 0) {}
  
    const price = selectedProduct.price;
    const discountAmount = orderDiscount || 0;
    const total = (price * orderQuantity) - discountAmount;
  
    if (isEditMode) {
      // Update the item
      setData((prevData) => {
        return prevData.map((item) =>
          item["Product Code"] === selectedProduct.code
            ? {
                ...item,
                "Quantity": orderQuantity,
                "Discount": orderDiscount,
                "Total": total,
              }
            : item
        );
      });
    } else {
      // Add a new item
      const newItem = {
        "Product Code": selectedProduct.code,
        "Supplier": selectedProduct.supplier,
        "Brand": selectedProduct.brand,
        "Product": selectedProduct.name,
        "Price": price,
        "Discount": orderDiscount,
        "Quantity": orderQuantity,
        "Total": total,
      };
      setData((prevData) => [...prevData, newItem]);
    }
  
    // Reset
    setSelectedProduct(null);
    setOrderQuantity(1);
    setOrderDiscount(0);
    setIsEditMode(false); // Reset to add mode
  };

  const handleEdit = (row) => {
    const {
      "Product Code": code,
      "Product": name,
      "Price": price,
      "Quantity": quantity,
      "Discount": discount,
      "Total": total,
    } = row;
  
    const selectedProduct = products.find(product => product.code === code);
    if (selectedProduct) {
      setSelectedProduct(selectedProduct);
      setOrderQuantity(quantity);
      setOrderDiscount(parseFloat(discount));
      setIsEditMode(true);
    }
  };
  
  const handleAddFreebie = () => {
  if (!selectedFreebie || freebieQuantity <= 0) return;
  const newFreebie = {
    "Product Code": selectedFreebie.code,
    "Supplier": selectedFreebie.supplier,
    "Brand": selectedFreebie.brand,
    "Product": `(Freebie)${selectedFreebie.name}`,
    "Price": 0,
    "Discount": 0,
    "Quantity": freebieQuantity,
    "Total": 0,
  };
    setData((prevData) => [...prevData, newFreebie]);
    setSelectedFreebie(null);
    setFreebieQuantity(1);
};
  
  const handleFreebieSelect = (product) => {
    setSelectedFreebie(product);
    setFreebieQuantity(1); 
    setOpenFreebie(false);
  };
  
  // DELETE BOTH OCCURRENCE IF SAME PRODUCT CODE
  const handleDelete = (productCode) => {
    setData((prevData) => prevData.filter(item => item["Product Code"] !== productCode));
  };

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const [integerPart, decimalPart] = value.replace(/[^0-9.]/g, "").split(".");
    const formattedInteger = parseInt(integerPart || "0", 10).toLocaleString("en-PH");
    return decimalPart !== undefined
      ? `₱${formattedInteger}.${decimalPart.slice(0, 2)}`
      : `₱${formattedInteger}`;
  };
  
  useEffect(() => {
    const fetchProductDiscounts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/discounts");
        setProductDiscounts(response.data);
      } catch (error) {
        console.error("Failed to fetch product discounts", error);
      }
    };
    fetchProductDiscounts();
  }, []);
  
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen overflow-x-hidden">
        <AppSidebar />

        <div className="flex flex-col flex-grow h-screen overflow-y-auto relative">
          <div className="rounded-lg shadow-sm border-b sticky top-0 z-20 bg-white px-8 py-8">
            <h1 className="text-3xl text-black font-bold">Summary of Order/s</h1>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 w-full p-4">
            
            {/* Left Section */}
            {/* TABLE */}
            <div className="lg:col-span-2 space-y-4 min-w-0">
              <div className="h-[50%] text-xl bg-white shadow-md p-4 rounded-xl">
              <DataTable 
                columns={getColumns(handleDelete, handleEdit)} 
                data={data}
              />
              </div>

              {/* TOTAL AMOUNT - PAYMENT */}
              <div className="bg-white shadow-lg p-6 text-center rounded-xl">
                <h2 className="text-lg text-blue-600">TOTAL AMOUNT</h2>
                <p className="text-5xl font-bold text-blue-600">
                  {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(discountedTotal)}
                </p>

                <div className="mt-4 flex justify-center items-center gap-2">
                  <div className="flex flex-col items-start w-[40%]">
                    <label className={`text-sm text-[15px] ${isInvalidDiscount ? "text-red-600" : "text-blue-600"}`}>
                      {isInvalidDiscount ? "Invalid Discount Amount" : "APPLY PURCHASE DISCOUNT"}
                    </label>
                    <input
                      type="text"
                      value={wholeOrderDiscount === 0 ? "" : formatNumberWithCommas(wholeOrderDiscount.toString())}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9.]/g, ""); 
                        setWholeOrderDiscount(rawValue === "" ? "" : parseFloat(rawValue) || 0); 
                      }}
                      className={`px-2 py-1 w-full border rounded-md text-[13px] text-center focus:outline-none ${isInvalidDiscount ? "border-red-600 text-red-600" : "border-blue-600 text-black"}`}
                    />
                  </div>

                  <button onClick={() => setIsModalOpen(true)} className="px-4 py-1 mt-5 bg-blue-600 text-white rounded-md text-[13px]">
                    INPUT PAYMENT
                  </button>

                  {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30" onClick={() => setIsModalOpen(false)}>
                      <div className="bg-white p-5 rounded-lg shadow-lg w-[400px] text-center relative" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg text-blue-600">TOTAL AMOUNT</h2>
                        <p className="text-[45px] font-bold text-blue-600">
                          {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(discountedTotal)}
                        </p>
                        <label
                          className={`pl-9 mt-2 text-start text-[15px] block ${
                            hasInteractedWithPayModal && !payment
                              ? "text-red-600"
                              : hasInteractedWithPayModal && (parseFloat(payment.toString().replace(/,/g, "")) || 0) < discountedTotal
                              ? "text-red-600"
                              : "text-black"
                          }`}
                        >
                          {hasInteractedWithPayModal && !payment
                            ? "Enter Payment Amount"
                            : hasInteractedWithPayModal && (parseFloat(payment.toString().replace(/,/g, "")) || 0) < discountedTotal
                            ? "Invalid Payment Amount"
                            : "Given Payment"}
                        </label>

                        <input
                          type="text"
                          value={payment === 0 ? "" : payment.toLocaleString("en-PH")}
                          onChange={(e) => {
                            setHasInteractedWithPayModal(true);
                            const rawValue = e.target.value.replace(/[^0-9.]/g, ""); 
                            const updatedPayment = rawValue === "" ? 0 : parseFloat(rawValue);
                            setPayment(updatedPayment);
                          }}
                          onBlur={() => {
                            if (!payment || parseFloat(payment.toString().replace(/,/g, "")) < discountedTotal) {
                              setHasInteractedWithPayModal(true);
                            }
                          }}
                          onMouseLeave={() => {
                            if (!payment || parseFloat(payment.toString().replace(/,/g, "")) < discountedTotal) {
                              setHasInteractedWithPayModal(true);
                            }
                          }}
                          className={`w-[80%] px-2 py-1 border rounded-md text-center focus:outline-none ${
                            hasInteractedWithPayModal && !payment 
                              ? "border-red-600 text-red-600" 
                              : hasInteractedWithPayModal && payment < discountedTotal 
                              ? "border-red-600 text-red-600" 
                              : "border-gray-300 text-black"
                          }`}
                        />


                      <label className={`pl-9 mt-2 text-start text-[15px] block ${receiptNumberError ? "text-red-600" : "text-black"}`}>
                        {receiptNumberError ? "Enter a valid receipt number" : "Enter Receipt Number"}
                      </label>
                      <input
                        type="text"
                        value={receiptNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setReceiptNumber(value);
                          console.log("Payment: ", payment);
                          console.log("Total Amount: ", totalAmount);
                          if (value.trim() !== "") setReceiptNumberError(false); 
                        }}
                        onBlur={() => {
                          if (!receiptNumber || !Number.isInteger(Number(receiptNumber))) {
                            setReceiptNumberError(true);
                          }
                        }}
                        onMouseLeave={() => {
                          if (!receiptNumber || !Number.isInteger(Number(receiptNumber))) {
                            setReceiptNumberError(true);
                            console.log("Receipt: ", receiptNumber);
                          }
                        }}
                        className={`w-[80%] px-2 py-1 border rounded-md text-center focus:outline-none ${
                          receiptNumberError ? "border-red-600 text-red-600" : "border-gray-300 text-black"
                        }`}
                      />

                        <button
                          className={`mt-4 p-1 text-[15px] w-[80%] rounded-md 
                            ${
                              payment < totalAmount || receiptNumber === "" || payment === 0 
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          onClick={handlePaymentConfirmation}
                          disabled={ payment === 0 || payment < totalAmount || receiptNumber === ""}
                        >
                          Enter Payment
                        </button>
                      

                        <p className="pl-9 mb-5 mt-2 text-start text-[13px] font-bold text-blue-600">
                          CHANGE: {new Intl.NumberFormat("en-PH", { 
                            style: "currency", 
                            currency: "PHP" 
                          }).format(change)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="space-y-4 min-w-0">
            <div
              className="bg-white shadow-lg p-6 rounded-xl"
              onMouseLeave={() => {
                if (isEditMode) {
                  setIsEditMode(false);
                  setSelectedProduct(null);
                  setOrderQuantity(1);
                  setOrderDiscount(0);
                }
              }}
            >

            {/* ADD PRODUCT/ITEM */}
            <h2 className="text-xl text-center font-semibold text-blue-600 pb-4">Add Product to Order/s</h2>
            <form className="text-[15px] space-y-2">
              <div className="text-left">
                
                {/* COMBOBOX SEARCH PRODUCT */}
                <label className="block mb-1 text-sm">Product</label>
                <Popover open={openProduct} onOpenChange={setOpenProduct}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openProduct} className="w-full justify-between">
                      {selectedProduct ? selectedProduct.name : "Select product..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search product..." />
                      <CommandEmpty>No product found.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.code}
                            value={product.name}
                            onSelect={() => handleProductSelect(product)}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedProduct?.code === product.code ? "opacity-100" : "opacity-0")} />
                            {product.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm">Price</label>
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                  <input
                    type="text"
                    value={selectedProduct ? new Intl.NumberFormat("en-PH", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(selectedProduct.price) || 0) : "0"}
                    disabled
                    className="w-full pl-6 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500"
                  />
              </div>

              <div>
                <label className="block text-sm">Stock Available</label>
                <input
                  type="number"
                  value={selectedProduct?.stock ?? 0}
                  disabled
                  className="w-full border border-gray-300 rounded-md px-5 py-2 text-sm bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm">Quantity</label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => {
                    let quantity = e.target.value;
                    quantity = quantity.replace(/\+/g, '');
                    // Ensure the value is a positive number and does not exceed the stock
                    if (quantity >= 1 && quantity <= selectedProduct?.stock) {
                      setOrderQuantity(quantity);
                    }
                  }}
                  className={`w-full border rounded-md px-5 py-2 text-sm ${orderQuantity <= 0 || orderQuantity > selectedProduct?.stock ? 'border-red-500' : 'border-gray-300'}`}
                />
                {(orderQuantity <= 0 || orderQuantity > selectedProduct?.stock) && (
                  <p className="text-red-500 text-xs">
                    Quantity must be greater than 0 and cannot exceed the available stock.
                  </p>
                )}
              </div>

              <DropdownMenu>
                <label className="block text-sm mb-1">With Product Discount?</label>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    {selectedProductDiscount?.D_discountType || " "}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuSeparator />
                  {productDiscounts.map((itemDiscount) => (
                    <DropdownMenuItem
                      key={itemDiscount.D_productDiscountID}
                      onClick={() => {
                        const discountType = itemDiscount.D_discountType;
                        const currentPrice = parseFloat(selectedProduct?.price);
                        const currentQuantity = parseInt(orderQuantity);
                      
                        setSelectedProductDiscount(itemDiscount);
                      
                        if (discountType.includes("%")) {
                          const percent = parseFloat(discountType); // e.g. "10%" becomes 10
                          const computed = currentPrice * currentQuantity * (percent / 100);
                          setOrderDiscount(computed.toFixed(2));
                        } else if (discountType.toLowerCase().includes("specific")) {
                          setOrderDiscount(""); // User will type manually
                        } else {
                          setOrderDiscount("0");
                        }
                      }}
                      
                    >
                      {itemDiscount.D_discountType}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>


                <label className="block text-sm">Discount Amount</label>
                <input
                  type="text"
                  disabled={
                    !selectedProductDiscount?.D_discountType
                      ?.toLowerCase()
                      .includes("specific")
                  }
                  value={orderDiscount === 0 ? "" : orderDiscount}
                  onFocus={(e) => {
                    if (orderDiscount === 0) e.target.select();
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^(\d+(\.\d{0,2})?)?$/.test(value)) {
                      setOrderDiscount(value === "" ? 0 : parseFloat(value));
                    }
                  }}                  
                  className={`w-full pl-6 border rounded-md px-3 py-2 text-sm ${
                    selectedProductDiscount?.D_discountType?.toLowerCase().includes(
                      "specific"
                    )
                      ? "border-gray-300"
                      : "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                  }`}
                />

                <label className="block text-sm">Total</label>
                <input
                  type="text"
                  value={(() => {
                    const price = parseFloat(selectedProduct?.price) || 0;
                    const quantity = parseInt(orderQuantity) || 0;
                    const discount = parseFloat(orderDiscount) || 0;
                    const total = (price * quantity) - discount;
                    return new Intl.NumberFormat("en-PH", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(total >= 0 ? total : 0);
                  })()}
                  disabled
                  className="w-full pl-6 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500"
                />

              <button
                type="button"
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md"
                onClick={handleAddOrderItem}
              >
                {isEditMode ? "Update Item" : "Add Product"}
              </button>
            </form>
          </div>

            <div className="bg-white shadow-lg p-5 rounded-xl">
              <h2 className="text-xl text-center font-semibold text-blue-600 pb-4">Add Freebie/s</h2>
              <form className="text-[15px] space-y-2">
                <div className="text-left">
                  <label className="block mb-1 text-sm">Product</label>
                  <Popover open={openFreebie} onOpenChange={setOpenFreebie}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={openFreebie} className="w-full justify-between">
                        {selectedFreebie ? selectedFreebie.label : "Select Freebie"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandEmpty>No freebie found.</CommandEmpty>
                        {/* SHOW PRODUCT ONLY QUANTITY > 0 */}
                        <CommandGroup>
                        {products
                          .filter(product => product.stock > 0)
                          .map((product) => (
                            <CommandItem
                              key={product.code}
                              value={product.label}
                              onSelect={() => handleFreebieSelect(product)}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedFreebie?.code === product.code ? "opacity-100" : "opacity-0")} />
                              {product.label}
                            </CommandItem>
                        ))}
                      </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm">Quantity</label>
                  <input
                    type="number"
                    value={freebieQuantity}
                    onChange={(e) => setFreebieQuantity(parseInt(e.target.value) || 1)}
                    className="w-full border rounded-md px-5 py-2 text-sm border-gray-300"
                  />
                </div>

                <button
                  type="button"
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md"
                  onClick={handleAddFreebie}
                >
                  Add Freebie
                </button>
              </form>
            </div>
          </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
};

export default OrderDashboard;
