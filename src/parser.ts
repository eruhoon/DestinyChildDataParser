import * as request from 'request';
import * as cheerio from 'cheerio';
import * as syncRequest from 'sync-request';
import * as querystring from 'querystring';

type GFDollInfo = {
	id: number,
	img_normal: string,
	img_normal_base: string
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

export class GFParser{
	private static DollInfo: Array<GFDollInfo> = [];
	public static parser_todo = 0;
	public static parser_done = 0;

	public static main(): void{
		let uri = 'http://girlsfrontline.inven.co.kr/dataninfo/dolls/';

		request.get(uri, (req, res, body) => {
			//console.log(body);

			let $ = cheerio.load(body);
			let $sample = $('title');
			let $result = $('div#listTable tr td div.imageHeight a');

			$result.each((i, e) =>{
				let link = $(e).attr('href');
				//console.log(i);
				//console.log(link);
			});

			let $imgsrc = $result.find('img');
			$imgsrc.each((i, e) =>{
				let img_link = $(e).attr('src');
				this.parser_todo = this.parser_todo+1;

				let img_base = "";
				//console.log(img_link);
				img_base = this.convertToBase64(img_link);

				this.DollInfo.push({
					id: i,
					img_normal: img_link,
					img_normal_base: img_base
				});
				this.parser_done = this.parser_done + 1;
				/*, (result) => {
					this.DollInfo.push({
						id: i,
						img_normal: img_link,
						img_normal_base: result
					});
					this.parser_done = this.parser_done + 1;
					console.log("되긴하냐?");
				});*/
			});

			while(this.parser_todo != this.parser_done){
				//console.log(this.parser_todo + ' / ' + this.parser_done);
			}

			this.DollInfo.forEach((e, i) => {
				console.log(e);
			});
			console.log($sample.text());
		});
	}

	public static convertToBase64(url): string {
		// exception
		if (!url)
			return null;

		let res = syncRequest('GET', url, { encoding: null });
		let body = res.getBody();
		let base64 = new Buffer(body, 'binary').toString('base64');
		let prefix = 'data:' + res.headers['content-type'] + ';base64,';
		let result: string = prefix + base64;

		return result;
	}
}
