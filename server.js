var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
require('prototypes');

var port = process.env.PORT || 8080; // set our port
var staticdir = process.env.NODE_ENV === 'production' ? 'dist.prod' : 'dist.dev'; // get static files dir

var ignoredPaths = ['/bower_components', '/styles', '/components', '/fonts', '/scripts'];

function startsWith(string, array) {

    for (var i = 0; i < array.length; i++)
        if (string.startsWith(array[i]))
            return true;
    return false;
}

app.all('/*', function(req, res, next) {
    var paths = ignoredPaths;

    //Redirecting to index only the requests that do not start with ignored paths
    if (!startsWith(req.url, paths)) {
        res.sendFile('index.html', { root: path.resolve(__dirname, staticdir) });
    } else
        next();
});


// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
//app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
//app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/' + staticdir)); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./devServer/routes')(app); // configure our routes

// start app ===============================================
app.listen(port); // startup our app at http://localhost:8080
console.log('Starting sever on port ' + port); // shoutout to the user
exports = module.exports = app; // expose app