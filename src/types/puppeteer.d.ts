declare module 'puppeteer-core' {
  export interface Browser {
    close(): Promise<void>;
    newPage(): Promise<Page>;
  }

  export interface ElementHandle<T = Element> {
    click(): Promise<void>;
    textContent(): Promise<string | null>;
  }

  export interface Request {
    resourceType(): string;
    abort(): Promise<void>;
    continue(): Promise<void>;
  }

  export interface Page {
    setUserAgent(userAgent: string): Promise<void>;
    setViewport(viewport: { width: number; height: number }): Promise<void>;
    setRequestInterception(value: boolean): Promise<void>;
    on(event: string, callback: (request: Request) => void): void;
    goto(url: string, options?: { waitUntil: 'networkidle0' | 'networkidle2' | 'load' | 'domcontentloaded' }): Promise<void>;
    waitForFunction(predicate: string | Function, options?: { timeout: number }): Promise<void>;
    evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
    waitForSelector(selector: string, options?: { timeout: number }): Promise<ElementHandle | null>;
    waitForTimeout(timeout: number): Promise<void>;
    close(): Promise<void>;
    $(selector: string): Promise<ElementHandle | null>;
    $$(selector: string): Promise<ElementHandle[]>;
  }

  const puppeteer: {
    launch(options: {
      args?: string[];
      defaultViewport?: { width: number; height: number };
      executablePath?: string;
      headless?: boolean | 'new';
      ignoreHTTPSErrors?: boolean;
    }): Promise<Browser>;
  };

  export default puppeteer;
}