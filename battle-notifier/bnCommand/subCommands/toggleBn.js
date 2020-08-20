const { emoji } = require('../config');

const toggleBn = async ({ message, store, isOn }) => {
  try {
    await store.set(message.author.id, { isOn });
    message.react(emoji.ok);
  } catch {
    message.react(emoji.error);
  }
};

module.exports = toggleBn;
