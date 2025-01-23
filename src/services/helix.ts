import { faker } from '@faker-js/faker';
import { ADMIN_HLX_PAGE_INDEX_URL_PREFIX } from '../utils/constants';
import { AlgoliaRecord, FetchHlxResMdResponse } from '../types';

export const buildAlgoliaRecord = (hlxResource: FetchHlxResMdResponse): AlgoliaRecord => {
  console.log(`Logging helix::buildAlgoliaRecord...`, hlxResource);

  if (hlxResource && hlxResource.results && hlxResource.results[0] && hlxResource.results[0].record) {
    // TODO:  replace faker with real data once schema is ready
    return {
      webPath: hlxResource.webPath,
      resourcePath: hlxResource.resourcePath,
      name: `${faker.food.dish()}`,
      lastModified: faker.date.anytime().getTime(),
      title: `${faker.food.dish()}`,
      image: `${faker.image.url()}`,
      description: `${faker.food.description()}`,
      category: `${faker.food.ethnicCategory()}`,
      author: `${faker.book.author()}`,
      date: faker.date.anytime().getTime(),
    } as AlgoliaRecord;
  }
  return undefined;
};

/**
 *
 * @param owner
 * @param repo
 * @param branch
 * @param path
 */
export const fetchHelixResourceMetadata = async ({
  owner,
  repo,
  branch,
  path,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}) => {
  const modPath = path.replace(/^\/*/, '');
  const url = new URL(`${ADMIN_HLX_PAGE_INDEX_URL_PREFIX}/${owner}/${repo}/${branch}/${modPath}`);
  console.log(`Logging helix::fetchHelixResourceMetadata... `, { url, modPath });

  const fetchRsp = await fetch(url);
  console.log(`helix::fetchHelixResourceMetadata fetchRsp: `, JSON.stringify(fetchRsp));

  if (!fetchRsp.ok)
    throw new Error(`Failed to fetch Helix resource metadata: ${fetchRsp.status} ${fetchRsp.statusText}`);

  const jsonBody = await fetchRsp.json();
  console.log(`helix::fetchHelixResourceMetadataLogging jsonRsp: `, JSON.stringify(jsonBody));

  // page does not exist
  if (JSON.stringify(jsonBody).includes('requested path returned a 301 or 404')) {
    return undefined;
  }

  // transform to AlgRecord
  return buildAlgoliaRecord(jsonBody);
};
