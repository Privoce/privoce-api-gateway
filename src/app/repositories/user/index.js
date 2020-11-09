const { UserModel } = require("../../models/user");

const { encryptPassword } = require("../../utils/encryptPassword");

exports.addUser = (model) => {
  const user = new UserModel({
    nickname: model.nickname,
    password: encryptPassword(model.password),
    profileColor: model.profileColor,
  });

  return user.save();
};

exports.findUser = (query, params) => UserModel.find(query, params);
exports.findOneUser = (query, params) => UserModel.findOne(query, params);
exports.findOneUserByIdAndUpdate = (id, params) =>
  UserModel.findOneAndUpdate(
    {
      _id: id,
    },
    params
  );
