declare module 'qiao-zip' {
  export function unzip(zipFile: string, destFolder: string): Promise<boolean>;
  export function zip(src: string, dest: string, subdir?: boolean): Promise<boolean>;
}
