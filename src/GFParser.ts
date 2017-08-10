import * as request from 'request';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as syncRequest from 'sync-request';
import * as querystring from 'querystring';

type GFDollIcon = string;

type GFDollInfo = {
	icon: GFDollIcon,
	link: string
	rarity: string,
	type: string,
	name: string,
	/*time: number,
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

			let curInfo : GFDollInfo = { icon:"", link:"", rarity:"", type:"", name:"" };

			//image & type & rarity parse
			let $entries = $('div#listTable tr td div.dollImage');
			$entries.each((i, e) => {
				let $entry = $(e);

				curInfo.link = $entry.children('div.imageHeight').children('a').attr('href');
				let icon = $entry.children('div.imageHeight').children('a').children('img').attr('src');
				curInfo.icon = this.convertToBase64(icon);
				curInfo.rarity = $entry.children('div.dollStar').attr('style');
				curInfo.type = $entry.children('div.dollType').attr('style');
				curInfo.name = $entry.parent().parent().children('td.name1').children('a').children('b').text();

				//console.log($entry.parent().parent());
				console.log(curInfo.name);

				curInfo.rarity = curInfo.rarity.replace("background: url('","").replace("');", '');
				curInfo.type = curInfo.type.replace("background: url('","").replace("');", '');

				curInfo.rarity = this.convertToBase64(curInfo.rarity);
				curInfo.type = this.convertToBase64(curInfo.type);

				let entry: GFDollInfo = {
					icon: curInfo.icon,	//curInfo.icon
					link: curInfo.link,
					rarity: curInfo.rarity,
					type: curInfo.type,
					name: curInfo.name
				};

				this.dollInfos.push(entry);

				//console.log(entry);
			});
					console.log(this.dollInfos);
					this.RecordResult();
		});

	}

	private static RecordResult(){
		let output: string = JSON.stringify(this.dollInfos);
		fs.writeFile('./out/gf-doll.json', output, (err) => {
			if (err) throw err;
			console.log('\'gf-doll.json\' write complete');
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
