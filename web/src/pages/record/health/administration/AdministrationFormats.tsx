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