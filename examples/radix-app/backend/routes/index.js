/*jslint node: true */
/*jshint esversion: 6 */

var express = require('express');
var router = express.Router();
var os = require('os');

/* GET home page. */
router.get('/', function(req, res) {
    var responseObject = {
        'RADIX_APP': (process.env.RADIX_APP || 'empty'),
        'RADIX_CLUSTERNAME': (process.env.RADIX_CLUSTERNAME || 'empty'),
        'RADIX_COMPONENT': (process.env.RADIX_COMPONENT || 'empty'),
        'RADIX_ENVIRONMENT': (process.env.RADIX_ENVIRONMENT || 'empty'),
        'HOSTNAME': (os.hostname() || 'empty'),
        'HOSTPLATFORM': (os.platform() || '0'),
        'GREETING_MESSAGE': (process.env.GREETING_MESSAGE || '')
    };

    res.set('Content-Type', 'application/json');
    console.log('Sending response HUSTON ', responseObject);
    res.status(200).send(responseObject);
});

router.get('/healthz', function(req, res){
    res.status(200).send();
});

module.exports = router;
