import { ADMIN_HLX_PAGE_INDEX_URL_PREFIX } from '../utils/constants';

/**
 *
 * @param owner
 * @param repo
 * @param branch
 * @param path
 */
const fetchHelixResourceMetadata = async ({
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
  console.log(`Logging fetchHelixResourceMetadata: `, { url, modPath });

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch Helix resource metadata: ${response.status} ${response.statusText}`);

  const result = await response.json();
  console.log(`Logging fetchHelixResourceMetadata result: `, result);

  return result;
};

export default fetchHelixResourceMetadata;
