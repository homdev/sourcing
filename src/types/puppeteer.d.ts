declare module 'puppeteer-core' {
    export * from 'puppeteer';
  }
  
  declare module 'chrome-aws-lambda' {
    import { Browser, LaunchOptions } from 'puppeteer-core';
  
    export const args: string[];
    export const defaultViewport: {
      width: number;
      height: number;
    };
    export const executablePath: Promise<string>;
    export const headless: boolean;
    export const puppeteer: {
      launch: (options?: LaunchOptions) => Promise<Browser>;
    };
}