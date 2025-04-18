export const formatQuantityString = (
    quantity: number,
    unit: string,
    pcsPerBox?: number
  ): string => {
    if (unit === "boxes" && pcsPerBox) {
      const boxText = quantity === 1 ? "box" : "boxes";
      return `${quantity} ${boxText} (${quantity * pcsPerBox} pcs total)`;
    }
    const unitText = quantity === 1 ? unit.replace(/s$/, "") : unit;
    return `${quantity} ${unitText}`;
  };