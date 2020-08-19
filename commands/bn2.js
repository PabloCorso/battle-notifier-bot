const bnBattleTpes = require('../bnBattleTypes');

const requestIntroMessage =
  'Please reply to complete the following sentences to set your Battle Notifier configuration:';
const designersRequestMessage = `**1. I want to get notified when these kuskis start a new battle:**
  *Examples:*
  *Pab Markku Sla*
  *pab markku sla*
  *all*`;
const typesRequestMessage = `**2. Only when the battle type is:**
  *Examples:*
  *Normal, First Finish, 1 Hour TT*
  *norm ff 1htt One Life slowness LastCount finish count*
  *all*`;

const spacesRegexp = / +/g;
const commasRegexp = /,/g;

const userConfigToString = (userConfig) => {
  const notifyList = userConfig.notifyList[0];
  const { designers, battleTypes } = notifyList;

  const desingersString = designers.length > 0 ? designers.join(' ') : 'All';
  const battleTypesString =
    battleTypes.length > 0 ? battleTypes.join(' ') : 'All';

  return `
  *Status:* **ON**
  *Designers:* **${desingersString}**
  *Battle Types*: **${battleTypesString}**
  `;
};

const getBn = async ({ message, store }) => {
  const user = message.author;
  const userConfig = await store.get(user.id);
  const response = userConfig
    ? `${user} your current config is:\n${userConfigToString(userConfig)}`
    : 'No configuration found';
  message.channel.send(response);
};

const requestUserInput = async ({ message, requestMessage }) => {
  await message.channel.send(requestMessage);

  const sameAuthorFilter = (m) => message.author.id === m.author.id;
  const input = await message.channel.awaitMessages(sameAuthorFilter, {
    time: 60000,
    max: 1,
    errors: ['time'],
  });
  return input.first().content;
};

const parseDesignersInput = (input) => {
  const rawStringInput = input ? input.toLowerCase() : '';
  return rawStringInput === 'all' ? [] : rawStringInput.split(spacesRegexp);
};

const parseBattleTypesInput = (input) => {
  const result = [];
  const rawStringInput = input
    ? input.replace(commasRegexp, ' ').toLowerCase()
    : '';
  for (const type of bnBattleTpes) {
    const typeName = type.name.toLowerCase();
    const noSpaceName = typeName.replace(spacesRegexp, '');
    const typeNameVariations = [typeName, noSpaceName, ...type.aliases];

    const hasType = typeNameVariations.some((variation) =>
      rawStringInput.includes(variation),
    );
    if (hasType) {
      result.push(type.name);
    }
  }

  return result;
};

const setBn = async ({ message, store }) => {
  try {
    message.channel.send(requestIntroMessage);

    const designersInput = await requestUserInput({
      message,
      requestMessage: designersRequestMessage,
    });
    const designers = parseDesignersInput(designersInput);

    const battleTypesInput = await requestUserInput({
      message,
      requestMessage: typesRequestMessage,
    });
    const battleTypes = parseBattleTypesInput(battleTypesInput);

    const userConfig = {
      enabled: true,
      notifyList: [{ designers: designers, battleTypes }],
    };

    await store.set(message.author.id, userConfig);

    message.channel.send(
      `Your configuration was saved as:\n${userConfigToString(userConfig)}`,
    );
  } catch (error) {
    message.channel.send(
      'An error ocurred or you did not enter any input on time.',
    );
  }
};

module.exports = {
  name: 'bn2',
  execute({ message, args, store }) {
    if (args && args[0] === 'get') {
      getBn({ message, store });
    } else {
      setBn({ message, store });
    }
  },
};
