"use strict";
exports.__esModule = true;
var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");
var querystring = require("querystring");
var GFFactory = (function () {
    function GFFactory() {
    }
    GFFactory.getDollInfo = function () {
        var _this = this;
        console.log(this.mCurrentPageIdx + 'Page');
        var uri = 'http://gf.inven.co.kr/dataninfo/dolls/detail.php?d=126&c=';
        var qs = querystring.stringify({
            schText: '',
            typeChk: '',
            belongChk: '',
            rankChk: '',
            pageIndex: this.mCurrentPageIdx,
            order: 'desc'
        });
        /*
        내가 만든 곳 시작
        */
        var id = this.mCurrentPageIdx;
        request.get(uri + id, function (err, res, body) {
            if (err || res.statusCode !== 200)
                return;
            var re = /\<tr onclick=".*\'(\d+)\'.*\)\;\"\>/g;
            var m;
            _this.mCurrentIds = [];
            while (m = re.exec(body)) {
                _this.mCurrentIds.push(m[1]);
            }
            if (_this.mCurrentIds.length === 0) {
                console.log('끗');
                _this.onAllChildrenCreated();
                return;
            }
            _this.mCurrentDollIdx = 0;
            _this.getDollsInfo(_this.mCurrentDollIdx);
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
    };
    GFFactory.getDollsInfo = function (idx) {
        var _this = this;
        var id = this.mCurrentIds[idx];
        //id = '10100010';
        var uri = 'http://gf.inven.co.kr/dataninfo/dolls/detail.php?d=126&c=' + id;
        request.get(uri, {
            encoding: 'utf-8'
        }, function (err, res, body) {
            var $ = cheerio.load(body, {
                normalizeWhitespace: true,
                decodeEntities: false
            });
            var name = $('.info_top dt').text();
            var img_normal = $('.info_top .image img').attr('src');
            var rarity = $('div[class*="dollStar"]').text().trim();
            var type = $('div[class*="dollType"]').text().trim();
            var time = parseInt($('span.icon.star_class').text()[1]);
            var story = $('.info_box p.discription').html().trim();
            story = story.replace(/\s*(\<.*?\>)+\s*/g, ' ');
            var imageRegex = /skinA = (\[.*\]);/;
            var r = imageRegex.exec(body);
            var rawSkins = JSON.parse(r[1]);
            var skins = rawSkins.map(function (e) { return ({
                type: e.type,
                name: e.name,
                src: e.skin_img
            }); });
            var $stat = $('.stat_info li span.number');
            var stat = {
                power: parseInt($stat.eq(0).text()),
                hp: parseInt($stat.eq(1).text()),
                attack: parseInt($stat.eq(2).text()),
                defense: parseInt($stat.eq(3).text()),
                agility: parseInt($stat.eq(4).text()),
                critical: parseInt($stat.eq(5).text())
            };
            var $skill = $('.skill_info .info');
            var skill = {
                base: {
                    title: $skill.eq(0).find('h3').text(),
                    description: $skill.eq(0).children('.text').text()
                },
                normal: {
                    title: $skill.eq(1).find('h3').text(),
                    description: $skill.eq(1).children('.text').text()
                },
                slide: {
                    title: $skill.eq(2).find('h3').text(),
                    description: $skill.eq(2).children('.text').text()
                },
                drive: {
                    title: $skill.eq(3).find('h3').text(),
                    description: $skill.eq(3).children('.text').text()
                },
                leader: {
                    title: $skill.eq(4).find('h3').text(),
                    description: $skill.eq(4).children('.text').text()
                }
            };
            var result = {
                name: name, img_normal: img_normal, rarity: rarity, type: type, time: time, story: story, skins: skins, stat: stat, skill: skill
            };
            _this.mDoll.push(result);
            console.log(result.name);
            _this.onDollCreated();
        });
    };
    GFFactory.onDollCreated = function () {
        this.mCurrentDollIdx++;
        if (this.mCurrentDollIdx < this.mCurrentIds.length) {
            this.getDollsInfo(this.mCurrentDollIdx);
        }
        else {
            this.onPagedDollCreated();
        }
    };
    GFFactory.onPagedDollCreated = function () {
        this.mCurrentPageIdx++;
        this.getDollInfo();
    };
    GFFactory.onAllChildrenCreated = function () {
        var output = JSON.stringify(this.mDoll);
        fs.writeFile('./out/gf-doll.json', output, function (err) {
            if (err)
                throw err;
            console.log('\'gf-doll.json\' write complete');
        });
    };
    GFFactory.main = function () {
        this.mCurrentPageIdx = 1;
        this.getDollInfo();
    };
    GFFactory.mDoll = [];
    return GFFactory;
}());
//http://cafe.nextfloor.com/destinychild/child/pda/scroll?schText=&typeChk=&belongChk=&rankChk=&pageIndex=1&sort=&order=desc&lw=0.886258134223495&lang=ko
//http://cafe.nextfloor.com/destinychild/child/pda/scroll?pageIndex=2&typeChk=&belongChk=&rankChk=&schText=&sort=&order=desc&lw=0.33499592992331717
//http://cafe.nextfloor.com/destinychild/child/pda/scroll?pageIndex=17&typeChk=&belongChk=&rankChk=&schText=&sort=&order=desc&lw=0.5385563437574095
GFFactory.main();
