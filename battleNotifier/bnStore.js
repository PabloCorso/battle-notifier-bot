const fs = require('fs');
const util = require('util');

fs.readFileAsync = util.promisify(fs.readFile);
fs.writeFileAsync = util.promisify(fs.writeFile);

const readJsonFile = async path => {
  let result = {};
  try {
    const fileHandle = await fs.readFileAsync(path);
    result = JSON.parse(fileHandle.toString());
  } catch (error) {
    result = {};
  }

  return result;
};

const writeJsonFile = async (fileName, data) => {
  await fs.writeFileAsync(fileName, JSON.stringify(data));
};

const createBnStore = path => {
  const getAll = async () => {
    return readJsonFile(path);
  };

  const get = async userId => {
    const bnStore = await getAll();
    return bnStore[userId];
  };

  const set = async (user, values) => {
    const { id: userId, username: userName } = user;
    const bnStore = await getAll();

    const createAt = bnStore[userId].createAt || new Date();
    const updateAt = new Date();
    const userConfig = {
      ...bnStore[userId],
      userName,
      createAt,
      updateAt,
      ...values,
    };

    const data = { ...bnStore, [userId]: userConfig };
    await writeJsonFile(path, data);
  };

  return {
    get,
    set,
    getAll,
  };
};

module.exports = createBnStore;
