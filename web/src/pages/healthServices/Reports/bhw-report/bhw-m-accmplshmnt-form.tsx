"use client"

import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"


export const InputLine = ({className, value}: {className: string, value?: string}) => (
  <Input 
    className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none", className)} 
    value={value || ""} 
    readOnly
  />
)

export default function BHWReportsForm() {
	return (
		<>
			<LayoutWithBack
				title="BHW Monthly Accomplishment Report"
				description="Manage and view BHW Monthly Accomplishment Report"
			>
				<div className="w-full h-full">
					<div className="bg-white p-10">
						<div className="bg-white py-10 px-[5rem] rounded-sm shadow-md border">
							{/* header section */}
							<div className="grid grid-cols-3 gap-2 mt-[5rem] ">
								{/* city health logo left side */}
								<div className="flex justify-center items-center">
									<span>
										City Health Logo
									</span>
								</div>

								{/* form from where and address */}
								<div className="flex flex-col justify-center items-center">
									<span className="flex flex-col items-center">
										<p className="text-[18px] font-bold">Republic of the Philippines</p>
										<p className="text-[18px] font-bold">City of Cebu</p>
										<h3 className="text-[24px] font-bold">CITY HEALTH DEPARTMENT</h3>
										<p className="text-[17px]">Gen. Maxilom Avenue, Cebu City, Philippines</p>
										<p className="text-[17px]">Email add: chocommmunication1022@gmail.com</p>
									</span>
								</div>

								{/* cebu city logo right side */}
								<div className="flex justify-center items-center">
									<span>
										Cebu City Logo
									</span>
								</div>
							</div>

							{/* sub-header section */}
							<div className="w-full mt-[3rem] flex justify-center">
								<h2 className="text-[36px] font-bold">BHW MONTHLY ACCOMPLISMENT REPORT</h2>
							</div>

							{/* bhw information section */}
							<div className="w-full grid grid-rows-3 gap-3 mt-8">
								{/* name and month grid */}
								<div className="flex">
									<Label className="mt-4">NAME OF BHW:</Label>
									<InputLine className="w-1/2" value=""/>

									<Label className="mt-4 ml-[5rem]">MONTH:</Label>
									<InputLine className="w-1/4" value=""/>
								</div>

								{/* barangay and year grid */}
								<div className="flex">
									<Label className="mt-4">BARANGAY:</Label>
									<InputLine className="w-1/2" value=""/>

									<Label className="mt-4 ml-[6.5rem]">YEAR:</Label>
									<InputLine className="w-1/4" value=""/>
								</div>

								{/* sitio grid */}
								<div className="flex">
									<Label className="mt-4">SITIO:</Label>
									<InputLine className="w-1/4" value=""/>
								</div>
							</div>

							{/* opt result */}
							<div className="mt-[3rem]">
								<Label className="font-bold text-[18px]">I. OPT RESULTS</Label>
							</div>

							{/* monthly monitoring of children 0-23 mos */}
							<div className="flex mt-[2rem]">
								<Label className="font-bold text-[18px] mt-2">II. MONTHLY MONITORING OF CHILDREN 0-23 MOS:</Label>
								<InputLine className="w-1/6"/>
							</div>

							{/* monthly monitoring of children with growth problem 0-71 mos */}
							<div className="flex mt-[2rem]">
								<Label className="font-bold text-[18px] mt-2">III. MONTHLY MONITORING OF CHILDREN WITH GROWTH PROBLEM 0-71 MOS:</Label>
								<InputLine className="w-1/6"/>
							</div>

							{/*  micronutrient supplementation */}
							<div className="mt-[3rem]">
								<Label className="font-bold text-[18px]">IV. MICRONUTRIENT SUPPLEMENTATION</Label>
							</div>
						</div> 
					</div>
				</div>
			</LayoutWithBack>
		</>
	)
}