const irc = require('irc');
const fs = require('fs');

const discordClient = require('./discord');
const settings = require('./settings');

let optOuts;

let updateOptOuts = (data) => {
    fs.writeFile('./optouts.json', JSON.stringify(data), (err) => { if(err)
        console.log(`Failed to write to optouts file, ${err}!`);
    });
}

fs.readFile('./optouts.json', (err,data) => {
    if(err){
      console.log('No optouts loaded, creating empty array');
      optOuts = [];
      return;
    }
    optOuts = JSON.parse(data);
});

let client = new irc.Client(settings.server, settings.nick, {
    channels: [settings.ircChannel],
});

client.addListener('message', function (from, to, message) {
    let force = false;
    if(message.substr(0,6) === '!disc '){
      message = message.substr(6,message.length);
      force = true;
    }
    if(message === '!optout'){
      if(optOuts.indexOf(from) === -1){
        optOuts.push(from);
        updateOptOuts(optOuts);
      }
    } else if(message === '!optin'){
      optOuts = optOuts.filter(i => i !== from);
      updateOptOuts(optOuts);
    } else if(from !== settings.nick ){
      if(optOuts.indexOf(from) === -1 || force){
        discordClient.reportMessage(from,discordClient.channelID,message);
      }
    }
});

client.addListener('error', function(message) {
    console.log('error: ', message);
});

discordClient.bot.on('message', function(user, userID, channelID, message, event) {
  let channel = discordClient.channelID;
  //console.log(`${message.substr(0,5)}:${message.substr(5,message.length)}`);
  if(userID !== discordClient.bot.id && message && channelID === discordClient.channelID){
    client.say(settings.ircChannel,`<${user}>: ${message}`);
  }
});

module.exports = client;
