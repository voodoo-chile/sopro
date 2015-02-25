var vertx = require('vertx');
console = require('vertx/console');
var eb = vertx.eventBus;

// set CAM_MOCKS:
load('tests/mock-data.js');

console.log(JSON.stringify(CAM_MOCKS.channels1, null, 2))

var backend = {};
backend.receive = {
  'token.authentication': tokenAuthentication,
  'get.channels': getChannels,
};

for(topic in backend.receive){
  if(!backend.receive.hasOwnProperty(topic)){
    continue;
  }
  console.log('Registering topic: '+topic);
  eb.registerHandler(topic, backend.receive[topic]);
}

function tokenAuthentication(token, callback) {
  if (token === CAM_MOCKS.validToken) {
    callback(true);
  } else {
    callback(false);
  }
};


function getChannels(msg, callback) {
  var channels = {};
  if (msg == CAM_MOCKS.roleId1) {
    channels = CAM_MOCKS.channels1;
  } else if (msg == CAM_MOCKS.roleId2) {
    channels = CAM_MOCKS.channels2;
  }
  callback(JSON.stringify(channels));
};