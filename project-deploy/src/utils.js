import { writeFile, readFile } from 'fs'
import { promisify } from 'util'
import ora from 'ora'
export { globby as glob } from 'globby'

export const write = promisify(writeFile)
export const read = promisify(readFile)

export const getLogger = () => {
  if (!globalThis.logger) globalThis.logger = ora('Project deploy').start()

  return logger
}
