function convertErrorToFrontFormat(errors) {
  return Object.values(errors).map((model) => model.msg);
}

module.exports = convertErrorToFrontFormat;
