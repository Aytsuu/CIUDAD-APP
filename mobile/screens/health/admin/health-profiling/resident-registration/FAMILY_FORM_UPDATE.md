# Family Form Update - Matching Web SoloFormLayout

## Overview
Updated the mobile FamilyForm to match the web's SoloFormLayout functionality, including household fetching and owned house selection.

## Key Features Implemented

### 1. **Toggle Between Household Sources**
- **Existing Households**: Fetch from database (TODO: API integration)
- **Owned Houses**: Select from houses registered in Step 3 (Household Form)
- Toggle button with ArrowDownUp icon

### 2. **Owned Houses Integration**
```typescript
// Automatically formats houses from Step 3
const formattedOwnedHouses = ownedHouses.map((house, index) => ({
  label: `House ${index + 1} - ${sitio}, ${street}`,
  value: house.address
}));
```

### 3. **Automatic Building Type Assignment**
- When selecting from owned houses → Building type auto-sets to "OWNER"
- Field becomes read-only with helper text
- Can be manually changed when using existing households

### 4. **Two Registration Modes**

#### **Living Solo Mode:**
- Household selection (Owned/Existing toggle)
- Household Occupancy (Owner/Renter/Sharer)
- Indigenous People status

#### **Existing Family Mode:**
- Family selection dropdown
- Role in family selection
- Warning note about family existence

### 5. **Improved UI/UX**

#### **Header Section:**
- Large icon (14x14) with UsersRound
- Clear title and subtitle
- Consistent spacing

#### **Info Card:**
- Blue background with border
- "Independent Living Registration" title
- Detailed explanation

#### **Registration Type Selector:**
- Two-button toggle (Living Solo / Existing Family)
- Active state with blue background
- Clear visual feedback

#### **Form Sections:**
- White card with border
- Section headers with dividers
- Helper text for each field
- Proper spacing

#### **Action Buttons:**
- "Continue" - SubmitButton component
- "Skip for Now" - Gray background button
- Help text at bottom

## Technical Implementation

### State Management
```typescript
const [registrationType, setRegistrationType] = useState<"solo" | "family">("solo");
const [selectOwnedHouses, setSelectOwnedHouses] = useState<boolean>(false);
const [buildingReadOnly, setBuildingReadOnly] = useState<boolean>(false);
```

### Data Flow
1. User selects registration type (Solo/Family)
2. For Living Solo:
   - Toggle between owned houses (from Step 3) or existing households
   - If owned house selected → Building type = "owner" (read-only)
   - If existing household → Building type selectable
3. Form validates all required fields before proceeding

### Form Validation
```typescript
const validateAndNext = async () => {
  if (registrationType === "solo") {
    await trigger([
      "livingSoloSchema.building",
      "livingSoloSchema.householdNo",
      "livingSoloSchema.indigenous",
    ]);
  } else {
    await trigger([
      "familySchema.familyId",
      "familySchema.role",
    ]);
  }
  // Validate completion and proceed
};
```

## UI Components Used

- `FormSelect` - All dropdown fields
- `SubmitButton` - Continue button
- `TouchableOpacity` - Type toggle, household toggle, skip button
- `UsersRound` (lucide-react-native) - Header icon
- `ArrowDownUp` (lucide-react-native) - Toggle icon
- Poppins fonts - Typography system
- NativeWind classes - Styling

## Fields Structure

### Living Solo Schema
```typescript
livingSoloSchema: {
  building: string,        // "owner" | "renter" | "sharer"
  householdNo: string,     // Household ID or owned house address
  indigenous: string,      // "yes" | "no"
}
```

### Family Schema
```typescript
familySchema: {
  familyId: string,       // Family ID to join
  role: string,           // Role in family
}
```

## Comparison with Web Version

| Feature | Web | Mobile | Status |
|---------|-----|--------|--------|
| Household toggle | ✅ | ✅ | Implemented |
| Owned houses selection | ✅ | ✅ | Implemented |
| Auto building type | ✅ | ✅ | Implemented |
| Existing household fetch | ✅ | 🔄 | TODO: API |
| Family list fetch | ✅ | 🔄 | TODO: API |
| Registration type toggle | ✅ | ✅ | Implemented |
| Form validation | ✅ | ✅ | Implemented |
| Skip functionality | ✅ | ✅ | Implemented |

## TODO: API Integration

### Required Endpoints:

1. **Fetch Existing Households**
```typescript
// GET /api/households
// Returns: [{ id, name, head, address }]
```

2. **Fetch Existing Families**
```typescript
// GET /api/families
// Returns: [{ id, head, members, address }]
```

### Implementation Pattern:
```typescript
// Example from web version
const { data: householdsList } = useHouseholdsList(searchQuery);
const { data: familiesList } = useFamiliesList(searchQuery);

// Format for dropdown
const formattedHouseholds = formatHouseholds(householdsList);
const formattedFamilies = formatFamilies(familiesList);
```

## Styling Improvements

1. **Better Spacing**
   - Consistent padding (px-5)
   - Section margins (mb-6)
   - Card padding (p-5)

2. **Typography**
   - PoppinsSemiBold for headers
   - PoppinsRegular for body text
   - PoppinsMedium for labels
   - Proper line heights (leading-5)

3. **Colors**
   - Blue theme (#2563EB)
   - Gray neutrals for text
   - Amber for warnings
   - Proper contrast ratios

4. **Interactive States**
   - Active/inactive toggle states
   - Button hover states
   - Read-only field indicators

## User Flow

1. **Initial State**: Living Solo mode selected
2. **Choose Household Source**:
   - If owned houses exist → Show toggle button
   - Click toggle → Switch between owned/existing
3. **Fill Form**:
   - Select household
   - Select building type (auto if owned)
   - Select indigenous status
4. **Validation**:
   - All fields required
   - Form triggers validation
5. **Proceed**: Click Continue or Skip

## Benefits

✅ **Matches web functionality** - Consistent UX across platforms
✅ **Smart defaults** - Auto-fills building type for owned houses
✅ **Flexible** - Works with or without owned houses
✅ **Clear UI** - Better visual hierarchy and spacing
✅ **Validated** - Proper form validation before proceeding
✅ **Accessible** - Helper text and clear labels
✅ **Responsive** - Clean mobile-first design

## Testing Checklist

- [ ] Toggle between registration types works
- [ ] Owned houses display correctly from Step 3
- [ ] Toggle between owned/existing households works
- [ ] Building type auto-sets to "owner" for owned houses
- [ ] Building type is editable for existing households
- [ ] Family dropdown displays correctly
- [ ] Role selection works
- [ ] Form validation triggers on Continue
- [ ] Skip button clears all data
- [ ] Proper error states display
- [ ] Helper text shows correctly
