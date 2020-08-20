const battleExample = require('./battleExample');
const { getSubscribedUserIds } = require('../notifyBattle');

const battleToString = (battle) => {
  return `${battle.designer}: ${battle.level} (${battle.battleType})`;
};

const notifyBattlestart = async ({ battle, store, client }) => {
  const userIds = await getSubscribedUserIds({ battle, store });
  const message = `▶ ${battleToString(battle)}`;
  Promise.all(
    userIds.map(async (userId) => {
      const user = await client.fetchUser(userId);
      await user.send(message);
    }),
  );
};

module.exports = {
  name: 'battle',
  execute({ store, client }) {
    const battle = battleExample;
    notifyBattlestart({ battle, store, client });
  },
};
