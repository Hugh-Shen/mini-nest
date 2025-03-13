import { NestApplication } from './nest-application'
import { Logger } from './logger'

export class NestFactory {
  static async create(module: any) {
    Logger.log('[NestFactory]', 'Starting Nest application...')

    const app = new NestApplication(module)

    return app
  }
}