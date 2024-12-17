type AssertFunction<T> = (input: unknown) => input is T;

/**
 * Asynchronously import ESM, verifying it has property `default`
 * of type `T` asserted by `assertFn`.
 *
 * @param path
 * @param assertFn
 * @returns
 */
export async function dynamicImportDefaultESM<T>(path: string, assertFn: AssertFunction<T>) {
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
