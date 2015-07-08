module.exports = function(options) {
  return {
    dir: options.dir || process.cwd(),
    port: parseInt(options.port || 3000, 10),
    libs: options.libs
  };
};
