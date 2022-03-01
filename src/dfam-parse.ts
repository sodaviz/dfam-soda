import { DfamRecord, DfamSearchResults } from "./dfam-record";
import { DfamAnnConfig, DfamAnnotation } from "./dfam-annotation";
import { REPEAT_TYPE_MAP } from "./dfam-constants";

export interface DfamGraphicRenderParams {
  start: number;
  end: number;
  forward: DfamAnnotation[];
  reverse: DfamAnnotation[];
  simple: DfamAnnotation[];
}

export function parseDfamSearchResults(
  data: DfamSearchResults
): DfamGraphicRenderParams {
  let records: DfamRecord[] = data.hits;
  let simpleRecords: DfamRecord[] = data.tandem_repeats;
  let annConfigs: DfamAnnConfig[] = [];
  let id = 0;

  for (const rec of records) {
    let x: number;
    let w: number;
    if (rec.strand == "+") {
      x = rec.ali_start;
      w = rec.ali_end - rec.ali_start;
    } else {
      x = rec.ali_end;
      w = rec.ali_start - rec.ali_end;
    }

    let annConfig: DfamAnnConfig = {
      id: `${id++}`,
      start: x,
      width: w,
      row: 0,
      type: REPEAT_TYPE_MAP.get(rec.type) || "Unknown",
      modelName: rec.query,
      strand: rec.strand,
      rowId: rec.row_id,
    };
    annConfigs.push(annConfig);
  }

  for (const rec of simpleRecords) {
    let annConfig: DfamAnnConfig = {
      id: `${id++}`,
      start: rec.start,
      end: rec.end,
      row: 0,
      type: "Simple",
      // for simple records, the type field holds the repeated sequence
      modelName: rec.type,
      strand: "+",
      rowId: rec.row_id,
    };
    annConfigs.push(annConfig);
  }

  let annotations = annConfigs.map((conf) => new DfamAnnotation(conf));

  return {
    start: Math.min(...annotations.map((a) => a.start)),
    end: Math.max(...annotations.map((a) => a.end)),
    forward: annotations.filter(
      (a) => a.orientation == "+" && a.type !== "Simple"
    ),
    reverse: annotations.filter(
      (a) => a.orientation == "-" && a.type !== "Simple"
    ),
    simple: annotations.filter((a) => a.type == "Simple"),
  };
}
