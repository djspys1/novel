import { GitContributors } from "/Users/pengding/Documents/project/extra/txt-reader/node_modules/.store/@vuepress+plugin-git@2.0.0-rc.88/node_modules/@vuepress/plugin-git/lib/client/components/GitContributors.js";
import { GitChangelog } from "/Users/pengding/Documents/project/extra/txt-reader/node_modules/.store/@vuepress+plugin-git@2.0.0-rc.88/node_modules/@vuepress/plugin-git/lib/client/components/GitChangelog.js";

export default {
  enhance: ({ app }) => {
    app.component("GitContributors", GitContributors);
    app.component("GitChangelog", GitChangelog);
  },
};
