export const REPEAT_TYPE_MAP: Map<string, string> = new Map([
  ["ARTEFACT", "Other TE"],
  ["DNA", "DNA Transposon"],
  ["LINE", "LINE"],
  ["LTR", "LTR"],
  ["Low_complexity", "None"],
  ["Other", "Unknown"],
  ["RC", "Other TE"],
  ["RNA", "RNA"],
  ["SINE", "SINE"],
  ["Satellite", "Satellite"],
  ["Simple_repeat", "None"],
  ["Unknown", "Unknown"],
  ["buffer", "Other TE"],
  ["rRNA", "RNA"],
  ["scRNA", "RNA"],
  ["snRNA", "RNA"],
  ["tRNA", "RNA"],
  ["Retroposon", "Other TE"],
  ["Segmental", "Other TE"],
  ["PLE", "Other TE"],
  ["DIRS", "Other TE"],
]);

export const REPEAT_TYPE_TO_COLOR: Map<string, string> = new Map([
  ["None", "#cccccc"],
  ["Other TE", "#3f6cbf"],
  ["LINE", "#739025"],
  ["SINE", "#AFD353"],
  ["LTR", "#3fbfb4"],
  ["DNA Transposon", "#bf793f"],
  ["Unknown", "#923fbf"],
  ["Satellite", "#b7a4e8"],
  ["RNA", "#bf3f41"],
  ["Simple", "#000000"],
]);

export const REPEAT_TYPES: string[] = Array.from(REPEAT_TYPE_TO_COLOR.keys());
export const REPEAT_COLORS: string[] = Array.from(
  REPEAT_TYPE_TO_COLOR.values()
);
