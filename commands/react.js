module.exports = {
  name: 'react',
  execute({ message, args }) {
    if (args && args[0] === 'ok') {
      message.react('✔');
    } else {
      message.react('❌');
    }
  },
};
