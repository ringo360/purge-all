import { Client, TextChannel, Message, Collection } from 'discord.js-selfbot-v13';
import consola from 'consola';
import c from 'picocolors';

export async function discordClient(token: string, channelid: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const client = new Client();

		client.on('ready', async () => {
			try {
				consola.info(`[Discord] Logging in as ${client.user?.username}.`);
				const channel = await client.channels.fetch(channelid);

				// チャンネルが存在しない場合や、TextChannelでない場合の処理を追加
				if (!channel || !(channel instanceof TextChannel)) {
					reject(new Error('Target channel is not a TextChannel or does not exist.'));
					return;
				}

				consola.info('[Discord] Target Channel ID:', channel.name);

				let lastId: string | null = null;

				while (true) {
					consola.info('[Devlog] Fetching... lastid: ', lastId);

					// 'msgs' に型注釈を追加
					const msgs: Collection<string, Message> = await channel.messages.fetch({
						limit: 100,
						before: lastId || undefined,
					});

					let empty = true;

					// メッセージごとに処理
					for (const msg of msgs.values()) {
						lastId = msg.id;

						// 自分のメッセージ以外は無視
						if (msg.author.id !== client.user?.id) continue;

						// メッセージが削除可能かどうかを確認
						if (!msg.deletable) continue;

						empty = false;
						try {
							await msg.delete();
							consola.success(`[DELETED] ${msg.id}`);
						} catch (e) {
							consola.fail(c.bold(`[FAIL] ${msg.id} - ${e}`));
						}
					}

					// 空の状態になったらループを抜ける
					if (empty) break;
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
