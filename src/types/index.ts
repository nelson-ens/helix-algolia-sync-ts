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
