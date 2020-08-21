const { prefix, token, bnStorePath } = require('./config');
const { bnCommand, battleCommand, createBnStore } = require('./battleNotifier');

const Discord = require('discord.js');
const client = new Discord.Client();
const store = createBnStore(bnStorePath);

client.once('ready', () => {
  console.log('Ready!');
  client.user.setUsername('BattleNotifier');

  client.commands = new Discord.Collection();
  client.commands.set(bnCommand.name, bnCommand);
  client.commands.set(battleCommand.name, battleCommand);
});

client.login(token);

const handleUserRequest = async (message) => {
  const spacesRegexp = / +/;
  const args = message.content.slice(prefix.length).trim().split(spacesRegexp);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    command.execute({ message, args, store, client });
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
};

const handleMessage = (message) => {
  const isPrefixedMessage = message.content.startsWith(prefix);
  const isBotMessage = message.author.bot;
  if (!isPrefixedMessage || isBotMessage) return;

  return handleUserRequest(message);
};

client.on('message', handleMessage);
