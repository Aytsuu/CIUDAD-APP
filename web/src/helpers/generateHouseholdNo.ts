import { getHouseholds } from "@/pages/record/profiling/restful-api/profilingGetAPI"

export const generateHouseholdNo = async () => {
    const householdList = await getHouseholds()
    const nextVal = householdList.length + 1
    const houseNo = 'HH-' + Intl.NumberFormat('en-US', {minimumIntegerDigits: 5, useGrouping: false}).format(nextVal)
    return houseNo
}