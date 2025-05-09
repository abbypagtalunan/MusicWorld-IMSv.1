"use client";

import React from "react";
import { Trash2, FilePen } from "lucide-react";

const getColumns = (handleDelete, handleEdit) => [
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
    accessorKey: "Quantity",
    header: "Quantity",
  },
  {
    accessorKey: "Price",
    header: "Price",
    cell: ({ row }) => {
      const value = row.getValue("Price");
      const amount = parseFloat(value) || 0;
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "Discount Type",
    header: "Discount Type",
    cell: ({ row }) => {
      const value = row.getValue("Discount Type");
      return <div className="font-medium">{value || "—"}</div>;
    },
  },
  {
    accessorKey: "Discount",
    header: "Discount",
    cell: ({ row }) => {
      const value = row.getValue("Discount");
      const amount = parseFloat(value) || 0;
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "Total",
    header: () => <div className="text-center">Total</div>,
    cell: ({ row }) => {
      const value = row.getValue("Total");
      const amount = parseFloat(value) || 0;
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);
      return <div className="font-medium text-center">{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const isFreebie = row.original.Product.toLowerCase().includes("(freebie)");
      return (
        <div className="flex items-center gap-3">
          {isFreebie ? (
            <span className=" inline-block" /> 
          ) : (
            <FilePen size={16}
              className="text-gray-500 cursor-pointer"
              onClick={() => handleEdit(row.original)}
            />
          )}
          <button
            className="text-gray-500 hover:text-red-700"
            onClick={() => handleDelete(row.original["Product Code"])}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    },
  },
];

export default getColumns;
