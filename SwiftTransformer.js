const upstreamTransformer = require("metro-react-native-babel-transformer");

module.exports.transform = async ({ src, filename, options }) => {
  if (filename.endsWith(".swift")) {
    const matches = src.match(/^\s+Name\("([a-zA-Z0-9_-]+)"\)$/gm);
    if (matches && matches.length > 1) {
      const moduleName = matches[1];
      src = `module.exports = { Module: require('expo-modules-core').NativeModulesProxy["${moduleName}"]; }`;
    } else {
      console.warn(
        'Failed to locate module name (ex: `Name("FooBar")`) in swift file: ' +
          filename
      );
      src = `module.exports = { Module: null };`;
    }
  }
  return upstreamTransformer.transform({ src, filename, options });
};
