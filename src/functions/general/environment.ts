/** Determine if this is a development runtime environment or not according to the `NODE_ENV` environment variable. */
export function isDevEnvironment(): boolean {
  switch (process.env.NODE_ENV) {
    case "development": {
      return true;
    }
    case undefined: // allow default to fallthrough to production
    case "production": {
      return false;
    }

    default: {
      throw new Error(
        `Invalid value for environment variable "NODE_ENV" ${process.env.NODE_ENV}. Refer to \`global.d.ts\`.`
      );
    }
  }
}
