const _ = require("lodash");

exports.convertErrorToFrontFormat = (errors) =>
  _.mapValues(errors, (model) => model.msg);
