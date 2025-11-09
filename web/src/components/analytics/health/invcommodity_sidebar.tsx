// CommodityAlertsSidebar.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, XCircle, ArrowRight, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useCommodityStocksTable } from "@/pages/healthInventory/inventoryStocks/REQUEST/Commodity/queries/fetch-queries";

type StockStatus = "low_stock" | "near_expiry" | "out_of_stock";

interface StockAlertItem {
  id: string;
  name: string;
  status: StockStatus;
  quantity?: number;
  expiryDate?: string;
  availableStock: number;
  recevFrom?: string;
  item?: {
    com_name: string;
  };
}

export function CommodityAlertsSidebar() {
  const [currentPage] = useState(1);
  const [pageSize] = useState(20);
  const [showAll, setShowAll] = useState(false);
  const { data: apiResponse, isLoading } = useCommodityStocksTable(currentPage, pageSize, "", "all");

  // Transform commodity data into alert items
  const getAlertItems = (): StockAlertItem[] => {
    if (!apiResponse?.results) return [];

    const alerts: StockAlertItem[] = [];

    apiResponse.results.forEach((item: any) => {
      if (item.isOutOfStock) {
        alerts.push({
          id: item.inv_id,
          name: item.item?.com_name || "Unknown Commodity",
          status: "out_of_stock",
          availableStock: item.availableStock,
          recevFrom: item.recevFrom,
          item: item.item
        });
      } else if (item.isLowStock) {
        alerts.push({
          id: item.inv_id,
          name: item.item?.com_name || "Unknown Commodity",
          status: "low_stock",
          quantity: item.availableStock,
          availableStock: item.availableStock,
          recevFrom: item.recevFrom,
          item: item.item
        });
      } else if (item.isNearExpiry) {
        alerts.push({
          id: item.inv_id,
          name: item.item?.com_name || "Unknown Commodity",
          status: "near_expiry",
          expiryDate: item.expiryDate,
          availableStock: item.availableStock,
          recevFrom: item.recevFrom,
          item: item.item
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

  const allAlertItems = getAlertItems();
  const itemsToShow = showAll ? allAlertItems : allAlertItems.slice(0, 10);
  const hasMoreItems = allAlertItems.length > 10;
  
  const counts = apiResponse?.filter_counts || { out_of_stock: 0, low_stock: 0, near_expiry: 0 };

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

  const getStatusText = (status: StockStatus) => {
    switch (status) {
      case "out_of_stock":
        return "Out of Stock";
      case "low_stock":
        return "Low Stock";
      case "near_expiry":
        return "Near Expiry";
      default:
        return "Alert";
    }
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

  const formatStockInfo = (item: StockAlertItem) => {
    if (item.status === "low_stock" && item.quantity !== undefined) {
      return `Only ${item.quantity} units remaining`;
    }
    if (item.status === "out_of_stock") {
      return "No available stock";
    }
    if (item.status === "near_expiry" && item.expiryDate) {
      return `Expires ${formatExpiryDate(item.expiryDate)}`;
    }
    return "";
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

  const hasAlerts = counts.out_of_stock > 0 || counts.low_stock > 0 || counts.near_expiry > 0;

  return (
    <Card className="rounded-lg shadow-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {counts.out_of_stock > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
              {counts.out_of_stock} Out of Stock
            </Badge>
          )}
          {counts.low_stock > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
              {counts.low_stock} Low Stock
            </Badge>
          )}
          {counts.near_expiry > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
              {counts.near_expiry} Near Expiry
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
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${getStatusColor(item.status)} transition-colors cursor-pointer`}
                  onClick={() => {
                    // Optional: Add navigation to specific commodity detail
                    console.log('Navigate to commodity:', item.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStatusColor(item.status)} border-0 flex-shrink-0 ml-2`}
                    >
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">
                      {formatStockInfo(item)}
                    </p>
                    
                    {item.recevFrom && (
                      <p className="text-xs opacity-75">
                        From: {item.recevFrom.toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Show More/Less Toggle */}
            {hasMoreItems && (
              <div className="pt-3 border-t border-gray-100 mt-3">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show {allAlertItems.length - 10} More
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* View All Button - Always visible when there are alerts */}
            <div className="pt-3 border-t border-gray-100 mt-3">
              <Link to="/inventory-stocks/list/stocks/commodity">
                <Button 
                  variant="link" 
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All Stock Alerts
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}