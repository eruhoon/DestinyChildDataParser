import * as request from 'request';
import * as syncRequest from 'sync-request';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

import * as querystring from 'querystring';
import { Base64Manager } from "./manager/Base64Manager";
import { GFDollInfo } from "./model/GFDoll";

export class GFParser {
	private static dollInfos: Array<GFDollInfo> = [];

	private static readonly gunType = [
		'NONE', 'HG', 'SMG', 'RF', 'AR', 'MG', 'SG'
	];

	public static main(): void {
		let uri = 'http://girlsfrontline.inven.co.kr/dataninfo/dolls/';

		let res = syncRequest('GET', uri);
		let body = res.getBody();

		let $ = cheerio.load(body);

		let $entries = $('div#listTable tbody tr');
		$entries.each((i, e) => {
			let $entry = $(e);

			let link = $entry.find('.imageHeight a').attr('href');

			let icon = $entry.find('.imageHeight a img').attr('src');
			icon = Base64Manager.convertToBase64(icon);

			let name = $entry.find('td.name1 a b').text();

			let typeSet = $entry.find('.dollType').attr('style');
			let rarity = typeSet.replace(/.*(\d)_(\d)\.png.*/, '$2');
			let typeCode = typeSet.replace(/.*(\d)_(\d)\.png.*/, '$1');

			console.log(name, this.gunType[typeCode], rarity);
			this.dollInfos.push({
				name: name,
				icon: icon,
				link: link,
				rarity: rarity,
				type: this.gunType[typeCode]
			});
		});

		this.recordResult();
	}

	private static recordResult() {
		let output: string = JSON.stringify(this.dollInfos);
		fs.writeFile('./out/gf-doll.json', output, (err) => {
			if (err) throw err;
			console.log('\'gf-doll.json\' write complete');
		});
	}

}
