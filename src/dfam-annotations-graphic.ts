import * as d3 from "d3";
import * as soda from "@sodaviz/soda";
import {DfamAnnotation, DfamSearchResults} from "./dfam-records";
import {REPEAT_COLORS, REPEAT_TYPE_MAP, REPEAT_TYPE_TO_COLOR, REPEAT_TYPES} from "./dfam-constants";

export interface DfamAnnotationGraphicConfig {
  selector: string;
  data?: DfamSearchResults;
  rowHeight?: number;
  zoomConstraint?: [number, number];
  domainConstraint?: (chart: soda.Chart<any>) => [number, number];
}

export interface DfamGraphicRenderParams {
  start: number;
  end: number;
  forward: DfamAnnotation[];
  reverse: DfamAnnotation[];
  simple: DfamAnnotation[];
}

let colorScale = d3.scaleOrdinal(REPEAT_COLORS).domain(REPEAT_TYPES);

interface DfamRenderParams extends soda.RenderParams {
  annotations: DfamAnnotation[];
}

export class DfamAnnotationsGraphic {
  data?: DfamSearchResults;
  forwardChart: soda.Chart<any>;
  reverseChart: soda.Chart<any>;
  simpleChart: soda.Chart<any>;
  zoomSyncer = new soda.ZoomSyncer();

  constructor(config: DfamAnnotationGraphicConfig) {
    let chartConf: soda.ChartConfig<any> = {
      selector: config.selector,
      zoomConstraint: config.zoomConstraint,
      domainConstraint: config.domainConstraint,
      rowHeight: config.rowHeight,
      zoomable: true,
      upperPadSize: 2,
      lowerPadSize: 2,
    };

    let draw = function (
      this: soda.Chart<DfamRenderParams>,
      params: DfamRenderParams
    ): void {
      this.addAxis();
      soda.rectangle({
        chart: this,
        annotations: params.annotations || [],
        selector: "dfam-ann",
        strokeWidth: 4,
        strokeOpacity: 0,
        strokeColor: (d) => colorScale(d.a.type),
        fillColor: (d) => colorScale(d.a.type),
      });

      soda.hoverBehavior({
        annotations: params.annotations,
        chart: this,
        mouseout: (s) => {
          s.style("stroke-opacity", 0);
        },
        mouseover: (s) => {
          s.style("stroke-opacity", 0.5);
        },
      });

      soda.tooltip({
        annotations: params.annotations,
        chart: this,
        text: (d) =>
          `${d.a.modelName} (${d.a.type}): ${d.a.start}-${d.a.end}`,
        opacity: () => 1.0,
      });

      soda.clickBehavior({
        annotations: params.annotations,
        chart: this,
        click: (s, d) => {
          const rowSelection = d3.select<HTMLElement, any>(`#${d.a.rowId}`);
          const rowElement = rowSelection.node();
          if (rowElement == undefined) {
            throw `Table row element on ${d.a.id} is null or undefined`;
          } else {
            rowElement.scrollIntoView(false);
            rowSelection.style("background-color", "yellow");
            rowSelection
              .transition()
              .duration(2000)
              .style("background-color", null);
          }
        },
      });
    };

    this.forwardChart = new soda.Chart({
      ...chartConf,
      upperPadSize: 25,
      axisType: soda.AxisType.Bottom,
      updateLayout(params) {
        let layout = soda.intervalGraphLayout(params.annotations);
        for (const ann of params.annotations) {
          layout.rowMap.set(ann.id, layout.rowCount - layout.rowMap.get(ann.id)! - 1)
        }
        this.layout = layout
      },
      draw
    });

    this.simpleChart = new soda.Chart({
      ...chartConf,
      rowColors: ["#ddd"],
      rowOpacity: 1,
      draw
    });

    this.reverseChart = new soda.Chart({
      ...chartConf,
      draw
    });

    d3.select(config.selector).append("span").attr("id", "soda-legend");

    this.zoomSyncer.add([
      this.forwardChart,
      this.reverseChart,
      this.simpleChart,
    ]);

    if (config.data) {
      this.render(config.data);
    }
  }

  public resize(): void {
    this.forwardChart.resize();
    this.reverseChart.resize();
    this.simpleChart.resize();
  }

  public render(data: DfamSearchResults): void {
    if (data !== this.data) {
      this.data = data;
      let parsedResults = parseDfamSearchResults(data);
      this.forwardChart.render({
        annotations: parsedResults.forward,
        start: parsedResults.start,
        end: parsedResults.end,
      });

      this.reverseChart.render({
        annotations: parsedResults.reverse,
        start: parsedResults.start,
        end: parsedResults.end,
      });

      this.simpleChart.render({
        annotations: parsedResults.simple,
        start: parsedResults.start,
        end: parsedResults.end,
      });

      this.drawLegend();
    }
  }


  public drawLegend(): void {
    const legendSelection = d3
      .select("#soda-legend")
      .style("border", "1.5px solid black")
      .style("border-radius", "4px");

    const legendEnter = legendSelection
      .selectAll("span")
      .data(REPEAT_TYPES)
      .enter();

    const legendSpans = legendEnter
      .append("span")
      .style("margin", "0.5em")
      .style("display", "inline-block");

    legendSpans
      .append("svg")
      .style("margin-right", "0.5em")
      .attr("width", 10)
      .attr("height", 10)
      .append("rect")
      .style("fill", (d) => REPEAT_TYPE_TO_COLOR.get(d)!)
      .style("stroke", "black")
      .attr("width", 10)
      .attr("height", 10);

    legendSpans.append("span").html((d) => d);
  }
}

function parseDfamSearchResults(data: DfamSearchResults): DfamGraphicRenderParams {
  let id = 0;
  let annotations: DfamAnnotation[] = data.hits.map((rec) => {
    return {
      id: `dfam-${id++}`,
      start: rec.ali_start < rec.ali_end ? rec.ali_start : rec.ali_end,
      end: rec.ali_end > rec.ali_start ? rec.ali_end : rec.ali_start,
      type: REPEAT_TYPE_MAP.get(rec.type) || "Unknown",
      modelName: rec.query,
      strand: rec.strand,
      rowId: rec.row_id,
    }
  })
  let simple = data.tandem_repeats.map((rec) => {
    return {
      id: `dfam-${id++}`,
      start: rec.start,
      end: rec.end,
      type: "Simple",
      modelName: rec.type,
      strand: rec.strand,
      rowId: rec.row_id,
    }   
  }) 
  
  let params: DfamGraphicRenderParams = {
    start: data.offset,
    end: data.offset + data.length,
    forward: annotations.filter((a) => a.strand == "+"),
    reverse: annotations.filter((a) => a.strand == "-"),
    simple,
  }
  return params;
}

