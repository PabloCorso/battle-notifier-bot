const battleExample = require('../battleExample');
const { getSubscribedUserIds } = require('../notifyBattle');

const battleToString = (battle) => {
  return `${battle.designer}: ${battle.level} (${battle.battleType})`;
};

const notifyBattlestart = async ({ battle, store, client }) => {
  const userIds = await getSubscribedUserIds({ battle, store });
  Promise.all(
    userIds.map(async (userId) => {
      const user = await client.users.fetch(userId);
      await user.send(battleToString(battle));
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
