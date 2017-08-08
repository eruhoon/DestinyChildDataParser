"use strict";
exports.__esModule = true;
var request = require("request");
var cheerio = require("cheerio");
var syncRequest = require("sync-request");
var GFParser = (function () {
    function GFParser() {
    }
    GFParser.main = function () {
        var _this = this;
        var uri = 'http://girlsfrontline.inven.co.kr/dataninfo/dolls/';
        request.get(uri, function (req, res, body) {
            //console.log(body);
            var $ = cheerio.load(body);
            var $sample = $('title');
            var $result = $('div#listTable tr td div.imageHeight a');
            $result.each(function (i, e) {
                var link = $(e).attr('href');
                //console.log(i);
                //console.log(link);
            });
            var $imgsrc = $result.find('img');
            $imgsrc.each(function (i, e) {
                var img_link = $(e).attr('src');
                _this.parser_todo = _this.parser_todo + 1;
                var img_base = "";
                //console.log(img_link);
                img_base = _this.convertToBase64(img_link);
                _this.DollInfo.push({
                    id: i,
                    img_normal: img_link,
                    img_normal_base: img_base
                });
                _this.parser_done = _this.parser_done + 1;
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
            while (_this.parser_todo != _this.parser_done) {
                //console.log(this.parser_todo + ' / ' + this.parser_done);
            }
            _this.DollInfo.forEach(function (e, i) {
                console.log(e);
            });
            console.log($sample.text());
        });
    };
    GFParser.convertToBase64 = function (url) {
        // exception
        if (!url)
            return null;
        var res = syncRequest('GET', url, { encoding: null });
        var body = res.getBody();
        var base64 = new Buffer(body, 'binary').toString('base64');
        var prefix = 'data:' + res.headers['content-type'] + ';base64,';
        var result = prefix + base64;
        return result;
    };
    GFParser.DollInfo = [];
    GFParser.parser_todo = 0;
    GFParser.parser_done = 0;
    return GFParser;
}());
exports.GFParser = GFParser;
