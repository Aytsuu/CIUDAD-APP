# Registration Testing Guide

## Quick Start Testing

### **Prerequisites**
1. ✅ Backend server running at `http://192.168.1.3:8000`
2. ✅ Mobile app running on device/emulator
3. ✅ User logged in with staff account
4. ✅ Network connectivity between mobile and server

---

## Test Scenario 1: Complete Registration (All Steps)

### **Steps:**
1. Navigate to Health Profiling → Resident Registration
2. **Step 1 - Account**:
   - Email: `testuser@example.com`
   - Phone: `09123456789`
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
   - Click **Next**
   
3. **Step 2 - Personal**:
   - First Name: `Juan`
   - Last Name: `Dela Cruz`
   - Middle Name: `Santos`
   - Date of Birth: `1990-01-15`
   - Sex: `MALE`
   - Marital Status: `SINGLE`
   - Religion: `ROMAN CATHOLIC`
   - Phone: `09123456789`
   - Add Address:
     - Province: `CEBU`
     - City: `CEBU CITY`
     - Barangay: `SAN ROQUE (CIUDAD)`
     - Sitio: `HEAVEN`
     - Street: `MAIN STREET`
   - Click **Next**

4. **Step 3 - House**:
   - NHTS: `NO`
   - Address: Select from Step 2 addresses
   - Click **Add Household**
   - Verify house appears in list
   - Click **Next**

5. **Step 4 - Family**:
   - Select **Living Solo**
   - Select owned house from dropdown
   - Building Type: `owner` (auto-filled)
   - Household Occupancy: `Owner`
   - Indigenous: `NO`
   - Click **Next**

6. **Completion Screen**:
   - Verify all steps show checkmarks
   - Click **Register**

### **Expected Results:**
- ✅ Green toast: "Registration completed successfully!"
- ✅ Toast auto-dismisses after 4 seconds
- ✅ Navigates back to profiling home after 1.5 seconds
- ✅ Form completely reset
- ✅ Database records created:
  - Personal record with capitalized names
  - Address record
  - PersonalAddress junction
  - ResidentProfile with RP-ID (e.g., `RP-2025-0001`)
  - Account with hashed password
  - Household with HH-ID (e.g., `HH-00001`)
  - Family with FAM-ID (e.g., `FAM-0001`)
  - FamilyComposition with role "INDEPENDENT"

---

## Test Scenario 2: Minimal Registration (Required Only)

### **Steps:**
1. **Step 1 - Account**: Fill all required fields → Next
2. **Step 2 - Personal**: Fill all required fields + 1 address → Next
3. **Step 3 - House**: Skip (click Skip button)
4. **Step 4 - Family**:
   - Select **Existing Family**
   - Search for existing family (e.g., type "DELA")
   - Select family from dropdown
   - Role: `Son`
   - Click **Next**
5. **Completion Screen**: Click **Register**

### **Expected Results:**
- ✅ Success toast appears
- ✅ Database records:
  - Personal, Address, PersonalAddress, ResidentProfile, Account
  - FamilyComposition linking to existing family
  - NO Household created (skipped)
  - NO new Family created (joined existing)

---

## Test Scenario 3: Living Solo with Existing Household

### **Steps:**
1. Complete Steps 1-2 as normal
2. **Step 3 - House**: Skip
3. **Step 4 - Family**:
   - Select **Living Solo**
   - Toggle to **Existing Households**
   - Search for household (e.g., type "HH-000")
   - Select household from green badge dropdown
   - Household Occupancy: `Renter`
   - Indigenous: `NO`
   - Click **Next**
4. **Completion Screen**: Click **Register**

### **Expected Results:**
- ✅ Success toast
- ✅ New Family created linked to selected existing household
- ✅ FamilyComposition with role "INDEPENDENT"
- ✅ Building type set to "renter"

---

## Test Scenario 4: Error Handling

### **Test 4A: Network Error**
1. Turn off backend server
2. Complete registration steps
3. Click **Register**

**Expected**:
- ❌ Red toast: "Network Error" or "Failed to connect"
- ❌ Form data persists
- ❌ Submit button re-enabled

### **Test 4B: Duplicate Account**
1. Register user with email `duplicate@example.com`
2. Try to register another user with same email
3. Click **Register**

**Expected**:
- ❌ Red toast with backend error message
- ❌ Form data persists
- ❌ Can retry with different email

### **Test 4C: Invalid Data**
1. Fill form with invalid phone (e.g., "123")
2. Try to proceed

**Expected**:
- ❌ Validation error shown inline
- ❌ Cannot proceed to next step
- ❌ Submit button disabled

---

## Test Scenario 5: Skip Functionality

### **Test 5A: Skip Account**
1. Step 1: Click **Skip** immediately
2. Complete Steps 2-4
3. Click **Register**

**Expected**:
- ⚠️ Should work IF form allows skipping account
- ✅ OR show validation error requiring account
- Check `canSubmit` logic to confirm

### **Test 5B: Skip House**
1. Complete Steps 1-2
2. Step 3: Click **Skip**
3. Step 4: Must complete (either Solo or Family)
4. Click **Register**

**Expected**:
- ✅ Success (House is optional if Family completed)

### **Test 5C: Skip Both House and Family**
1. Complete Steps 1-2
2. Step 3: Click **Skip**
3. Step 4: Click **Skip**
4. Completion Screen: Submit button status?

**Expected**:
- ❌ Submit button disabled
- ❌ Message: "Must complete at least House or Family"

---

## Test Scenario 6: Multi-Address & Multi-House

### **Steps:**
1. **Step 2 - Personal**:
   - Add 3 different addresses
   - Verify all show in list
   
2. **Step 3 - House**:
   - Add house with Address 1 (NHTS: YES)
   - Add house with Address 2 (NHTS: NO)
   - Add house with Address 3 (NHTS: YES)
   - Verify all 3 houses in list

3. **Step 4 - Family**:
   - Select **Living Solo**
   - Choose owned house from dropdown (should show all 3)
   - Select House #0 (first house)
   - Complete and submit

### **Expected Results:**
- ✅ All 3 addresses created
- ✅ All 3 households created with HH-IDs
- ✅ Family linked to first household (index 0)
- ✅ Each house has correct NHTS status

---

## Test Scenario 7: Special Characters & Edge Cases

### **Test 7A: Names with Special Characters**
```
First Name: "María José"
Last Name: "Del Rosario-Santos"
Middle Name: "O'Brien"
```

**Expected**:
- ✅ Capitalization works correctly
- ✅ Special characters preserved
- ✅ Hyphens and apostrophes maintained

### **Test 7B: Long Text**
```
First Name: "Verylongnamethatexceedsnormallimits"
Street: "Very Long Street Name That Goes On And On..."
```

**Expected**:
- ✅ Saved correctly
- ✅ No truncation (unless DB field limit)

### **Test 7C: Empty Optional Fields**
```
Middle Name: (empty)
Suffix: (empty)
Disability: (empty)
```

**Expected**:
- ✅ Null or empty string saved
- ✅ No validation errors

---

## Debugging Checklist

### **If Submit Fails:**

1. **Check Console Logs**:
   ```typescript
   console.log("Submitting registration payload:", payload);
   console.log("Registration response:", response.data);
   console.error("Registration failed:", error);
   ```

2. **Verify API Endpoint**:
   - Open browser: `http://192.168.1.3:8000/profiling/complete/registration/`
   - Should show Django REST browsable API

3. **Check Network Tab** (if using browser debugger):
   - Request URL correct?
   - Request payload structure correct?
   - Response status code? (200 = success)
   - Response body contains error details?

4. **Verify Backend Logs**:
   ```bash
   # In server-1 terminal
   python manage.py runserver 0.0.0.0:8000
   # Watch for POST requests and errors
   ```

5. **Check Database**:
   ```sql
   -- Check if records created
   SELECT * FROM profiling_residentprofile ORDER BY rp_date_registered DESC LIMIT 5;
   SELECT * FROM profiling_personal ORDER BY per_id DESC LIMIT 5;
   SELECT * FROM account_account ORDER BY id DESC LIMIT 5;
   ```

---

## Performance Testing

### **Test P1: Rapid Submissions**
1. Complete registration
2. Immediately start new registration
3. Submit quickly
4. Repeat 5 times

**Expected**:
- ✅ All submissions succeed
- ✅ No race conditions
- ✅ Each gets unique IDs
- ✅ No duplicate records

### **Test P2: Large Payload**
1. Add 10 addresses
2. Add 10 houses
3. Submit

**Expected**:
- ✅ Submission succeeds
- ✅ Reasonable time (<5 seconds)
- ✅ All records created

---

## Security Testing

### **Test S1: SQL Injection Attempt**
```
First Name: "'; DROP TABLE users; --"
```

**Expected**:
- ✅ Treated as literal string
- ✅ No database damage
- ✅ Django ORM prevents injection

### **Test S2: XSS Attempt**
```
First Name: "<script>alert('XSS')</script>"
```

**Expected**:
- ✅ Escaped on display
- ✅ No script execution
- ✅ Stored safely

---

## Success Metrics

After all tests pass:

- ✅ 100% submission success rate
- ✅ All database records created correctly
- ✅ Toast notifications appear for all outcomes
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Form resets properly
- ✅ Navigation works smoothly
- ✅ Data capitalization correct
- ✅ Error messages helpful
- ✅ Staff ID tracked correctly

---

## Known Limitations

1. **Business Registration**: Not yet implemented in mobile
2. **File Uploads**: Not available for business documents
3. **Offline Mode**: Requires active network connection
4. **Progress Saving**: No draft/resume functionality
5. **Validation**: Client-side only (backend also validates)

---

## Next Steps After Testing

1. Fix any bugs discovered
2. Add automated tests (Jest/React Native Testing Library)
3. Implement offline queue for submissions
4. Add analytics tracking
5. Improve error messages based on user feedback
6. Add confirmation dialogs for destructive actions
7. Implement business registration step
8. Add file upload capability
9. Create admin dashboard for monitoring
10. Set up error logging service (Sentry)

---

## Support

If you encounter issues:
1. Check this testing guide
2. Review `REGISTRATION_SUBMISSION.md` for detailed implementation
3. Check console logs for errors
4. Verify backend server status
5. Test with minimal data first
6. Escalate to development team with:
   - Screenshots
   - Console logs
   - Steps to reproduce
   - Expected vs actual behavior
