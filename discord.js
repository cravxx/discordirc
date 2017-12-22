const Discord = require('discord.io');
const settings = require('./settings')

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
    bot.sendMessage({
      to: to,
      message:`**<${from}>**: ${message}`
    });
  },
  channelList
};

module.exports = discordClient;
