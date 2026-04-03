# Bug Report: Memory Exhaustion / Browser Crash on Export of Specific Malformed PDFs

## Description
We have encountered a critical issue where the Nutrient Web SDK (PSPDFKit) completely exhausts browser memory and crashes when performing export or serialization operations (such as `exportPDF()`, `exportPDFWithOperations()`, and `exportOffice()`) on certain PDFs encountered "in the wild."

While the underlying issue stems from how these specific PDF files were malformed by their generator, the SDK fails to handle them gracefully, leading to outright browser tab crashes that are actively impacting our customers.

## Root Cause Analysis
Through our investigation, we identified that these problematic PDFs suffer from an extreme case of "object explosion." Specifically, a bug in certain versions of **Foxit PDF Editor** (and potentially Nuance PDF Create) causes it to generate a brand-new, completely redundant `ExtGState` dictionary for *every single graphic element and text block* across every page during operations like Optical Character Recognition (OCR) or Bates Numbering.

This results in files with millions of identical objects. Because PDF 1.5+ uses Object Streams (`/ObjStm`) with `FlateDecode` compression, these millions of identical text objects compress incredibly well, resulting in seemingly small files on disk (e.g., 50-70MB). 

However, when the SDK attempts to perform a full DOM traversal or serialization (like during an export), it uncompresses these streams and instantiates all ~2.8+ million objects into memory at once. This balloons the RAM footprint to over 5-7 GB, instantly crashing the browser tab.

You can read our full technical breakdown of the Foxit bug in the `analysis/foxit-file-analysis.md` file included in our reproduction repository.

## Reproduction Repository
We have created a self-contained reproduction environment based on your official TypeScript example to consistently demonstrate this crash.

**Repository/Branch:** [Insert Link to your GitHub Repo here]

### Steps to Reproduce:
1. Clone the repository and navigate to the `nutrient-example/` directory.
2. Run `npm install` and then `npm run start` to boot the dev server.
3. Open `http://localhost:8080/` in your browser.
4. **Open your browser's Developer Tools Console** to monitor the output and crashes.
5. In the UI, ensure "Memory Problem PDF" is selected in the "Load Document" dropdown.
6. Click any of the export buttons: **Export PDF**, **Export Flattened**, or **Export Office**.
7. Observe that the viewer locks up, memory usage skyrockets, and the browser tab eventually crashes with an "Out of Memory" error.
8. *(Optional)* Switch the dropdown to "Working Example PDF" and click the export buttons to see that the SDK works perfectly on normally structured files.

## Expected Behavior
While the PDFs themselves are pathologically structured, the SDK should ideally either:
1. Handle the duplicate objects more efficiently (e.g., via deduplication or lazy loading during export).
2. Fail gracefully and throw a catchable JavaScript error when memory limits or extreme object-count thresholds are exceeded, rather than hard-crashing the entire browser tab.

We have included a Python/TypeScript detection script in the `detector/` directory of our repo that we are currently using as a workaround to block these files, but a more robust fallback within the SDK itself would be highly appreciated.