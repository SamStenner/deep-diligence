import { BrowserUseClient } from "browser-use-sdk";

export const browserUseClient = new BrowserUseClient({
  apiKey: process.env.BROWSER_USE_API_KEY,
});