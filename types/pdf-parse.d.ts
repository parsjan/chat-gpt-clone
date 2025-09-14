declare module "pdf-parse" {
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }

  interface PDFParseData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }

  function pdf(dataBuffer: Buffer | Uint8Array): Promise<PDFParseData>;

  export = pdf;
}
