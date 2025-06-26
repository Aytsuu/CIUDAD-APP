import { BsChevronLeft } from "react-icons/bs";
import { Button } from "../button/button";
import { useNavigate } from "react-router";
import React from "react";
import { useLoading } from "@/context/LoadingContext";

export const LayoutWithBack = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { hideLoading } = useLoading();
  return (
    <div className="w-full">
      <div className="flex gap-2 justify-between pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Header - Stacks vertically on mobile */}
          <Button
            className="text-black p-2 self-start"
            variant={"outline"}
            onClick={() => {
              hideLoading();
              navigate(-1)
            }}
          >
            <BsChevronLeft />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">{description}</p>
          </div>
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />
      {children}
    </div>
  );
};
