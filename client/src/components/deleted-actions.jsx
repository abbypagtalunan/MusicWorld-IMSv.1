// Retrieve/Delete Functions

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

const RDaction = ({ item, handleRetrieve, handleDelete, idField, codeField }) => {
    const[adminPW, setAdminPW] = useState("");
    const[isDDOpen, setDDOpen] = useState(false);
    const[isRDOpen, setRDOpen] = useState(false);

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
                        onClick={() => {handleRetrieve(`${item[idField]}-${item[codeField]}`); setRDOpen(false);}}
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