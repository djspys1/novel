import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import fs from 'fs'
import path from 'path'

const novelsDir = path.resolve(__dirname, '../novels')
const pagesDir = path.resolve(__dirname, '../pages')
const sidebar = {}

fs.readdirSync(pagesDir).forEach(novelName => {
  const novelPath = path.join(pagesDir, novelName)
  if (fs.statSync(novelPath).isDirectory()) {
    // 获取所有章节
    const chapters = fs.readdirSync(novelPath)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        // 提取章节号
        const match = f.match(/^第(\d+)章/)
        const num = match ? parseInt(match[1], 10) : 0
        return {
          text: f.replace('.md', ''),
          link: `/pages/${novelName}/${f.replace('.md', '.html')}`,
          num
        }
      })
      .sort((a, b) => a.num - b.num) // 按章节号排序
      .map(({ text, link }) => ({ text, link })) // 去掉 num 字段
    sidebar[`/pages/${novelName}/`] = chapters
  }
})

const novelNav = fs.readdirSync(novelsDir)
  .filter(f => f.endsWith('.txt'))
  .map(f => {
    const name = f.replace('.txt', '')
    // 获取该小说目录下所有章节
    const chapterFiles = fs.readdirSync(path.join(pagesDir, name))
      .filter(c => c.endsWith('.md'))
      .sort()
    // 取第一个章节文件
    const firstChapter = chapterFiles[0] || ''
    return {
      text: name,
      link: firstChapter ? `/pages/${name}/${firstChapter.replace('.md', '.html')}` : ''
    }
  })

export default defineUserConfig({
  lang: 'en-US',
  base: '/',

  title: 'VuePress',
  description: 'My first VuePress Site',

  theme: defaultTheme({
    logo: 'https://vuejs.press/images/hero.png',

    navbar: [{
      text: '小说',
      children: novelNav
    }],
    sidebar
  }),

  bundler: viteBundler(),
})
