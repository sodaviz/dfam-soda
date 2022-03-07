import * as ds from "@sodaviz/dfam-soda";
import {Spinner} from "spin.js";

let spinner = new Spinner({
  color: "cadetblue",
  position: "relative",
  top: "100px",
})

let graphicConf: ds.DfamAnnotationGraphicConfig = {
  selector: "#charts",
  rowHeight: 12,
  zoomConstraint: [1, 10],
};

let graphic = new ds.DfamAnnotationsGraphic(graphicConf);

window.onresize = () => graphic.resize();

initButtons();
checkUrl();

function submitQuery() {
  let chr = (<HTMLInputElement>document.getElementById("chromosome")).value;
  let start = parseInt(
    (<HTMLInputElement>document.getElementById("start")).value
  );
  let end = parseInt(
    (<HTMLInputElement>document.getElementById("end")).value
  );
  let nrphCheck = <HTMLInputElement>document.getElementById("nrph")!;
  let nrph = nrphCheck.checked;
  
  setUrl(chr, `${start}`, `${end}`, `${nrph}`);
  
  spinner.spin(document.getElementById("charts")!);
  let query = {
    start: start,
    end: end,
    chr: chr,
    nrph: nrph,
  };

  ds.renderGraphic(graphic, query).then(() => spinner.stop());
}

function setUrl(chr: string, start: string, end: string, nrph: string): void {
  let params = new URLSearchParams(location.search);
  params.set("chromosome", chr);
  params.set("start", start);
  params.set("end", end);
  params.set("nrph", nrph);
  window.history.replaceState({}, "", `${location.pathname}?${params}`);
}

function checkUrl(): void {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);

  let chrSet = false;
  let startSet = false;
  let endSet = false;
  let nrphSet = false;

  let chromosome = urlParams.get("chromosome");
  if (chromosome !== null) {
    let chromInput = <HTMLInputElement>document.getElementById("chromosome");
    if (chromInput !== undefined) {
      chromInput.value = chromosome;
      chrSet = true;
    } else {
      throw "Can't find chromosome input";
    }
  }

  let start = urlParams.get("start");
  if (start !== null) {
    let startInput = <HTMLInputElement>document.getElementById("start");
    if (startInput !== undefined) {
      startInput.value = start;
      startSet = true;
    } else {
      throw "Can't find start input";
    }
  }

  let end = urlParams.get("end");
  if (end !== null) {
    let endInput = <HTMLInputElement>document.getElementById("end");
    if (endInput !== undefined) {
      endInput.value = end;
      endSet = true;
    } else {
      throw "Can't find end input";
    }
  }

  let nrph = urlParams.get("nrph");
  if (nrph !== null) {
    let nrphInput = <HTMLInputElement>document.getElementById("nrph");
    if (nrphInput !== undefined) {
      if (nrph == "true") {
        nrphInput.checked = true;
      } else {
        nrphInput.checked = false;
      }
      nrphSet = true;
    } else {
      throw "Can't find end input";
    }
  }

  if (chrSet && startSet && endSet && nrphSet) {
    submitQuery();
  }
}

function initButtons(): void {
  let submitButton = document.getElementById("submit-query")!;
  if (submitButton !== undefined) {
    submitButton.addEventListener("click", submitQuery);
  } else {
    throw "Can't find submit button";
  }

  let resetButton = document.getElementById("reset")!;
  if (resetButton !== undefined) {
    resetButton.addEventListener("click", reset);
  } else {
    throw "Can't find reset button";
  }

  let exampleButton = document.getElementById("example")!;
  if (exampleButton !== undefined) {
    exampleButton.addEventListener("click", example);
  } else {
    throw "Can't find example button";
  }
}

let collapsibleElements = document.getElementsByClassName("collapsible");
for (let i = 0; i < collapsibleElements.length; i++) {
  collapsibleElements[i].addEventListener("click", function (this: any) {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

function example() {
  (<HTMLInputElement>document.getElementById("chromosome")).value = "chr3";
  (<HTMLInputElement>document.getElementById("start")).value = "147733000";
  (<HTMLInputElement>document.getElementById("end")).value = "147766820";
  //@ts-ignore
  (<HTMLInputElement>document.getElementById("nrph")!.checked) = true;
}

function reset() {
  (<HTMLInputElement>document.getElementById("chromosome")).value = "chr1";
  (<HTMLInputElement>document.getElementById("start")).value = "";
  (<HTMLInputElement>document.getElementById("end")).value = "";
  //@ts-ignore
  (<HTMLInputElement>document.getElementById("nrph")!.checked) = true;
  setUrl("chr1", "", "", "true");
}
