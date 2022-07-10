require("ts-node/register");
const upstreamTransformer = require("metro-react-native-babel-transformer");
const { transform } = require("./transformer");

module.exports.transform = async ({ src, filename, options }) => {
  return upstreamTransformer.transform(transform({ src, filename, options }));
};
