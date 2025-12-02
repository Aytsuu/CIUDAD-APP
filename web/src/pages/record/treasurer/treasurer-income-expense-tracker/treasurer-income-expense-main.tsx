import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react'; 
import { Link } from 'react-router';
import CardLayout from "@/components/ui/card/card-layout";
import { Calendar, Search } from 'lucide-react';
import { Progress } from "@/components/ui/progress"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useIncomeExpenseMainCard, type IncomeExpenseCard } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";


function IncomeExpenseMain() {
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const { showLoading, hideLoading } = useLoading();
    
    // Add debouncing for search
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    const { data: mainCardData = { results: [], count: 0 }, isLoading } = useIncomeExpenseMainCard(
        currentPage,
        pageSize,
        debouncedSearchTerm
    );

    const styles = {
        budgetLabel: "w-[12rem]",
    };

    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);   

    // Get data from paginated response
    const fetchedData = mainCardData.results || [];
    const totalCount = mainCardData.count || 0;

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 when searching
    };

    return (
        <div className="w-full h-full">
             <div className="flex flex-col gap-3 mb-4">
                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                     <div>Income & Expense Tracking</div>
                 </h1>
                 <p className="text-xs sm:text-sm text-darkGray">
                     Gain clear insights into your finances by tracking income and expenses in real time.
                 </p>
             </div>
             <hr className="border-gray mb-7 sm:mb-9" /> 

            <div className="mb-[1rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <div className="relative flex-1 min-w-[100px]">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                        />
                        <Input 
                            placeholder="Search..." 
                            className="pl-10 w-full bg-white text-sm" 
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>                            
                </div>
                
                {/* Page Size Selector */}
                <div className="flex gap-x-2 items-center">
                    <p className="text-xs sm:text-sm">Show</p>
                    <Select 
                        value={pageSize.toString()} 
                        onValueChange={(value) => {
                            const newPageSize = Number.parseInt(value);
                            setPageSize(newPageSize);
                            setCurrentPage(1); // Reset to page 1 when page size changes
                        }}
                    >
                        <SelectTrigger className="w-20 h-8 bg-white border-gray-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="16">16</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs sm:text-sm">Entries</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 col-span-2">
                        <Spinner size="lg" />
                        <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                ) : fetchedData.length > 0 ? (
                    fetchedData.map((tracker: IncomeExpenseCard, index: number) => {
                        const budget = Number(tracker.ie_main_tot_budget)
                        const income = Number(tracker.ie_main_inc)
                        const expense = Number(tracker.ie_main_exp)
                        const progress = budget > 0 ? (expense / budget) * 100 : 0;
                        const remainingBal = Number(tracker.ie_remaining_bal);
                        
                        return (
                            <Link 
                                to={`/treasurer-income-and-expense-tracking/`}
                                state={{
                                    type: "viewing", 
                                    budYear: tracker.ie_main_year,
                                    totalBud: tracker.ie_main_tot_budget,
                                    totalExp: tracker.ie_main_exp,
                                    totalInc: tracker.ie_main_inc,
                                }}
                                className="hover:shadow-lg transition-shadow" 
                                key={index}
                            >
                                <CardLayout
                                    title={
                                        <div className="flex flex-row">
                                            <div className="flex justify-between items-center w-full">
                                                <h1 className="font-semibold text-xl sm:text-2xl text-primary flex items-center gap-3 pb-4">
                                                    <div className="rounded-full border-2 border-solid border-primary p-3 flex items-center">
                                                        <Calendar />
                                                    </div>
                                                    <div>{tracker.ie_main_year} Budget Overview</div>
                                                </h1>
                                            </div>
                                        </div>
                                    }
                                    description=""
                                    content={
                                        <div className="flex flex-col gap-4 pl-3">
                                            <div className="flex flex-col sm:flex-row">
                                                <Label className={styles.budgetLabel}>Total Budget:</Label>
                                                <Label className="text-blue">Php {budget.toFixed(2)}</Label>
                                            </div>
                                            <div className="flex flex-col sm:flex-row">
                                                <Label className={styles.budgetLabel}>Total Income:</Label>
                                                <Label className="text-green-600">Php {income.toFixed(2)}</Label>
                                            </div>
                                            <div className="flex flex-col sm:flex-row">
                                                <Label className="w-[12rem]">Total Expenses:</Label>
                                                <Label className="text-red-600">Php {expense.toFixed(2)}</Label>
                                            </div>
                                            <div className="flex flex-col sm:flex-row"> 
                                                <Label className="w-[12rem]">Remaining Balance:</Label>
                                                <Label className="text-yellow-600">Php {remainingBal.toFixed(2)}</Label>
                                            </div>

                                            <div className="mt-4">
                                                <Progress value={progress} className="w-full h-4 bg-gray-300 border" />
                                                <div className="text-sm text-gray-600 text-center mt-2">
                                                    {progress.toFixed(2)}% of budget spent
                                                </div>
                                            </div>
                                        </div>
                                    }
                                />
                            </Link>                        
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 col-span-2">
                        <h3 className="text-md font-normal text-gray-600 mb-2">No results found</h3>
                    </div>
                )}                
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, totalCount)} of{" "}
                    {totalCount} rows
                </p>
                {totalCount > 0 && totalPages > 1 && (
                    <PaginationLayout
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
}

export default IncomeExpenseMain;