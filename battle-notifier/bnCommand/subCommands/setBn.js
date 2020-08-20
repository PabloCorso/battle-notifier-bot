const {
  readUserMessage,
  TimeOutError,
  redirectToDMChannel,
} = require('../messageUtils');

const { emoji, keyword } = require('../config');
const bnBattleTypes = require('../bnBattleTypes');
const {
  parser,
  formatter,
  isUserConfigEmpty,
} = require('../userConfig/index.js');
const userConfigParser = parser({ bnBattleTypes, keyword });
const userConfigFormatter = formatter({ keyword });

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
const setConfigErrorMessage =
  'Could not use your reply to configure, please try again.';
const unknownErrorMessage = 'Something went wrong, please try again.';

const setBn = async ({ message, store }) => {
  const user = message.author;
  try {
    const channel = await redirectToDMChannel({
      message,
      redirectMessage: requestIntroMessage,
    });

    const userMessage = await readUserMessage({ channel, user });
    const userConfig = userConfigParser.parse(userMessage.content);

    if (!isUserConfigEmpty(userConfig)) {
      await store.set(user.id, userConfig);

      const configString = userConfigFormatter.toString(userConfig);
      channel.send(`Your configuration was saved as:\n\n${configString}`);
      userMessage.react(emoji.ok);
    } else {
      channel.send(setConfigErrorMessage);
      userMessage.react(emoji.error);
    }
  } catch (error) {
    const errorMessage =
      error instanceof TimeOutError ? error.message : unknownErrorMessage;
    user.send(errorMessage);
  }
};

module.exports = setBn;
