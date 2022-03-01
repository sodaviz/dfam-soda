/**
 * An interface to match the results JSON returned by a query to the Dfam API
 */
export interface DfamSearchResults {
  hits: DfamRecord[];
  tandem_repeats: DfamRecord[];
}

/**
 * An interface to match the individual record JSONs that live inside the DfamSearchResults
 */
export interface DfamRecord {
  accession: string;
  bit_score: number;
  e_value: number;
  model_start: number;
  model_end: number;
  strand: string;
  ali_start: number;
  ali_end: number;
  start: number;
  end: number;
  seq_start: number;
  seq_end: number;
  sequence: string;
  query: string;
  type: string;
  row_id: string;
}
