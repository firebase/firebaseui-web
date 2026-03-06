<script setup lang="ts">
import { applyPureReactInVue } from "veaury";
import { setVeauryOptions } from "veaury";
import { createRoot } from "react-dom/client";
import ReactRootComponent from "./ReactRoot";

// react-dom 19+ requires explicit createRoot configuration
setVeauryOptions({ react: { createRoot } });

const ReactApp = applyPureReactInVue(ReactRootComponent);
</script>

<template>
  <ReactApp />
</template>
