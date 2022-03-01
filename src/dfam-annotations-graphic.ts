import * as d3 from "d3";
import * as soda from "@sodaviz/soda";

import {
  DfamSearchResults,
  parseDfamSearchResults,
  REPEAT_COLORS,
  REPEAT_TYPES,
  REPEAT_TYPE_TO_COLOR,
  DfamAnnotation,
} from "./main";

export interface DfamAnnotationGraphicConfig {
  selector: string;
  data?: DfamSearchResults;
  rowHeight?: number;
  zoomConstraint?: [number, number];
  domainConstraint?: (chart: soda.Chart<any>) => [number, number];
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

    let inRender = function (
      chart: soda.Chart<DfamRenderParams>,
      params: DfamRenderParams,
      inverted: boolean
    ): void {
      soda.rectangle({
        chart,
        annotations: params.annotations || [],
        selector: "dfam-ann",
        y: (d) => {
          if (inverted) {
            return (d.c.rowCount - d.a.y - 1) * d.c.rowHeight + 2;
          } else {
            return d.c.rowHeight * d.a.y + 2;
          }
        },
        strokeWidth: 4,
        strokeOpacity: 0,
        strokeColor: (d) => colorScale(d.a.type),
        fillColor: (d) => colorScale(d.a.type),
      });

      soda.hoverBehavior({
        annotations: params.annotations,
        chart: chart,
        mouseout: (s) => {
          s.style("stroke-opacity", 0);
        },
        mouseover: (s) => {
          s.style("stroke-opacity", 0.5);
        },
      });

      soda.tooltip({
        annotations: params.annotations,
        chart: chart,
        text: (d) =>
          `${d.a.modelName} (${d.a.type}): ${d.a.x}-${d.a.x + d.a.w}`,
        opacity: () => 1.0,
      });

      soda.clickBehavior({
        annotations: params.annotations,
        chart: chart,
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
      upperPadSize: 20,
      axisType: soda.AxisType.Bottom,
      inRender(params): void {
        inRender(this, params, true);
      },
    });

    this.simpleChart = new soda.Chart({
      ...chartConf,
      inRender(params): void {
        inRender(this, params, false);
      },
    });

    this.simpleChart.viewportSelection
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "#ddd");

    this.reverseChart = new soda.Chart({
      ...chartConf,
      inRender(params): void {
        inRender(this, params, false);
      },
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
        layoutFn: soda.intervalGraphLayout,
        start: parsedResults.start,
        end: parsedResults.end,
      });

      this.reverseChart.render({
        annotations: parsedResults.reverse,
        layoutFn: soda.intervalGraphLayout,
        start: parsedResults.start,
        end: parsedResults.end,
      });

      this.simpleChart.render({
        annotations: parsedResults.simple,
        layoutFn: soda.intervalGraphLayout,
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
