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

import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import isGlob from 'is-glob';
import { tryCatch } from '../either';
import { pluck, flip2 } from '../utils';
import {
  push,
  prokGlob,
  trim,
  isBlackListedDir,
  isWhiteListedFile,
  isDir,
  isExcluded,
  handleErr,
  tryPath,
} from './enumeration_helpers';

export const enumeratePatterns = (rootPath) => (log) => (patternsMap) => {
  const res = [];
  const resPush = push(res);
  const logError = handleErr(log);

  for (const pattern of patternsMap) {
    const [pathPattern, meta] = pattern;
    tryCatch(() => tryPath(pathPattern))
      .fold(logError, pathExists(meta, pathPattern));
  }
  return res;

  function pathExists (meta, pathPattern) {

    const pluckMeta = flip2(pluck)(meta);

    return () => {
      const [owner, exclusions] = ['coverageOwner', 'excludeFiles'].map(pluckMeta);

      const creeper = (x) => creepFsSync(x, [], rootPath, owner, exclusions);

      (isGlob(pathPattern) ? prokGlob(pathPattern).map(creeper) : creeper(pathPattern))
        .forEach(resPush);
    };
  }
};

function creepFsSync (dir, xs, rootPath, owner, exclusions) {
  const joinRoot = join.bind(null, rootPath);
  const trimRoot = trim(rootPath);

  xs = xs || [];

  const aJoined = joinRoot(dir);
  const isADir = isDir(aJoined);
  const entries = isADir ? readdirSync(joinRoot(dir)) : [dir];

  entries.forEach((entry) => {
    const full = isADir ? join(dir, entry) : entry;

    if (statSync(full).isDirectory() && !isBlackListedDir(full)) {
      xs = creepFsSync(full, xs, rootPath, owner, exclusions);
    } else {
      if (isWhiteListedFile(full) && !isExcluded(full, exclusions))
        xs.push(`${trimRoot(full)} ${owner}`);
    }
  });

  return xs;
}
