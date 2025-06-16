interface StockBadgeProps {
    quantity: number;
    unit: string;
  }
  
  export const StockBadge = ({ quantity, unit }: StockBadgeProps) => {
    if (quantity <= 10) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span className="hidden sm:inline">
            Low: {quantity} {unit}
          </span>
          <span className="sm:hidden">{quantity}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200">
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <span className="hidden sm:inline">
          {quantity} {unit}
        </span>
        <span className="sm:hidden">{quantity}</span>
      </span>
    );
  };