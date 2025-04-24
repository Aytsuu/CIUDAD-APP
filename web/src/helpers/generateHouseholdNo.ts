

export const generateHouseholdNo = async () => {
    const householdList = []
    const nextVal = householdList.length + 1
    const houseNo = 'HH-' + Intl.NumberFormat('en-US', {minimumIntegerDigits: 5, useGrouping: false}).format(nextVal)
    return houseNo
}