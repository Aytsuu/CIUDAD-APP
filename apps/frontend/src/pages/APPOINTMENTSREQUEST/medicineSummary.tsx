import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Check, X, Search, Pill } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import FeedbackForm from "./reqrejectModal";
import { Label } from "@radix-ui/react-label";
import { SelectLayout } from "@/components/ui/select/select-layout";

export default function MedicineSummary() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccessfulModal, setIsSuccessfulModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handeleClose = () => {
    setIsDialogOpen(false);
  };
  const handeSave = () => {
    setIsDialogOpen(false);
    setIsSuccessfulModal(true);

    setTimeout(() => {
      setIsSuccessfulModal(false);
    }, 800);
  };
  return (
    <>
      <div>
        <DialogLayout
          trigger={
            <div className="bg-white hover:bg-[#f3f2f2]  text-green-600 border border-green-700 px-4 py-2 rounded cursor-pointer">
              Approve
            </div>
          }
          title="Requested Medicine"
          description="summary of Requested Medicine"
          mainContent={
            <>
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
                <div className="h-[200px]  max-h-[calc(100vh-7rem)] overflow-y-auto px-1">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-2 p-2 rounded-md border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <Pill className="h-5 w-5 text-blue flex-shrink-0" />
                        <Label className="font-medium">
                          Medicine: <span className="ml-1">Keneme</span>
                        </Label>
                      </div>
                      <div className="flex gap-3 ml-8">
                        <Label className="text-sm text-gray-600">
                          Qty: <span className="font-medium">12</span>
                        </Label>
                        <Label className="text-sm text-red-600">
                          Expiry Date:{" "}
                          <span className="font-medium">12-12-23</span>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                  <Button
                    variant={"outline"}
                    onClick={handeleClose}
                    className="mt-6 w-[120px]"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handeSave} className="mt-6 w-[120px]">
                    Confirm
                  </Button>



                </div>
              </div>
            </>
          }
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />


        {showSuccessfulModal && (
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 transition-all duration-300 ease-out transform translate-y-0 opacity-100">
            <div className="bg-snow border border-blue p-4 sm:p-6 rounded-lg text-center mx-4 sm:mx-auto w-full sm:w-auto sm:min-w-[320px] max-w-md">
              <h3 className="text-lg font-semibold">Feedback Saved</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Your feedback has been successfully saved.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
