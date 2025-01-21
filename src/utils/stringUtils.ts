import { createHash } from 'crypto';

export const md5 = (str) => createHash('md5').update(str).digest('hex');
