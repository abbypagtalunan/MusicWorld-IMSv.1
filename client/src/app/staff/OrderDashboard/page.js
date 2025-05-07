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
  const [selectedDiscountType, setSelectedDiscountType] = useState("");
  const [wholeOrderDiscountInput, setWholeOrderDiscountInput] = useState("");
  const [wholeOrderDiscount, setWholeOrderDiscount] = useState(0);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptNumberError, setReceiptNumberError] = useState("");
  const [totalProductDiscounted, setTotalProductDiscounted] = useState(0);
  const [netItemSale, setNetItemSale] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);

  const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.Total), 0); //Total after discount
  const discountedTotal = Math.max(totalAmount - wholeOrderDiscount, 0); //Total after whole order discount and product discount
  const parsedPayment = parseFloat(payment.toString().replace(/,/g, "")) || 0;
  const change = Math.max(parsedPayment - discountedTotal, 0);
  const isInvalidDiscount = wholeOrderDiscount > totalAmount;
  const totalWithWholeDiscount = totalAmount - wholeOrderDiscount;

  // Add order and order details
  const handlePaymentConfirmation = async (e) => {
    if (payment === 0) {
      toast.error("Enter payment.");
      return;
    }
    if (!receiptNumber) {
      toast.error("Enter receipt number.");
      return;
    }
  
    const transactionDate = new Date(Date.now() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
  
    // Create Order
    const orderPayload = {
      O_receiptNumber: receiptNumber,
      T_totalAmount: discountedTotal,
      D_wholeOrderDiscount: wholeOrderDiscount || 0,
      D_totalProductDiscount: totalProductDiscounted,
      T_transactionDate: transactionDate,
      isTemporarilyDeleted: false,
      O_orderPayment: payment
    };
  
    console.log("PAYMENT ORDERLOAD: ", orderPayload.O_orderPayment);
    console.log("Order Payload:", orderPayload);
  
    try {
      // Create order
      const response = await axios.post("http://localhost:8080/orders", orderPayload);
      
      if (!data || data.length === 0) {
        toast.error("No products or freebies to save. Please add items to the order.");
        return;
      }
  
      // Loop through the data and create order details and update stock
      for (let item of data) {
        const isFreebie = item.Product?.includes('(Freebie)');
        const price = parseFloat(item["Price"]) || 0;
        const discount = parseFloat(item["Discount"]) || 0;
        const quantity = parseInt(item["Quantity"]) || 0;
  
        const detailPayload = {
          O_orderID: response.data.id.orderId,
          P_productCode: item["Product Code"],
          D_discountType: isFreebie ? "Freebie" : selectedDiscountType,
          OD_quantity: quantity,
          OD_sellingPrice: isFreebie ? 0.00 : price,
          OD_unitPrice: isFreebie ? 0.00 : unitPrice,
          OD_discountAmount: isFreebie ? 0.00 : discount,
        };
  
        console.log("Order Detail Payload:", detailPayload);
  
        // Create order detail
        await axios.post("http://localhost:8080/orderDetails", detailPayload)
          .catch(err => {
            console.error("Failed to save order detail:", detailPayload, err.response?.data || err.message);
          });
  
        // Update the stock number for the product 
        try {
          await axios.patch(`http://localhost:8080/products/${item["Product Code"]}/deductStock`, {
            quantityOrdered: quantity,
          });
          console.log(`Stock updated for product ${item["Product Code"]} with Quantity:`, quantity);
        } catch (err) {
          console.error("Failed to update stock:", err.response ? err.response.data : err.message);
          console.log(`Stock did not update for product ${item["Product Code"]} with Quantity:`, quantity);
        }
      }
  
      toast.success("Payment confirmed and order successfully added!");
      setIsModalOpen(false);
  
    } catch (err) {
      console.error("Error processing payment:", err);
      if (
        err.response?.status === 409 ||
        err.response?.data?.message?.includes('Orders.O_receiptNumber')
      ) {
        toast.error(`Receipt Number already exists. Enter a different receipt`);
      } else {
        toast.error(`An error occurred while saving the order.`);
      }
    }
    refreshAll();
  };

  const handleAddOrderItem = () => {
    if (!selectedProduct || orderQuantity <= 0) {
      return; 
    }
  
    const sellingPrice = parseFloat(selectedProduct.price) || 0;
    const unitPrice = parseFloat(selectedProduct.unitPrice) || 0;
    const quantity = parseInt(orderQuantity) || 1;
    const discountAmount = parseFloat(orderDiscount) || 0;
    const netSales = (sellingPrice * quantity) - discountAmount;
  
    const newItem = {
      "Product Code": selectedProduct.code,
      "Supplier": selectedProduct.supplier,
      "Brand": selectedProduct.brand,
      "Product": selectedProduct.name,
      "Price": sellingPrice,
      "Quantity": quantity,
      "Discount Type": selectedProductDiscount?.D_discountType || "",
      "Discount": discountAmount,
      "Discount Value": discountAmount,
      "Total": netSales,
    };
  
    let updatedData = [];
    if (isEditMode) {
      updatedData = data.map((item) =>
        item["Product Code"] === selectedProduct.code
          ? { ...item, ...newItem }
          : item
      );
    } else {
      updatedData = [...data, newItem];
    }
  
    // Calculate total product discount including the new/updated item
    const totalProductDiscount = updatedData.reduce((sum, item) => {
      return sum + (parseFloat(item["Discount Value"]) || 0);
    }, 0);
  
    setData(updatedData);
    setTotalProductDiscounted(totalProductDiscount);
    setNetItemSale(netSales);
    setUnitPrice(unitPrice);
    setSelectedDiscountType(selectedDiscountType);
    console.log("<Discount Type>: ", selectedDiscountType);
  
    console.log('[Total ProductDiscount Amount]: ', totalProductDiscount);
    console.log('Discount Amount: ', discountAmount);
    console.log('Net Sales (Selling price): ', netSales);
    console.log('<Unit Price>: ', unitPrice);
  
    // Reset form
    setSelectedProduct(null);
    setOrderQuantity(1);
    setOrderDiscount(0);
    setSelectedProductDiscount(null);
    setIsEditMode(false);
  };
  
  const handleEdit = (row) => {
    const {
      "Product Code": code,
      Quantity: quantity,
      Discount: discount,
      "Discount Type": discountType, 
    } = row;
  
    const matchedProduct = products.find((p) => p.code === code);
    if (!matchedProduct) return;
  
    setSelectedProduct(matchedProduct);
    setOrderQuantity(quantity);
    setOrderDiscount(parseFloat(discount));
  
    const matchedDiscount = productDiscounts.find(
      (d) => d.D_discountType === discountType
    );
  
    setSelectedProductDiscount(matchedDiscount);
    setIsEditMode(true);
  };

    // Fetch data for product list
    useEffect(() => {
      fetchProductsCombobox();
    }, []);  
  
    const fetchProductsCombobox = async () => {
      try {
        const res = await axios.get("http://localhost:8080/products");
        const mappedProducts = res.data.map((p) => ({
          code: p.P_productCode,
          name: p.P_productName,
          brand: p.brand,
          supplier: p.supplier,
          price: p.P_sellingPrice,
          unitPrice: p.P_unitPrice,
          stock: p.stock,
          label: `${p.P_productName} - B${p.brand} - S${p.supplier}`,
        }));
        setProducts(mappedProducts);
        console.log("Products fetched and mapped.");
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    
  
    const handleProductSelect = (product) => {
      console.log("Selected Product:", product);
      setSelectedProduct(product);  
      setOpenProduct(false); 
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

  const refreshAll = async () => {
    fetchProductsCombobox();
    // Reset all states
    setData([]);
    setIsModalOpen(false);
  
    // Order-related
    setSelectedProduct(null);
    setOpenProduct(false);
    setIsEditMode(false);
    setOrderQuantity(1);
    setOrderDiscount(0);
    setProductDiscounts([]);
    setSelectedProductDiscount(null);
  
    // Freebies
    setOpenFreebie(false);
    setSelectedFreebie(null);
    setFreebieQuantity(0);
  
    // Whole order and payment
    setHasInteractedWithPayModal(false);
    setPayment(0);
    setSelectedDiscountType("");
    setWholeOrderDiscountInput("");
    setWholeOrderDiscount(0);
    setReceiptNumber("");
    setReceiptNumberError("");
    setTotalProductDiscounted(0);
    setNetItemSale(0);
    setUnitPrice(0);
    console.log("Form reset complete.");
  };
  
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen overflow-x-hidden">
        <AppSidebar />

        <div className="flex flex-col flex-grow h-screen overflow-y-auto relative">
          <div className="rounded-lg shadow-sm border-b sticky top-0 z-20 bg-white px-8 py-8">
            <h1 className="text-3xl text-black font-bold">Summary of Order/s</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 w-full p-4">
            
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
                      value={wholeOrderDiscountInput}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const sanitized = rawValue.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
                        setWholeOrderDiscountInput(sanitized);
                        const numeric = parseFloat(sanitized);
                        setWholeOrderDiscount(!isNaN(numeric) ? numeric : 0);
                      }}
                      inputMode="decimal"
                      className={`px-2 py-1 w-full border rounded-md text-[13px] text-center focus:outline-none ${
                        isInvalidDiscount ? "border-red-600 text-red-600" : "border-blue-600 text-black"
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (data.length === 0) {
                        toast.error("Please add at least one product or freebie before proceeding to payment.");
                        return;
                      }
                      setIsModalOpen(true);
                    }}
                    className={`px-4 py-1 mt-5 rounded-md text-[13px] transition-colors ${
                      data.length === 0
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
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
                            console.log("Payment: ", payment)
                            console.log("!!!!!discountedTotal: ", discountedTotal)
                          }}
                          onBlur={() => {
                            if (!payment || parseFloat(payment.toString().replace(/,/g, "")) < discountedTotal) {
                              setHasInteractedWithPayModal(true);
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!payment || parseFloat(payment.toString().replace(/,/g, "")) < discountedTotal) {
                              setHasInteractedWithPayModal(true);
                            }
                            const rawValue = e.target.value.replace(/[^0-9.]/g, ""); 
                            const updatedPayment = rawValue === "" ? 0 : parseFloat(rawValue);
                            setPayment(updatedPayment);
                            console.log("Payment: ", payment)
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
                            console.log("Total Amount with Whole Order Discount: ", totalWithWholeDiscount);
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
                              payment < totalWithWholeDiscount|| receiptNumber === "" || payment === 0 
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          onClick={handlePaymentConfirmation}
                          disabled={ payment === 0 || payment < totalWithWholeDiscount || receiptNumber === ""}
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
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProduct}
                        className="w-full justify-between">
                        {selectedProduct ? selectedProduct.label : "Select product..."}
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
                              value={product.label} 
                              onSelect={() => {
                                handleProductSelect(product); 
                                setOpenProduct(false);
                              }}>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProduct?.code === product.code ? "opacity-100" : "opacity-0"
                                )}/>
                              {product.label}
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
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-sm ${
                      isEditMode ? "pointer-events-none opacity-50 text-gray" : ""
                    }`}
                  >
                    {selectedProductDiscount?.D_discountType || " "}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuSeparator />
                  {productDiscounts.map((itemDiscount) => (
                    <DropdownMenuItem
                      key={itemDiscount.D_productDiscountID}
                      disabled={isEditMode}
                      onClick={() => {
                        const discountType = itemDiscount.D_discountType;
                        setSelectedDiscountType(discountType);
                        console.log("Discount Type: ", discountType);
                        const currentPrice = parseFloat(selectedProduct?.price || "0");
                        const currentQuantity = parseInt(orderQuantity || "1");

                        setSelectedProductDiscount(itemDiscount);
                        if (discountType.includes("%")) {
                          const percent = parseFloat(discountType);
                          const computed = currentPrice * currentQuantity * (percent / 100);
                          setOrderDiscount(computed.toFixed(2));
                        } else if (discountType.toLowerCase().includes("specific")) {
                          setOrderDiscount("");
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

            {/* FREEBIES */}
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
