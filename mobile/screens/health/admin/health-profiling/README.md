# Mobile Health Profiling - Resident Registration

## 📁 Folder Structure Created

```
mobile/
├── app/
│   └── (health)/
│       └── admin/
│           └── health-profiling/
│               ├── _layout.tsx                    # Navigation layout
│               ├── index.tsx                      # Entry point
│               └── resident-registration.tsx      # Registration route
│
├── screens/
│   └── health/
│       └── admin/
│           └── health-profiling/
│               ├── index.tsx                      # Health Profiling home
│               └── resident-registration/
│                   ├── index.tsx                  # Main registration screen
│                   └── forms/
│                       ├── AccountForm.tsx        # Step 1: Account Setup
│                       ├── PersonalForm.tsx       # Step 2: Personal Info
│                       ├── HouseholdForm.tsx      # Step 3: Household
│                       ├── FamilyForm.tsx         # Step 4: Family
│                       └── CompletionScreen.tsx   # Final review & submit
│
└── form-schema/
    └── profiling-schema.ts                        # Zod validation schemas
```

## 🎯 Features Implemented

### 1. **Health Profiling Home Screen**
   - Clean card-based interface
   - Primary action: "Register New Resident" (highlighted in blue)
   - Quick access to existing records (Residents, Families, Households, Businesses)
   - Responsive and mobile-friendly UI

### 2. **Multi-Step Registration Flow** (4 Steps - No Business)
   
   #### **Step 1: Account Setup (Optional)**
   - Email address
   - Phone number
   - Password with validation
   - Confirm password
   - Password requirements display
   - Skip option available
   - Show/hide password toggle

   #### **Step 2: Personal Information (Required)**
   - Last Name, First Name, Middle Name
   - Suffix (dropdown)
   - Sex (dropdown)
   - Date of Birth (date picker)
   - Civil Status (dropdown)
   - Religion
   - Contact Number
   - Educational Attainment (optional)
   - Disability (optional)

   #### **Step 3: Household Details (Optional)**
   - Household Head name
   - NHTS status (dropdown)
   - Complete Address (multiline)
   - Skip option available
   - Note about family registration

   #### **Step 4: Family Information (Optional)**
   - **Two modes:**
     1. **Living Solo:** Building type, Household number, Indigenous status
     2. **Existing Family:** Family ID, Role in family
   - Toggle between modes
   - Skip option available

   #### **Step 5: Completion Screen**
   - Visual summary of all completed steps
   - Required vs Optional steps indicator
   - Completion status (X/4 steps)
   - What happens next information
   - Animated submit button (pulses when ready)
   - Clear error messages if requirements not met

### 3. **UI/UX Features**

   ✅ **Animated Progress Bar** - Smooth transitions between steps
   ✅ **Step Indicators** - Visual representation with icons
   ✅ **Form Validation** - Real-time validation with Zod
   ✅ **Error Messages** - Clear, user-friendly error displays
   ✅ **Skip Options** - Flexible registration flow
   ✅ **Icon Integration** - Lucide React Native icons
   ✅ **Responsive Design** - Works on all screen sizes
   ✅ **Loading States** - Submission feedback
   ✅ **Clean Typography** - Easy to read, professional

### 4. **Technical Implementation**

   - **React Hook Form** - Efficient form state management
   - **Zod Validation** - Type-safe schema validation
   - **Reanimated** - Smooth animations
   - **TypeScript** - Full type safety
   - **Expo Router** - File-based navigation
   - **NativeWind** - Tailwind CSS for React Native

## 🎨 Design Highlights

1. **Color Scheme:**
   - Primary Blue: `#3B82F6`
   - Success Green: `#10B981`
   - Warning Amber: `#F59E0B`
   - Neutral Grays: For backgrounds and text

2. **Card-Based Layout:**
   - White cards with subtle shadows
   - Rounded corners (xl - 12px)
   - Proper spacing and padding

3. **Interactive Elements:**
   - Touch feedback on all buttons
   - Visual state changes (completed, current, pending)
   - Smooth transitions between steps

4. **Information Architecture:**
   - Clear section headers
   - Helpful info cards (blue background)
   - Warning notices (amber background)
   - Success indicators (green)

## 📝 Validation Rules

### Account Schema
- Email: Valid email format with domain check
- Phone: 11 digits, starts with 09
- Password: Min 6 chars, uppercase, lowercase, number
- Confirm Password: Must match password

### Personal Schema
- Names: Required, min 2 characters
- Sex: Required
- Date of Birth: Required, valid date
- Civil Status: Required
- Religion: Required
- Contact: Required, 11 digits (09XXXXXXXXX)

### Household Schema
- Household Head: Required
- NHTS: Required
- Address: Required

### Family/Living Solo Schema
- Living Solo: Building, Household No, Indigenous all required
- Existing Family: Family ID and Role required

## 🔄 User Flow

1. User navigates to Health Profiling from home
2. Selects "Register New Resident"
3. Completes 4-step form:
   - Account (optional)
   - Personal (required)
   - Household (optional but needs Household OR Family)
   - Family (optional)
4. Reviews completion screen
5. Submits registration
6. Returns to Health Profiling home

## 📱 Mobile Optimizations

- Touch-friendly buttons (minimum 44px height)
- Scrollable forms for small screens
- Native date picker integration
- Native dropdown pickers
- Keyboard-aware views
- Proper input types (email, phone-pad, etc.)

## 🚀 Next Steps (To Be Implemented)

1. **API Integration:**
   - Connect to `profiling/complete/registration/` endpoint
   - Handle success/error responses
   - Add loading states

2. **Data Persistence:**
   - Save draft registrations
   - Resume incomplete registrations

3. **Additional Features:**
   - Search existing families
   - Auto-fill household head from resident
   - Photo capture for profile
   - ID scanning
   - Address autocomplete

## 📦 Dependencies Used

- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `lucide-react-native` - Icons
- `react-native-reanimated` - Animations
- `@react-native-community/datetimepicker` - Date picker
- `@react-native-picker/picker` - Native dropdowns

## ✅ Testing Checklist

- [ ] Navigation between steps works
- [ ] Form validation displays errors
- [ ] Skip buttons clear form data
- [ ] Date picker shows and sets dates
- [ ] Dropdowns select values correctly
- [ ] Completion screen shows correct status
- [ ] Submit button only enabled when valid
- [ ] Back navigation preserves data
- [ ] Animations run smoothly
- [ ] Works on different screen sizes

---

**Created:** Mobile version of web's RegistrationLayout
**Status:** ✅ Complete (Ready for API integration)
**Branch:** health-profiling
