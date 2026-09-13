module.exports = {
  tagPrefix: "",
  bumpFiles: [
    { filename: "github-user-notes.user.js", updater: "meta-updater.js" }
  ],
  scripts: {
    prerelease: "npm run lint:all"
  },
  writerOpts: {
    finalizeContext(context) {
      if (!context.commitGroups?.length) {
        context.commitGroups = [{ commits: [{ header: "No significant changes" }] }];
      }
      return context;
    }
  }
};
