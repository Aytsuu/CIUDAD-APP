# Debugging Guide: 500 Error Investigation

## 🔍 How to Debug the 500 Error

### **Step 1: Check the Full Payload**

With the updated logging, when you submit the registration, you should see:

```
Submitting registration payload: {
  "personal": {
    "per_fname": "Janjan",
    "per_lname": "Colina",
    "per_mname": "Abe",
    "per_sex": "Male",
    "per_dob": "2009-01-15",
    "per_status": "Single",
    "per_religion": "Roman Catholic",
    "per_contact": "09056372257",
    "per_edAttainment": "High School",
    "per_suffix": "",
    "per_disability": "",
    "per_addresses": [
      {
        "add_province": "CEBU",
        "add_city": "CEBU CITY",
        "add_barangay": "SAN ROQUE (CIUDAD)",
        "sitio": "PALMA",
        "add_street": "R. PALMA",
        "add_external_sitio": ""
      }
    ]
  },
  "account": {
    "email": "kent.bryant2003@gmail.com",
    "password": "betaTrident1",
    "phone": "09056372257"
  },
  "livingSolo": {
    "householdNo": "HH-2510-4",
    "building": "renter",
    "indigenous": "no"
  },
  "staff": "00002250924"
}
```

### **Step 2: Check Error Response**

You should now see:
```
Error response data: { ... detailed error ... }
```

### **Step 3: Common Causes of 500 Error**

#### **Cause 1: Household Doesn't Exist**
```python
# Backend tries this:
Household.objects.get(hh_id="HH-2510-4")
# If household doesn't exist → DoesNotExist exception → 500 error
```

**Solution**: Verify the household exists in database:
```sql
SELECT * FROM profiling_household WHERE hh_id = 'HH-2510-4';
```

#### **Cause 2: Staff Member Doesn't Exist**
```python
staff = Staff.objects.filter(staff_id="00002250924").first()
# If None → NoneType error later → 500 error
```

**Solution**: Verify staff exists:
```sql
SELECT * FROM administration_staff WHERE staff_id = '00002250924';
```

#### **Cause 3: Sitio Doesn't Exist**
```python
sitio = Sitio.objects.filter(sitio_name="PALMA").first()
# If None → creates address with sitio=None
# Might cause issues if sitio is required
```

**Solution**: Verify sitio exists:
```sql
SELECT * FROM profiling_sitio WHERE sitio_name = 'PALMA';
```

#### **Cause 4: Address Format Issues**
The address object must have:
- `add_province` ✅
- `add_city` ✅
- `add_barangay` ✅
- `sitio` OR `add_external_sitio` ✅
- `add_street` ✅

#### **Cause 5: Capitalization Issues**
Backend might expect specific formats:
- Sex: "MALE" not "Male" ?
- Status: "SINGLE" not "Single" ?
- Religion: "ROMAN CATHOLIC" not "Roman Catholic" ?

### **Step 4: Test Different Scenarios**

#### **Scenario 1: Skip Household, Just Create Family**
Try registering WITHOUT selecting existing household:
- Account: Fill
- Personal: Fill
- House: Add 1 house
- Family: Select owned house → Create family

If this works, the issue is with existing household lookup.

#### **Scenario 2: Check Household ID Format**
Verify the household ID format:
- Should be exactly "HH-2510-4"
- No extra spaces
- Correct prefix "HH"

#### **Scenario 3: Minimal Registration**
Try with absolute minimum:
- Account: Fill
- Personal: Fill (1 address)
- House: Skip
- Family: Skip

If this works, add components one by one to find the issue.

### **Step 5: Backend Server Logs**

You need to check the Python server terminal for the actual error. Look for:

```python
Traceback (most recent call last):
  File "...", line X, in create_family
    hh = Household.objects.get(hh_id=household_no)
profiling.models.DoesNotExist: Household matching query does not exist.
```

Or:

```python
TypeError: 'NoneType' object has no attribute ...
```

Or:

```python
IntegrityError: NOT NULL constraint failed: ...
```

### **Step 6: Run Backend in Debug Mode**

In your Python server terminal:

```bash
cd server-1
python manage.py runserver 0.0.0.0:8000
```

Watch the console output when you submit the registration.

### **Step 7: Database Checks**

Run these SQL queries to verify data exists:

```sql
-- Check if household exists
SELECT * FROM profiling_household WHERE hh_id LIKE 'HH-2510%';

-- Check if staff exists
SELECT * FROM administration_staff WHERE staff_id = '00002250924';

-- Check all sitios
SELECT * FROM profiling_sitio;

-- Check recent registrations
SELECT * FROM profiling_residentprofile 
ORDER BY rp_date_registered DESC 
LIMIT 5;
```

---

## 🛠️ Quick Fixes to Try

### **Fix 1: Remove Staff ID Temporarily**

Comment out staff in payload:

```typescript
// if (user?.staff?.staff_id) {
//   payload.staff = user.staff.staff_id;
// }
```

If it works, the issue is with staff lookup.

### **Fix 2: Use Owned House Instead**

Instead of selecting existing household "HH-2510-4":
1. Add a house in Step 3
2. Select that owned house in Step 4

If it works, the issue is with existing household lookup.

### **Fix 3: Uppercase All Personal Fields**

```typescript
const capitalizedPersonal = {
  ...capitalizeAllFields(personalRest),
  per_sex: personalRest.per_sex?.toUpperCase(),
  per_status: personalRest.per_status?.toUpperCase(),
  per_religion: personalRest.per_religion?.toUpperCase(),
};
```

If it works, the issue is with field casing.

---

## 📋 Checklist

Run through this checklist:

- [ ] Payload structure matches web (use JSON.stringify to compare)
- [ ] per_addresses is a simple array, not nested object
- [ ] livingSolo doesn't have 'id' field
- [ ] householdNo is correct format ("HH-2510-4" or "0")
- [ ] Staff ID exists in database
- [ ] Household "HH-2510-4" exists in database (if using existing)
- [ ] Sitio "PALMA" exists in database
- [ ] Backend server is running
- [ ] No CORS errors
- [ ] Network connectivity is good

---

## 🎯 Next Steps

1. **Submit registration again** with improved logging
2. **Copy the full console output** including:
   - "Submitting registration payload: {...}"
   - "Error response data: {...}"
3. **Check Python server terminal** for error traceback
4. **Share those logs** so we can identify the exact issue

The enhanced logging will give us the exact error message from the backend, which will pinpoint the problem immediately!
