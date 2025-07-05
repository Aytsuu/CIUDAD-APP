export interface AgeCalculation {
    totalDays: number
    totalWeeks: number
    totalMonths: number
    months: number
    days: number
    weeks: number
    remainingDaysAfterWeeks: number
    remainingDaysAfterMonths: number
    ageString: string
  }
  
  export function calculateAgeFromDOB(dob: string | Date, referenceDate?: string | Date): AgeCalculation {
    const birthDate = new Date(dob)
    const currentDate = referenceDate ? new Date(referenceDate) : new Date()
  
    // Ensure we're working with valid dates
    if (isNaN(birthDate.getTime()) || isNaN(currentDate.getTime())) {
      return {
        totalDays: 0,
        totalWeeks: 0,
        totalMonths: 0,
        months: 0,
        days: 0,
        weeks: 0,
        remainingDaysAfterWeeks: 0,
        remainingDaysAfterMonths: 0,
        ageString: "Invalid date",
      }
    }
  
    // Calculate total days
    const timeDifference = currentDate.getTime() - birthDate.getTime()
    const totalDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
  
    // Calculate total weeks and remaining days after weeks
    const totalWeeks = Math.floor(totalDays / 7)
    const remainingDaysAfterWeeks = totalDays % 7
  
    // Calculate months more accurately
    let totalMonths = 0
    const tempDate = new Date(birthDate)
  
    while (tempDate < currentDate) {
      tempDate.setMonth(tempDate.getMonth() + 1)
      if (tempDate <= currentDate) {
        totalMonths++
      }
    }
  
    // Calculate remaining days after full months
    const lastFullMonthDate = new Date(birthDate)
    lastFullMonthDate.setMonth(lastFullMonthDate.getMonth() + totalMonths)
    const remainingDaysAfterMonths = Math.floor(
      (currentDate.getTime() - lastFullMonthDate.getTime()) / (1000 * 60 * 60 * 24),
    )
  
    // Create age string with improved formatting
    let ageString = ""
  
    if (totalMonths >= 24) {
      // 2+ years: show years and months
      const years = Math.floor(totalMonths / 12)
      const months = totalMonths % 12
      if (months > 0) {
        ageString = `${years} year${years > 1 ? "s" : ""} and ${months} month${months > 1 ? "s" : ""}`
      } else {
        ageString = `${years} year${years > 1 ? "s" : ""}`
      }
    } else if (totalMonths >= 6) {
      // 6-24 months: show months and days
      if (remainingDaysAfterMonths > 0) {
        ageString = `${totalMonths} month${totalMonths > 1 ? "s" : ""} and ${remainingDaysAfterMonths} day${remainingDaysAfterMonths > 1 ? "s" : ""}`
      } else {
        ageString = `${totalMonths} month${totalMonths > 1 ? "s" : ""}`
      }
    } else if (totalWeeks >= 2) {
      // 2+ weeks: show weeks and days
      if (remainingDaysAfterWeeks > 0) {
        ageString = `${totalWeeks} week${totalWeeks > 1 ? "s" : ""} and ${remainingDaysAfterWeeks} day${remainingDaysAfterWeeks > 1 ? "s" : ""}`
      } else {
        ageString = `${totalWeeks} week${totalWeeks > 1 ? "s" : ""}`
      }
    } else if (totalDays >= 7) {
      // 1 week: show as "1 week and X days" or just "1 week"
      const weeks = Math.floor(totalDays / 7)
      const days = totalDays % 7
      if (days > 0) {
        ageString = `${weeks} week and ${days} day${days > 1 ? "s" : ""}`
      } else {
        ageString = `${weeks} week`
      }
    } else {
      // Less than 1 week: show days only
      ageString = `${totalDays} day${totalDays > 1 ? "s" : ""}`
    }
  
    return {
      totalDays,
      totalWeeks,
      totalMonths,
      months: totalMonths,
      days: remainingDaysAfterMonths,
      weeks: totalWeeks,
      remainingDaysAfterWeeks,
      remainingDaysAfterMonths,
      ageString,
    }
  }
  
  export function getAgeInMonthsOnly(dob: string | Date, referenceDate?: string | Date): number {
    const age = calculateAgeFromDOB(dob, referenceDate)
    return age.totalMonths
  }
  
  export function getAgeInWeeksOnly(dob: string | Date, referenceDate?: string | Date): number {
    const age = calculateAgeFromDOB(dob, referenceDate)
    return age.totalWeeks
  }
  
  export function getAgeInDaysOnly(dob: string | Date, referenceDate?: string | Date): number {
    const age = calculateAgeFromDOB(dob, referenceDate)
    return age.totalDays
  }
  
  export function formatAgeForDisplay(dob: string | Date, referenceDate?: string | Date): string {
    const age = calculateAgeFromDOB(dob, referenceDate)
    return age.ageString
  }
  
  // Helper function to get age in weeks and days format specifically
  export function getAgeInWeeksAndDays(
    dob: string | Date,
    referenceDate?: string | Date,
  ): {
    weeks: number
    days: number
    formatted: string
  } {
    const age = calculateAgeFromDOB(dob, referenceDate)
  
    const formatted =
      age.remainingDaysAfterWeeks > 0
        ? `${age.totalWeeks} week${age.totalWeeks > 1 ? "s" : ""} and ${age.remainingDaysAfterWeeks} day${age.remainingDaysAfterWeeks > 1 ? "s" : ""}`
        : `${age.totalWeeks} week${age.totalWeeks > 1 ? "s" : ""}`
  
    return {
      weeks: age.totalWeeks,
      days: age.remainingDaysAfterWeeks,
      formatted,
    }
  }
  
  // Helper function to determine the best age unit for nutritional calculations
  export function getBestAgeUnitForNutrition(
    dob: string | Date,
    referenceDate?: string | Date,
  ): {
    value: number
    unit: "days" | "weeks" | "months"
    displayString: string
  } {
    const age = calculateAgeFromDOB(dob, referenceDate)
  
    if (age.totalMonths >= 6) {
      return {
        value: age.totalMonths,
        unit: "months",
        displayString:
          age.remainingDaysAfterMonths > 0
            ? `${age.totalMonths} months and ${age.remainingDaysAfterMonths} days`
            : `${age.totalMonths} months`,
      }
    } else if (age.totalWeeks >= 2) {
      return {
        value: age.totalWeeks,
        unit: "weeks",
        displayString:
          age.remainingDaysAfterWeeks > 0
            ? `${age.totalWeeks} weeks and ${age.remainingDaysAfterWeeks} days`
            : `${age.totalWeeks} weeks`,
      }
    } else {
      return {
        value: age.totalDays,
        unit: "days",
        displayString: `${age.totalDays} days`,
      }
    }
  }
  
  // Simple helper to get just the age string
  export function getAgeString(dob: string | Date, referenceDate?: string | Date): string {
    const age = calculateAgeFromDOB(dob, referenceDate)
    return age.ageString
  }
  