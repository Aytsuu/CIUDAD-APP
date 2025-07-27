import React from "react";

export const useRequestExpiration = (date: string) => {
  const calculateRemainingTime = React.useMemo(() => {
    if (!date) return { days: 7, hours: 0 }; // Default to 7 days if no creation date
    const createdDate = new Date(date);
    const currentDate = new Date();
    const expirationDate = new Date(createdDate);
    expirationDate.setDate(createdDate.getDate() + 7); // Add 7 days to creation date

    const timeDiff = expirationDate.getTime() - currentDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const hoursDiff = Math.floor(
      (timeDiff % (1000 * 3600 * 24)) / (1000 * 3600)
    );

    return {
      days: Math.max(0, daysDiff),
      hours: Math.max(0, hoursDiff),
      isExpired: timeDiff <= 0,
    };
  }, [date]);

  const getExpirationMessage = React.useMemo(() => {
    const { days, hours, isExpired } = calculateRemainingTime;

    if (isExpired) {
      return "This request has expired and will be archived.";
    }

    if (days < 1) {
      if (hours === 1) {
        return "This request will automatically expire and be archived after 1 hour if not approved.";
      } else if (hours === 0) {
        return "This request will expire very soon if not approved.";
      } else {
        return `This request will automatically expire and be archived after ${hours} hours if not approved.`;
      }
    } else if (days === 1) {
      return "This request will automatically expire and be archived after 1 day if not approved.";
    } else {
      return `This request will automatically expire and be archived after ${days} days if not approved.`;
    }
  }, [calculateRemainingTime]);

  const getExpirationColor = React.useMemo(() => {
    const { days, hours, isExpired } = calculateRemainingTime;

    if (isExpired || (days < 1 && hours <= 2)) {
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-500",
        title: "text-red-800",
        text: "text-red-700",
      };
    } else if (days < 1 || days === 1) {
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: "text-orange-500",
        title: "text-orange-800",
        text: "text-orange-700",
      };
    } else if (days <= 3) {
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "text-amber-500",
        title: "text-amber-800",
        text: "text-amber-700",
      };
    } else {
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "text-blue-500",
        title: "text-blue-800",
        text: "text-blue-700",
      };
    }
  }, [calculateRemainingTime]);

  // Update the status display in the JSX
  const getStatusDisplay = React.useMemo(() => {
    const { days, hours, isExpired } = calculateRemainingTime;

    if (isExpired) {
      return "EXPIRED";
    } else if (days < 1) {
      if (hours === 0) {
        return "EXPIRES VERY SOON";
      } else if (hours === 1) {
        return "EXPIRES IN 1 HOUR";
      } else {
        return `EXPIRES IN ${hours} HOURS`;
      }
    } else if (days === 1) {
      return "EXPIRES TODAY";
    } else {
      return null; // Don't show status for longer periods
    }
  }, [calculateRemainingTime]);


  return {
    calculateRemainingTime,
    getExpirationMessage,
    getExpirationColor,
    getStatusDisplay
  }
};
