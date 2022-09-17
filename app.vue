<template>
  <NConfigProvider
    inline-theme-disabled
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="theme"
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
import { computed, onMounted } from "vue";
import { usePreferredDark } from '@vueuse/core';

const osThemeRef = useOsTheme();
const isDark = usePreferredDark();
// console.log(isDark.value);
const theme = ref(null);

// const theme = computed(() => (osThemeRef.value === 'dark' ? darkTheme : null));
watch(() => osThemeRef.value, () => {
  theme.value = osThemeRef.value === 'dark' ? darkTheme : null
})
function getTheme() {
  theme.value = osThemeRef.value === 'dark' ? darkTheme : null
}

onMounted(() => {
  getTheme();
});

</script>

<style scoped></style>
