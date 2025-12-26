declare module 'node-poppler' {
    export default class Poppler {
      constructor(binaryPath?: string);
      pdfInfo(file: string): Promise<{ pages?: string }>;
      pdfToCairo(
        file: string,
        outputFile: string,
        options?: {
          pngFile?: boolean;
          singleFile?: boolean;
          firstPageToConvert?: number;
          lastPageToConvert?: number;
          resolutionXYAxis?: number;
        }
      ): Promise<void>;
    }
  }