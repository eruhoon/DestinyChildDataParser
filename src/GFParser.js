"use strict";
exports.__esModule = true;
var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");
var syncRequest = require("sync-request");
var GFParser = (function () {
    function GFParser() {
    }
    GFParser.main = function () {
        var _this = this;
        var uri = 'http://girlsfrontline.inven.co.kr/dataninfo/dolls/';
        request.get(uri, function (req, res, body) {
            var $ = cheerio.load(body);
            var curInfo = { icon: "", link: "", rarity: "", type: "", name: "" };
            //image & type & rarity parse
            var $entries = $('div#listTable tr td div.dollImage');
            $entries.each(function (i, e) {
                var $entry = $(e);
                curInfo.link = $entry.children('div.imageHeight').children('a').attr('href');
                var icon = $entry.children('div.imageHeight').children('a').children('img').attr('src');
                curInfo.icon = _this.convertToBase64(icon);
                curInfo.rarity = $entry.children('div.dollStar').attr('style');
                curInfo.type = $entry.children('div.dollType').attr('style');
                curInfo.name = $entry.parent().parent().children('td.name1').children('a').children('b').text();
                //console.log($entry.parent().parent());
                console.log(curInfo.name);
                curInfo.rarity = curInfo.rarity.replace("background: url('", "").replace("');", '');
                curInfo.type = curInfo.type.replace("background: url('", "").replace("');", '');
                curInfo.rarity = _this.convertToBase64(curInfo.rarity);
                curInfo.type = _this.convertToBase64(curInfo.type);
                var entry = {
                    icon: curInfo.icon,
                    link: curInfo.link,
                    rarity: curInfo.rarity,
                    type: curInfo.type,
                    name: curInfo.name
                };
                _this.dollInfos.push(entry);
                //console.log(entry);
            });
            console.log(_this.dollInfos);
            _this.RecordResult();
        });
    };
    GFParser.RecordResult = function () {
        var output = JSON.stringify(this.dollInfos);
        fs.writeFile('./out/gf-doll.json', output, function (err) {
            if (err)
                throw err;
            console.log('\'gf-doll.json\' write complete');
        });
    };
    GFParser.convertToBase64 = function (url) {
        // exception
        if (!url) {
            return null;
        }
        var res = syncRequest('GET', url, { encoding: null });
        var body = res.getBody();
        var base64 = new Buffer(body, 'binary').toString('base64');
        var prefix = 'data:' + res.headers['content-type'] + ';base64,';
        var result = prefix + base64;
        return result;
    };
    GFParser.dollInfos = [];
    return GFParser;
}());
exports.GFParser = GFParser;
