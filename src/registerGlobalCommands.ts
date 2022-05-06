import { config as configDotEnv } from "dotenv";

import Client from "./structures/Client";

console.clear();

configDotEnv();
const client: Client = new Client();

client
  .registerCommands(true)
  .then(() => {
    process.stdout.write("Successfully registered");
  })
  .catch((error) => {
    console.error(error);
    process.stdout.write("FAILED to register");
  })
  .finally(() => {
    process.stdout.write(" global commands! Closing process in 3 seconds...");
    setTimeout(process.exit(0), 3000);
  });
