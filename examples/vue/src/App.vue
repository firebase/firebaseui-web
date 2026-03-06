<script setup lang="ts">
import { ref } from 'vue'
import { applyPureReactInVue } from 'veaury'
import HelloReact from './react_app/Hello.jsx'

const ReactHello = applyPureReactInVue(HelloReact)

const vueCount = ref(0)
</script>

<template>
  <div class="app">
    <h1>Veaury Demo — Vue + React</h1>

    <section class="card">
      <p>🟢 This is a <strong>Vue</strong> component</p>
      <button @click="vueCount++">Vue count: {{ vueCount }}</button>
    </section>

    <section class="card">
      <ReactHello name="Vue App" />
    </section>
  </div>
</template>

<style scoped>
.app {
  font-family: sans-serif;
  max-width: 480px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
h1 {
  font-size: 1.4rem;
  margin: 0;
}
.card {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
button {
  padding: 0.4rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #888;
}
</style>
