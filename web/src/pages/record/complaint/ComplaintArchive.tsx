import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Link, useNavigate } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";

type Complaint = {
  id: string;
  complainant: string;
  category: string;
  description: string;
  dateCreated: string;
  dateArchived: string;
  status: string;
  priority: string;
  accusedPersons: string[];
  location: string;
};

const ArchiveComplaints = () => {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <div className="flex gap-3 mb-2">
          {/* Column 1 - Button */}
          <div className="flex items-center">
            <Link to="/complaint">
              <Button className="text-black p-2" variant="outline">
                <BsChevronLeft />
              </Button>
            </Link>
          </div>

          {/* Column 2 - Text Content */}
          <div className="flex-1">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-darkBlue2">
                Archived Complaints
              </h1>
            </div>
            <p className="text-darkGray text-sm">
              Manage and review archived complaint records
            </p>
          </div>
        </div>
        <hr />
      </div>

      <body>
        <div className="">
        </div>
      </body>

      <footer></footer>
    </div>
  );
};

export default ArchiveComplaints;
