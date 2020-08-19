module.exports = {
  name: 'usage',
  args: true,
  usage: '<user> <example>',
  execute({ message, args }) {
    message.channel.send(
      `Arguments: ${args}\nArguments length: ${args.length}`,
    );
  },
};
