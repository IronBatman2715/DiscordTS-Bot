import { Awaitable } from "discord.js";
import { lstat, readdir } from "fs/promises";
import { join } from "path";

import logger from "../../structures/Logger.js";

/**
 * Read a directory at `path` whose direct children are all directories with only files within them.
 * These files will be filtered for only valid ESM files (.ts, .js, .mts, .mjs).
 * Finally, `callback` is called on each of these files.
 *
 * @param path
 * @param callback
 */
export async function forNestedDirsFiles(
  path: string,
  callback: (fullFilePath: string, subDirName: string, fileName: string) => Awaitable<void>
): Promise<void> {
  logger.verbose(`Loading directory: "${path}"`);

  const subDirs = await readdir(path);
  if (subDirs.length < 1) {
    throw new Error(`Parent directory is empty: "${path}"`);
  }

  for (const subDir of subDirs) {
    const subDirPath = join(path, subDir);
    const subDirStats = await lstat(subDirPath);
    if (!subDirStats.isDirectory()) {
      throw new Error(`Parent directory contains non-directory: "${path}"`);
    }

    const files = await readdir(subDirPath);
    const esmFiles = files.filter(
      (f) => f.endsWith(".ts") || f.endsWith(".js") || f.endsWith(".mts") || f.endsWith(".mjs")
    );
    if (esmFiles.length < 1) {
      logger.verbose(`Skipping sub-directory with no ESM files: "${subDirPath}"`);
      continue;
    }

    for (const esmFile of esmFiles) {
      const esmFilePath = join(subDirPath, esmFile);
      const esmFileStats = await lstat(esmFilePath);
      if (!esmFileStats.isFile()) {
        throw new Error(`Unexpected file system entity at "${esmFilePath}"`);
      }

      await callback(esmFilePath, subDir, esmFile);
    }
  }
}

type AssertFunction<T> = (input: unknown) => input is T;

/**
 * Asynchronously import ESM, verifying it has property `default`
 * of type `T` asserted by `assertFn`.
 *
 * @param path
 * @param assertFn
 * @returns
 */
export async function importDefaultESM<T>(path: string, assertFn: AssertFunction<T>) {
  const file: unknown = await import(path);
  if (file && typeof file === "object" && "default" in file) {
    if (assertFn(file.default)) {
      return file.default;
    } else {
      throw new TypeError(`Unexpected type exported as default from ${path}`);
    }
  } else {
    throw new TypeError(`Expected file imported from ${path} to have a default export`);
  }
}
