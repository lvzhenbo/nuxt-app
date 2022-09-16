<template>
  <NConfigProvider
    inline-theme-disabled
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="isDark ? darkTheme : null "
  >
    <NLayout class="h-screen">
      <NLayoutHeader>颐和园</NLayoutHeader>
      <NLayoutContent content-style="padding: 24px;"> 平山道 </NLayoutContent>
      <NLayoutFooter>成府路</NLayoutFooter>
    </NLayout>
  </NConfigProvider>
  <!-- <div>
    <NuxtLayout>
      <NuxtPage class="p-4" />
    </NuxtLayout>
  </div> -->
</template>

<script lang="ts" setup>
import {
  NConfigProvider,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NLayoutHeader,
} from "naive-ui";
import { zhCN, dateZhCN, useOsTheme, darkTheme } from "naive-ui";
import { computed } from "vue";
import { usePreferredDark } from '@vueuse/core';

const osThemeRef = useOsTheme();
const isDark = usePreferredDark();
console.log(isDark.value);

const theme = computed(() => (osThemeRef.value === 'dark' ? darkTheme : null));
console.log(osThemeRef.value);

</script>

<style scoped></style>
