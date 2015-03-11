module.exports = function(pruneEntryPoints) {
  return pruneEntryPoints && {
      entryPoints: (typeof pruneEntryPoints === 'string' ? [pruneEntryPoints] : pruneEntryPoints)
    };
};
