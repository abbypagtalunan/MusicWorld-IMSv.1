"use client";

import React from "react";
import { Trash2 } from "lucide-react";

const getColumns = (handleDelete) => [
    {
      accessorKey: "Product Code",
      header: "Product Code",
    },
    {
      accessorKey: "Product",
      header: "Product",
    },
    {
      accessorKey: "Brand",
      header: "Brand",
    },
    {
      accessorKey: "Supplier",
      header: "Supplier",
    },
    {
      accessorKey: "Price",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("Price"));
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "Discount",
      header: "Discount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("Discount"));
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },    
    {
      accessorKey: "Quantity",
      header: "Quantity",
    },
    {
      accessorKey: "Total",
      header: () => <div className="text-center">Total</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("Total"));
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "Delete",
      header: "",
      cell: ({ row }) => (
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => handleDelete(row.original["Product Code"])}
        >
          <Trash2 size={15} />
        </button>
      ),
    },
];

export default getColumns;
