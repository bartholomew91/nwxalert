var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var conusInterval = null;
var grabInterval = null;
var utc = null;
var loop = 1;

var routes = require('./routes');
var users = require('./routes/user');

var app = express();

var zeroPad = function (num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

var grabLatestConus = function () {
    console.log('grabbing conus data...');
    var utc = new Date;
    if (utc.getUTCMinutes().toString().match(/[0-9]{1}9/) != null) {
        console.log('getting image...');
        var img = 'Conus_' + utc.getUTCFullYear().toString() + zeroPad((Number(utc.getUTCMonth()) + 1), 2) + utc.getUTCDate().toString() + '_' + utc.getUTCHours().toString() + (Number(utc.getUTCMinutes() - 1)) + '_N0Ronly.gif';
        console.log('image path is /ridge/Conus/RadarImg/' + img);
        var options = {
            host: 'radar.weather.gov', port: 80, path: '/ridge/Conus/RadarImg/' + img
        }
        var request = http.get(options, function (res) {
            console.log('requesting image..');
            var imagedata = '';
            res.setEncoding('binary');

            res.on('data', function (chunk) {
                imagedata += chunk;
            });

            res.on('end', function () {
                fs.writeFile('public/images/radar/' + img, imagedata, 'binary', function (err) {
                    if (err) throw err;
                    console.log('File saved.');
                });
            });
        });
    }

    if (conusInterval === null)
        conusInterval = setInterval(grabLatestConus, 60000);
};

//grab past 4 hours of radar data
var grabAllConus = function () {

    if (loop === 1) {
        utc = new Date;
        utc.setUTCHours(utc.getUTCHours() - 4);
    }
    var img;

    if (loop <= 24) {
        if (utc.getUTCMinutes().toFixed() > 7 && utc.getUTCMinutes() < 18) {
            img = 'Conus_' + utc.getUTCFullYear().toString() + zeroPad((Number(utc.getUTCMonth()) + 1), 2) + utc.getUTCDate().toString() + '_' + utc.getUTCHours().toString() + '08_N0Ronly.gif';
        }

        if (utc.getUTCMinutes().toFixed() > 17 && utc.getUTCMinutes() < 28) {
            img = 'Conus_' + utc.getUTCFullYear().toString() + zeroPad((Number(utc.getUTCMonth()) + 1), 2) + utc.getUTCDate().toString() + '_' + utc.getUTCHours().toString() + '18_N0Ronly.gif';
        }

        if (utc.getUTCMinutes().toFixed() > 27 && utc.getUTCMinutes() < 38) {
            img = 'Conus_' + utc.getUTCFullYear().toString() + zeroPad((Number(utc.getUTCMonth()) + 1), 2) + utc.getUTCDate().toString() + '_' + utc.getUTCHours().toString() + '28_N0Ronly.gif';
        }

        if (utc.getUTCMinutes().toFixed() > 37 && utc.getUTCMinutes() < 48) {
            img = 'Conus_' + utc.getUTCFullYear().toString() + zeroPad((Number(utc.getUTCMonth()) + 1), 2) + utc.getUTCDate().toString() + '_' + utc.getUTCHours().toString() + '38_N0Ronly.gif';
        }

        if (utc.getUTCMinutes().toFixed() > 47 && utc.getUTCMinutes() < 58) {
            img = 'Conus_' + utc.getUTCFullYear().toString() + zeroPad((Number(utc.getUTCMonth()) + 1), 2) + utc.getUTCDate().toString() + '_' + utc.getUTCHours().toString() + '48_N0Ronly.gif';
        }

        if (utc.getUTCMinutes().toFixed() === 59) {
            img = 'Conus_' + utc.getUTCFullYear().toString() + zeroPad((Number(utc.getUTCMonth()) + 1), 2) + utc.getUTCDate().toString() + '_' + utc.getUTCHours().toString() + '58_N0Ronly.gif';
        }

        if (utc.getUTCMinutes().toFixed() > 0 && utc.getUTCMinutes() < 8) {
            utc.setUTCHours(utc.getUTCHours() - 1);
            img = 'Conus_' + utc.getUTCFullYear().toString() + zeroPad((Number(utc.getUTCMonth()) + 1), 2) + utc.getUTCDate().toString() + '_' + utc.getUTCHours().toString() + '58_N0Ronly.gif';
            utc.setUTCHours(utc.getUTCHours() + 1);
        }

        utc.setUTCMinutes(utc.getUTCMinutes() + 10);

        downloadImage(img);
        loop++;
        if (grabInterval === null) {
            grabInterval = setInterval(grabAllConus, 1000);
        }
    } else {
        clearInterval(grabInterval);
        loop = 0;
        utc = null;
    }
};

var downloadImage = function (img) {
    var options = {
        host: 'radar.weather.gov', port: 80, path: '/ridge/Conus/RadarImg/' + img
    }
    var request = http.get(options, function (res) {
        console.log('requesting image..');
        var imagedata = '';
        res.setEncoding('binary');

        res.on('data', function (chunk) {
            imagedata += chunk;
        });

        res.on('end', function () {
            fs.writeFileSync('public/images/radar/' + img, imagedata, 'binary', function (err) {
                if (err) throw err;
                console.log('File saved.');
            });
        });
    });
}

grabLatestConus();
grabAllConus();
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
