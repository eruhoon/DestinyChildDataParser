import * as syncRequest from 'sync-request';

export class Base64Manager {

	public static convertToBase64(url): string {
		// exception
		if (!url) { return null; }

		let res = syncRequest('GET', url, { encoding: null });
		let body = res.getBody();
		let base64 = new Buffer(body, 'binary').toString('base64');
		let prefix = 'data:' + res.headers['content-type'] + ';base64,';
		let result: string = prefix + base64;

		return result;
	}
}