import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Trash2, Download } from "lucide-react";
import { useState, useEffect } from "react";

const RDaction = ({ item, handleRetrieve, handleDelete, idField, codeField }) => {
    const [adminPW, setAdminPW] = useState("");
    const [isDDOpen, setDDOpen] = useState(false);
    const [isRDOpen, setRDOpen] = useState(false);
    const [hideDownloadPrompt, setHideDownloadPrompt] = useState(false);
    
    // Load preference from localStorage on component mount
    useEffect(() => {
        const savedPreference = localStorage.getItem('hideDownloadPrompt');
        if (savedPreference) {
            setHideDownloadPrompt(JSON.parse(savedPreference));
        }
    }, []);

    // Save preference to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('hideDownloadPrompt', JSON.stringify(hideDownloadPrompt));
    }, [hideDownloadPrompt]);

    const [activeTab, setActiveTab] = useState("order");
    const [deletedOrders, setDeletedOrders] = useState([]);
    const [deletedReturns, setDeletedReturns] = useState([]);
    const [deletedDeliveries, setDeletedDeliveries] = useState([]);
    const [deletedProducts, setDeletedProducts] = useState([]);

    const configMap = {
        order: {
            label: "Orders",
            idField: "O_orderID",
            idDetail: "OD_detailID",
            codeField: "P_productCode",
            receiptField: "O_receiptNumber",
            nameField: "P_productName",
            totalamtField: "T_totalAmount",
            paymentField: "O_orderPayment",
            dateField: "T_transactionDate",
            supplierField: "supplier",
            brandField: "brand",
            categoryField: "category",
            quantityField: "OD_quantity",
            sellingpriceField: "OD_unitPrice",
            itemtotalField: "OD_netSale",
            discAmtField: "OD_discountAmount",
            setter: setDeletedOrders,
            api: {
                fetch: "http://localhost:8080/deletedOrders", 
                retrieve: "http://localhost:8080/deletedOrders", 
                delete: "http://localhost:8080/deletedOrders",
                download: "http://localhost:8080/deletedOrders/download"
            },
        },

        return: {
            label: "Returns",
            idField: "R_returnID",
            codeField: "P_productCode",
            typeField: "R_reasonOfReturn",
            nameField: "P_productName",
            totalamtField: "R_TotalPrice",
            dateField: "R_dateOfReturn",
            supplierField: "supplier",
            brandField: "brand",
            categoryField: "category",
            quantityField: "R_returnQuantity",
            discountField: "R_discountAmount",
            setter: setDeletedReturns,
            api: {
                fetch: "http://localhost:8080/deletedReturns",
                retrieve: "http://localhost:8080/deletedReturns",
                delete: "http://localhost:8080/deletedReturns",
                download: "http://localhost:8080/deletedReturns/download"
            },
        },

        delivery: {
            label: "Deliveries",
            idField: "D_deliveryNumber",
            codeField: "P_productCode",
            nameField: "P_productName",
            dateField: "D_deliveryDate",
            supplierField: "supplier",
            brandField: "brand",
            categoryField: "category",
            quantityField: "DPD_quantity",
            setter: setDeletedDeliveries,
            api: {
                fetch: "http://localhost:8080/deletedDeliveries", 
                retrieve: "http://localhost:8080/deletedDeliveries", 
                delete: "http://localhost:8080/deletedDeliveries",
                download: "http://localhost:8080/deletedDeliveries/download"
            },
        },

        product: {
            label: "Products",
            idField: "P_productCode",
            codeField: "P_productCode",
            categoryField: "category",
            nameField: "P_productName",
            brandField: "brand",
            supplierField: "supplier",
            stockField: "stockAmt",
            stockID: "P_StockDetailsID",
            unitpriceField: "P_unitPrice",
            sellingpriceField: "P_sellingPrice",
            statusField: "P_productStatusName",
            statusId: "P_productStatusID",
            dateField: "P_dateAdded",
            setter: setDeletedProducts,
            api: {
                fetch: "http://localhost:8080/deletedProducts", 
                retrieve: "http://localhost:8080/deletedProducts", 
                delete: "http://localhost:8080/deletedProducts",
                download: "http://localhost:8080/deletedProducts/download"
            },
        },
    };

    // Determine which tab the current item belongs to based on its properties
    const determineItemTab = () => {
        if (item.O_orderID || item.O_receiptNumber) return "order";
        if (item.R_returnID || item.R_reasonOfReturn) return "return";
        if (item.D_deliveryNumber) return "delivery";
        if (item.P_productCode && (item.P_productStatusID || item.P_dateAdded)) return "product";
        
        // Default fallback - check which ID field exists in the item
        for (const [tabKey, tabConfig] of Object.entries(configMap)) {
            if (item[tabConfig.idField]) return tabKey;
        }
        
        return activeTab; // Fallback to current activeTab if can't determine
    };

    const config = configMap[activeTab] || {};  
    
    // Get the correct tab configuration for the specific item being processed
    const getItemConfig = () => {
        const tabKey = determineItemTab();
        return configMap[tabKey] || config;
    };

    // Download
    const [isDownloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
    const handleDownloadCSV = (data) => {
      const currentTabD = getFilteredTransactions();

      let headers = [];
      let rows = [];
      
      switch(activeTab) {
        case "order":
          headers = [
            "Receipt Number",
            "Order ID",
            "Transaction Date",
            "Product Name",
            "Product Code",
            "Quantity",
            "Total Amount",
            "Order Detail ID",
            "Supplier",
            "Brand",
            "Category",
            "Selling Price",
            "Discount Amount"
          ];
          rows = currentTabD.map(item => [
            item[config.receiptField],
            item[config.idField],
            new Date(item[config.dateField]).toLocaleDateString(),
            item[config.nameField],
            item[config.codeField],
            item[config.quantityField],
            item[config.idDetail],
            item[config.supplierField],
            item[config.brandField],
            item[config.categoryField],
            item[config.sellingpriceField],
            item[config.discAmtField]
          ]);
          break;

        case "return":
          headers = [
            "Return ID",
            "Product Code",
            "Reason of Return",
            "Product Name",
            "Return Total Amount",
            "Return Date",
            "Supplier",
            "Brand",
            "Category",
            "Quantity",
            "Discount Amount"
          ];
          rows = currentTabD.map(item => [
            item[config.idField],
            item[config.codeField],
            item[config.typeField],
            item[config.nameField],
            item[config.totalamtField],
            new Date(item[config.dateField]).toLocaleDateString(),
            item[config.supplierField],
            item[config.brandField],
            item[config.categoryField],
            item[config.quantityField],
            item[config.discountField]
          ]);
          break;

        case "delivery":
          headers = [
            "Delivery ID",
            "Product Code",
            "Product Name",
            "Supplier",
            "Quantity",
            "Delivery Date",
            "Brand",
            "Category"
          ];
          rows = currentTabD.map(item => [
            item[config.idField],
            item[config.codeField],
            item[config.nameField],
            item[config.supplierField],
            item[config.quantityField],
            new Date(item[config.dateField]).toLocaleDateString(),
            item[config.brandField],
            item[config.categoryField]
          ]);
          break;

        case "product":
            headers = [
              "Product Code",
              "Product Name",
              "Category",
              "Supplier",
              "Brand",
              "Stock Number",
              "Last Restock",
              "Unit Price",
              "Selling Price",
              "Status",
              "Date Product Added"
            ];
            rows = currentTabD.map(item => [
              item.productCode,
              item.productName,
              item.category,
              item.supplier,
              item.brand,
              item.stockNumber,
              item.lastRestock,
              item.price,
              item.sellingPrice,
              item.status,
              new Date(item[config.dateField]).toLocaleDateString()
            ]);
            break;
      }

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(val => `"${val}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const itemConfig = getItemConfig();
      link.setAttribute("download", `${itemConfig.label}-Deleted.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    
    return (
        <div className="flex items-center">
            {/*Retrieve*/ }
            <Dialog open={isRDOpen} onOpenChange={(open) => { setRDOpen(open) }}>
                <DialogTrigger asChild>
                <span className="cursor-pointer text-gray-500 hover:text-blue-600">
                    <RotateCcw size={16} />
                </span>
                </DialogTrigger>
                <DialogContent className="w-[30vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to retrieve this transaction?</DialogTitle>
                    <DialogDescription>This action will restore the transaction and update the sales report.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-4 mt-4">
                    <Button
                        className="bg-blue-400 text-white hover:bg-blue-700"
                        onClick={() => {handleRetrieve(`${item[idField]}-${item[codeField]}`); setRDOpen(false); setAdminPW("");}}
                    >
                    Confirm
                    </Button>
                    <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                    </DialogClose>
                </div>  
                </DialogContent>
            </Dialog>

            {/*Delete*/ }
            <Dialog open={isDDOpen} onOpenChange={(open) => { setDDOpen(open); if (!open) setAdminPW("");}}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                        <Trash2 size={16} />
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                    <DialogHeader>
                        <DialogTitle>
                        <span className="text-lg text-red-900">Delete Transaction</span>{" "}
                        <span className="text-lg text-gray-400 font-normal italic">{item[idField]}</span>  
                        </DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <p className='text-sm text-gray-800 mt-2 pl-4'>
                        Warning: This action will permanently remove the transaction from your records. Enter the admin password to continue.
                    </p>
                    
                    {/* Download prompt inside */}
                    {!hideDownloadPrompt && (
                        <div className="flex flex-col gap-4 mt-4 text-gray-700 p-4 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex x-space-2 justify-between items-center">
                                <p className='text-sm text-gray-800'>
                                    Do you want to download {getItemConfig().label}-Deleted.csv file first?
                                </p>
                                <Button 
                                      onClick={() => {
                                      handleDownloadCSV();
                                      toast.success("Downloaded successfully!");
                                      setDownloadConfirmOpen(false);
                                    }}
                                    variant="outline" 
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                    <Download size={16} />
                                    {getItemConfig().label}-Deleted.csv
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="relative inline-block">
                                    <input
                                        type="checkbox"
                                        id="doNotShowAgain"
                                        checked={hideDownloadPrompt}
                                        onChange={(e) => setHideDownloadPrompt(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor="doNotShowAgain"
                                        className={`relative block w-10 h-5 rounded-full cursor-pointer ${
                                            hideDownloadPrompt ? 'bg-blue-500' : 'bg-gray-300'
                                        } transition-colors duration-200`}
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                                                hideDownloadPrompt ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        ></span>
                                    </label>
                                </div>
                                <label
                                    htmlFor="doNotShowAgain"
                                    className="text-sm font-medium text-gray-700 cursor-pointer"
                                >
                                    Do not show this prompt again
                                </label>
                            </div>
                        </div>
                    )}
                    
                    {/* for inputting Admin password before deleting */}
                    <div className="flex gap-4 mt-4 text-gray-700 items-center pl-4">
                        <div className="flex-1">
                        <label htmlFor={`password-${item[idField]}`} className="text-base font-medium text-gray-700 block mb-2">
                            Admin Password
                        </label>
                        <Input
                            type="password" 
                            value={adminPW} 
                            required 
                            placeholder="Enter valid password" 
                            className="w-full"
                            onChange={(e) => setAdminPW(e.target.value)}
                        />
                        </div>
                        <Button
                        className="bg-red-900 hover:bg-red-950 text-white uppercase text-sm font-medium whitespace-nowrap mt-7"
                        onClick={() => {handleDelete(`${item[idField]}-${item[codeField]}`, adminPW); setDDOpen(false);}}
                        >
                        DELETE TRANSACTION
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RDaction;