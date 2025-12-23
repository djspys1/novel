import fs from 'fs'
import path from 'path'

const txtDir = path.resolve('docs/novels')
const outDir = path.resolve('docs/pages')

const chapterReg = /^第[\d一二三四五六七八九十百千]+章\s+(.+)$/gm


function normalizeText(text) {
    return text
        .replace(/\r\n/g, '\n')        // 统一换行
        .replace(/\n{2,}/g, '\n\n')    // 多行压缩
        .replace(/([^\n])\n([^\n])/g, '$1\n\n$2') // 单换行 → 段落
}

fs.mkdirSync(outDir, { recursive: true })

fs.readdirSync(txtDir).forEach(file => {
    if (!file.endsWith('.txt')) return

    const name = file.replace('.txt', '')
    const slug = name
    const text = fs.readFileSync(path.join(txtDir, file), 'utf-8')

    const novelDir = path.join(outDir, slug)
    fs.mkdirSync(novelDir, { recursive: true })

    const matches = [...text.matchAll(chapterReg)]
        matches.forEach((m, i) => {
            const start = m.index
            const end = matches[i + 1]?.index ?? text.length
            const content = normalizeText(
                text.slice(start, end)
            )
            // 获取章节名（如“第一章 xxx”）
            let chapterName = m[0].replace(/\s+/g, '_')
            // 防止特殊字符影响文件名
            chapterName = chapterName.replace(/[^\w\u4e00-\u9fa5_\-]/g, '')
fs.writeFileSync(
  path.join(novelDir, `${chapterName}.md`),
  `---
layout: ReaderLayout
---

${content}` // 注意 frontmatter 后有两个换行
)
        })
})
