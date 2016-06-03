var azure = require('azure');
var async = require('async');
var logule = require('logule');

module.exports = function() {
  var clientName = 'azureservicebusClient';
  var log = logule.init(module, clientName);
  var validate = function(credential, next) {
    var connectionString = 'Endpoint=sb://' + credential.namespace_name + '.servicebus.windows.net/;SharedAccessKeyName=' + credential.shared_access_key_name + ';SharedAccessKey=' + credential.shared_access_key_value; 
    log.debug('connectionString: ' + connectionString);
    var queueName = 'azureservicebus' + Math.floor(Math.random()*1000);
    var message = {body: 'servicebus test message'};
    try {
      var serviceBusService = azure.createServiceBusService(connectionString);
      async.waterfall([
        function(callback) {
          serviceBusService.createQueueIfNotExists(queueName, function(error){
            if(!error){
              log.debug('Queue created or exists.');
              callback(null, true);
            } else {
              log.error('Queue ' + queueName + ' not created. Error: ' + error);
              callback(error)
            }
          });
        },
        function(created, callback) {
          serviceBusService.sendQueueMessage(queueName, message, function(error){
            if(!error){
              log.debug('message sent');
              callback(null, true);
            } else {
              log.error('Failed to send message, Error: ' + error);
              callback(error);
            }
          });
        },
        function(sent, callback) {
          serviceBusService.receiveQueueMessage(queueName, function(error, receivedMessage){
            if(!error){
              if(receivedMessage.body == 'servicebus test message') {
                callback(null, true);
              } else {
                log.error('Message does not match. Sent: ' + message + ' Received: ' + receivedMessage);
                callback('recive message does not match the message sent', false)
              }
            } else {
              log.error('Failed to receive message. Error: ' + receivedMessage);
              callback(error);
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
    } catch (ex) {
      log.error('Got exception: ' + ex);
      next('FAIL');
    }   
  }

  this.validateCredential = function(credential, next) {
    var sleeptTime = 1; //sleep 30 seconds(30000) will pass the test
    setTimeout(function(){
      validate(credential, next)
    }, sleeptTime);
  }
}
