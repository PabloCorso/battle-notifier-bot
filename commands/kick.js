module.exports = {
  name: 'kick',
  description: 'Kick a user from the server.',
  guildOnly: true,
  execute({ message, args }) {
    message.channel.send(
      `Arguments: ${args}\nArguments length: ${args.length}`,
    );
  },
};
