
var request = require('request');
const crypto = require('crypto');



var appid = "20160603000022650";
var key = "CGaYSrUX8xlIso0zBDaf"

Translate.prototype.translate = function(text, from, to, callback) {
	var salt = Math.round(Math.random() * 10000000000);
	var str = appid + text + salt + key;
	var sign = crypto.createHash('md5').update(str).digest('hex');


	if( !from ) from = 'en';
	if( !to ) to = 'zh'; 
	request.post({url:'http://api.fanyi.baidu.com/api/trans/vip/translate', 
		form: {from:from,
			to: to,
			q:text,
			appid:appid,
			salt:salt,
			sign:sign
		}}, 
		function(error,response,body){
			//console.log(httpResponse);
			
			if (!error && response.statusCode == 200) {
				console.log(body);

				var dst = "";
				var json  = ( body !== null && body.length > 0) ? JSON.parse(body) : {};

				if( json !== null && json.trans_result !== null && json.trans_result !== undefined) {
					dst = json.trans_result[0].dst;
					console.log("[translate.js - translate]dst:" + dst);

					if( callback ) {
						callback();
					}
				}

				
			} else {
				console.log("err:"+error);
			}
		}
	);
}

Translate.prototype.translateToZh = function(txt, callback) {
	this.translate(txt, "en", "zh", callback);

}

Translate.prototype.translateToEn = function(txt, callback) {
	this.translate(txt, "zh", "en", callback);
}

function Translate() {
	
}

module.exports = Translation;

//var trans = new Translate();

//trans.translateToZh("Why does the Sunny sky look blue?");


/*function test() {
	if( access_token != null && access_token != "" ) {
		translation('Use pixels to express measurements for padding and margins.');
	} else {
		getToken(function() {
			translation('Use pixels to express measurements for padding and margins.');
		});
	}
}*/

