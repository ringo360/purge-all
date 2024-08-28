import consola from 'consola';
import c from 'picocolors';
import config from '../config.json';
import { discordClient } from './discord';
import { writeFile } from 'fs';

const version = '1.0.0';

consola.info(c.bold(`PurgeALL v${version}`));

async function UpdateToken(token: string) {
	const data = {
		token: token,
	};
	const jsonData = JSON.stringify(data, null, 2);
	writeFile('./config.json', jsonData, (e) => {
		if (e) {
			consola.error(e);
		} else {
			consola.log('[Manager] Updated token data.');
		}
	});
}

async function main() {
	const channelid = await consola.prompt('Enter Channel ID:');
	consola.start('[Discord] Calling...');
	let token = config.token;
	if (!token) {
		consola.fail(c.bold('[Discord] Failed to find token from config.json.'));
		token = (await consola.prompt('Input your token:')) as string;
		await UpdateToken(token);
	}
	await discordClient(token, channelid as string).then(() => {
		consola.success('[Discord] Finished!');
		shutdown();
	});
}

async function shutdown() {
	consola.info('Goodbye!');
	process.exit(0);
	//*discordのclientをdestroyするべきだけどめんどいのでやめ。PRまってます
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('uncaughtException', (e) => {
	consola.error(e);
});

main();
