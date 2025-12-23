import { defineClientConfig } from 'vuepress/client'

export default defineClientConfig({
  enhance({ router }) {
    if (typeof window !== 'undefined') {
      router.afterEach((to) => {
        const key = `read-pos:${to.path}`
        const pos = localStorage.getItem(key)
        if (pos) {
          setTimeout(() => {
            window.scrollTo(0, Number(pos))
          }, 0)
        }
      })

      window.addEventListener('scroll', () => {
        const key = `read-pos:${router.currentRoute.value.path}`
        localStorage.setItem(key, window.scrollY)
      })

      window.addEventListener('DOMContentLoaded', () => {
        const key = `read-pos:${router.currentRoute.value.path}`
        const pos = localStorage.getItem(key)
        if (pos) {
          setTimeout(() => {
            window.scrollTo(0, Number(pos))
          }, 0)
        }
      })
    }
  },
})
