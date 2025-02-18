interface FamilyPlanningViewProps {
  data: {
    clientId: string;
    philhealthNo: string;
    nhts: {
      status: boolean;
      pantawidStatus: boolean;
    };
    personalInfo: {
      lastName: "Kurt";
      givenName: "Ken";
      middleInitial: "O";
      dateOfBirth: string;
      age: number;
      educationalAttainment: string;
      occupation: string;
      address:{
        house_no: string;
        street: string;
        barangay: string;
        municipality: string;
        province: string;
        contactnum: string;
        civil_stat: string;
        religion: string;
      }
    };
   
  };
}

const FamilyPlanningView: React.FC<FamilyPlanningViewProps> = ({ data }) => {
  return (
    <div className="max-w-5xl mx-auto p-4 border border-gray-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">SIDE A</div>
        <div className="text-center font-bold">FAMILY PLANNING (FP) FORM 1</div>
        <div className="text-sm">ver 3.0</div>
      </div>

      {/* Instructions Box */}
      <div className="border border-black p-3 bg-ashGray">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <p className="text-sm">
              <strong>FAMILY PLANNING CLIENT ASSESSMENT RECORD</strong>
              <br></br><br></br>
              Instructions for Physicians, Nurses, and Midwives: <strong>Make sure that the client is not pregnant by using the question listed in SIDE B. </strong> 
              Completely fill out or check the required information. Refer accordingly for any abnormal history/findings for further medical evaluation
            </p>
          </div>
          <div  className="border-black">
            <div className="mb-2">
              <span className="block text-sm font-medium">CLIENT ID: <span className="border-b-2 border-black inline-block min-w-[150px]">{data.clientId}</span></span>
              <span className="block p-1 bg-gray-50"></span>
            </div>
            <div className="mb-2">
              <span className="block text-sm font-medium">PHILHEALTH NO: <span className="border-b-2 border-black inline-block min-w-[130px]">{data.philhealthNo}</span></span>

            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">NHTS:</span>
              <span className="text-sm">{data.nhts.status ? 'Yes' : 'No'}</span>
              <span className="text-sm font-medium ml-4">Pantawid Pamilya Pilipino (4Ps):</span>
              <span className="text-sm">{data.nhts.pantawidStatus ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Client Information */}
<div className="mb-4 mt-6">
  <div className="mb-4">
    <span className="block text-sm font-medium mb-1">
      NAME OF CLIENT: 
      <span className="border-b-2 border-black inline-block min-w-[300px] text-center">
        {data.personalInfo.lastName} {data.personalInfo.givenName} {data.personalInfo.middleInitial}
      </span>
    </span>
</div> 
    {/* Additional Information */}
    <div className="flex flex-wrap mt-2 gap-4">
      <div className="text-sm font-medium">
        Date of Birth: 
        <span className="border-b-2 border-black inline-block w-[120px] text-center ml-2">
          {data.personalInfo.dateOfBirth}
        </span>
      </div>
      <div className="text-sm font-medium">
        Age: 
        <span className="border-b-2 border-black inline-block w-[50px] text-center ml-2">
          {data.personalInfo.age}
        </span>
      </div>
      <div className="text-sm font-medium">
        Educ. Attain.: 
        <span className="border-b-2 border-black inline-block w-[120px] text-center ml-2">
          {data.personalInfo.educationalAttainment}
        </span>
      </div>
      <div className="text-sm font-medium">
        Occupation: 
        <span className="border-b-2 border-black inline-block w-[150px] text-center ml-2">
          {data.personalInfo.occupation}
        </span>
      </div>
    </div>
</div>

         
          <div className="grid grid-cols-4 gap-4">
            <div className="p-1 bg-gray-50">{data.personalInfo.lastName}</div>
            <div className="p-1 bg-gray-50">{data.personalInfo.givenName}</div>
            <div className="p-1 bg-gray-50">{data.personalInfo.middleInitial}</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-1 bg-gray-50">{data.personalInfo.dateOfBirth}</div>
              <div className="p-1 bg-gray">{data.personalInfo.age}</div>
              <div className="p-1 bg-gray-50">{data.personalInfo.educationalAttainment}</div>
            </div>
          </div>
        
        
        <div className="mb-4">
          <span className="block text-sm font-medium mb-1">ADDRESS:</span>
          <div className="grid grid-cols-5 gap-4">
            <div className="p-1 bg-gray-50">123</div>
            <div className="p-1 bg-gray-50">Sampaguita St.</div>
            <div className="p-1 bg-gray-50">San Antonio</div>
            <div className="p-1 bg-gray-50">Quezon City</div>
            <div className="p-1 bg-gray-50">Metro Manila</div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="p-1 bg-gray-50">09123456789</div>
            <div className="p-1 bg-gray-50">Married</div>
            <div className="p-1 bg-gray-50">Catholic</div>
          </div>
        </div>

        <div className="mb-4">
          <span className="block text-sm font-medium mb-1">NAME OF SPOUSE:</span>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-1 bg-gray-50">Dela Cruz</div>
            <div className="p-1 bg-gray-50">Juan</div>
            <div className="p-1 bg-gray-50">R.</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-1 bg-gray-50">1988-08-20</div>
              <div className="p-1 bg-gray-50">35</div>
              <div className="p-1 bg-gray-50">Engineer</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <span className="block text-sm font-medium mb-1">NO. OF LIVING CHILDREN:</span>
            <div className="p-1 bg-gray-50">2</div>
          </div>
          <div>
            <span className="block text-sm font-medium mb-1">PLAN TO HAVE MORE CHILDREN?</span>
            <div className="p-1 bg-gray-50">No</div>
          </div>
          <div>
            <span className="block text-sm font-medium mb-1">AVERAGE MONTHLY INCOME:</span>
            <div className="p-1 bg-gray-50">₱45,000</div>
          </div>
        </div>
     

      {/* Type of Client Section */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-300 pt-4">
        <div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">☐</span>
              <span className="text-sm">New Acceptor</span>
            </div>
            <div className="ml-6">
              <span className="block text-sm mb-1">Reason for FP:</span>
              <div className="flex gap-4">
                <span className="text-sm">☒ spacing</span>
                <span className="text-sm">☐ limiting</span>
                <span className="text-sm">☐ others</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">☒</span>
              <span className="text-sm">Current User</span>
            </div>
            <div className="ml-6">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">Changing Method</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">Changing Clinic</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">Dropout/Restart</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2">Method currently used (for Changing Method):</span>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">COC</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">POP</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">Injectable</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">Implant</span>
              </div>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☒</span>
                <span className="text-sm">IUD</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">Interval</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">Post Partum</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">Condom</span>
              </div>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">BOM/CMM</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">BBT</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">STM</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">☐</span>
                <span className="text-sm">SDM</span>
              </div>
      </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default FamilyPlanningView;