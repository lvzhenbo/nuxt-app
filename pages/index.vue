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
          :rules="rules"
          require-mark-placement="left"
        >
          <NFormItem label="文件" path="fileList">
            <NUpload
              v-model:file-list="epubFormValue.fileList"
              :max="1"
              :directory="false"
              accept="application/epub+zip"
              :disabled="loading"
              @change="handleChange"
            >
              <NButton :disabled="loading" size="small">上传文件</NButton>
            </NUpload>
          </NFormItem>
          <NFormItem label="转换器" path="converter">
            <NSelect
              v-model:value="epubFormValue.converter"
              :disabled="loading"
              :options="options"
            />
          </NFormItem>
          <NFormItem>
            <NButton :loading="loading" @click="handleSubmit">转换</NButton>
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
  import type { FormInst, SelectOption, UploadFileInfo, FormRules } from 'naive-ui';
  import Jszip from 'jszip';
  import { minimatch } from 'minimatch';

  const epubFormRef = ref<FormInst | null>(null);
  const epubFormValue = ref({
    fileList: [] as UploadFileInfo[],
    converter: null,
  });
  const converterFiles = ref<{ path: string; file: string }[]>([]);
  const options: SelectOption[] = [
    {
      label: '简体化',
      value: 'Simplified',
    },
    {
      label: '繁体化',
      value: 'Traditional',
    },
    {
      label: '中国大陆化',
      value: 'China',
    },
    {
      label: '中国香港化',
      value: 'Hongkong',
    },
    {
      label: '中国台湾化',
      value: 'Taiwan',
    },
    {
      label: '拼音化',
      value: 'Pinyin',
    },
    {
      label: '注音化',
      value: 'Bopomofo',
    },
    {
      label: '火星化',
      value: 'Mars',
    },
    {
      label: '维基简体化',
      value: 'WikiSimplified',
    },
    {
      label: '维基繁体化',
      value: 'WikiTraditional',
    },
  ];
  const rules: FormRules = {
    fileList: [
      {
        required: true,
        trigger: 'change',
        validator: (rule, value: UploadFileInfo[]) => {
          if (value.length === 0) {
            return new Error('请选择文件');
          }
          if (value[0].file?.type !== 'application/epub+zip') {
            return new Error('请选择 EPUB 文件');
          }
          return true;
        },
      },
    ],
    converter: [{ required: true, message: '请选择转换器', trigger: 'change' }],
  };
  const loading = ref(false);
  const isBackEnd = ref(false);
  const message = useMessage();

  onMounted(async () => {
    const { data } = await useFetch('/api/', {
      method: 'get',
    });
    if (data.value) {
      isBackEnd.value = true;
    }
  });

  function handleSubmit(e: MouseEvent) {
    e.preventDefault();
    epubFormRef.value?.validate(async (errors) => {
      if (!errors) {
        try {
          loading.value = true;
          message.loading('转换中，请稍后...');
          if (isBackEnd.value) {
            const params = new FormData();
            params.append('converter', epubFormValue.value.converter as unknown as string);
            params.append('file', epubFormValue.value.fileList[0].file as File);
            const { data } = await useFetch('/api/epub', {
              method: 'POST',
              body: params,
              responseType: 'blob',
            });
            const res: Ref<any> = await textConvert(
              epubFormValue.value.fileList[0].file?.name as string,
              epubFormValue.value.converter as unknown as string,
            );
            if (res.value.data.text) {
              Download(data.value as Blob, res.value.data.text);
            } else {
              Download(data.value as Blob, epubFormValue.value.fileList[0].file?.name as string);
            }
          } else {
            for (let i = 0; i < converterFiles.value.length; i++) {
              const res: Ref<any> = await textConvert(
                converterFiles.value[i].file,
                epubFormValue.value.converter as unknown as string,
              );
              if (res.value.data.text) {
                converterFiles.value[i].file = res.value.data.text;
              }
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            await editZip();
          }
          loading.value = false;
          message.success('转换成功');
        } catch (error) {
          console.error(error);
          loading.value = false;
          message.error('转换失败，如有需要请联系我');
        }
      } else {
        console.log(errors);
      }
    });
  }

  function Download(content: Blob, filename: string) {
    const eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    const blob = content;
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    URL.revokeObjectURL(eleLink.href); // 释放URL 对象
    document.body.removeChild(eleLink);
  }

  async function handleChange({
    file,
    event,
  }: {
    file: UploadFileInfo;
    fileList: Array<UploadFileInfo>;
    event?: Event;
  }) {
    if (event) {
      converterFiles.value = [];
      const zip = await Jszip.loadAsync(file.file as File);
      zip.forEach(async (relativePath, zipFile) => {
        if (minimatch(relativePath, '**/*.{htm,html,xhtml,ncx,opf}')) {
          converterFiles.value.push({
            path: relativePath,
            file: await zipFile.async('string'),
          });
        }
      });
    } else {
      converterFiles.value = [];
    }
  }

  async function textConvert(text: string, converter: string) {
    const { data } = await useFetch('https://api.zhconvert.org/convert', {
      method: 'POST',
      body: {
        text,
        converter,
      },
    });
    return data;
  }

  async function editZip() {
    const zip = await Jszip.loadAsync(epubFormValue.value.fileList[0].file as File);
    for (let i = 0; i < converterFiles.value.length; i++) {
      zip.file(converterFiles.value[i].path, converterFiles.value[i].file);
    }
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
    const res: Ref<any> = await textConvert(
      epubFormValue.value.fileList[0].file?.name as string,
      epubFormValue.value.converter as unknown as string,
    );
    if (res.value.data.text) {
      Download(content, res.value.data.text);
    } else {
      Download(content, epubFormValue.value.fileList[0].file?.name as string);
    }
  }
</script>
