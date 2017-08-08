import * as request from 'request';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as querystring from 'querystring';


type GFDollSkin = { type: string, name: string, src: string };
type GFDollSkill = { title: string, description: string };
type GFDollInfo = {
	name: string,
	img_normal: string,
	rarity: string,
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
	}
}



class GFFactory {

	private static mCurrentPageIdx;
	private static mCurrentIds: Array<string>;
	private static mCurrentDollIdx;


	private static mDoll: Array<GFDollInfo> = [];

	private static getDollInfo() {
		console.log(this.mCurrentPageIdx + 'Page');
		let uri = 'http://gf.inven.co.kr/dataninfo/dolls/detail.php?d=126&c=';
		let qs = querystring.stringify({
			schText: '',
			typeChk: '',
			belongChk: '',
			rankChk: '',
			pageIndex: this.mCurrentPageIdx,
			order: 'desc',
		});

		/*
		내가 만든 곳 시작
		*/

		let id = this.mCurrentPageIdx;

		request.get(uri + id, (err, res, body) => {
			if (err || res.statusCode !== 200) return;


			var re = /\<tr onclick=".*\'(\d+)\'.*\)\;\"\>/g;
			var m;
			this.mCurrentIds = [];
			while (m = re.exec(body)) {
				this.mCurrentIds.push(m[1]);
			}
			if (this.mCurrentIds.length === 0) {
				console.log('끗');
				this.onAllChildrenCreated();
				return;
			}

			this.mCurrentDollIdx = 0;
			this.getDollsInfo(this.mCurrentDollIdx);

		});

		/*
		내가 만든 곳 끗
		*/

		/*
		원본

		request.get(uri + qs, (err, res, body) => {
			if (err || res.statusCode !== 200) return;


			var re = /\<tr onclick=".*\'(\d+)\'.*\)\;\"\>/g;
			var m;
			this.mCurrentIds = [];
			while (m = re.exec(body)) {
				this.mCurrentIds.push(m[1]);
			}
			if (this.mCurrentIds.length === 0) {
				console.log('끗');
				this.onAllChildrenCreated();
				return;
			}

			this.mCurrentDollIdx = 0;
			this.getDollsInfo(this.mCurrentDollIdx);

		});
		*/
	}

	private static getDollsInfo(idx: number) {
		let id = this.mCurrentIds[idx];
		//id = '10100010';
		let uri = 'http://gf.inven.co.kr/dataninfo/dolls/detail.php?d=126&c=' + id;
		request.get(uri, {
			encoding: 'utf-8'
		}, (err, res, body) => {

			let $ = cheerio.load(body, {
				normalizeWhitespace: true,
				decodeEntities: false
			});

			let name = $('.info_top dt').text();
			let img_normal = $('.info_top .image img').attr('src');
			let rarity = $('div[class*="dollStar"]').text().trim();
			let type = $('div[class*="dollType"]').text().trim();
			let time = parseInt($('span.icon.star_class').text()[1]);
			let story = $('.info_box p.discription').html().trim();
			story = story.replace(/\s*(\<.*?\>)+\s*/g, ' ');

			let imageRegex = /skinA = (\[.*\]);/;
			let r = imageRegex.exec(body);
			let rawSkins: Array<any> = JSON.parse(r[1]);
			let skins: Array<GFDollSkin> = rawSkins.map(e => ({
				type: <string>e.type,
				name: <string>e.name,
				src: <string>e.skin_img
			}));
			let $stat = $('.stat_info li span.number');
			let stat = {
				power: parseInt($stat.eq(0).text()),
				hp: parseInt($stat.eq(1).text()),
				attack: parseInt($stat.eq(2).text()),
				defense: parseInt($stat.eq(3).text()),
				agility: parseInt($stat.eq(4).text()),
				critical: parseInt($stat.eq(5).text())
			};

			let $skill = $('.skill_info .info');
			let skill = {
				base: {
					title: $skill.eq(0).find('h3').text(),
					description: $skill.eq(0).children('.text').text(),
				},
				normal: {
					title: $skill.eq(1).find('h3').text(),
					description: $skill.eq(1).children('.text').text(),
				},
				slide: {
					title: $skill.eq(2).find('h3').text(),
					description: $skill.eq(2).children('.text').text(),
				},
				drive: {
					title: $skill.eq(3).find('h3').text(),
					description: $skill.eq(3).children('.text').text(),
				},
				leader: {
					title: $skill.eq(4).find('h3').text(),
					description: $skill.eq(4).children('.text').text(),
				}
			};

			let result: GFDollInfo = {
				name, img_normal, rarity, type, time, story, skins, stat, skill
			};
			this.mDoll.push(result);
			console.log(result.name);
			this.onDollCreated();
		});
	}

	private static onDollCreated() {
		this.mCurrentDollIdx++;
		if (this.mCurrentDollIdx < this.mCurrentIds.length) {
			this.getDollsInfo(this.mCurrentDollIdx);
		} else {
			this.onPagedDollCreated();
		}
	}

	private static onPagedDollCreated() {
		this.mCurrentPageIdx++;
		this.getDollInfo();
	}

	private static onAllChildrenCreated() {
		let output: string = JSON.stringify(this.mDoll);
		fs.writeFile('./out/gf-doll.json', output, (err) => {
			if (err) throw err;
			console.log('\'gf-doll.json\' write complete');
		});
	}

	public static main() {
		this.mCurrentPageIdx = 1;
		this.getDollInfo();
	}

}

//http://cafe.nextfloor.com/destinychild/child/pda/scroll?schText=&typeChk=&belongChk=&rankChk=&pageIndex=1&sort=&order=desc&lw=0.886258134223495&lang=ko

//http://cafe.nextfloor.com/destinychild/child/pda/scroll?pageIndex=2&typeChk=&belongChk=&rankChk=&schText=&sort=&order=desc&lw=0.33499592992331717

//http://cafe.nextfloor.com/destinychild/child/pda/scroll?pageIndex=17&typeChk=&belongChk=&rankChk=&schText=&sort=&order=desc&lw=0.5385563437574095

GFFactory.main();
