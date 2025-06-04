// export function getTextareaWidth(paperSize: string) {
//   // Page widths in points
//   const pageWidths: Record<string, number> = {
//     a4: 595,
//     letter: 612,
//     legal: 612
//   };

//   const marginPt = 72 * 2; // 1 inch margin on each side
//   const contentWidthPt = (pageWidths[paperSize] || pageWidths.a4) - marginPt;
  
//   // Convert points to pixels (1pt ≈ 1.333px at 96dpi)
//   return Math.floor(contentWidthPt * 1.333);
// }




//BEFORE THE DYNAMIC MARGIN
// export function getTextareaWidth(paperSize: string) {
//   // Page widths in points (from jsPDF source)
//   const pageWidths: Record<string, number> = {
//     a4: 595.28,    // More precise A4 width
//     letter: 612,    // 8.5 * 72
//     legal: 612      // 8.5 * 72
//   };

//   const marginPt = 72 * 2; // 1 inch margins
//   const contentWidthPt = (pageWidths[paperSize] || pageWidths.a4) - marginPt;
  
//   // Precision conversion with 3% buffer
//   return Math.floor(contentWidthPt * (4/3) * 1.03);
// }



export function getTextareaWidth(paperSize: string, marginType: string = 'normal') {
  // Page widths in points (from jsPDF source)
  const pageWidths: Record<string, number> = {
    a4: 595.28,    // More precise A4 width
    letter: 612,    // 8.5 * 72
    legal: 612      // 8.5 * 72
  };

  // Margin sizes in points (1 inch = 72 points)
  const marginSizes: Record<string, number> = {
    normal: 72,     // 1 inch
    narrow: 36      // 0.5 inch
  };

  const marginPt = marginSizes[marginType] || marginSizes.normal;
  const totalMargin = marginPt * 2; // Left and right margins
  const contentWidthPt = (pageWidths[paperSize] || pageWidths.a4) - totalMargin;
  
  // Conversion from points to pixels (4/3 ratio is standard, with 3% buffer)
  return Math.floor(contentWidthPt * (4/3) * 1.03);
}
