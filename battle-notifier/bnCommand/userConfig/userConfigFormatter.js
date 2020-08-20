const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const listItemToString = (item) => {
  return Object.values(item).join(', ');
};

const isUserConfigEmpty = (userConfig) => {
  return (
    userConfig.notifyList.length === 0 && userConfig.ignoreList.length === 0
  );
};

const userConfigFormatter = ({ keyword }) => {
  const configListToString = (list, isIgnore = false) => {
    const stringValues = list.map((item) => {
      const ignore = isIgnore ? `${capitalize(keyword.ignore)} ` : '';
      const battleTypes =
        listItemToString(item.battleTypes) || capitalize(keyword.any);
      const designers = listItemToString(item.designers) || keyword.any;

      return `${ignore}${battleTypes}${keyword.separator}${designers}`;
    });
    return stringValues.join('\n');
  };

  const userConfigToString = (userConfig) => {
    let result = '';

    const isEmpty = isUserConfigEmpty(userConfig);
    if (!isEmpty) {
      const notify = configListToString(userConfig.notifyList);
      const ignore = configListToString(userConfig.ignoreList, true);
      result = `${notify}${notify ? '\n' : ''}${ignore}`;
    } else {
      result =
        'No notifications set, please use `!bn` to set your configuration';
    }

    return result;
  };

  return { toString: userConfigToString };
};

module.exports = userConfigFormatter;
module.exports.isUserConfigEmpty = isUserConfigEmpty;
