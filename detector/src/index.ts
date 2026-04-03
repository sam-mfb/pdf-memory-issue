export const ESTIMATED_BYTES_PER_OBJECT_IN_MEMORY = 2800; // ~2.75 KB per object in DOM
export const ESTIMATED_BYTES_PER_OBJECT_UNCOMPRESSED = 510; // ~500 bytes per object on disk

export const THRESHOLD_OBJECT_COUNT = 500000;
export const THRESHOLD_OBJECTS_PER_MB = 10000;

export interface PdfMemoryRiskReport {
    totalFileSizeBytes: number;
    totalFileSizeMb: number;
    objectCount: number;
    objectsPerMb: number;
    estimatedMemMb: number;
    estimatedUncompressedMb: number;
    isProblematic: boolean;
    report: string;
    error?: string;
}

/**
 * Detects if a PDF file is likely to cause memory explosion based on object count density.
 * 
 * @param fileData - The bytes of the PDF file (or at least the last 1MB for the trailer).
 * @param totalFileSizeBytes - The total size of the original PDF file in bytes.
 * @returns Report containing risk assessment and estimations.
 */
export function analyzePdfMemoryRisk(fileData: Uint8Array, totalFileSizeBytes: number): PdfMemoryRiskReport {
    let tailString = '';
    if (typeof TextDecoder !== 'undefined') {
        tailString = new TextDecoder('ascii').decode(fileData);
    } else {
        // Fallback for environments without TextDecoder
        for (let i = 0; i < fileData.length; i++) {
            tailString += String.fromCharCode(fileData[i]);
        }
    }

    // Search for the /Size dictionary entry which tells us the number of objects
    const sizeRegex = /\/Size\s+(\d+)/g;
    let match: RegExpExecArray | null;
    let maxObjCount = 0;
    
    while ((match = sizeRegex.exec(tailString)) !== null) {
        const size = parseInt(match[1], 10);
        if (size > maxObjCount) {
            maxObjCount = size;
        }
    }

    if (maxObjCount === 0) {
        return {
            totalFileSizeBytes,
            totalFileSizeMb: 0,
            objectCount: 0,
            objectsPerMb: 0,
            estimatedMemMb: 0,
            estimatedUncompressedMb: 0,
            isProblematic: false,
            report: '',
            error: "Could not find /Size in the provided bytes. Invalid PDF or trailer not in this chunk."
        };
    }

    const objCount = maxObjCount;
    const fileSizemb = totalFileSizeBytes / (1024 * 1024);
    const objectsPerMb = fileSizemb > 0 ? objCount / fileSizemb : 0;
    
    const estimatedMemMb = (objCount * ESTIMATED_BYTES_PER_OBJECT_IN_MEMORY) / (1024 * 1024);
    const estimatedUncompressedMb = (objCount * ESTIMATED_BYTES_PER_OBJECT_UNCOMPRESSED) / (1024 * 1024);

    const isProblematic = (objCount > THRESHOLD_OBJECT_COUNT) && (objectsPerMb > THRESHOLD_OBJECTS_PER_MB);

    let reportText = 
`============================================================
📄 PDF Memory Explosion Analysis
============================================================
Original File Size:     ${fileSizemb.toFixed(2)} MB
Total Objects (Size):   ${objCount.toLocaleString()}
Density (Objects/MB):   ${Math.round(objectsPerMb).toLocaleString()} obj/MB
------------------------------------------------------------
🧠 Estimated RAM Usage: ~${Math.round(estimatedMemMb).toLocaleString()} MB
💾 Estimated Uncompressed: ~${Math.round(estimatedUncompressedMb).toLocaleString()} MB
------------------------------------------------------------
`;
    if (isProblematic) {
        reportText += `⚠️  WARNING: High Risk of Memory Explosion Detected! ⚠️\n`;
        reportText += `This file contains an unusually high number of objects relative to its size.\n`;
        reportText += `This typically indicates extreme redundancy compressed inside Object Streams.\n`;
        reportText += `Opening this file in strict PDF parsers or DOM builders will likely cause\n`;
        reportText += `severe memory consumption and possible out-of-memory errors.`;
    } else {
        reportText += `✅ No immediate memory explosion risk detected.`;
    }

    return {
        totalFileSizeBytes,
        totalFileSizeMb: fileSizemb,
        objectCount: objCount,
        objectsPerMb,
        estimatedMemMb,
        estimatedUncompressedMb,
        isProblematic,
        report: reportText
    };
}
