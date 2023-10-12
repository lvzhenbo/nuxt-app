declare module 'qiao-zip' {
  function unzip(zipFile: string, destFolder: string): Promise<boolean>;
  function zip(src: string, dest: string, subdir?: boolean): Promise<boolean>;
}
