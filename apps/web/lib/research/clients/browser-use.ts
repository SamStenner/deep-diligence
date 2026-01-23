import { BrowserUseClient } from "browser-use-sdk";

export const browserUse = new BrowserUseClient({
  apiKey: process.env.BROWSER_USE_API_KEY,
});
