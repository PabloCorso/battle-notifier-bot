module.exports = {
  name: 'dm',
  execute({ message }) {
    const user = message.author;
    message.channel.send(`${user}, I sent you a hi.`);
    user.send('hi');
  },
};
