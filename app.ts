import * as request from 'request';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as querystring from 'querystring';

type DCChildSkin = { type: string, name: string, src: string };
type DCChildSkill = { title: string, description: string };
type DCChildInfo = {
	name: string,
	icon: string,
	role: string,
	type: string,
	star: number,
	story: string,
	skins: Array<DCChildSkin>,
	stat: {
		power: number, hp: number, attack: number,
		defense: number, agility: number, critical: number
	},
	skill: {
		base: DCChildSkill,
		normal: DCChildSkill,
		slide: DCChildSkill,
		drive: DCChildSkill,
		leader: DCChildSkill
	}
}



class DCFactory {

	private static mCurrentPageIdx;
	private static mCurrentIds: Array<string>;
	private static mCurrentChildIdx;


	private static mChildren: Array<DCChildInfo> = [];

	private static getChildrenInfo() {
		console.log(this.mCurrentPageIdx + 'Page');
		let uri = 'http://cafe.nextfloor.com/destinychild/child/pda/scroll?';
		let qs = querystring.stringify({
			schText: '',
			typeChk: '',
			belongChk: '',
			rankChk: '',
			pageIndex: this.mCurrentPageIdx,
			order: 'desc',
		});

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

			this.mCurrentChildIdx = 0;
			this.getChildInfo(this.mCurrentChildIdx);

		});
	}

	private static getChildInfo(idx: number) {
		let id = this.mCurrentIds[idx];
		//id = '10100010';
		let uri = 'http://cafe.nextfloor.com/destinychild/child/pda/' + id;
		request.get(uri, {
			encoding: 'utf-8'
		}, (err, res, body) => {

			let $ = cheerio.load(body, {
				normalizeWhitespace: true,
				decodeEntities: false
			});

			let name = $('.info_top dt').text();
			let icon = $('.info_top .image img').attr('src')
			let role = $('span[class*="child_role"]').text().trim();
			let type = $('span[class*="child_type"]').text().trim();
			let star = parseInt($('span.icon.star_class').text()[1]);
			let story = $('.info_box p.discription').html().trim();
			story = story.replace(/\s*(\<.*?\>)+\s*/g, ' ');

			let imageRegex = /skinA = (\[.*\]);/;
			let r = imageRegex.exec(body);
			let rawSkins: Array<any> = JSON.parse(r[1]);
			let skins: Array<DCChildSkin> = rawSkins.map(e => ({
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

			let result: DCChildInfo = {
				name, icon, role, type, star, story, skins, stat, skill
			};
			this.mChildren.push(result);
			console.log(result.name);
			this.onChildCreated();
		});
	}

	private static onChildCreated() {
		this.mCurrentChildIdx++;
		if (this.mCurrentChildIdx < this.mCurrentIds.length) {
			this.getChildInfo(this.mCurrentChildIdx);
		} else {
			this.onPagedChildrenCreated();
		}
	}

	private static onPagedChildrenCreated() {
		this.mCurrentPageIdx++;
		this.getChildrenInfo();
	}

	private static onAllChildrenCreated() {
		let output: string = JSON.stringify(this.mChildren);
		fs.writeFile('./out/dc-children.json', output, (err) => {
			if (err) throw err;
			console.log('\'dc-children.json\' write complete');
		});
	}

	public static main() {
		this.mCurrentPageIdx = 1;
		this.getChildrenInfo();
	}

}

//http://cafe.nextfloor.com/destinychild/child/pda/scroll?schText=&typeChk=&belongChk=&rankChk=&pageIndex=1&sort=&order=desc&lw=0.886258134223495&lang=ko

//http://cafe.nextfloor.com/destinychild/child/pda/scroll?pageIndex=2&typeChk=&belongChk=&rankChk=&schText=&sort=&order=desc&lw=0.33499592992331717

//http://cafe.nextfloor.com/destinychild/child/pda/scroll?pageIndex=17&typeChk=&belongChk=&rankChk=&schText=&sort=&order=desc&lw=0.5385563437574095

DCFactory.main();