// InventoryAlertsSidebar.tsx - Combined Stock Alerts
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, XCircle, Package, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAntigenCombineStocks } from "@/pages/healthInventory/inventoryStocks/REQUEST/Antigen/queries/AntigenFetchQueries";
import { useMedicineStockTable } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/queries/MedicineFetchQueries";
import { useCommodityStocksTable } from "@/pages/healthInventory/inventoryStocks/REQUEST/Commodity/queries/fetch-queries";
import { useFirstAidStocksTable } from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/queries/FirstAidFetchQueries";

type StockStatus = "low_stock" | "near_expiry" | "out_of_stock";
type ItemType = "antigen" | "medicine" | "commodity" | "firstaid";

interface StockAlertItem {
  id: string;
  name: string;
  status: StockStatus;
  type: ItemType;
  quantity?: number;
  expiryDate?: string;
  availableStock: number;
  details?: string;
  isOutOfStock: boolean;
  isLowStock: boolean;
  isNearExpiry: boolean;
}

export function InventoryAlertsSidebar() {
  const [currentPage] = useState(1);
  const [pageSize] = useState(20);
  const [showViewAllDropdown, setShowViewAllDropdown] = useState(false);

  // Fetch all inventory types
  const { data: antigenResponse, isLoading: isAntigenLoading } = useAntigenCombineStocks(currentPage, pageSize, "", "all");
  const { data: medicineResponse, isLoading: isMedicineLoading } = useMedicineStockTable(currentPage, pageSize, "", "all");
  const { data: commodityResponse, isLoading: isCommodityLoading } = useCommodityStocksTable(currentPage, pageSize, "", "all");
  const { data: firstAidResponse, isLoading: isFirstAidLoading } = useFirstAidStocksTable(currentPage, pageSize, "", "all");

  const isLoading = isAntigenLoading || isMedicineLoading || isCommodityLoading || isFirstAidLoading;

  // Transform all inventory data into combined alert items
  const getCombinedAlertItems = (): StockAlertItem[] => {
    const alerts: StockAlertItem[] = [];

    // Process Antigen
    antigenResponse?.results?.forEach((item: any) => {
      if (item.isOutOfStock || item.isLowStock || item.isNearExpiry) {
        let primaryStatus: StockStatus;
        if (item.isOutOfStock) primaryStatus = "out_of_stock";
        else if (item.isLowStock) primaryStatus = "low_stock";
        else primaryStatus = "near_expiry";

        const typeLabel = item.type === 'vaccine' ? 'Vaccine' : 'Immunization Supply';
        const details = item.item?.dosage 
          ? `${item.item.dosage} ${item.item.unit || ""} • ${typeLabel}`
          : typeLabel;

        alerts.push({
          id: item.inv_id,
          name: item.item?.antigen || "Unknown Item",
          status: primaryStatus,
          type: "antigen",
          quantity: item.availableStock,
          expiryDate: item.expiryDate,
          availableStock: item.availableStock,
          details,
          isOutOfStock: item.isOutOfStock,
          isLowStock: item.isLowStock,
          isNearExpiry: item.isNearExpiry
        });
      }
    });

    // Process Medicine
    medicineResponse?.results?.forEach((item: any) => {
      if (item.isOutOfStock || item.isLowStock || item.isNearExpiry) {
        let primaryStatus: StockStatus;
        if (item.isOutOfStock) primaryStatus = "out_of_stock";
        else if (item.isLowStock) primaryStatus = "low_stock";
        else primaryStatus = "near_expiry";

        const details = item.item?.dosage 
          ? `${item.item.dosage} ${item.item.dsgUnit}, ${item.item.form}`
          : "";

        alerts.push({
          id: item.inv_id,
          name: item.item?.medicineName || "Unknown Medicine",
          status: primaryStatus,
          type: "medicine",
          quantity: item.availableStock,
          expiryDate: item.expiryDate,
          availableStock: item.availableStock,
          details,
          isOutOfStock: item.isOutOfStock,
          isLowStock: item.isLowStock,
          isNearExpiry: item.isNearExpiry
        });
      }
    });

    // Process Commodity
    commodityResponse?.results?.forEach((item: any) => {
      if (item.isOutOfStock || item.isLowStock || item.isNearExpiry) {
        let primaryStatus: StockStatus;
        if (item.isOutOfStock) primaryStatus = "out_of_stock";
        else if (item.isLowStock) primaryStatus = "low_stock";
        else primaryStatus = "near_expiry";

        const details = item.recevFrom ? `From: ${item.recevFrom.toUpperCase()}` : "";

        alerts.push({
          id: item.inv_id,
          name: item.item?.com_name || "Unknown Commodity",
          status: primaryStatus,
          type: "commodity",
          quantity: item.availableStock,
          expiryDate: item.expiryDate,
          availableStock: item.availableStock,
          details,
          isOutOfStock: item.isOutOfStock,
          isLowStock: item.isLowStock,
          isNearExpiry: item.isNearExpiry
        });
      }
    });

    // Process First Aid
    firstAidResponse?.results?.forEach((item: any) => {
      if (item.isOutOfStock || item.isLowStock || item.isNearExpiry) {
        let primaryStatus: StockStatus;
        if (item.isOutOfStock) primaryStatus = "out_of_stock";
        else if (item.isLowStock) primaryStatus = "low_stock";
        else primaryStatus = "near_expiry";

        alerts.push({
          id: item.inv_id,
          name: item.item?.fa_name || "Unknown First Aid",
          status: primaryStatus,
          type: "firstaid",
          quantity: item.availableStock,
          expiryDate: item.expiryDate,
          availableStock: item.availableStock,
          details: item.category || "",
          isOutOfStock: item.isOutOfStock,
          isLowStock: item.isLowStock,
          isNearExpiry: item.isNearExpiry
        });
      }
    });

    // Sort by priority: out_of_stock > low_stock > near_expiry
    return alerts.sort((a, b) => {
      const priority: Record<StockStatus, number> = {
        out_of_stock: 3,
        low_stock: 2,
        near_expiry: 1
      };
      return priority[b.status] - priority[a.status];
    });
  };

  const allAlertItems = getCombinedAlertItems();
  const itemsToShow = allAlertItems.slice(0, 10);

  // Calculate total counts
  const totalCounts = {
    out_of_stock: allAlertItems.filter(item => item.isOutOfStock).length,
    low_stock: allAlertItems.filter(item => item.isLowStock && !item.isOutOfStock).length,
    near_expiry: allAlertItems.filter(item => item.isNearExpiry && !item.isOutOfStock && !item.isLowStock).length,
  };

  // Count by type
  const typeCounts = {
    antigen: allAlertItems.filter(item => item.type === "antigen").length,
    medicine: allAlertItems.filter(item => item.type === "medicine").length,
    commodity: allAlertItems.filter(item => item.type === "commodity").length,
    firstaid: allAlertItems.filter(item => item.type === "firstaid").length,
  };

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case "out_of_stock":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "near_expiry":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case "out_of_stock":
        return "text-red-700 bg-red-50 border-red-200";
      case "low_stock":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "near_expiry":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case "antigen":
        return "text-purple-700 bg-purple-50 border-purple-200";
      case "medicine":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "commodity":
        return "text-green-700 bg-green-50 border-green-200";
      case "firstaid":
        return "text-pink-700 bg-pink-50 border-pink-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getTypeLabel = (type: ItemType) => {
    switch (type) {
      case "antigen":
        return "Antigen";
      case "medicine":
        return "Medicine";
      case "commodity":
        return "Commodity";
      case "firstaid":
        return "First Aid";
      default:
        return "Unknown";
    }
  };

  const getTypeRoute = (type: ItemType) => {
    switch (type) {
      case "antigen":
        return "/inventory-stocks/list/stocks/antigen";
      case "medicine":
        return "/inventory-stocks/list/stocks/medicine";
      case "commodity":
        return "/inventory-stocks/list/stocks/commodity";
      case "firstaid":
        return "/inventory-stocks/list/stocks/firstaid";
      default:
        return "/inventory-stocks/list/stocks";
    }
  };

  const getStatusBadges = (item: StockAlertItem) => {
    const badges = [];
    
    if (item.isOutOfStock) {
      badges.push(
        <Badge 
          key="out_of_stock"
          variant="secondary" 
          className="text-xs bg-red-50 text-red-700 border-red-200"
        >
          Out of Stock
        </Badge>
      );
    }
    
    if (item.isLowStock) {
      badges.push(
        <Badge 
          key="low_stock"
          variant="secondary" 
          className="text-xs bg-orange-50 text-orange-700 border-orange-200"
        >
          Low Stock
        </Badge>
      );
    }
    
    if (item.isNearExpiry) {
      badges.push(
        <Badge 
          key="near_expiry"
          variant="secondary" 
          className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Near Expiry
        </Badge>
      );
    }
    
    return badges;
  };

  const formatExpiryDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-lg shadow-sm border-0">
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAlerts = totalCounts.out_of_stock > 0 || totalCounts.low_stock > 0 || totalCounts.near_expiry > 0;

  return (
    <Card className="rounded-lg shadow-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {totalCounts.out_of_stock > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
              {totalCounts.out_of_stock} Out of Stock
            </Badge>
          )}
          {totalCounts.low_stock > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
              {totalCounts.low_stock} Low Stock
            </Badge>
          )}
          {totalCounts.near_expiry > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
              {totalCounts.near_expiry} Near Expiry
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasAlerts ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold mb-1">All Good!</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              No stock alerts at the moment.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {itemsToShow.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={getTypeRoute(item.type)}
                  className="block"
                >
                  <div
                    className={`p-3 rounded-lg border ${getStatusColor(item.status)} transition-all hover:shadow-sm cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0 ml-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(item.type)}`}
                        >
                          {getTypeLabel(item.type)}
                        </Badge>
                        {getStatusBadges(item)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      {/* Status messages */}
                      {item.isOutOfStock && (
                        <p className="font-medium">No available stock</p>
                      )}
                      {!item.isOutOfStock && item.isLowStock && (
                        <p className="font-medium">Only {item.quantity} units remaining</p>
                      )}
                      
                      {/* Expiry information */}
                      {item.isNearExpiry && item.expiryDate && (
                        <p className="font-medium">Expires {formatExpiryDate(item.expiryDate)}</p>
                      )}
                      
                      {/* Item details */}
                      {item.details && (
                        <p className="text-xs opacity-75">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button with Dropdown */}
            <div className="pt-3 border-t border-gray-100 mt-3">
              <DropdownMenu open={showViewAllDropdown} onOpenChange={setShowViewAllDropdown}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="link" 
                    className="w-full flex items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <span className="flex items-center gap-2">
                      View All Stock Alerts ({allAlertItems.length})
                      {allAlertItems.length > 10 && <span className="text-gray-400 text-xs">• Showing 10 of {allAlertItems.length}</span>}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {typeCounts.antigen > 0 && (
                    <DropdownMenuItem asChild>
                      <Link to="/inventory-stocks/list/stocks/antigen" className="cursor-pointer">
                        <Package className="w-4 h-4 mr-2 text-purple-500" />
                        Antigen Alerts ({typeCounts.antigen})
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {typeCounts.medicine > 0 && (
                    <DropdownMenuItem asChild>
                      <Link to="/inventory-stocks/list/stocks/medicine" className="cursor-pointer">
                        <Package className="w-4 h-4 mr-2 text-blue-500" />
                        Medicine Alerts ({typeCounts.medicine})
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {typeCounts.commodity > 0 && (
                    <DropdownMenuItem asChild>
                      <Link to="/inventory-stocks/list/stocks/commodity" className="cursor-pointer">
                        <Package className="w-4 h-4 mr-2 text-green-500" />
                        Commodity Alerts ({typeCounts.commodity})
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {typeCounts.firstaid > 0 && (
                    <DropdownMenuItem asChild>
                      <Link to="/inventory-stocks/list/stocks/firstaid" className="cursor-pointer">
                        <Package className="w-4 h-4 mr-2 text-pink-500" />
                        First Aid Alerts ({typeCounts.firstaid})
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
