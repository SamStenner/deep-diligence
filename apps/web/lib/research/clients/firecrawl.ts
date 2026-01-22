import Firecrawl, { type Document, type SearchResultWeb } from '@mendable/firecrawl-js';

export const firecrawl = new Firecrawl({
  apiUrl: "http://localhost:3002",
});

export const isSearchResult = (result: Document | SearchResultWeb): result is SearchResultWeb => {
  return 'url' in result;
}