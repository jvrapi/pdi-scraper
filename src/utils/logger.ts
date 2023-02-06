import chalk from 'chalk';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import util from 'node:util';
import {format} from 'date-fns'

const { log, time, timeEnd } = console;

function createLogFile( message: string){
  const folderPath = resolve(__dirname, `../../logs`)

  if(!existsSync(folderPath)){
    mkdirSync(folderPath, { recursive: true})
  }

  const currentDate = format(new Date(),"yyyy-MM-dd")
  

  const writer = createWriteStream(`${folderPath}/${currentDate}.log`, 'utf-8')

  writer.write(`${message}\n`)
}

export const logger = {
  error: (message: unknown) => log(chalk.red.bold(util.format(message))),
  success: (message: unknown) => log(chalk.green.bold(util.format(message))),
  warn: (message: unknown) => log(chalk.yellow.bold(util.format(message))),
  message: (message: unknown) => log(chalk.cyan.bold(util.format(message))),
  file: {
    write: (message: string) => createLogFile(message)
  },
  timer: {
    start: (label: string) => time(chalk.green.bold(`✔️ ${label}`)),
    stop: (label: string) => timeEnd(chalk.green.bold(`✔️ ${label}`))
  }

};
