import fsP from "node:fs/promises";
import fs from "node:fs";
import tmp from "tmp-promise";
import { globby } from "globby";
import path from "path";
import iconvLite from "iconv-lite";
import chardet from "chardet";
import archiver from "archiver";
import { unzip, zip } from "qiao-zip";

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event);
  const file = formData.get("file") as File;
  const converter = formData.get("converter") as string;
  const { path: rowPath, cleanup: rowFileCleanup } = await tmp.file({
    postfix: ".epub",
  });
  const { path: dirPath, cleanup: dirCleanup } = await tmp.dir({
    unsafeCleanup: true,
  });
  const { path: outPath, cleanup: outCleanup } = await tmp.file({
    postfix: ".epub",
  });

  const buffer = await file.arrayBuffer();
  await fsP.writeFile(rowPath, Buffer.from(buffer));

  await unzip(rowPath, dirPath);

  const files = (
    await globby("**/*.{htm,html,xhtml,ncx,opf}", { cwd: dirPath })
  ).map((f) => path.join(dirPath, f));

  // await Promise.all(files.map((f) => textConvert(f, { converter })));

  await zipDir(dirPath, outPath);

  const send = sendStream(event, fs.createReadStream(outPath));
  await rowFileCleanup();
  await dirCleanup();
  await outCleanup();
  return send;

  // return {
  //   hello: "world",
  // };
});

async function textConvert(filePath: string, config: { converter: string }) {
  const TYPES = [
    "Simplified",
    "Traditional",
    "China",
    "Hongkong",
    "Taiwan",
    "WikiSimplified",
    "WikiTraditional",
  ];
  const buf = await fsP.readFile(filePath);
  if (!TYPES.includes(config.converter)) {
    throw new Error("Invalid converter value.");
  }
  const text = iconvLite.decode(buf, chardet.detect(buf) as string);
  const converted = await convertFun(text, config.converter);

  return fsP.writeFile(filePath, converted, "utf-8");
}

async function convertFun(text: string, converter: string) {
  const res: any = await $fetch("https://api.zhconvert.org/convert", {
    method: "POST",
    body: {
      text,
      converter,
    },
  });
  return res.data.text;
}

async function zipDir(dir: string, out: string) {
  await new Promise((res, rej) => {
    const st = fs.createWriteStream(out);
    const ar = archiver("zip", {
      zlib: { level: 9 },
    });
    ar.on("end", res);
    ar.on("error", rej);
    ar.pipe(st);
    ar.directory(dir, false);
    ar.finalize();
  });
}
