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



export function getTextareaWidth(paperSize: string) {
  // Page widths in points (from jsPDF source)
  const pageWidths: Record<string, number> = {
    a4: 595.28,    // More precise A4 width
    letter: 612,    // 8.5 * 72
    legal: 612      // 8.5 * 72
  };

  const marginPt = 72 * 2; // 1 inch margins
  const contentWidthPt = (pageWidths[paperSize] || pageWidths.a4) - marginPt;
  
  // Precision conversion with 3% buffer
  return Math.floor(contentWidthPt * (4/3) * 1.03);
}
