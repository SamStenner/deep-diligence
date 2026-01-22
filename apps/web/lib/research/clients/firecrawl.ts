import Firecrawl, { type Document, type SearchResultWeb } from '@mendable/firecrawl-js';

export const firecrawl = new Firecrawl({
  apiUrl: process.env.FIRECRAWL_API_URL,
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export const isSearchResult = (result: Document | SearchResultWeb): result is SearchResultWeb => {
  return 'url' in result;
}