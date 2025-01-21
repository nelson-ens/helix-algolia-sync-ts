/**
 * {
 *   "webPath": "/blogs/aspernatur-molestias-caste",
 *   "resourcePath": "/blogs/aspernatur-molestias-caste.md",
 *   "name": "Fresh Chillies Salad",
 *   "lastModified": "1731143207086",
 *   "title": "White Wine And Turkey Pie",
 *   "image": "https://loremflickr.com/1147/2155?lock=8202902739233803",
 *   "description": "Three almonds with spinach, onion, snowpea sprouts, kale and bacon. With a side of baked blackberry, and your choice of camellia tea oil or bok choy.",
 *   "category": "Bulgarian",
 *   "author": "W.G. Sebald",
 *   "date": "1714224070019",
 *   "objectID": "fae28cfcddd8c25206ce85b67fc7bc20"
 * }
 */
export interface AlgoliaRecord extends Record<string, unknown> {
  webPath?: string;
  resourcePath?: string;
  name?: string;
  lastModified?: number;
  title?: string;
  image?: string;
  description?: string;
  category?: string;
  author?: string;
  date?: number;
}

export interface FetchHlxResMdParam extends Record<string, unknown> {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export interface FetchHlxResMdResponse {
  webPath?: string;
  resourcePath?: string;
  results?: FetchHlxResMdResponseResult[];
}

export interface FetchHlxResMdResponseResult {
  name?: string;
  record?: FetchHlxResMdResponseResultRecord;
}

export interface FetchHlxResMdResponseResultRecord extends Record<string, unknown> {
  lastModified?: number;
  title?: string;
  image?: string;
  description?: string;
  category?: string;
  author?: string;
  date?: string;
}

export interface AppCfg {
  appId: string;
  apiKey: string;
  indexName: string;
  branchName: string;
}
