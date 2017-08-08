import * as request from 'request';
import * as cheerio from 'cheerio';
import * as syncRequest from 'sync-request';
import * as querystring from 'querystring';

type GFDollIcon = string;

type GFDollInfo = {
	icon: GFDollIcon,
	link: string
	/*rarity: string,
	type: string,
	time: number,
	story: string,
	skins: Array<GFDollSkin>,
	stat: {
		power: number, hp: number, attack: number,
		defense: number, agility: number, critical: number
	},
	skill: {
		base: GFDollSkill,
		normal: GFDollSkill,
		slide: GFDollSkill,
		drive: GFDollSkill,
		leader: GFDollSkill
	}*/
};

export class GFParser {
	private static dollInfos: Array<GFDollInfo> = [];

	public static main(): void {
		let uri = 'http://girlsfrontline.inven.co.kr/dataninfo/dolls/';

		request.get(uri, (req, res, body) => {

			let $ = cheerio.load(body);
			let $entries = $('div#listTable tr td div.imageHeight a');
			$entries.each((i, e) => {
				let $entry = $(e);

				let link = $(e).attr('href');
				let icon = $entry.children('img').attr('src');
				let iconBase64 = this.convertToBase64(icon);

				let entry: GFDollInfo = {
					icon: iconBase64,
					link: link
				};

				this.dollInfos.push(entry);

				console.log(entry);

			});

		});
	}

	private static convertToBase64(url): string {
		// exception
		if (!url) {
			return null;
		}

		let res = syncRequest('GET', url, { encoding: null });
		let body = res.getBody();
		let base64 = new Buffer(body, 'binary').toString('base64');
		let prefix = 'data:' + res.headers['content-type'] + ';base64,';
		let result: string = prefix + base64;

		return result;
	}
}
