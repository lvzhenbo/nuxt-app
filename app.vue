<template>
  <NConfigProvider
    inline-theme-disabled
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
  <div class="p-4">

  </div>
  </NConfigProvider>
  <!-- <div>
    <NuxtLayout>
      <NuxtPage class="p-4" />
    </NuxtLayout>
  </div> -->
</template>

<script lang="ts" setup>
import { NConfigProvider } from "naive-ui";
import { zhCN, dateZhCN } from "naive-ui";
</script>
