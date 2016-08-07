/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

var express = require('express');
var extend     = require('util')._extend;
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var Rnr = require('./modules/rnr');

// create a new express server
global.app = express();

var expressWs = require('express-ws')(app);



var fs     = require('fs');
global.watson = require('watson-developer-cloud');


var stt = require("./stt")(app);


var dialog_service = watson.dialog({
  username: '1293409a-12c0-4234-8d84-eff15a10b5db',
  password: 'nNA413mnZYwR',
  version: 'v1'
});

app.get('/create', function(req, res, next) {
    var createParams = {
      name: 'rapiro-nodejs',
      file: fs.createReadStream('./dialogs/robot.xml')
    };

    dialog_service.createDialog(createParams, function(err, dialog) {
      if (err)
        console.log(err)
      else
        console.log(dialog);
    });
});


var dialog_id = 'c1675894-c361-47de-8407-5f66a51a3f85';


var updateParams = {
    dialog_id: dialog_id,
    file: fs.createReadStream('./dialogs/robot.xml')
};

dialog_service.updateDialog(updateParams, function(err, dialog) {
  if (err)
    console.log(err)
  else
    console.log(dialog);
});


/*dialog_service.getDialogs({}, function(err, dialogs) {
  if (err)
    console.log(err)
  else
    console.log(dialogs);
});*/


app.get('/conversation', function(req, res, next) {

    var dialogParams = {
        conversation_id: req.query.conversation_id == null ? '' : parseInt(req.query.conversation_id),
        dialog_id: dialog_id,
        client_id: req.query.client_id == null ? '' : parseInt(req.query.client_id),
        input: req.query.input
    };

    dialog_service.conversation(dialogParams, function(err, results) {
        if (err) {
            console.log(err)
        } else {
            console.log(results);

            var converAry = new Array();
            var converseOuts = results.response;
            var input = results.input;
            var actionParams = null;
            for( var i=0; i<converseOuts.length; i++) {
                if( converseOuts[i].indexOf('Backend_Action') >= 0 ) {
                    actionParams = JSON.parse(converseOuts[i]);
                    //break;
                } else {
                    converAry.push( converseOuts[i] );
                }
            }

            if( actionParams != null && actionParams.Backend_Action != null && actionParams.Backend_Action != '' ) {
                if( actionParams.Backend_Action == 'sayHello' ) {
                    converAry.unshift("你好，" + (actionParams.Person_Name).replace(/\s+/g,"") + "，很高兴认识你。");
                    results.response = converAry;
                    res.json({ dialog_id: dialog_id, conversation: results});
                    res.end();
                } else if( actionParams.Backend_Action == 'rnr' ) {
                    var rnr = new Rnr();
                    //rnr.question(actionParams.Question, function(answer) {
                    var q = input.replace(/\s+/g,"");
                    rnr.question(q, function(answer) {

                        if( answer == "0" ) {
                            converAry.unshift("对不起，我的知识库里没有找到关于这个问题的答案");
                        } else {
                            converAry.unshift(answer);
                        }
                        results.response = converAry;
                        res.json({ dialog_id: dialog_id, conversation: results});
                        res.end();
                    });
                }
            } else {
                results.response = converAry;
                res.json({ dialog_id: dialog_id, conversation: results});
                res.end();
            }
            
        }
    });

    //getProfiles(req.query.client_id);
});


app.get('/profile', function(req, res, next) {
  var params = extend({ dialog_id: dialog_id }, req.query);
  console.log(JSON.stringify(req.query));
  console.log("[app.js - profile] params:" + JSON.stringify(params) );
  dialog_service.getProfile(params, function(err, results) {
    if (err)
      return next(err);
    else
      res.json(results);
  });
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
