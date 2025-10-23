

interface MedicalRecordsProps {
  ncdRecords: any[]
  tbRecords: any[]
}

const MedicalRecords = ({ ncdRecords, tbRecords }: MedicalRecordsProps) => {
  return (
    <>
      {/* NCD Section */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2 bg-gray-200 p-1">NON-COMMUNICABLE DISEASE</h3>
        <table className="w-full border border-black text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-1">Pangalan</th>
              <th className="border-r border-black p-1">Edad</th>
              <th className="border-r border-black p-1">Kasarian</th>
              <th className="border-r border-black p-1">Risk Class (40+ years)</th>
              <th className="border-r border-black p-1">Comorbidities</th>
              <th className="border-r border-black p-1">Lifestyle Risk</th>
              <th className="p-1">In Maintenance</th>
            </tr>
          </thead>
          <tbody>
            {ncdRecords.map((ncd: any, index: number) => (
              <tr key={index} className="border-b border-black">
                <td className="border-r border-black p-1">{`${ncd.resident_info.personal_info.last_name}, ${ncd.resident_info.personal_info.first_name}`}</td>
                <td className="border-r border-black p-1 text-center">
                  {ncd.resident_info.personal_info.date_of_birth
                    ? new Date().getFullYear() - new Date(ncd.resident_info.personal_info.date_of_birth).getFullYear()
                    : ""}
                </td>
                <td className="border-r border-black p-1 text-center">{ncd.resident_info.personal_info.sex}</td>
                <td className="border-r border-black p-1 text-center">{ncd.health_data.risk_class_age_group}</td>
                <td className="border-r border-black p-1 text-center">{`${ncd.health_data.comorbidities || ''}${ncd.health_data.comorbidities_others ? ` (${ncd.health_data.comorbidities_others})` : ''}`}</td>
                <td className="border-r border-black p-1 text-center">{`${ncd.health_data.lifestyle_risk || ''}${ncd.health_data.lifestyle_risk_others ? ` (${ncd.health_data.lifestyle_risk_others})` : ''}`}</td>
                <td className="p-1 text-center">{
                  (() => {
                    const maintenance = ncd.health_data.in_maintenance
                    if (maintenance === true || maintenance === "true" || maintenance === "YES") return "YES"
                    if (maintenance === false || maintenance === "false" || maintenance === "NO") return "NO"
                    return maintenance || ""
                  })()
                }</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 3 - ncdRecords.length) }).map((_, i) => (
              <tr key={`ncd-empty-${i}`} className="border-b border-black">
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="p-1">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TB Surveillance Section */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2 bg-gray-200 p-1">TUBERCULOSIS SURVEILLANCE</h3>
        <table className="w-full border border-black text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-1">Pangalan</th>
              <th className="border-r border-black p-1">Edad</th>
              <th className="border-r border-black p-1">Kasarian (M/F)</th>
              <th className="border-r border-black p-1">Source of Anti-TB Meds</th>
              <th className="border-r border-black p-1">No. of Days on Anti-TB Meds</th>
              <th className="p-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {tbRecords.map((tb: any, index: number) => (
              <tr key={index} className="border-b border-black">
                <td className="border-r border-black p-1">{`${tb.resident_info.personal_info.last_name}, ${tb.resident_info.personal_info.first_name}`}</td>
                <td className="border-r border-black p-1 text-center">
                  {tb.resident_info.personal_info.date_of_birth
                    ? new Date().getFullYear() - new Date(tb.resident_info.personal_info.date_of_birth).getFullYear()
                    : ""}
                </td>
                <td className="border-r border-black p-1 text-center">{tb.resident_info.personal_info.sex}</td>
                <td className="border-r border-black p-1 text-center">{tb.health_data.src_anti_tb_meds}</td>
                <td className="border-r border-black p-1 text-center">{tb.health_data.no_of_days_taking_meds}</td>
                <td className="p-1 text-center">{tb.health_data.tb_status}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 3 - tbRecords.length) }).map((_, i) => (
              <tr key={`tb-empty-${i}`} className="border-b border-black">
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="p-1">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default MedicalRecords