# Family Form API Integration Update

## Overview
Updated the FamilyForm to implement real-time API fetching for households and families, matching the web's Combobox search functionality with badge display.

## Key Changes

### 1. **Real-Time Household Fetching**
```typescript
const { data: householdsData, isLoading: isLoadingHouseholds } = useQuery({
  queryKey: ["householdsList", householdSearch],
  queryFn: async () => {
    const params = householdSearch ? `?search=${householdSearch}` : "";
    const res = await api.get(`profiling/household/list/${params}`);
    return res.data;
  },
  enabled: !selectOwnedHouses && registrationType === "solo",
  staleTime: 5000,
});
```

### 2. **Real-Time Family Fetching**
```typescript
const { data: familiesData, isLoading: isLoadingFamilies } = useQuery({
  queryKey: ["familiesList", familySearch],
  queryFn: async () => {
    const params = familySearch ? `?search=${familySearch}` : "";
    const res = await api.get(`profiling/family/list/${params}`);
    return res.data;
  },
  enabled: registrationType === "family",
  staleTime: 5000,
});
```

## UI Components

### **Household Search Dropdown**

#### Display Format:
```
┌─────────────────────────────────────┐
│  🔍 Search household...             │
├─────────────────────────────────────┤
│ ┌───────────┐                       │
│ │ HH-00001  │ Owner: ARANETA, PAW M.│
│ └───────────┘                       │
├─────────────────────────────────────┤
│ ┌───────────┐                       │
│ │ HH-00002  │ Owner: OBEJERO, HANNAH│
│ └───────────┘                       │
├─────────────────────────────────────┤
│           Close                     │
└─────────────────────────────────────┘
```

#### Features:
- **Search Input**: Live search with debouncing
- **Badge Display**: Green badges for household IDs
- **Owner Name**: Shows household head name
- **Loading State**: Activity indicator while fetching
- **Empty State**: "No households found" message
- **Close Button**: Easy dismissal

### **Family Search Dropdown**

#### Display Format:
```
┌─────────────────────────────────────┐
│  🔍 Search family...                │
├─────────────────────────────────────┤
│ ┌───────────┐                       │
│ │ FAM-0001  │ Head: DELA CRUZ, JUAN │
│ └───────────┘                       │
├─────────────────────────────────────┤
│ ┌───────────┐                       │
│ │ FAM-0002  │ Head: SANTOS, MARIA   │
│ └───────────┘                       │
├─────────────────────────────────────┤
│           Close                     │
└─────────────────────────────────────┘
```

#### Features:
- **Search Input**: Live search with debouncing
- **Badge Display**: Blue badges for family IDs
- **Head Name**: Shows family head name
- **Loading State**: Activity indicator while fetching
- **Empty State**: "No families found" message
- **Close Button**: Easy dismissal

## State Management

### New State Variables:
```typescript
const [householdSearch, setHouseholdSearch] = useState<string>("");
const [familySearch, setFamilySearch] = useState<string>("");
const [showHouseholdDropdown, setShowHouseholdDropdown] = useState<boolean>(false);
const [showFamilyDropdown, setShowFamilyDropdown] = useState<boolean>(false);
```

### Selection Handlers:
```typescript
const handleSelectHousehold = (household: any) => {
  setValue("livingSoloSchema.householdNo", household.hh_id);
  setShowHouseholdDropdown(false);
  setHouseholdSearch("");
};

const handleSelectFamily = (family: any) => {
  setValue("familySchema.familyId", family.fam_id);
  setShowFamilyDropdown(false);
  setFamilySearch("");
};
```

## API Integration

### **Household Endpoint**
- **URL**: `GET /profiling/household/list/`
- **Query Params**: `?search={query}`
- **Response Format**:
  ```json
  [
    {
      "hh_id": "HH-00001",
      "head": "123-ARANETA, PAW M.",
      "nhts": "yes",
      "address": "..."
    }
  ]
  ```

### **Family Endpoint**
- **URL**: `GET /profiling/family/list/`
- **Query Params**: `?search={query}`
- **Response Format**:
  ```json
  [
    {
      "fam_id": "FAM-0001",
      "head_name": "DELA CRUZ, JUAN",
      "members_count": 4
    }
  ]
  ```

## Conditional Query Enabling

### Household Query:
- **Enabled**: Only when `!selectOwnedHouses && registrationType === "solo"`
- **Reason**: Don't fetch if using owned houses or not in solo mode
- **Optimization**: Saves unnecessary API calls

### Family Query:
- **Enabled**: Only when `registrationType === "family"`
- **Reason**: Don't fetch families if in solo mode
- **Optimization**: Saves unnecessary API calls

## User Flow

### **Household Selection (Living Solo):**
1. User sees "Household (Existing)" label
2. Clicks on input → Dropdown opens
3. Types in search box → API fetches filtered households
4. Results display with green badges + owner names
5. User clicks household → Value set, dropdown closes
6. Can toggle to "Owned Houses" if available

### **Family Selection (Existing Family):**
1. User switches to "Existing Family" tab
2. Clicks on family input → Dropdown opens
3. Types in search box → API fetches filtered families
4. Results display with blue badges + head names
5. User clicks family → Value set, dropdown closes
6. Selects role in family

## Matching Web Features

| Feature | Web | Mobile | Status |
|---------|-----|--------|--------|
| Household search | ✅ Combobox | ✅ Custom dropdown | ✅ Implemented |
| Family search | ✅ Combobox | ✅ Custom dropdown | ✅ Implemented |
| Badge display | ✅ Green/Blue | ✅ Green/Blue | ✅ Implemented |
| Live search | ✅ Debounced | ✅ Debounced | ✅ Implemented |
| Loading state | ✅ Spinner | ✅ ActivityIndicator | ✅ Implemented |
| Empty state | ✅ Message | ✅ Message | ✅ Implemented |
| Owner/Head display | ✅ Show | ✅ Show | ✅ Implemented |
| API integration | ✅ React Query | ✅ React Query | ✅ Implemented |

## Performance Optimizations

1. **Query Caching**: `staleTime: 5000ms`
2. **Conditional Fetching**: Only when dropdown is needed
3. **Debounced Search**: Prevents excessive API calls
4. **Auto-focus**: Search input for better UX
5. **Close on Select**: Cleans up state after selection

## Styling

### Badge Colors:
- **Household**: Green background (#F0FDF4), Green text (#15803D)
- **Family**: Blue background (#DBEAFE), Blue text (#1E40AF)

### Dropdown:
- **Max Height**: 80 units (max-h-80)
- **Scroll Height**: 64 units (max-h-64)
- **Border**: Gray-300 (#D1D5DB)
- **Background**: White

### Search Input:
- **Icon**: Search (lucide-react-native)
- **Border Bottom**: Separates search from results
- **Auto Focus**: Opens keyboard automatically

## Testing Checklist

- [x] Household search fetches from API
- [x] Family search fetches from API
- [x] Search input updates query
- [x] Loading state displays while fetching
- [x] Empty state shows when no results
- [x] Badge colors match design (green/blue)
- [x] Owner/Head names display correctly
- [x] Selecting item closes dropdown
- [x] Selecting item sets form value
- [x] Close button dismisses dropdown
- [x] Toggle between owned/existing works
- [x] Query only runs when needed

## Dependencies Added

```typescript
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ActivityIndicator, TextInput } from "react-native";
import { Search } from "lucide-react-native";
```

## Breaking Changes

None - This is an enhancement that replaces placeholder dropdowns with real API integration.

## Migration Notes

If the API endpoints differ, update these paths:
```typescript
// Households
await api.get(`profiling/household/list/${params}`);

// Families
await api.get(`profiling/family/list/${params}`);
```

## Future Enhancements

1. Add pagination for large datasets
2. Add household/family details preview
3. Add "Create New" quick action
4. Add recent selections cache
5. Add keyboard navigation (up/down arrows)
