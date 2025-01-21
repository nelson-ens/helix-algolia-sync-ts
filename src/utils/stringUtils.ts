import {createHash} from 'crypto';

const md5 = str => createHash('md5').update(str).digest('hex');

export default md5;
