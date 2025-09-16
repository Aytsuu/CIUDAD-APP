// components/filters/selected-filters-chips.tsx
interface SelectedFiltersChipsProps {
  items: string[];
  onRemove: (item: string) => void;
  onClearAll: () => void;
  label: string;
  chipColor: string;
  textColor: string;
  getDisplayName?: (item: string) => string;
}

export function SelectedFiltersChips({ items, onRemove, onClearAll, label, chipColor, textColor, getDisplayName = (item) => item }: SelectedFiltersChipsProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-gray-50 p-3 flex flex-wrap gap-2">
      <span className="text-sm font-medium">{label}:</span>
      {items.map((item) => (
        <span key={item} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${chipColor} ${textColor}`}>
          {getDisplayName(item)}
          <button onClick={() => onRemove(item)} className="ml-1.5 rounded-full flex-shrink-0">
            ×
          </button>
        </span>
      ))}
      <button onClick={onClearAll} className={`text-xs ${textColor} hover:opacity-80 ml-2`}>
        Clear all
      </button>
    </div>
  );
}
