"use client";

import React from "react";
import { Trash2 } from "lucide-react";

const getColumns = (handleDelete) => [
    {
      accessorKey: "Product Code",
      header: "Product Code",
    },
    {
      accessorKey: "Supplier",
      header: "Supplier",
    },
    {
      accessorKey: "Brand",
      header: "Brand",
    },
    {
      accessorKey: "Product",
      header: "Product",
    },
    {
      accessorKey: "Price",
      header: "Price",
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
