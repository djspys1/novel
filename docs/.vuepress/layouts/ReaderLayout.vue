<template>
  <div class="reader" ref="el">
    <Content />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const el = ref()
const route = useRoute()

onMounted(() => {
  const key = `read-pos:${route.path}`
  const pos = localStorage.getItem(key)
  if (pos) el.value.scrollTop = Number(pos)

  el.value.addEventListener('scroll', () => {
    localStorage.setItem(key, el.value.scrollTop)
  })
})
</script>

<style>
.reader {
  max-width: 720px;
  margin: auto;
  padding: 3rem 1.5rem;
  font-size: 18px;
  line-height: 1.8;
}
</style>
