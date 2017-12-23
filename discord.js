const Discord = require('discord.io');
const settings = require('./settings')
const request = require('request');

let bot = new Discord.Client({
    token: settings.token,
    autorun: true
});
let channelList = [];

bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
    let channelID;
    for(x in bot.channels){
      channelID = (bot.channels[x].name === settings.discordChannel)?bot.channels[x].id:undefined;
      if(channelID){
        break;
      }
    };
    console.log(`Locked onto discord channel ${channelID}`);
    module.exports.channelID = channelID;
});

bot.on('disconnect',()=>{
  console.log('Disconnected!');
  bot.connect();
});


let discordClient = {
  bot,
  reportMessage(from,to,message){
    request.post(
        settings.discordWebhook,
        { json: { 
                content: message,
                username: from,
                avatar_url: "https://robohash.org/"+from+".png"
                } 
        },
        function (error, response, body) {
            if (response.statusCode != 204) {
                console.log(response);
            }
        }
    );
//    bot.sendMessage({
//      to: to,
//      message:`**(${from})** ${message}`
//    });
  },
  reportAction(from,to,text,message){
    bot.sendMessage({
      to: to,
      message:`*${from} ${text}*`
    });
  },
  channelList
};

module.exports = discordClient;
