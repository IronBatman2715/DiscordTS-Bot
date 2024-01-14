import type { ActivitiesOptions } from "../../botConfig";
import Client from "../../structures/Client";
import { ClientEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new ClientEvent("ready", () => {
  const client = Client.get();
  let unusedActivities = setRandomBotPresence(client, client.config.activities.slice());

  logger.info("Online and ready!");

  setInterval(() => {
    logger.verbose("Updating bot presence/activities.");
    unusedActivities = setRandomBotPresence(client, unusedActivities);
  }, 3600000); //set random presence every 3600000 ms = 1 hour
});

function setRandomBotPresence(client: Client, unusedActivities: ActivitiesOptions[]) {
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
