export const REGIONS = [
  { value: "mg", label: "Minas Gerais", coords: [-44.55503, -18.51218] }, // [lng, lat]
  { value: "sp", label: "São Paulo", coords: [-46.633309, -23.55052] },
  { value: "pe", label: "Pernambuco", coords: [-34.881256, -8.047562] },
  { value: "rj", label: "Rio de Janeiro", coords: [-43.172896, -22.906847] },
];

export const getRegionByValue = (value: string) => {
  return REGIONS.find((region) => region.value === value);
};
