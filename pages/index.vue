<template>
  <NLayout class="h-screen">
    <NLayoutHeader class="flex justify-center">
      <NH1 class="p-4">EPUB/TXT 电子书繁简转换</NH1>
    </NLayoutHeader>
    <NLayoutContent class="flex justify-center">
      <NCard title="EPUB" class="m-4 w-96" hoverable embedded>
        <NForm
          ref="epubFormRef"
          :model="epubFormValue"
          size="small"
          label-placement="left"
          label-align="left"
          label-width="auto"
        >
          <NFormItem label="文件">
            <NUpload
              v-model:file-list="epubFormValue.fileList"
              :max="1"
              :directory="false"
              accept="application/epub+zip"
            >
              <NButton size="small">上传文件</NButton>
            </NUpload>
          </NFormItem>
          <NFormItem label="转换器">
            <NSelect
              :options="options"
              v-model:value="epubFormValue.converter"
            />
          </NFormItem>
          <NFormItem>
            <NButton @click="handleSubmit">转换</NButton>
          </NFormItem>
        </NForm>
      </NCard>
      <NCard title="TXT" class="m-4 w-96" hoverable embedded>
        <!-- <NForm
          size="small"
          label-placement="left"
          label-align="left"
          label-width="auto"
        >
          <NFormItem label="文件">
            <NUpload accept="text/plain" :max="1">
              <NButton size="small">上传文件</NButton>
            </NUpload>
          </NFormItem>
          <NFormItem label="转换器">
            <NSelect :options="options" />
          </NFormItem>
          <NFormItem>
            <NButton>转换</NButton>
          </NFormItem>
        </NForm> -->
      </NCard>
    </NLayoutContent>
  </NLayout>
</template>

<script setup lang="ts">
import type { FormInst, SelectOption, UploadFileInfo } from "naive-ui";

const epubFormRef = ref<FormInst | null>(null);
const epubFormValue = ref({
  fileList: [] as UploadFileInfo[],
  converter: null,
});

const options: SelectOption[] = [
  {
    label: "简体化",
    value: "Simplified",
  },
  {
    label: "繁体化",
    value: "Traditional",
  },
  {
    label: "中国大陆化",
    value: "China",
  },
  {
    label: "中国香港化",
    value: "Hongkong",
  },
  {
    label: "中国台湾化",
    value: "Taiwan",
  },
  {
    label: "拼音化",
    value: "Pinyin",
  },
  {
    label: "注音化",
    value: "Bopomofo",
  },
  {
    label: "火星化",
    value: "Mars",
  },
  {
    label: "维基简体化",
    value: "WikiSimplified",
  },
  {
    label: "维基繁体化",
    value: "WikiTraditional",
  },
];

function handleSubmit(e: MouseEvent) {
  e.preventDefault();
  epubFormRef.value?.validate(async (errors) => {
    if (!errors) {
      const params = new FormData();
      params.append(
        "converter",
        epubFormValue.value.converter as unknown as string
      );
      params.append("file", epubFormValue.value.fileList[0].file as File);
      const { data } = await useFetch("/api/epub", {
        method: "POST",
        body: params,
        responseType: "blob",
      });

      Download(
        data.value as Blob,
        epubFormValue.value.fileList[0].file?.name as string
      );
    } else {
      console.log(errors);
    }
  });
}

function Download(content: Blob, filename: string) {
  const eleLink = document.createElement("a");
  eleLink.download = filename;
  eleLink.style.display = "none";
  // 字符内容转变成blob地址
  const blob = content;
  eleLink.href = URL.createObjectURL(blob);
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}
</script>
