const irc = require('irc');
const fs = require('fs');

const discordClient = require('./discord');
const settings = require('./settings');

/*let optOuts;

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
});*/

let client = new irc.Client(settings.server, settings.nick, {
	channels: [settings.ircChannel],
	port: settings.ircPort,
	password: settings.password,
	secure: true,	
	autoConnect: true,
	autoRejoin: true,
	selfSigned : true,
	certExpired : true,
});


//irc
client.addListener('message', function (from, to, message) {
	let avatarURL = discordClient.bot.users.find(u => u.username.toLowerCase().trim() === from.toLowerCase().trim());
	if(avatarURL != null) {
		avatarURL = avatarURL.displayAvatarURL;
		avatarURL = avatarURL.substr(0, avatarURL.lastIndexOf("?")); //trim it
	}
	let useThisURL = avatarURL != null ? avatarURL : "https://robohash.org/" + from + ".png";

	let reg = /(?<=:)\w.*?(?=:)/g;
	let useTheseEmojis = message.match(reg);

	let mString = message;
	if( useTheseEmojis != null) {
		for(let i = 0; i < useTheseEmojis.length; i++) {
			discordClient.bot.emojis.find(emoji => {
				if(useTheseEmojis[i].toLowerCase().trim() == emoji.name.toLowerCase().trim()) {
					mString = mString.replace(":" + useTheseEmojis[i] + ":", "<:" + useTheseEmojis[i] + ":" + emoji.id + ">");
				}
			})
		}
	}

	discordClient.reportMessage(useThisURL, from,discordClient.channelID,mString);      
	console.log(`<${from}>| ${mString}`);
});
client.addListener('error', function(message) {
    console.log('error: ', message);
});

//discord
discordClient.bot.on('message', msg => {
	
	//reject webhooks
	if(msg.webhookID != null)
		return;

	if(msg.channel.id !== settings.discordChannel)
		return;	

	if(msg.author.id == discordClient.bot.id)
		return;

	let user = msg.author.username
	let message = msg.content

	let reg = /(?<=\<).*?(?=\>)/g;
	let regInner = /(?<=:)\w.*?(?=:)/g;
	let useTheseEmojis = message.match(reg);
	if( useTheseEmojis != null) {
		for(let i = 0; i < useTheseEmojis.length; i++) {
			console.log(useTheseEmojis[i]);
			let t = useTheseEmojis[i].match(regInner);
			if(t != null) {
				message = message.replace("<" + useTheseEmojis[i] + ">", ":" +t[0] + ":");
			}
			
		}
	}

	if(message !== '') {
		client.say(settings.ircChannel,`<${user}> ${message}`);
		console.log(`<${user}>: ${message}`);
	}
	
    if(msg.attachments.length != 0) {
      msg.attachments.forEach( function(value) {
        client.say(settings.ircChannel,`<${user}> ${value.url}`);
        console.log(`<${user}>: ${value.url}`);
      });
	}	
    
});

module.exports = client;
