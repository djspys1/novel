import { CodeTabs } from "/Users/pengding/Documents/project/extra/txt-reader/node_modules/.store/@vuepress+plugin-markdown-tab@2.0.0-rc.86/node_modules/@vuepress/plugin-markdown-tab/lib/client/components/CodeTabs.js";
import { Tabs } from "/Users/pengding/Documents/project/extra/txt-reader/node_modules/.store/@vuepress+plugin-markdown-tab@2.0.0-rc.86/node_modules/@vuepress/plugin-markdown-tab/lib/client/components/Tabs.js";
import "/Users/pengding/Documents/project/extra/txt-reader/node_modules/.store/@vuepress+plugin-markdown-tab@2.0.0-rc.86/node_modules/@vuepress/plugin-markdown-tab/lib/client/styles/vars.css";

export default {
  enhance: ({ app }) => {
    app.component("CodeTabs", CodeTabs);
    app.component("Tabs", Tabs);
  },
};
