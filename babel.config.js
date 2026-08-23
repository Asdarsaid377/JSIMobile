module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
          },
        },
      ],
      // react-native-reanimated v4 split its worklet transform into react-native-worklets —
      // this plugin is required and must be last in the array (per reanimated's own docs),
      // otherwise worklet functions don't get transformed and the app can crash on start.
      "react-native-worklets/plugin",
    ],
  };
};
