<template>
  <NConfigProvider inline-theme-disabled :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <NuxtPage />
  </NConfigProvider>
</template>

<script setup lang="ts">
  import { zhCN, dateZhCN, lightTheme, darkTheme, useOsTheme, type GlobalTheme } from 'naive-ui';

  const osThemeRef = useOsTheme();
  const theme = ref<GlobalTheme>(lightTheme);

  watch(
    () => osThemeRef.value,
    () => {
      getTheme();
    },
  );
  function getTheme() {
    theme.value = osThemeRef.value === 'dark' ? darkTheme : lightTheme;
  }

  onMounted(() => {
    getTheme();
  });
</script>

<style>
  .page-enter-active,
  .page-leave-active {
    transition: all 0.4s;
  }
  .page-enter-from,
  .page-leave-to {
    opacity: 0;
    filter: blur(1rem);
  }
</style>
