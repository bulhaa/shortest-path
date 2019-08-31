//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'),
    nodesOnly = require('./test/harness/atoll'),
    dataWithEdges = require('./use/atoll'),
    build = require('./use/build'),
    util = require('util'),
    mapHelpers = build.__webpack_require__("./src/mapHelpers.js"),
    graphHelper = build.__webpack_require__("./src/graphHelper.js");
    // ngraph = require('ngraph.graph');
    // require('ngraph.graph')
// import createGraph from 'ngraph.graph'

    // graphHelper = require('./use/src/graphHelper');

// import { data as asiaData } from '../../test/harness/atoll'
// import { dataWithEdges } from '../atoll'
// import { setupMap, setData, setupRouteLayer } from './mapHelpers'
// import { loadGraphFromFile, createGraphFromData } from './graphHelper'

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

// app.configure(function () {
//     // app.set('port', process.env.PORT || 3000);
//     // app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
//     // app.use(express.bodyParser()),
//     app.use(express.static(path.join(__dirname, 'public')));
// });

// app.use('/public', express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/map', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count });
    });
  } else {
    var file = 1
    var showMap = 0
    var asiaData = nodesOnly.data

    mapHelpers.setupMap(null, null, showMap)
    mapHelpers.setData(asiaData, showMap)
    if(showMap)
      mapHelpers.setupRouteLayer()
    if(file)
      var pageCountMessage = graphHelper.loadGraphFromFile(dataWithEdges.dataWithEdges)
    else
      graphHelper.createGraphFromData(asiaData)

    console.log('test');
    console.log(pageCountMessage);
    console.log(util.inspect(pageCountMessage));
    console.log('end');

    res.render('../use/map.html', { pageCountMessage : pageCountMessage});
  }
});


// app.get('/public/leaflet.css', function (req, res) {
//     res.render('../public/leaflet.css', { pageCountMessage : null});
// });

// app.get('/public/leaflet.js', function (req, res) {
//     res.render('../public/leaflet.js', { pageCountMessage : null});
// });

// app.get('/public/turf.min.js', function (req, res) {
//     res.render('../public/turf.min.js', { pageCountMessage : null});
// });

// app.get('/public/build.js', function (req, res) {
//     res.render('../public/build.js', { pageCountMessage : null});
// });

// app.get('/public/atoll.json', function (req, res) {
//     res.render('../public/atoll.json', { pageCountMessage : null});
// });

// app.get('/public/engines.json', function (req, res) {
//     res.render('../public/engines.json', { pageCountMessage : null});
// });

// app.get('/public/favicon.ico', function (req, res) {
//     res.render('../public/favicon.ico', { pageCountMessage : null});
// });


app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened! '+err.stack);
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
