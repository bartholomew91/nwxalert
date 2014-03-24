var express = require('express');
var http = require('http');
var path = require('path');
var request = require('request');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var $ = require('cheerio');
var images = [];
var grabInterval = null;

var routes = require('./routes');
var users = require('./routes/user');

var app = express();

var grabRadarImage = function (err, resp, html) {
    console.log('Checking for new radar image...');
    if (err) return console.error(err);
    var parsedHTML = $.load(html);
    images = [];
    parsedHTML('a').map(function (i, link) {
        var href = $(link).attr('href');

        if (!href.match(/Conus_[0-9]+_[0-9]{4}_N0Ronly.gif/)) return;
        images.push(href);
    });
    downloadImage(images.length);

    if (grabInterval === null) grabInterval = setInterval(grabRadarImage, 60000);
};

var grabRadarImages = function (err, resp, html) {
    if (err) return console.error(err);
    var parsedHTML = $.load(html);
    images = [];
    parsedHTML('a').map(function (i, link) {
        var href = $(link).attr('href');

        if (!href.match(/Conus_[0-9]+_[0-9]{4}_N0Ronly.gif/)) return;
        images.push(href);
    });
    downloadImage(0);
};

var downloadImage = function (index) {
    if (images.length === 0 || index > images.length) return;
    var options = {
        host: 'radar.weather.gov', port: 80, path: '/ridge/Conus/RadarImg/' + images[index]
    }
    var request = http.get(options, function (res) {
        var imagedata = '';
        res.setEncoding('binary');

        res.on('data', function (chunk) {
            imagedata += chunk;
        });

        res.on('end', function () {
            index++;
            if (res.statusCode === 200 && images[index] != undefined) fs.writeFileSync('public/images/radar/' + images[index], imagedata, 'binary');
            downloadImage(index);
        });
    });
}

request('http://radar.weather.gov/ridge/Conus/RadarImg/', grabRadarImages);
request('http://radar.weather.gov/ridge/Conus/RadarImg/', grabRadarImage);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', routes.index);
app.get('/users', users.list);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

var server = app.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
});
