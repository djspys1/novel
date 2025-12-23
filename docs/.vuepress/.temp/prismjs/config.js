import "/Users/pengding/Documents/project/extra/txt-reader/node_modules/@vuepress/highlighter-helper/lib/client/styles/base.css"
import "/Users/pengding/Documents/project/extra/txt-reader/node_modules/@vuepress/plugin-prismjs/lib/client/styles/nord.css"
import "/Users/pengding/Documents/project/extra/txt-reader/node_modules/@vuepress/highlighter-helper/lib/client/styles/line-numbers.css"
import "/Users/pengding/Documents/project/extra/txt-reader/node_modules/@vuepress/highlighter-helper/lib/client/styles/notation-highlight.css"
import "/Users/pengding/Documents/project/extra/txt-reader/node_modules/@vuepress/highlighter-helper/lib/client/styles/collapsed-lines.css"
import { setupCollapsedLines } from "/Users/pengding/Documents/project/extra/txt-reader/node_modules/@vuepress/highlighter-helper/lib/client/index.js"
import "/Users/pengding/Documents/project/extra/txt-reader/node_modules/@vuepress/highlighter-helper/lib/client/styles/code-block-title.css"

export default {
  setup() {
    setupCollapsedLines()
  }
}
