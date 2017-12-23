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
    if(message === '!optin'){
      if(optOuts.indexOf(from) === -1){
        optOuts.push(from);
        updateOptOuts(optOuts);
      }
    } else if(message === '!optout'){
      optOuts = optOuts.filter(i => i !== from);
      updateOptOuts(optOuts);
    } else if(from !== settings.nick ){
      if(optOuts.indexOf(from) !== -1 || force){
        discordClient.reportMessage(from,discordClient.channelID,message);
      }
    }
    console.log(`<${from}>| ${message}`);
});
client.addListener('action', function (from,to,text,message) {
    if(message === '!optin'){
      if(optOuts.indexOf(from) === -1){
        optOuts.push(from);
        updateOptOuts(optOuts);
      }
    } else if(message === '!optout'){
      optOuts = optOuts.filter(i => i !== from);
      updateOptOuts(optOuts);
    } else if(from !== settings.nick ){
      if(optOuts.indexOf(from) !== -1){
        discordClient.reportAction(from,discordClient.channelID,text,message);
      }
    }
});

client.addListener('error', function(message) {
    console.log('error: ', message);
});

discordClient.bot.on('any', function(event) {
  if(event.t == 'MESSAGE_CREATE' && event.d.channel_id === discordClient.channelID && event.d.author.id !== discordClient.bot.id && event.d.author.id !== settings.discordWebhookID) {
    let user = event.d.author.username
    let message = event.d.content
    if(event.d.attachments.length != 0) {
      event.d.attachments.forEach( function(value) {
        let url = value.url
        client.say(settings.ircChannel,`<${user}> ${url}`);
        console.log(`<${user}>: ${url}`);
      });
    }
    if(event.d.content !== '') {
      client.say(settings.ircChannel,`<${user}> ${message}`);
      console.log(`<${user}>: ${message}`);
    }
  }
});

module.exports = client;
