
var request = require('request');

var access_token;

//微软翻译API token 有效期是10分钟，所以每9分钟重新获取一次token
setInterval(
	getToken
, 5*60*1000);

/*var fs = require('fs');
var resourceFile = fs.readFileSync("/projects/properties.json","utf-8");
resource = JSON.parse(resourceFile);*/
var resource = {
	"microsoft":{
		"client_id":"b13b8064-c6c5-402c-a042-19853c543415",
		"client_secret":"pcZc9tKjoIsSsGdgobCkK48k7VXLErvKxNMBLA3RIwM"
	}
}

function getToken(callback) {
	request.post({url:'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13', 
		form: {grant_type:'client_credentials',
			client_id: resource.microsoft.client_id,
			client_secret:resource.microsoft.client_secret,
			scope:'http://api.microsofttranslator.com'
		}}, 
		function(error,response,body){
			//console.log(httpResponse);
			//console.log(body);
			if (!error && response.statusCode == 200) {
				access_token = JSON.parse(body).access_token;
				//console.log("[translation.js - getToken] access_token:" + access_token);
				if( callback ) {
					callback();
				}
			} else {
				console.log("err:"+error);
			}
		}
	);
}
//access_token = 'http%3a%2f%2fschemas.xmlsoap.org%2fws%2f2005%2f05%2fidentity%2fclaims%2fnameidentifier=b13b8064-c6c5-402c-a042-19853c543415&http%3a%2f%2fschemas.microsoft.com%2faccesscontrolservice%2f2010%2f07%2fclaims%2fidentityprovider=https%3a%2f%2fdatamarket.accesscontrol.windows.net%2f&Audience=http%3a%2f%2fapi.microsofttranslator.com&ExpiresOn=1465567531&Issuer=https%3a%2f%2fdatamarket.accesscontrol.windows.net%2f&HMACSHA256=gAz88bpipqPQVKHrjWBMKwRJIcqjv3ASOOaSqdHr7ZA%3d'

Translation.prototype.translate = function(text, from, to, callback) {
	if( !from ) from = 'en';
	if( !to ) to = 'zh'; 
	request({
			url: 'http://api.microsofttranslator.com/v2/Http.svc/Translate?text='+encodeURI(text)+'&from='+from+'&to='+to,
			headers: {
	    		'Authorization': 'Bearer ' + access_token
			}
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				//console.log(response);
	    		//console.log(body);

	    		//var json =  xml2js.parseString(body);

	    		//console.log( "json:"+JSON.stringify(json) );
	    		//xml2js.parseString(body,  {explicitArray : false}, function(err, json) {
	    		//	console.log("json:"+JSON.stringify(json));
				//});

				var txt = body.slice(body.indexOf(">")+1, body.lastIndexOf("<"));
				console.log(txt);
				callback(txt);
	  		} else {
	  			console.log("[translation.js - translate]err:"+error+";response:"+JSON.stringify(response));
	  		}
		}
	);
}

Translation.prototype.translateToZh = function(txt, callback) {
	if( access_token != null && access_token != "" ) {
		this.translate(txt, "en", "zh", callback);
	} else {
		var trans = this;
		getToken(function() {
			trans.translate(txt, "en", "zh", callback);
		});
	}
}

Translation.prototype.translateToEn = function(txt, callback) {
	if( access_token != null && access_token != "" ) {
		this.translate(txt, "zh", "en", callback);
	} else {
		var trans = this;
		getToken(function() {
			trans.translate(txt, "zh", "en", callback);
		});
	}
}

function Translation() {
	
}

module.exports = Translation;


/*function test() {
	if( access_token != null && access_token != "" ) {
		translation('Use pixels to express measurements for padding and margins.');
	} else {
		getToken(function() {
			translation('Use pixels to express measurements for padding and margins.');
		});
	}
}*/

