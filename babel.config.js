module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["inline-import", { extensions: [".sql"] }],
      [
        "module-resolver",
        {
          alias: {
            "@": "./",        // ✅ allows "@/constant/..." to resolve from root
            "@app": "./app",  // ✅ allows "@app/..." inside app folder
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
