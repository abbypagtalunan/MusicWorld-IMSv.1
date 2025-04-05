"use client";

import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/staff-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import getColumns from "../../../components/ui/columns";
import DataTable from "../../../components/ui/data-table";
import InputNumber from "@/components/ui/order-input-number";
import Dropdown from "@/components/ui/order-dropdown";

const getData = async () => {
  return [
    {
      "Product Code": "188090",
      Supplier: "Lazer",
      Brand: "Cort",
      Product: "AD 880 NS W/ BAG",
      Price: "15,995",
      Quantity: "2",
      Total: "31990",
    },
    {
      "Product Code": "188091",
      Supplier: "Lazer",
      Brand: "Lazer",
      Product: "Mapex Drumset (2 sets)",
      Price: "4,995",
      Quantity: "1",
      Total: "9990",
    },
    {
      "Product Code": "188092",
      Supplier: "Lazer",
      Brand: "Lazer",
      Product: "Mapex Drumset (2 sets)",
      Price: "4,995",
      Quantity: "1",
      Total: "9990",
    },
  ];
};

const OrderDashboard = () => {
  const [data, setData] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payment, setPayment] = useState("");

  useEffect(() => { getData().then(setData); }, []);

  const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.Total), 0);
  const discountedTotal = Math.max(totalAmount - discount, 0);
  const change = Math.max((parseFloat(payment.replace(/,/g, "")) || 0) - discountedTotal, 0);
  const isInvalidDiscount = discount > totalAmount;
  
  const inputClass = `border-${isInvalidDiscount ? "red" : "blue"}-600 text-${isInvalidDiscount ? "red" : "blue"}-600`;

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    // Convert to number and ensure two decimal places
    const [integerPart, decimalPart] = value.replace(/[^0-9.]/g, "").split(".");
    // Format integer part with commas
    const formattedInteger = parseInt(integerPart || "0", 10).toLocaleString("en-PH");
    // Append decimal part if it exists
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart.slice(0, 2)}` : formattedInteger;
  };
  
  const parseNumberInput = (value) => { return value.replace(/[^0-9.]/g, "");};
  const handleDelete = (productCode) => {
    setData((prevData) => prevData.filter(item => item["Product Code"] !== productCode));
  };
  
  const handleAddProduct = () => { //ADD
  };
  
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen overflow-x-hidden">
    <AppSidebar />
  
  <div className="flex flex-col flex-grow p-8">
    <h1 className="text-2xl font-bold pt-2">Summary of Order/s</h1>
    <div className="flex gap-6 mt-4 w-full">
      
      {/* Left Section: Table & Summary */}
      <div className="flex-1 space-y-4">
        <div className="h-[50%] bg-white shadow-md p-4 rounded-xl">
          <DataTable columns={getColumns(handleDelete)} data={data} />
        </div>
        
        {/* Total Amount */}
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
                className={`px-2 py-1 w-full border rounded-md text-[13px] text-center focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isInvalidDiscount ? "border-red-600 text-red-600" : "border-blue-600 text-blue-600"}`}
              />
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-4 py-1 mt-5 bg-blue-600 text-white rounded-md text-[13px]">INPUT PAYMENT</button>
            
            {isModalOpen && (
              <div 
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30" 
                onClick={() => setIsModalOpen(false)}>
              <div 
                className="bg-white p-5 rounded-lg shadow-lg w-[400px] text-center relative" 
                onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg text-blue-600">TOTAL AMOUNT</h2>
                <p className="text-[45px] font-bold text-blue-600">
                  {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(discountedTotal)}
                </p>
                <label 
                  className={`pl-9 mt-2 text-start text-[13px] block ${
                    (parseFloat(payment.replace(/,/g, "")) || 0) < discountedTotal ? "text-red-600" : "text-blue-600"}`}>
                  {(parseFloat(payment.replace(/,/g, "")) || 0) < discountedTotal ? "Invalid Payment Amount" : "PAYMENT GIVEN"}
                </label>
                <input
                  type="text"
                  value={payment}
                  onChange={(e) => {
                    const rawValue = parseNumberInput(e.target.value);
                    setPayment(formatNumberWithCommas(rawValue));
                  }}
                  className={`w-[80%] border rounded-md text-center focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    (parseFloat(payment.replace(/,/g, "")) || 0) < discountedTotal ? "border-red-600 text-red-600" : "border-blue-600 text-blue-600"
                  }`}/>
                
                <button
                  className="mt-4 p-1 text-[13px] w-[80%] bg-blue-600 text-white rounded-md"
                  onClick={() => {
                    setIsModalOpen(false);
                    window.location.reload();
                  }}> ENTER PAYMENT
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

      {/* Right Section: Add Products and Freebies */}
      <div className="w-1/4 space-y-4">
        <div className="bg-white shadow-lg p-6 rounded-xl">
          <h2 className="text-xl text-center font-semibold text-blue-600 pb-4">Add Product to Order/s</h2>
          <form className="text-[15px] space-y-2">
            <Dropdown label="Product" options={["XL Bass String", "AD 880 NS W/ BAG", "Mapex Drumset"]} />
            <Dropdown label="Supplier" options={["Lazer", "Cort"]} />
            <Dropdown label="Brand" options={["Lazer", "Cort"]} />
            <InputNumber label="Price" />
            <InputNumber label="Quantity" />
            <InputNumber label="Discount Amount" />
            <button className="mt-4 px-2 py-1 w-full bg-blue-600 text-white rounded-md text-[13px]">ADD ORDER</button>
          </form>
        </div>

        {/* Freebies */}
        <div className="bg-white shadow-lg p-5 rounded-xl">
          <h2 className="text-xl text-center font-semibold text-blue-600 pb-4">Add Freebie/s</h2>
          <form className="text-[15px] space-y-2">
            <Dropdown label="Product" options={["XL Bass String", "AD 880 NS W/ BAG", "Mapex Drumset"]} />
            <InputNumber label="Quantity" />
            <button className="mt-4 px-2 py-1 w-full bg-blue-600 text-white rounded-md text-[13px]">ADD TO ORDER</button>
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
