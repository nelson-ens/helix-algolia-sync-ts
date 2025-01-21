/**
 *
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
