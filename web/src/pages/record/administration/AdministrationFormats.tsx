// Format positions for searching
export const formatPositions = (positions: any) => {
  if (!positions) return [];

  const positionList = positions.map(
    (item: { pos_id: string; pos_title: string }) => ({
      id: String(item.pos_id),
      name: item.pos_title,
    })
  );

  return positionList;
};

export const formatPositionGroups = (groups: any) => {
  if(!groups) return [];

  return groups.map((group: any) => ({
    id: group.toLowerCase(),
    name: group
  }))
}