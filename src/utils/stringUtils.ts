import { createHash } from 'crypto';

/**
 *
 * @param str
 */
const md5 = (str) => createHash('md5').update(str).digest('hex');

export default md5;
