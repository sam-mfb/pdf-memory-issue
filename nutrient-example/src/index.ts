import NutrientViewer from "@nutrient-sdk/viewer";

let instance: unknown = null;

function setExportButtonsDisabled(disabled: boolean) {
  const exportBtn = window.document.getElementById("exportBtn") as HTMLButtonElement | null;
  if (exportBtn) exportBtn.disabled = disabled;
  
  const exportOperationsBtn = window.document.getElementById("exportOperationsBtn") as HTMLButtonElement | null;
  if (exportOperationsBtn) exportOperationsBtn.disabled = disabled;
  
  const exportOfficeBtn = window.document.getElementById("exportOfficeBtn") as HTMLButtonElement | null;
  if (exportOfficeBtn) exportOfficeBtn.disabled = disabled;
}

function load(document: string) {
  console.log(`Loading ${document}...`);
  setExportButtonsDisabled(true);

  NutrientViewer.load({
    document,
    container: ".container",
    baseUrl: "",
  })
    .then((_instance) => {
      instance = _instance;
      _instance.addEventListener("annotations.change", () => {
        console.log(`${document} loaded!`);
      });
      setExportButtonsDisabled(false);
    })
    .catch(console.error);
}

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

let objectUrl = "";

// Handle local file selection
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

// Handle dropdown document selection
const documentSelect = window.document.getElementById("documentSelect") as HTMLSelectElement | null;
if (documentSelect) {
  documentSelect.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    NutrientViewer.unload(".container");
    load(target.value);
  });
}

// Export Handlers
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

// Initial load
if (documentSelect) {
  load(documentSelect.value);
} else {
  load("base-memory-problem-example.pdf");
}
