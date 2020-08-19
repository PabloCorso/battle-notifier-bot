const bnBattleTypes = require('../bnBattleTypes');
const { battleMatchesUserConfig } = require('../notifyBattle');

const requestIntroMessage = `Please reply to this message to set your configuration. Write one line per "rule" like this:

Normal, Flag Tag *by* Pab, Markku, Sla
First Finish *by* any
Ignore any *by* Grob

*This example reads like:*
*1. Let me know when a Normal or Flag Tag battle is started by Pab, Markku or Sla.*
*2. Let me know when a First Finish battle is started by anyone.*
*3. Ignore when Grob starts a battle (even First Finish).*

*Note:*
*Use the word* ***any*** *to indicate "Any battle types" or "Any designers".*
*Use the word* ***ignore*** *at the beinning of a line to ignore that specific configuration.*
`;
const helpMessage = `This is Battle Notifier 🔔 I'll send you a message to let you know when your favourite battles are started.

Commands:
\`\`\`
!bn       - to save a new configuration
!bn get   - to see your current configuration
!bn on    - to turn notifications on 
!bn off   - to turn notifications off
!bn alias - show all battle type name aliases
!bn test  - simulate a battle to test your configuration
\`\`\`
`;

const spacesRegexp = / +/g;
const commasRegexp = /,/g;

const okEmoji = '✅';
const errorEmoji = '❌';

const anyKeyword = 'any';
const ignoreKeyword = 'ignore';
const separatorKeyword = ' by ';

const replyTimeout = 120000;

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

class TimeOutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeOutError';
  }
}

const listItemToString = (item) => {
  return Object.values(item).join(', ');
};

const configListToString = (list, isIgnore = false) => {
  const stringValues = list.map((item) => {
    const ignore = isIgnore ? `${capitalize(ignoreKeyword)} ` : '';
    const battleTypes =
      listItemToString(item.battleTypes) || capitalize(anyKeyword);
    const designers = listItemToString(item.designers) || anyKeyword;

    return `${ignore}${battleTypes}${separatorKeyword}${designers}`;
  });
  return stringValues.join('\n');
};

const isUserConfigEmpty = (userConfig) => {
  return (
    userConfig.notifyList.length === 0 && userConfig.ignoreList.length === 0
  );
};

const userConfigToString = (userConfig) => {
  let result = '';

  const isEmpty = isUserConfigEmpty(userConfig);
  if (!isEmpty) {
    const notify = configListToString(userConfig.notifyList);
    const ignore = configListToString(userConfig.ignoreList, true);
    result = `${notify}${notify ? '\n' : ''}${ignore}`;
  } else {
    result = 'No notifications set, please use `!bn` to set your configuration';
  }

  return result;
};

const statusToString = (isOn) => (isOn ? 'ON' : 'OFF');

const getBn = async ({ user, store }) => {
  let response = '';
  try {
    const userConfig = await store.get(user.id);

    const status = statusToString(userConfig.isOn);
    const oppositeStatus = statusToString(!userConfig.isOn).toLocaleLowerCase();
    const toggleStatus = `to turn it ${oppositeStatus} use "!bn ${oppositeStatus}"`;

    const configString = userConfigToString(userConfig);
    response = `${user} your current config is **${status}**\n(*${toggleStatus}*)\n\n${configString}`;
  } catch {
    response = 'No configuration found, please write `!bn` to set it';
  }

  user.send(response);
};

const readUserMessage = async (user) => {
  const sameAuthorFilter = (msg) => user.id === msg.author.id;

  try {
    const messages = await user.dmChannel.awaitMessages(sameAuthorFilter, {
      time: replyTimeout,
      max: 1,
      errors: ['time'],
    });
    return messages.first();
  } catch {
    throw new TimeOutError('⏳ Time ran out, please try again.');
  }
};

const parseDesignersInput = (input) => {
  const isAny = input.toLowerCase() === anyKeyword;
  return isAny ? [] : input.split(spacesRegexp);
};

const getBattleTypeVariations = (bnBattleType) => {
  const typeName = bnBattleType.name.toLowerCase();
  const typeNameVariations = [typeName, ...bnBattleType.aliases];
  if (typeName.includes(' ')) {
    const noSpaceName = typeName.replace(spacesRegexp, '');
    typeNameVariations.push(noSpaceName);
  }

  return typeNameVariations;
};

const parseBattleTypesInput = (input) => {
  const rawStringInput = input ? input.replace(commasRegexp, ' ') : '';

  return bnBattleTypes.reduce((acc, type) => {
    const typeNameVariations = getBattleTypeVariations(type);
    const hasType = typeNameVariations.some((variation) =>
      rawStringInput.includes(variation),
    );
    return hasType ? [...acc, type.name] : acc;
  }, []);
};

const splitInputLine = (inputLine) => {
  const input = inputLine.replace(commasRegexp, ' ');
  const [rawTypesInput, rawDesignersInput] = input.split(separatorKeyword);

  const battleTypesInput = rawTypesInput.trim().toLowerCase();
  const designersInput = rawDesignersInput.trim();
  return [battleTypesInput, designersInput];
};

const parseInputLine = (inputLine) => {
  const [battleTypesInput, designersInput] = splitInputLine(inputLine);

  const isIgnore = battleTypesInput.includes(ignoreKeyword);
  const cleanTypesInput = isIgnore
    ? battleTypesInput.replace(ignoreKeyword, ' ')
    : battleTypesInput;

  const battleTypes = parseBattleTypesInput(cleanTypesInput);
  const designers = parseDesignersInput(designersInput);

  return { isIgnore, battleTypes, designers };
};

const parseUserConfig = (userInput) => {
  const notifyList = [];
  const ignoreList = [];

  const splitLines = userInput.split('\n');
  splitLines.forEach((inputLine) => {
    if (inputLine.includes(separatorKeyword)) {
      const { isIgnore, ...configLine } = parseInputLine(inputLine);
      if (isIgnore) {
        ignoreList.push(configLine);
      } else {
        notifyList.push(configLine);
      }
    }
  });

  return {
    isOn: true,
    notifyList,
    ignoreList,
  };
};

const setBn = async ({ user, store }) => {
  try {
    user.send(requestIntroMessage);

    const message = await readUserMessage(user);
    const userConfig = parseUserConfig(message.content);

    if (!isUserConfigEmpty(userConfig)) {
      await store.set(user.id, userConfig);

      const configString = userConfigToString(userConfig);
      user.send(`Your configuration was saved as:\n\n${configString}`);
      message.react(okEmoji);
    } else {
      user.send('Could not use your reply to configure, please try again.');
      message.react(errorEmoji);
    }
  } catch (error) {
    const errorMessage =
      error instanceof TimeOutError
        ? error.message
        : 'Something went wrong, please try again.';
    user.send(errorMessage);
  }
};

const toggleBn = async ({ message, store, isOn }) => {
  try {
    await store.set(message.author.id, { isOn });
    message.react(okEmoji);
  } catch {
    message.react(errorEmoji);
  }
};

const helpBn = (user) => {
  user.send(helpMessage);
};

const noCommandFound = (message) => {
  message.react('❓');
  message.channel.send('Use `!bn help` to see the available commands');
};

const aliasBn = (user) => {
  const typeAliases = bnBattleTypes
    .map((bnType) => getBattleTypeVariations(bnType).join(', '))
    .join('\n');
  user.send(
    `This are all the possible alias for battle types:\n*(can separate battle types and kuski names by comma or spaces)*\n\`\`\`${typeAliases}\`\`\``,
  );
};

const testBn = async ({ user, store }) => {
  user.send(
    'Please write a battle type and designer to test:\n*(First Finish by Markku)*',
  );

  try {
    const message = await readUserMessage(user);
    const { battleTypes, designers } = parseInputLine(message.content);

    const battle = { battleType: battleTypes[0], designer: designers[0] };
    const userConfig = await store.get(user.id);

    const matches = battleMatchesUserConfig(battle, userConfig);
    user.send(
      `Test: ${battle.battleType || anyKeyword} started by ${battle.designer}`,
    );
    user.send(
      `${matches ? '🔔' : '🔕'} The battle ${
        matches ? 'matches' : 'does not match'
      } your configuration.`,
    );
    message.react(okEmoji);
  } catch {
    user.send('There was an issue to run your test, please try again.');
  }
};

module.exports = {
  name: 'bn',
  execute({ message, args, store }) {
    const user = message.author;
    const subCommand = args && args[0] && args[0].toLowerCase();

    if (!subCommand) {
      setBn({ user, store });
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
      testBn({ user, store });
    } else {
      noCommandFound(message);
    }
  },
};
