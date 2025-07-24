// Report type formatter
export const formatReportType = (reportType: any) => {
  if(!reportType) return [];

  return reportType.map((rt: any) => ({
      label: rt.rt_label,
      value: rt.rt_label.toLowerCase()
  }))
}