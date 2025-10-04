import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MonthInfoCardV2 } from "../bhw-report/folder-component"

export default function BHWReportsMainTable() {
	// const [selectedSort, setSelectedSort] = useState("All");

	// sample data
	const sampleData = [	
		{ month: "2025-04" },
		{ month: "2025-05" },
		{ month: "2025-06" },
		{ month: "2025-07" },
		{ month: "2025-08" },
	]

	// const sortOptions = [
	// 	{ id: "All", name: "All" },
	// 	{ id: "Resident", name: "Resident" },
	// 	{ id: "Transient", name: "Transient" },
	// ]

	return (
		<LayoutWithBack
			title="BHW Monthly Accomplishment Report"
			description="Manage and track BHW Monthly Accomplishment Report"
		>
			<div className="w-full h-full flex flex-col">
				<div className="h-full ">
					<div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
						<div className="relative flex-1">
							<Search
								className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
								size={17}
							/>
							<Input
								placeholder="Search by month (e.g. 'January 2025')"
								className="pl-10 w-full bg-white"
								value=""
								// onChange={}
							/>
						</div>
					</div>

					<div className="bg-white w-full p-6">
						<div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
							<div className="flex gap-x-3 justify-start items-center">
								<p className="text-xs sm:text-sm">Show</p>
								<Input
								type="number"
								className="w-[70px] h-8"
								value={10}
								// onChange={(e) => {
								// 	const value = parseInt(e.target.value);
								// 	setPageSize(value > 0 ? value : 1);
								// 	setCurrentPage(1);
								// }}
								min="1"
								/>
								<p className="text-xs sm:text-sm">Entries</p>
							</div>
						</div>

						<div>

						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
							{sampleData.map((record) => {
								const monthName = new Date(record.month + "-01").toLocaleString(
									"default",
									{
										month: "long",
										year: "numeric",
									}
								);

								return (
									<MonthInfoCardV2 
										key={record.month}
										monthItem={{
											month: record.month,
											month_name: monthName
										}}
										navigateTo={{
											path: ""
										}}
										className="[&_.icon-gradient]:from-yellow-400 [&_.icon-gradient]:to-orange-500 [&_.item-count]:bg-blue-100 [&_.item-count]:text-blue-700"
									/>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</LayoutWithBack>
	)
}