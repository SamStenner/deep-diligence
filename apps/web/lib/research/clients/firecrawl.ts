import Firecrawl, { type Document, type SearchResultWeb } from '@mendable/firecrawl-js';

export const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_BASE_URL,
});

export const isDocument = (result: object | Document): result is Document => {
  return 'url' in result;
}
