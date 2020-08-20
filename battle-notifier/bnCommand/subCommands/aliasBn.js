const bnBattleTypes = require('../bnBattleTypes');
const { getBattleTypeVariations } = require('../userConfig');

const aliasBn = (user) => {
  const typeAliases = bnBattleTypes
    .map((bnType) => getBattleTypeVariations(bnType).join(', '))
    .join('\n');
  user.send(
    `This are all the possible alias for battle types:\n*(can separate battle types and kuski names by comma or spaces)*\n\`\`\`${typeAliases}\`\`\``,
  );
};

module.exports = aliasBn;
