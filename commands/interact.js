module.exports = {
  name: 'interact',
  execute({ message }) {
    message.channel.send('Please enter more input.').then(() => {
      const filter = (m) => message.author.id === m.author.id;

      message.channel
        .awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
        .then((messages) => {
          message.channel.send(`You've entered: ${messages.first().content}`);
        })
        .catch(() => {
          message.channel.send('You did not enter any input!');
        });
    });
  },
};
