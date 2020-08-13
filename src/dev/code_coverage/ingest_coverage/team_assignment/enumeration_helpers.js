/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { statSync } from 'fs';
import isGlob from 'is-glob';
import glob from 'glob';

export const push = xs => x => xs.push(x);
export const exists = x => statSync(x);
export const isDir = joined => statSync(joined).isDirectory();
export const prokGlob = x => glob.sync(x, { nonull: true });
export const isExcluded = (x, exclusions) =>
  exclusions && exclusions.length
    ? exclusions.some(ex => x.includes(ex))
    : false;
export const trim = ROOT => (x) => x.replace(`${ROOT}/`, '');
export const isWhiteListedFile = x => {
  const isJsOrTsOrTsxOrJsx = /.(j|t)(s|sx)$/gm;
  return isJsOrTsOrTsxOrJsx.test(x);
};
export const isBlackListedDir = x =>
  /node_modules|target|__tests__|__fixture__|__fixtures__|build/gm.test(x);
export const handleErr = log => err => log.error(`### ${err.message}\n`);
export const tryPath = (x) => !isGlob(x) ? exists(x) : undefined;
