import * as soda from "@sodaviz/soda";

export interface DfamAnnConfig extends soda.AnnotationConfig {
  type: string;
  modelName: string;
  strand: string;
  rowId: string;
}

export class DfamAnnotation extends soda.Annotation {
  // the type of annotations we are drawing
  readonly type: string;
  // TE classification names
  readonly modelName: string;
  readonly orientation: soda.Orientation;
  // provides us a means to select the corresponding row
  // in the table that lists the annotations
  readonly rowId: string;

  constructor(config: DfamAnnConfig) {
    super(config);
    this.type = config.type;
    this.modelName = config.modelName;
    if (config.strand == "+") {
      this.orientation = soda.Orientation.Forward;
    } else {
      this.orientation = soda.Orientation.Reverse;
    }
    this.rowId = config.rowId;
  }
}
