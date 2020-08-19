module.exports = {
  name: 'bn1get',
  async execute({ message, store }) {
    const user = message.author;
    const config = await store.get(user.id);
    const response = config
      ? `${user} your current config is ${JSON.stringify(config)}`
      : 'No configuration found';
    message.channel.send(response);
  },
};
