const { prefix, token, bnStorePath } = require('./config');
const battleNotifier = require('./battleNotifier');

const Discord = require('discord.js');
const client = new Discord.Client();
const bn = battleNotifier({ client, bnStorePath });

client.once('ready', () => {
  console.log('Ready!');
  client.user.setUsername('BattleNotifier');
});

client.login(token);

const handleUserRequest = async message => {
  const spacesRegexp = / +/;
  const args = message.content.slice(prefix.length).trim().split(spacesRegexp);
  const commandName = args.shift().toLowerCase();

  if (commandName !== bn.commandName) return;

  try {
    await bn.handleMessage({ message, args });
  } catch (error) {
    console.log(error);
    await message.reply('There was an error trying to execute that command!');
  }
};

const handleMessage = message => {
  const isPrefixedMessage = message.content.startsWith(prefix);
  const isBotMessage = message.author.bot;
  if (!isPrefixedMessage || isBotMessage) return;

  return handleUserRequest(message);
};

client.on('message', handleMessage);
