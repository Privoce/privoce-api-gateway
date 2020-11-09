const { UserModel } = require("../../models/user");

const { encryptPassword } = require("../../utils/encryptPassword");

function addUser(model) {
  const user = new UserModel({
    nickname: model.nickname,
    password: encryptPassword(model.password),
    profileColor: model.profileColor,
  });

  return user.save();
}

function findUser(query, params) {
  return UserModel.find(query, params);
}

function findOneUser(query, params) {
  return UserModel.findOne(query, params);
}

function findOneUserByIdAndUpdate(id, params) {
  return UserModel.findOneAndUpdate(
    {
      _id: id,
    },
    params
  );
}

module.exports = { addUser, findUser, findOneUser, findOneUserByIdAndUpdate };
