#!/usr/bin/env node
import { Command } from 'commander';
import spawn from 'cross-spawn';
import * as fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { ReadableStream } from 'node:stream/web';
import path from 'path';
import yauzl from 'yauzl';

import config from '@src/config.json';

const templateUrl = config.templateUrl;
const templateZippedPath = config.pathToRemove;

const program = new Command();

program.requiredOption('-n, --name <string>', 'The name of the project');

program.parse();

const options = program.opts();
const projectName = options.name;

const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);
const zipPath = path.join(projectDir, 'template.zip');
const packageJsonPath = path.join(projectDir, 'package.json');

function getDownloadedFilePath(fileName: string): string {
  if (!templateZippedPath) {
    return fileName;
  }

  return fileName.replace(templateZippedPath, '');
}

(async () => {
  fs.mkdirSync(projectDir);

  const stream = fs.createWriteStream(zipPath);
  const { body } = await fetch(templateUrl);
  await finished(Readable.fromWeb(body as ReadableStream).pipe(stream));

  const unzipDir = projectDir;

  await new Promise((resolve) => {
    yauzl.open(
      zipPath,
      { lazyEntries: true, decodeStrings: true, autoClose: true },
      (err, zipfile) => {
        if (err) {
          console.log('Zip file failed to open');
          throw err;
        }

        zipfile.readEntry();

        zipfile.on('end', () => {
          resolve(null);
        });

        zipfile.on('entry', function (entry) {
          if (/\/$/.test(entry.fileName)) {
            const dir = path.join(
              unzipDir,
              getDownloadedFilePath(entry.fileName),
            );
            console.log('Creating directory:', dir);
            fs.mkdirSync(dir, {
              recursive: true,
            });
            zipfile.readEntry();
          } else {
            zipfile.openReadStream(entry, function (streamErr, readStream) {
              if (streamErr) {
                console.log('Zip file stream error');
                throw streamErr;
              }
              readStream.on('end', function () {
                zipfile.readEntry();
              });

              const filePath = path.join(
                unzipDir,
                getDownloadedFilePath(entry.fileName),
              );

              console.log('Creating file:', filePath);

              const writeStream = fs.createWriteStream(filePath);

              readStream.pipe(writeStream);
            });
          }
        });
      },
    );
  });

  fs.rmSync(zipPath);

  const packageJson = require(packageJsonPath);

  const newPackageJson = { ...packageJson, name: projectName };

  fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));

  spawn.sync('npm', ['install'], { stdio: 'inherit', cwd: projectDir });
  spawn.sync('git', ['init'], { stdio: 'inherit', cwd: projectDir });

  console.log(`Project created in ${projectDir}`);
})().then(() => {
  process.exit(0);
});
