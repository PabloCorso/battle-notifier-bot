const fs = require('fs').promises;
const { prefix, token } = require('./config.json');

const Keyv = require('keyv');
const store = new Keyv();

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
  console.log('Ready!');
  client.user.setUsername('BattleNotifier');
});

client.login(token);

client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const handleUserRequest = (message) => {
  const spacesRegexp = / +/;
  const args = message.content.slice(prefix.length).trim().split(spacesRegexp);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  if (command.guildOnly && message.channel.type === 'dm') {
    return message.reply('I cannot execute that command inside DMs!');
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  try {
    command.execute({ message, args, store });
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
};

const handleMessage = (message) => {
  const isPrefixedMessage = message.content.startsWith(prefix);
  const isBotMessage = message.author.bot;
  if (!isPrefixedMessage || isBotMessage) return;

  return handleUserRequest(message);
};

client.on('message', handleMessage);
