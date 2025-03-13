import ansiColors from 'ansi-colors'

export class Logger {
  static log (content: string, context: string, timeDiff?: string) {
    const prime = `${ ansiColors.green('[Nest] ' + process.pid + '  - ') }`
    const time = new Date().toLocaleString()
    const msg = `    ${ ansiColors.green('LOG') } ${ ansiColors.yellow(content) } ${ ansiColors.green(context) } ${ ansiColors.yellow(timeDiff) }`

    const message = prime + time + msg

    console.log(message)
  }
}