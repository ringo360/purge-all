import { Client, TextChannel } from 'discord.js-selfbot-v13';
import consola from 'consola';
import c from 'picocolors';

export async function discordClient(token: string, channelid: string): Promise<void> {
	return new Promise((resolve, reject) => {
		let client = new Client();
		client.on('ready', async () => {
			try {
				consola.info(`[Discord] Logging in as ${client.user?.username}.`);
				const channel = (await client.channels.fetch(channelid)) as TextChannel;
				consola.info('[Discord] Target Channel ID:', channel.name);
				let lastId = null;
				while (1) {
					consola.info('[Devlog] Fetching... lastid: ', lastId);
					//@ts-ignore
					let msgs = await channel.messages.fetch({
						limit: 100,
						...(lastId != null && {
							before: lastId,
						}),
					});
					let empty = true;
					//@ts-ignore
					for (let msg of msgs.toJSON()) {
						lastId = msg.id;
						if (!msg.content) continue;
						//@ts-ignore
						if (msg.author.id != client.user.id) continue;
						if (!msg.deletable) continue;
						empty = false;
						const msgid = msg.id;
						try {
							await msg.delete();
							consola.success(`[DELETED] ${msgid}`);
						} catch (e) {
							consola.fail(c.bold(`[FAIL] ${msgid} - ${e}`));
						}
					}
					// if (empty) break;
				}

				consola.info('[Discord] Destroying...');
				client.destroy();
				resolve();
			} catch (e) {
				reject(e);
			}
		});

		client.login(token).catch(reject);
	});
}
