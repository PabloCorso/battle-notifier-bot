const { battleMatchesUserConfig } = require('../../notifyBattle');
const {
  readUserMessage,
  TimeOutError,
  redirectToDMChannel,
} = require('../messageUtils');

const { emoji, keyword } = require('../config');
const bnBattleTypes = require('../bnBattleTypes');
const userConfigParser = require('../userConfig').parser({
  bnBattleTypes,
  keyword,
});

const testBnMessage =
  'Please write a battle type and designer to test:\n*(First Finish by Markku)*';

const testBn = async ({ message, store }) => {
  const user = message.author;
  try {
    const channel = await redirectToDMChannel({
      message,
      redirectMessage: testBnMessage,
    });

    const userMessage = await readUserMessage({ channel, user });
    const { battleTypes, designers } = userConfigParser.parseInputLine(
      userMessage.content,
    );

    const battle = { battleType: battleTypes[0], designer: designers[0] };
    const userConfig = await store.get(message.author.id);

    const matches = battleMatchesUserConfig(battle, userConfig);
    channel.send(
      `Test: ${battle.battleType || keyword.any} battle started by ${
        battle.designer
      }`,
    );
    channel.send(
      `${matches ? '🔔' : '🔕'} The battle ${
        matches ? 'matches' : 'does not match'
      } your configuration.`,
    );
    userMessage.react(emoji.ok);
  } catch (error) {
    const errorMessage =
      error instanceof TimeOutError
        ? error.message
        : 'Something went wrong, please try again.';
    user.send(errorMessage);
  }
};

module.exports = testBn;
