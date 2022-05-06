import { config as configDotEnv } from "dotenv";

import Client from "./structures/Client";

configDotEnv();
const client: Client = new Client();

client.start();
