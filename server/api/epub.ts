import formidable from "formidable";
import type { H3Event } from "h3";
import tmp from "tmp-promise";
import fs from "fs-extra";
import unzipper from "unzipper";
import { globby } from "globby";
import path from "path";
import iconvLite from "iconv-lite";
import chardet from "chardet";
import archiver from "archiver";

export default defineEventHandler(async (event) => {
  const { file, _fields } = await getData(event);
  const config: any = {};
  const filePath = file.file.filepath;
  config.type = _fields.converter;
  const { path: dir, cleanup } = await tmp.dir({ unsafeCleanup: true });

  await new Promise((res, rej) => {
    fs.createReadStream(file.file.filepath)
      .pipe(unzipper.Extract({ path: dir }))
      .on("close", res)
      .on("error", rej);
  });
  const files = (
    await globby("**/*.{htm,html,xhtml,ncx,opf}", { cwd: dir })
  ).map((f) => path.join(dir, f));
  await Promise.all(files.map((f) => textConvert(f, { type: config.type })));
  await zipDir(dir, config.dest || filePath);
  await cleanup();

  return sendStream(
    event,
    fs.createReadStream(filePath, { start: 0, end: file.file.size })
  );
  // return {
  //   filepath: file.file.filepath,
  // };
});

function getData(
  event: H3Event,
  options?: formidable.Options
): Promise<formidable> {
  return new Promise((resolve, reject) => {
    const form = formidable(options);

    form.parse(event.req, (err, _fields, files) => {
      if (err) reject(err);

      resolve({ file: files, _fields });
    });
  });
}

async function textConvert(filePath, config) {
  const TYPES = [
    "Simplified",
    "Traditional",
    "China",
    "Hongkong",
    "Taiwan",
    "WikiSimplified",
    "WikiTraditional",
  ];
  const buf = await fs.readFile(filePath);
  if (!TYPES.includes(config.type)) {
    throw new Error("Invalid config.type value.");
  }
  const text = iconvLite.decode(buf, chardet.detect(buf));
  const converted = await convertFun(text, config.type);

  return fs.writeFile(config.dest || filePath, converted, "utf-8");
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

async function zipDir(dir, dest) {
  await new Promise((res, rej) => {
    const st = fs.createWriteStream(dest);
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
