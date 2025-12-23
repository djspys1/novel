
import fs from 'fs'
import path from 'path'

const novelsRoot = path.resolve('docs/novels')
const outRoot = path.resolve('docs/pages')
const chapterReg = /^第[\d一二三四五六七八九十百千]+章\s+(.+)$/gm

function normalizeText(text) {
    return text
        .replace(/\r\n/g, '\n')        // 统一换行
        .replace(/\n{2,}/g, '\n\n')    // 多行压缩
        .replace(/([^\n])\n([^\n])/g, '$1\n\n$2') // 单换行 → 段落
}

fs.mkdirSync(outRoot, { recursive: true })

// 遍历分类文件夹
fs.readdirSync(novelsRoot).forEach(categoryName => {
    const categoryDir = path.join(novelsRoot, categoryName)
    if (!fs.statSync(categoryDir).isDirectory()) return

    // 遍历小说文件夹
    fs.readdirSync(categoryDir).forEach(novelName => {
        const novelDir = path.join(categoryDir, novelName)
        if (!fs.statSync(novelDir).isDirectory()) return

        // 读取 content.txt
        const contentPath = path.join(novelDir, 'content.txt')
        if (!fs.existsSync(contentPath)) return
        const text = fs.readFileSync(contentPath, 'utf-8')

        // 输出目录 docs/pages/category/novel
        const outNovelDir = path.join(outRoot, categoryName, novelName)
        fs.mkdirSync(outNovelDir, { recursive: true })

        // 章节解析
        const matches = [...text.matchAll(chapterReg)]
        matches.forEach((m, i) => {
            const start = m.index
            const end = matches[i + 1]?.index ?? text.length
            const content = normalizeText(text.slice(start, end))
            let chapterName = m[0].replace(/\s+/g, '_')
            chapterName = chapterName.replace(/[^\w\u4e00-\u9fa5_\-]/g, '')
            fs.writeFileSync(
                path.join(outNovelDir, `${chapterName}.md`),
                `${content}`
            )
        })
    })
})
