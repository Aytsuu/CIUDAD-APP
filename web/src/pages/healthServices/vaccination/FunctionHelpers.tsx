export const calculateNextVisitDate = (
    interval: number,
    timeUnit: string,
    createdDate: string
  ): Date => {
    const date = new Date(createdDate);

    switch (timeUnit.toLowerCase()) {
      case "days":
        date.setDate(date.getDate() + interval);
        break;
      case "weeks":
        date.setDate(date.getDate() + interval * 7);
        break;
      case "months":
        date.setMonth(date.getMonth() + interval);
        break;
      case "years":
        date.setFullYear(date.getFullYear() + interval);
        break;
      default:
        // If time unit is not recognized, return the same date
        break;
    }

    return date;
  };


  export const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };
