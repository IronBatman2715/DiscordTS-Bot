import type { ActivityOption } from "../../botConfig.js";
import logger from "../../logger.js";
import Client from "../../structures/Client.js";
import { ClientEvent } from "../../structures/Event.js";

export default new ClientEvent("ready", async () => {
  const client = await Client.get();
  let unusedActivities = setRandomBotPresence(client, client.config.activities.slice());

  logger.info("Online and ready!");

  setInterval(() => {
    logger.verbose("Updating bot presence/activities.");
    unusedActivities = setRandomBotPresence(client, unusedActivities);
  }, 3600000); //set random presence every 3600000 ms = 1 hour
});

function setRandomBotPresence(client: Client, unusedActivities: ActivityOption[]) {
  // If used all of them, regenerate array to restart
  if (unusedActivities.length < 1) {
    unusedActivities = client.config.activities.slice();
  }

  // Get random unused activity index
  const randomIndex = Math.floor(Math.random() * unusedActivities.length);

  client.user?.setPresence({
    status: "online",
    afk: false,
    activities: [unusedActivities[randomIndex]],
  });

  unusedActivities.splice(randomIndex, 1);

  return unusedActivities;
}
