/*jslint node: true */
/*jshint esversion: 6 */

const promBundle = require('express-prom-bundle');
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

const metricsMiddleware = promBundle({
    includeStatusCode: true,
    includeMethod: true,
    includePath:true,
    customLabels: {
        component_name: 'sergeysmtest',
        author: 'abc12'
    },
    includeUp: 1,
    promClient: {
        collectDefaultMetrics: {
            timeout: 5000
        }
    },
});


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(metricsMiddleware);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.set('Content-Type', 'application/json');
    res.send({});
    //
});

module.exports = app;
