<template>
  <NConfigProvider inline-theme-disabled :locale="zhCN" :date-locale="dateZhCN">
    <NuxtPage />
  </NConfigProvider>
</template>

<script setup lang="ts">
import { zhCN, dateZhCN } from "naive-ui";
</script>
