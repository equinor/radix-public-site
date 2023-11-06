var express = require('express');
var router = express.Router();
var request = require('request');
var createError = require('http-errors');

const echoUrl = (process.env.ECHO_URL || 'http://localhost:3000');

var echoOptions = {
    url: echoUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    time:true
};

/* GET users listing. */
router.get('/', function(req, res, next) {

    console.log('Preparing for getting Echo data from ', echoUrl);
    request.get(echoOptions, function (error, response, body) {

        if (!error && response.statusCode >= 200 && response.statusCode <= 399) {
        
            console.log('Got response from echo: ' + body);

            var bodyObj = JSON.parse(body);
            var echoObject = {};
            echoObject.RADIX_APP = (bodyObj.RADIX_APP || 'No Radix App?');
            echoObject.RADIX_CLUSTERNAME = (bodyObj.RADIX_CLUSTERNAME || 'No Radix Clustername?');
            echoObject.RADIX_COMPONENT = (bodyObj.RADIX_COMPONENT || 'No Radix Component?');
            echoObject.RADIX_ENVIRONMENT = (bodyObj.RADIX_ENVIRONMENT || 'No Radix Environment?');
            echoObject.RADIX_HOSTNAME = (bodyObj.HOSTNAME || 'No hostname');
            echoObject.RADIX_HOSTPLATFORM = (bodyObj.HOSTPLATFORM || 'No platform');
            echoObject.GREETING_MESSAGE = (bodyObj.GREETING_MESSAGE || '');
           
            res.render('echo', { title: 'Echo response', echoObject });

        } else {

            console.log('Error getting echo information : ', error);
            next(createError(500));
            // res.status(500).send('Bad things happend');
        }
      
    });


});

module.exports = router;
