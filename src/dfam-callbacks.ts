import { DfamAnnotationsGraphic } from "./dfam-annotations-graphic";
import { DfamSearchResults } from "./dfam-records";

export interface DfamQuery {
  start: number;
  end: number;
  chr: string;
  nrph: boolean;
}

export async function renderGraphic(
  graphic: DfamAnnotationsGraphic,
  query: DfamQuery
): Promise<void> {
  let response = await fetch(
    `https://www.dfam.org/api/annotations?assembly=hg38&chrom=${query.chr}&start=${query.start}&end=${query.end}&family=&nrph=${query.nrph}`
  )
    .then((data) => data.text())
    .then((res: string) => res);

  let searchResults: DfamSearchResults = JSON.parse(response);
  graphic.render(searchResults);
}
