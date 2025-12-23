import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import fs from 'fs'
import path from 'path'

const novelsDir = path.resolve(__dirname, '../novels')
const pagesDir = path.resolve(__dirname, '../pages')
const sidebar = {}

fs.readdirSync(pagesDir).forEach(categoryName => {
  const categoryPath = path.join(pagesDir, categoryName)
  if (fs.statSync(categoryPath).isDirectory()) {
    fs.readdirSync(categoryPath).forEach(bookName => {
      const bookPath = path.join(categoryPath, bookName)
      if (fs.statSync(bookPath).isDirectory()) {
        const chapters = fs.readdirSync(bookPath)
          .filter(f => f.endsWith('.md'))
          .map(f => {
            const match = f.match(/^第(\d+)章/)
            const num = match ? parseInt(match[1], 10) : 0
            return {
              text: f.replace('.md', ''),
              link: `/pages/${categoryName}/${bookName}/${f.replace('.md', '.html')}`,
              num
            }
          })
          .sort((a, b) => a.num - b.num)
          .map(({ text, link }) => ({ text, link }))
        sidebar[`/pages/${categoryName}/${bookName}/`] = chapters
      }
    })
  }
})

const novelNav = fs.readdirSync(pagesDir)
  .filter(category => fs.statSync(path.join(pagesDir, category)).isDirectory())
  .map(category => {
    const categoryPath = path.join(pagesDir, category)
    const books = fs.readdirSync(categoryPath)
      .filter(book => fs.statSync(path.join(categoryPath, book)).isDirectory())
      .map(book => {
        // 获取该目录下所有文本
        const chapterFiles = fs.readdirSync(path.join(categoryPath, book))
          .filter(c => c.endsWith('.md'))
          .map(f => {
            const match = f.match(/^第(\d+)章/)
            const num = match ? parseInt(match[1], 10) : 0
            return { filename: f, num }
          })
          .sort((a, b) => a.num - b.num)
          .map(({ filename }) => filename)
        const firstChapter = chapterFiles[0] || ''
        return {
          text: book,
          link: firstChapter ? `/pages/${category}/${book}/${firstChapter.replace('.md', '.html')}` : ''
        }
      })
    return {
      text: category,
      children: books
    }
  })

export default defineUserConfig({
  lang: 'en-US',
  base: '/novel',

  title: 'VuePress',
  description: 'My first VuePress Site',

  theme: defaultTheme({
    logo: 'https://vuejs.press/images/hero.png',

    navbar: novelNav,
    sidebar
  }),

  bundler: viteBundler(),
})
