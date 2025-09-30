// Format sitio for select tag
export const formatSitio = (sitio: any) => {
  if (!sitio) return [];

  return sitio.map(
    (item: { sitio_id: string; sitio_name: string }) => ({
      label: item.sitio_name,
      value: item.sitio_name,
    })
  );
};