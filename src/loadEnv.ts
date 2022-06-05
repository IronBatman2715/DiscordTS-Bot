import { config } from "dotenv";

/** Load the appropriate .env file (`development.env` or `production.env`) */
const loadEnv = () => {
  config({ path: process.env.NODE_ENV === "development" ? "development.env" : "production.env" });
};

export default loadEnv;
