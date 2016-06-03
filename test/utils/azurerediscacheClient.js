var redis = require('redis');
var async = require('async');
var logule = require('logule');

module.exports = function() {
  var clientName = 'azurerediscacheClient';
  var log = logule.init(module, clientName);
  this.validateCredential = function(credential, next) {
    try {
      var client = redis.createClient(credential.sslPort, credential.hostname, {auth_pass: credential.primaryKey, tls: {servername: credential.hostname}});
      client.on("error", function (err) {
        log.error("Client Error: " + err);
        client.end(false);
      });
      var key = clientName + 'key' + Math.floor(Math.random()*1000);
      var value = clientName + 'value' + Math.floor(Math.random()*1000);
      async.waterfall([
        function(callback) {
          client.set(key, value, function(err, reply) {
            if(!err) {
              callback(null, true);
            } else {
              log.error('Failed to set a data. Error: ' + err);
              callback(err);
            }
          });
        },
        function(set, callback) {
          client.get(key,  function(err, reply) {
            if(!err) {
              if(reply == value) {
                callback(null, true);
              } else {
                log.error('Data not match. expect: ' + value + ' got: ' + reply);
                callback('value not match', false);
              }
            } else {
              log.error('Failed to get data. Error: ' + err);
              callback(err);
            }
          });
        }
      ],
      function(err, result) {
        if(err || !result) {
          next('FAIL');
        } else {
          next('PASS')
        }
      }); 
  
    } catch(ex) {
      log.error('Got an exception: ' + ex);
      next('FAIL');
    }
  }
}
