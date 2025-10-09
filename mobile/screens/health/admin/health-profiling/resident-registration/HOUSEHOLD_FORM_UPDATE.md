# Household Form Update - Matching Web Version

## Overview
Updated the mobile HouseholdForm to match the web's HouseholdFormLayout standard form functionality.

## Key Changes

### 1. **Two-Column Layout**
- **Left Column**: House information form (NHTS, Address)
- **Right Column**: List of added houses with delete functionality

### 2. **Dynamic House List Management**
```typescript
// User can add multiple houses
// Each house shows:
- House number (HOUSE 1, HOUSE 2, etc.)
- Sitio and Street
- NHTS badge (green if yes, gray if no)
- Delete button (X icon)
```

### 3. **Address Integration**
- Automatically pulls addresses from Personal Information step
- Formats as dropdown: "Sitio, Street, Barangay"
- Uses the format: `index-sitio-street` for value tracking

### 4. **Form Behavior**
- **Add Household Button**: Validates and adds house to list
- **Next Button**: Proceeds if at least one house added
- **Skip Button**: Clears all data and proceeds (for residents without owned houses)

### 5. **Schema Updates**
```typescript
houseSchema: z.object({
  list: z.array(householdInfoSchema).default([]),  // Array of houses
  info: householdInfoSchema                        // Current house being added
})
```

## Features Matching Web Version

✅ **Two-column layout** (Form | List)
✅ **Add multiple houses** to the list
✅ **Remove houses** individually
✅ **NHTS status** dropdown (YES/NO)
✅ **Address selection** from personal info addresses
✅ **Skip functionality** for non-homeowners
✅ **Visual feedback** with badges and icons
✅ **Validation** before adding to list
✅ **Help text** at bottom
✅ **Responsive design** with proper spacing

## UI Components Used

- `FormSelect` - For NHTS and Address dropdowns
- `SubmitButton` - For Next action
- `TouchableOpacity` - For Add Household, Skip, and Delete buttons
- `HousePlus` icon - Header icon
- `Plus` icon - Add button
- `X` icon - Remove button
- Badge styling - NHTS status indicators

## Data Flow

1. User fills NHTS and Address in left column
2. Clicks "Add Household" → Validates → Adds to `houseSchema.list`
3. Right column updates to show all added houses
4. User can remove houses individually
5. Clicks "Next" → Validates at least one house exists → Proceeds to Family step
6. OR clicks "Skip" → Clears all house data → Proceeds to Family step

## Validation Rules

- **NHTS**: Required before adding
- **Address**: Required before adding
- **Continue**: Requires at least one house in the list (or skip)

## Mobile-Specific Adaptations

- Used `ScrollView` instead of web's card scrolling
- Applied Poppins fonts (matching mobile design system)
- Used NativeWind classes instead of Tailwind
- Adapted two-column layout for mobile screens using `flex-row`
- Badge component uses conditional styling instead of separate component

## Files Modified

1. **HouseholdForm.tsx** - Complete rewrite to match web version
2. **profiling-schema.ts** - Updated `householdInfoSchema` and `CompleteResidentProfilingSchema`

## Testing Checklist

- [ ] Can add multiple houses
- [ ] NHTS dropdown works
- [ ] Address dropdown shows personal info addresses
- [ ] Delete button removes correct house
- [ ] Next button validates house list
- [ ] Skip button clears data and proceeds
- [ ] Form validation works properly
- [ ] Layout displays correctly on different screen sizes
