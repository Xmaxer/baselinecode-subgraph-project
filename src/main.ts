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

const program = new Command();

program.requiredOption('-n, --name <string>', 'The name of the project');
program.requiredOption(
  '-r, --routingUrl <string>',
  'The HTTP endpoint of the subgraph',
);
program.requiredOption('-a, --apiType <string>', 'The API type');

program.parse();

const options = program.opts();
const projectName = options.name;
const routingUrl = options.routingUrl;
const apiType = options.apiType;
const port = new URL(routingUrl).port;
const url = new URL(routingUrl).hostname;

const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);
const zipPath = path.join(projectDir, 'template.zip');
const packageJsonPath = path.join(projectDir, 'package.json');
const envFilePath = path.join(projectDir, '.env');
const loggerFilePath = path.join(projectDir, 'src/utils/logger.mts');

function getDownloadedFilePath(fileName: string): string {
  return fileName.slice(fileName.indexOf('/'));
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

  const newPackageJson = JSON.parse(
    JSON.stringify(packageJson)
      .replaceAll('{{projectName}}', projectName)
      .replaceAll('{{routingUrl}}', routingUrl)
      .replaceAll('{{apiType}}', apiType),
  );

  fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));

  fs.writeFileSync(
    envFilePath,
    `# This will be loaded by dotenv https://www.npmjs.com/package/dotenv
SERVER_PORT=${port}
NODE_ENV=local
SERVER_HOST=${url}
`,
  );

  const rawLoggerFile = fs.readFileSync(loggerFilePath, 'utf-8');

  const updatedRawLoggerFile = rawLoggerFile.replace(
    '{{appName}}',
    projectName,
  );

  fs.writeFileSync(loggerFilePath, updatedRawLoggerFile);

  const runInDirectory = (...commands: Array<string>) => {
    spawn.sync(commands[0], commands.slice(1), {
      stdio: 'inherit',
      cwd: projectDir,
    });
  };

  runInDirectory('git', 'init');
  runInDirectory('npm', 'install');
  runInDirectory('npm', 'run', 'prettier');
  runInDirectory('git', 'add', '.');
  runInDirectory('git', 'commit', '-m', 'Initial commit');

  console.log(`Project created in ${projectDir}`);
})().then(() => {
  process.exit(0);
});
