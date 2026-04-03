import { analyzePdfMemoryRisk } from './index';

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const outputDiv = document.getElementById('output') as HTMLPreElement;

    if (!fileInput || !outputDiv) return;

    fileInput.addEventListener('change', async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) return;
        
        outputDiv.textContent = `Analyzing ${file.name}...`;

        try {
            // For efficiency, only read the last 1MB of the file
            const chunkSize = Math.min(1024 * 1024, file.size);
            const start = Math.max(0, file.size - chunkSize);
            const blob = file.slice(start, file.size);
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Use the exported method
            const result = analyzePdfMemoryRisk(uint8Array, file.size);
            
            if (result.error) {
                outputDiv.textContent = `Error: ${result.error}`;
                return;
            }

            outputDiv.textContent = result.report;

            if (result.isProblematic) {
                alert("Warning: This PDF will likely crash the browser if rendered!");
            }
        } catch (e: any) {
            outputDiv.textContent = `Error: ${e.message}`;
        }
    });
});
