var watson = require('watson-developer-cloud');
var qs = require('qs');

var Translation = require('./translation');
var trans = new Translation();

var retrieve_and_rank = watson.retrieve_and_rank({
	username: 'a92d431c-715a-4a4c-8dcc-611ff7298a46',
	password: 'LEq14O7bzcae',
	version: 'v1'
});

var params = {
	cluster_id: 'scbf809f72_1200_4c82_97f3_5b13e0559429',
	collection_name: 'example_collection',
    ranker_id: '3b140ax14-rank-9814'
};

Rnr.prototype.fcselect = function (question, callback) {

	// Get a Solr client for indexing and searching documents.
	// See https://github.com/watson-developer-cloud/node-sdk/blob/master/services/retrieve_and_rank/v1.js
	solrClient = retrieve_and_rank.createSolrClient(params);

	var ranker_id = '3b140ax15-rank-9702';
	var question  = 'q=' + question;
	var query     = qs.stringify({q: question, ranker_id: ranker_id, fl: 'id,title,body'});
	//var query     = qs.stringify({q: question, fl: 'id,title,body'});

	solrClient.get('fcselect', query, function(err, searchResponse) {
	  	if(err) {
	    	console.log('[rnr.js - fcelect]Error: ' + err);
	  	} else {
	      	console.log(JSON.stringify(searchResponse.response, null, 2));
	      	if(callback) callback(searchResponse.response.docs);
	  	}
	});
}

Rnr.prototype.question = function(txt, callback) {
	var rnr = this;
	trans.translateToEn(txt, function (enTxt){
		console.log("[rnr.js - question] - " + enTxt);
		//var enAnswer = rnr.fcselect(enTxt);

		rnr.fcselect(enTxt, function(docs) {



			if( docs == null || docs.length <= 0) {
				if( callback ) callback("0");
			} else if( docs.length == 1 && docs[0].id == 1 ) {
                if( callback ) callback("0");
            }else {
				var enAnswer = docs[0].body;
				console.log(JSON.stringify(docs[0], null, 2))
				trans.translateToZh(enAnswer, function(chAnswer) {
					if( callback ) callback(chAnswer);
				});
			}
		});

		//console.log("[rnr.js - question] - " + enAnswer);
		//var chAnswer = trans.translateToZh(enAnswer);
		//console.log("[rnr.js - question] - " + chAnswer);
	});
	
}

function Rnr() {

}

module.exports = Rnr;


//var rnr = new Rnr();

//rnr.question('星星离我们多远');  //How Far Are the Stars from Us
//rnr.question('为什么可以移动的云');  //Why Mobile cloud
//rnr.fcselect('Why Is the Sun Bigger at Sunrise and Sunset Than It Is at Noontime');
//rnr.fcselect('Is the Sun a big fire ball');
// rnr.fcselect('Can the Sun burn out');
// rnr.fcselect('Which Is Bigger, the Sun or the Moon');
//rnr.fcselect('Which Is Bigger, a Star or the Moon');
//rnr.fcselect('Why Is There a White Circle Around the Moon');
// rnr.fcselect('为什么可以移动的云');
// rnr.fcselect('为什么可以移动的云');