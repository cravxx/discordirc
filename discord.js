const Discord = require('discord.js');
const settings = require('./settings')
const request = require('request');

let bot = new Discord.Client();
bot.login(settings.token);
let channelList = [];

bot.on('ready', function() {
	console.log('Logged in as %s - %s\n', bot.user.username, bot.user.id);
	let channelID = null;
	let channel = bot.channels.get(settings.discordChannelID);
	if(channel != null) {
		console.log(`Locked onto discord channel ${channel.id}`);
		channelID = channel.id;
	}    
    module.exports.channelID = channelID;
});

bot.on('disconnect',()=>{
  console.log('Disconnected!');
  bot.connect();
});

let discordClient = {
	bot,
	reportMessage(id, from,to,message){
	  request.post(
		  "https://discordapp.com/api/webhooks/"+settings.discordWebhookID+"/"+settings.discordWebhookToken,
		  { json: { 
				  content: message,
				  username: from,
				  avatar_url: id
				  } 
		  },
		  function (error, response, body) {
			  if (response.statusCode != 204) {
				  console.log(response);
			  }
		  }
	  );
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
