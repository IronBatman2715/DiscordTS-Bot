import { config } from "dotenv";

let loadedFile = false;

/** Determine if this is a development runtime environment or not according to the `NODE_ENV` environment variable. */
export function isDevEnvironment(): boolean {
  switch (process.env.NODE_ENV) {
    case "development": {
      if (!loadedFile) {
        config({ path: "dev.env" });
        loadedFile = true;
      }
      return true;
    }
    case undefined: // allow default to fallthrough to production
    case "production": {
      if (!loadedFile) {
        config({ path: ".env" });
        loadedFile = true;
      }
      return false;
    }

    default: {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Invalid value for environment variable "NODE_ENV" ${process.env.NODE_ENV}. Refer to \`global.d.ts\`.`
      );
    }
  }
}
isDevEnvironment(); // force load file on first import
