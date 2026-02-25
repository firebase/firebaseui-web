<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onAuthStateChanged, type User } from "firebase/auth";
import { applyPureReactInVue } from "veaury";
import FirebaseUiExperiment from "./react_app/FirebaseUiExperiment";
import { auth } from "./react_app/firebase";

const ReactFirebaseUiExperiment = applyPureReactInVue(FirebaseUiExperiment);
const authUser = ref<User | null>(auth.currentUser);
const authReady = ref(false);
const theme = ref<"light" | "dark">("light");

const authStatus = computed(() => {
  if (!authReady.value) return "Checking auth state...";
  if (!authUser.value) return "Signed out";
  return `Signed in as ${authUser.value.email ?? authUser.value.phoneNumber ?? authUser.value.uid}`;
});

let unsubscribeAuth: (() => void) | undefined;

function applyTheme(nextTheme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  localStorage.setItem("theme", nextTheme);
  theme.value = nextTheme;
}

onMounted(() => {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(storedTheme === "dark" || (!storedTheme && prefersDark) ? "dark" : "light");

  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    authUser.value = user;
    authReady.value = true;
  });
});

onUnmounted(() => {
  unsubscribeAuth?.();
});
</script>

<template>
  <div class="page">
    <h1>Vue + React Bridge Experiment</h1>
    <p class="subtitle">This Vue app mounts `@firebase-oss/ui-react` through veaury.</p>
    <div class="theme-controls">
      <button
        type="button"
        class="theme-button"
        :class="{ active: theme === 'light' }"
        @click="applyTheme('light')"
      >
        Light
      </button>
      <button type="button" class="theme-button" :class="{ active: theme === 'dark' }" @click="applyTheme('dark')">
        Dark
      </button>
    </div>
    <div class="status-panel">
      <div class="status-label">Auth Status</div>
      <div class="status-value">{{ authStatus }}</div>
    </div>
    <ReactFirebaseUiExperiment />
  </div>
</template>
