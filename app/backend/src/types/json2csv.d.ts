declare module 'json2csv' {
  export class Parser {
    constructor(options?: any);
    parse(data: any): string;
  }
}