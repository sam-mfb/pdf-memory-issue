import NutrientViewer from "@nutrient-sdk/viewer";

let instance: unknown = null;

function load(document: string) {
  console.log(`Loading ${document}...`);
  NutrientViewer.load({
    document,
    container: ".container",
    baseUrl: "",
    toolbarItems: [
      {
        type: "custom",
        title: "Random annotation",
        className: "randomAnnotation",
        onPress: () => {
          if (!(instance instanceof NutrientViewer.Instance)) return;

          // Get page 0 dimensions
          const { width, height } = instance.pageInfoForIndex(0);
          // Create a rectangle annotation in page 0 with random position
          // and dimensions
          const left =
            Math.random() *
            (width - NutrientViewer.Options.MIN_SHAPE_ANNOTATION_SIZE);
          const top =
            Math.random() *
            (height - NutrientViewer.Options.MIN_SHAPE_ANNOTATION_SIZE);
          const annotationProperties = {
            boundingBox: new NutrientViewer.Geometry.Rect({
              left,
              top,
              width: Math.random() * (width - left),
              height: Math.random() * (height - top),
            }),
            strokeColor: new NutrientViewer.Color({
              r: Math.floor(Math.random() * 255),
              g: Math.floor(Math.random() * 255),
              b: Math.floor(Math.random() * 255),
            }),
            fillColor: new NutrientViewer.Color({
              r: Math.floor(Math.random() * 255),
              g: Math.floor(Math.random() * 255),
              b: Math.floor(Math.random() * 255),
            }),
            strokeDashArray: [[1, 1], [3, 3], [6, 6], null][
              Math.floor(Math.random() * 4)
            ] as [number, number] | null,
            strokeWidth: Math.random() * 30,
          };
          const annotationClass = [
            NutrientViewer.Annotations.RectangleAnnotation,
            NutrientViewer.Annotations.EllipseAnnotation,
          ][Math.floor(Math.random() * 2)];

          instance.create(
            new annotationClass({
              ...annotationProperties,
              pageIndex: 0,
            }),
          );
        },
      },
    ],
  })
    .then((_instance) => {
      instance = _instance;
      _instance.addEventListener("annotations.change", () => {
        console.log(`${document} loaded!`);
      });
      const exportBtn = window.document.getElementById("exportBtn") as HTMLButtonElement | null;
      if (exportBtn) exportBtn.disabled = false;
      const exportOperationsBtn = window.document.getElementById("exportOperationsBtn") as HTMLButtonElement | null;
      if (exportOperationsBtn) exportOperationsBtn.disabled = false;
      const exportOfficeBtn = window.document.getElementById("exportOfficeBtn") as HTMLButtonElement | null;
      if (exportOfficeBtn) exportOfficeBtn.disabled = false;
      const exportInstantJsonBtn = window.document.getElementById("exportInstantJsonBtn") as HTMLButtonElement | null;
      if (exportInstantJsonBtn) exportInstantJsonBtn.disabled = false;
    })
    .catch(console.error);
}

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

let objectUrl = "";

document.addEventListener("change", (event: HTMLInputEvent) => {
  if (
    event.target &&
    event.target.className === "chooseFile" &&
    event.target.files instanceof FileList
  ) {
    NutrientViewer.unload(".container");

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    objectUrl = URL.createObjectURL(event.target.files[0]);
    load(objectUrl);
  }
});

const loadProblemBtn = window.document.getElementById("loadProblemBtn");
if (loadProblemBtn) {
  loadProblemBtn.addEventListener("click", () => {
    NutrientViewer.unload(".container");
    const exportBtn = window.document.getElementById("exportBtn") as HTMLButtonElement | null;
    if (exportBtn) exportBtn.disabled = true;
    const exportOperationsBtn = window.document.getElementById("exportOperationsBtn") as HTMLButtonElement | null;
    if (exportOperationsBtn) exportOperationsBtn.disabled = true;
    const exportOfficeBtn = window.document.getElementById("exportOfficeBtn") as HTMLButtonElement | null;
    if (exportOfficeBtn) exportOfficeBtn.disabled = true;
    const exportInstantJsonBtn = window.document.getElementById("exportInstantJsonBtn") as HTMLButtonElement | null;
    if (exportInstantJsonBtn) exportInstantJsonBtn.disabled = true;
    load("base-memory-problem-example.pdf");
  });
}

const loadGoodBtn = window.document.getElementById("loadGoodBtn");
if (loadGoodBtn) {
  loadGoodBtn.addEventListener("click", () => {
    NutrientViewer.unload(".container");
    const exportBtn = window.document.getElementById("exportBtn") as HTMLButtonElement | null;
    if (exportBtn) exportBtn.disabled = true;
    const exportOperationsBtn = window.document.getElementById("exportOperationsBtn") as HTMLButtonElement | null;
    if (exportOperationsBtn) exportOperationsBtn.disabled = true;
    const exportOfficeBtn = window.document.getElementById("exportOfficeBtn") as HTMLButtonElement | null;
    if (exportOfficeBtn) exportOfficeBtn.disabled = true;
    const exportInstantJsonBtn = window.document.getElementById("exportInstantJsonBtn") as HTMLButtonElement | null;
    if (exportInstantJsonBtn) exportInstantJsonBtn.disabled = true;
    load("example.pdf");
  });
}

const exportBtn = window.document.getElementById("exportBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", async () => {
    if (!(instance instanceof NutrientViewer.Instance)) return;
    try {
      console.log("Exporting PDF...");
      const buffer = await instance.exportPDF();
      
      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exported.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Export completed!");
    } catch (e) {
      console.error("Export failed:", e);
    }
  });
}

const exportOperationsBtn = window.document.getElementById("exportOperationsBtn");
if (exportOperationsBtn) {
  exportOperationsBtn.addEventListener("click", async () => {
    if (!(instance instanceof NutrientViewer.Instance)) return;
    try {
      console.log("Exporting flattened PDF...");
      const buffer = await instance.exportPDFWithOperations([{ type: "flattenAnnotations" }]);
      
      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flattened.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Export completed!");
    } catch (e) {
      console.error("Export failed:", e);
    }
  });
}

const exportOfficeBtn = window.document.getElementById("exportOfficeBtn");
if (exportOfficeBtn) {
  exportOfficeBtn.addEventListener("click", async () => {
    if (!(instance instanceof NutrientViewer.Instance)) return;
    try {
      console.log("Exporting to Office format...");
      const buffer = await instance.exportOffice({ format: NutrientViewer.OfficeDocumentFormat.docx });
      
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exported.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Export completed!");
    } catch (e) {
      console.error("Export failed:", e);
    }
  });
}

const exportInstantJsonBtn = window.document.getElementById("exportInstantJsonBtn");
if (exportInstantJsonBtn) {
  exportInstantJsonBtn.addEventListener("click", async () => {
    if (!(instance instanceof NutrientViewer.Instance)) return;
    try {
      console.log("Exporting InstantJSON...");
      const json = await instance.exportInstantJSON();
      
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "annotations.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Export completed!");
    } catch (e) {
      console.error("Export failed:", e);
    }
  });
}

load("base-memory-problem-example.pdf");
