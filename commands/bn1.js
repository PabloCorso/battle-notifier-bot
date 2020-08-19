module.exports = {
  name: 'bn1',
  async execute({ message, args, store }) {
    if (args && args[0] === 'get') {
      getBn({ message, store });
    } else {
      setBn({ message, store });
    }
  },
};

const getBn = async ({ message, store }) => {
  const user = message.author;
  const config = await store.get(user.id);
  const response = config
    ? `${user} your current config is ${JSON.stringify(config)}`
    : 'No configuration found';
  message.channel.send(response);
};

const setBn = async ({ message, store }) => {
  await message.channel.send(
    'Please enter kuski names separated by space, example: Pab Markku Sla',
  );

  const sameAuthorFilter = (m) => message.author.id === m.author.id;

  try {
    const kuskisInput = await message.channel.awaitMessages(sameAuthorFilter, {
      time: 60000,
      max: 1,
      errors: ['time'],
    });
    await message.channel.send(
      'Please enter battle types separated by space, example: Normal FirstFinish OneLife',
    );

    const typesInput = await message.channel.awaitMessages(sameAuthorFilter, {
      time: 60000,
      max: 1,
      errors: ['time'],
    });

    const spacesRegexp = / +/;
    const kuskis = kuskisInput.first().content.split(spacesRegexp);
    const battleTypes = typesInput.first().content.split(spacesRegexp);
    const config = { enabled: true, notifyList: [{ kuskis, battleTypes }] };

    await store.set(message.author.id, config);

    message.channel.send(
      `Your configuration was saved as ${JSON.stringify(config)}`,
    );
  } catch (error) {
    message.channel.send('You did not enter any input!');
  }
};
