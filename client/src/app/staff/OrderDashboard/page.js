"use client";

import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/staff-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import getColumns from "../../../components/ui/columns";
import DataTable from "../../../components/ui/data-table";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

const OrderDashboard = () => {
  const [data, setData] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payment, setPayment] = useState("");

  const [products, setProducts] = useState([]);
  const [openProduct, setOpenProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [openFreebie, setOpenFreebie] = useState(false);
  const [selectedFreebie, setSelectedFreebie] = useState(null);
  const [freebieQuantity, setFreebieQuantity] = useState(0);

  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderDiscount, setOrderDiscount] = useState(0);

  const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.Total), 0);
  const discountedTotal = Math.max(totalAmount - discount, 0);
  const change = Math.max((parseFloat(payment.replace(/,/g, "")) || 0) - discountedTotal, 0);
  const isInvalidDiscount = discount > totalAmount;
  
  // Fetch data
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
    if (!selectedProduct || orderQuantity <= 0) return;
    const price = selectedProduct.price;
    const discountAmount = orderDiscount || 0;
    const total = ( price * orderQuantity) - discountAmount;
  
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
  
    // Update the data state with the new item for reflection in the DataTable
    setData((prevData) => [...prevData, newItem]);
  
    // Reset the form fields after adding the order
    setSelectedProduct(null);
    setOrderQuantity(1);
    setOrderDiscount(0);
  };

  // VIEW ROW NOT YET FIXED
  const handleRowClick = (row) => {
    const { "Product Code": productCode, "Product": productName, "Price": price, "Quantity": quantity, "Discount": discount, "Total": total } = row;
    const selectedProduct = products.find(product => product.code === productCode);
  
    setSelectedProduct(selectedProduct);  // Set the selected product based on the clicked row
    setOrderQuantity(quantity);           // Set the order quantity
    setOrderDiscount(parseFloat(discount)); // Set the discount if any
  };

  const handleAddFreebie = () => {
    if (!selectedFreebie || freebieQuantity <= 0) return;
    const newFreebie = {
      "Product Code": selectedFreebie.code,
      "Supplier": selectedFreebie.supplier,
      "Brand": selectedFreebie.brand,
      "Product": `${selectedFreebie.name} (Freebie)`,
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
  
  // DELETES THE WHOLE ORDER LIST NOT FIXED
  const handleDelete = (productCode) => {
    setData((prevData) => prevData.filter(item => item["Product Code"] !== productCode));
  };

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const [integerPart, decimalPart] = value.replace(/[^0-9.]/g, "").split(".");
    const formattedInteger = parseInt(integerPart || "0", 10).toLocaleString("en-PH");
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart.slice(0, 2)}` : formattedInteger;
  };
  const parseNumberInput = (value) => value.replace(/[^0-9.]/g, "");

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen overflow-x-hidden">
        <AppSidebar />

        <div className="flex flex-col flex-grow p-8">
          <h1 className="text-2xl font-bold pt-2">Summary of Order/s</h1>
          <div className="flex gap-6 mt-4 w-full">
            
            {/* Left Section */}
            {/* TABLE */}
            <div className="flex-1 space-y-4">
              <div className="h-[50%] bg-white shadow-md p-4 rounded-xl">
              <DataTable 
                columns={getColumns(handleDelete)} 
                data={data} 
                onRowClick={(row) => handleRowClick(row)}
              />
              </div>

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
                      value={discount === 0 ? "" : formatNumberWithCommas(discount.toString())}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, "");
                        setDiscount(rawValue === "" ? "" : parseFloat(rawValue) || "");
                      }}
                      className={`px-2 py-1 w-full border rounded-md text-[13px] text-center focus:outline-none ${isInvalidDiscount ? "border-red-600 text-red-600" : "border-blue-600 text-blue-600"}`}
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
                        <label className={`pl-9 mt-2 text-start text-[13px] block ${(parseFloat(payment.replace(/,/g, "")) || 0) < discountedTotal ? "text-red-600" : "text-blue-600"}`}>
                          {(parseFloat(payment.replace(/,/g, "")) || 0) < discountedTotal ? "Invalid Payment Amount" : "PAYMENT GIVEN"}
                        </label>
                        <input
                          type="text"
                          value={payment}
                          onChange={(e) => {
                            const rawValue = parseNumberInput(e.target.value);
                            setPayment(formatNumberWithCommas(rawValue));
                          }}
                          className={`w-[80%] border rounded-md text-center focus:outline-none ${parseFloat(payment.replace(/,/g, "")) < discountedTotal ? "border-red-600 text-red-600" : "border-blue-600 text-blue-600"}`}
                        />

                        {/* ADD RECEIPT NUMBER NOT FUNCTIONAL YET */}
                        <label className="pl-9 mt-2 text-start text-[13px] block text-blue-600">ENTER RECEIPT NUMBER</label>
                        <input
                          type="number"
                          className="w-[80%] border rounded-md text-center focus:outline-none border-blue-600" 
                        />
                        <button
                          className="mt-4 p-1 text-[13px] w-[80%] bg-blue-600 text-white rounded-md"
                          onClick={() => {
                            setIsModalOpen(false);
                            window.location.reload();
                          }}
                        >
                          ENTER PAYMENT
                        </button>
                        <p className="pl-9 mb-5 mt-2 text-start text-[12px] font-bold text-blue-600">
                          CHANGE: {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(change)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="w-1/4 space-y-4">
              <div className="bg-white shadow-lg p-6 rounded-xl">

                {/* ADD PRODUCT/ITEM */}
                <h2 className="text-xl text-center font-semibold text-blue-600 pb-4">Add Product to Order/s</h2>
                <form className="text-[15px] space-y-2">
                  <div className="text-left">
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
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                      <input
                        type="text"
                        value={selectedProduct 
                          ? new Intl.NumberFormat("en-PH", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(selectedProduct.price)) : ""
                        } disabled
                        className="w-full pl-6 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm">Quantity</label>
                    <input
                      type="number"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(e.target.value)}
                      className={`w-full border rounded-md px-3 py-2 text-sm ${isNaN(orderQuantity) ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Discount Amount</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                      <input
                        type="number"
                        value={orderDiscount === 0 ? "" : orderDiscount}
                        onFocus={(e) => {
                          if (orderDiscount === 0) e.target.select();
                        }}
                        // If disc amt left empty, make the value 0
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setOrderDiscount(isNaN(value) ? 0 : value);
                        }}
                        className="w-full pl-6 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-4 px-2 py-1 w-full bg-blue-600 text-white rounded-md text-[14px]"
                    onClick={handleAddOrderItem}
                  >
                    ADD ORDER
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
                          {selectedFreebie ? selectedFreebie.label : "Select product..."}
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
                      className="w-full border rounded-md px-3 py-2 text-sm border-gray-300"
                    />
                  </div>

                  <button
                    type="button"
                    className="mt-4 px-2 py-1 w-full bg-blue-600 text-white rounded-md text-[14px]"
                    onClick={handleAddFreebie}
                  >
                    ADD TO ORDER
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OrderDashboard;
