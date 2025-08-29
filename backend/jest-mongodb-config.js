module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '7.0.0',
      skipMD5: true,
    },
    instance: {
      dbName: 'jest',
      port: 27017,
    },
    autoStart: true,
    debug: false,
  },
};
