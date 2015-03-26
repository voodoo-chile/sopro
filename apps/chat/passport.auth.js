var serverConfig = require('./cfg/servers.js');
var nano = require('nano')(serverConfig.couchdb.url);
var async = require('async');

var db = nano.use(serverConfig.couchdb.db);
var crypto = require('crypto');


module.exports = function(app){
  var passport = require('passport')
  var LocalStrategy = require('passport-local').Strategy;
  passport.use(new LocalStrategy(checkAuthCouchdb));

  // Take a user and turn it into a unique key for the session identifier
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  // Take the session identifier and turn it into a unique key for a user
  passport.deserializeUser(function(id, done) {
    var opts = {id: id};
    async.waterfall([
      function(next){
        userById(opts, next)
      },
      setIdentities,
    ], function(err, opts){
      if(err){
        console.log(err);
        return done(err);
      }
      done(null, opts.user);
    })
  });

  return passport;
}

function userById(opts, callback){
  db.view('soprochat', 'user_by_userid', {key: opts.id}, function(err, body){
    if(err){
      return callback(err)
    };
    if(body.rows.length > 1){
      return callback(new Error('Found more than one user object for id '+opts.id))
    };
    if(body.rows.length == 0){
      return callback('not_found')
    }
    opts.user = body.rows[0].value;
    callback(null, opts);
  })
}


function checkAuthCouchdb(username, password, callback){
  var opts = {
    username: username,
    password: password,
  }
  async.waterfall([
    function(next){
      next(null, opts);
    },
    findUser,
    checkHash,
    setIdentities,
  ], function (err, opts){
    if(err){
      return callback(err, false);
    }
    callback(null, opts.user);
  })
}
  function findUser(opts, next){
    db.view('soprochat', 'user_by_name', {key: opts.username}, function(err, body){
      if(err){
        return next(err);
      }
      if(body.rows.length !== 1){
        return next('Found non-1 number of users matching '+opts.username)
      }
      opts.user = body.rows[0].value;
      next(null, opts);
    });
  }

  function checkHash(opts, next){
    db.view('soprochat', 'pwdcreds_by_userid', {key: opts.user._id}, function(err, body){
      if(err){
        console.log(err);
        return next(err, false);
      }
      if(body.rows.length === 0){
        return next('No credentials for userid '+opts.user._id);
      }
      if(body.rows.length > 1){
        return next('multiple users found');
      }
      var doc = body.rows[0].value;
      var salt = doc.salt;
      var hash = doc.hash;

      var toHash = opts.password.concat(salt);
      var sha256er = crypto.createHash('sha256');
      sha256er.update(toHash,'utf8');
      var saltedHash = sha256er.digest('hex');

      if(saltedHash == hash) { // password matched
        return next(null, opts)
      } else {
        return next('Password mismatch');
      };

    })
  }


  function setIdentities(opts, next){
    if(opts.user === false){
      return next('Can\'t set identities without a user');
    }
    db.view('soprochat', 'identities_for_userid', {key: opts.user._id}, function(err, body){
      if(err){
        return next(err)
      };
      if(body.rows.length == 0){
        return next('no_identities_for_user');
      }
      var identities = [];
      body.rows.forEach(function(row){
        identities.push(row.value);
      })
      opts.user.identities = identities;
      opts.user.currentIdentity = identities[0];
      next(null, opts)
    })
  };
