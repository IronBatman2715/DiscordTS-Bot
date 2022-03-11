import { ClientEvent } from "../../structures/Event";

export = new ClientEvent("interactionCreate", async (client, interaction) => {
	if (interaction.isCommand()) {
		//console.log("CommandInteraction created!");

		//Get command
		const command = client.commands.get(interaction.commandName);

		//If command name is not valid, do nothing
		if (!command) return;

		//Show user that command is loading
		await interaction.deferReply().catch((error) => {
			console.error(error);
		});

		client.runCommand(command, interaction);
	}
});
