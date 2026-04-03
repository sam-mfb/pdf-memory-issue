import * as fs from 'fs';
import * as path from 'path';
import { analyzePdfMemoryRisk } from './index';

function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: npm start <path_to_pdf>  OR  node dist/cli.js <path_to_pdf>");
        process.exit(1);
    }

    const filePath = args[0];
    try {
        const stats = fs.statSync(filePath);
        const totalSize = stats.size;
        
        // For efficiency, we only read the last 1MB of the file where the trailer resides
        const chunkSize = Math.min(1024 * 1024, totalSize);
        const position = Math.max(0, totalSize - chunkSize);
        const buffer = Buffer.alloc(chunkSize);
        
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, chunkSize, position);
        fs.closeSync(fd);
        
        // Use the library function
        const result = analyzePdfMemoryRisk(buffer, totalSize);
        
        if (result.error) {
            console.error(result.error);
            process.exit(1);
        }
        
        // Inject the filename into the CLI report
        const finalReport = result.report.replace(
            'Original File Size:', 
            `File:                   ${path.basename(filePath)}\nOriginal File Size:`
        );
        console.log(finalReport);
        
        if (result.isProblematic) {
            process.exit(2);
        } else {
            process.exit(0);
        }
    } catch (e: any) {
        console.error("Error analyzing PDF:", e.message);
        process.exit(1);
    }
}

run();
