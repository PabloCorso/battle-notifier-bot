const {
  setBn,
  getBn,
  toggleBn,
  helpBn,
  aliasBn,
  testBn,
} = require('./subCommands');
const { emoji } = require('./config');

const noCommandFound = (message) => {
  message.react(emoji.notFound);
  message.channel.send('Use `!bn help` to see the available commands');
};

module.exports = {
  name: 'bn',
  execute({ message, args, store }) {
    const user = message.author;
    const subCommand = args && args[0] && args[0].toLowerCase();

    if (!subCommand) {
      setBn({ message, store });
    } else if (subCommand === 'get') {
      getBn({ user, store });
    } else if (subCommand === 'on') {
      toggleBn({ message, store, isOn: true });
    } else if (subCommand === 'off') {
      toggleBn({ message, store, isOn: false });
    } else if (subCommand === 'help') {
      helpBn(user);
    } else if (subCommand === 'alias') {
      aliasBn(user);
    } else if (subCommand === 'test') {
      testBn({ message, store });
    } else {
      noCommandFound(message);
    }
  },
};
