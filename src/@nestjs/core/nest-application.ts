import 'reflect-metadata'
import express, { type Express } from 'express'
import { Logger } from './logger'
import { ParamType } from '../types/constants'

export class NestApplication {
  private readonly app: Express = express()
  private readonly providers = new Map()
  constructor(protected readonly module) {
    this.registerProvider()
  }

  private isModule = (exportToken) => {
    const module = Reflect.getMetadata('isModule', exportToken)
    return exportToken && exportToken instanceof Function && module
  }

  private registerModule(module) {
    const { providers, exports } = Reflect.getMetadata('moduleOptions', module)

    for (const exportToken of exports) {
      if (this.isModule(exportToken)) {
        this.registerModule(exportToken)
      } else {
        const provide = providers.find(provider => provider === exportToken || provider.provide === exportToken)  

        if (provide) {
          this.addProvider(provide)
        }
      }
    }

    for (const provider of providers) {
      this.addProvider(provider)
    }
  }

  private registerProvider() {
    const { imports } = Reflect.getMetadata('moduleOptions', this.module)

    this.registerModule(this.module)

    for (const importModule of imports) {
      const importModuleProviders = Reflect.getMetadata('moduleOptions', importModule) ?? []

      for (const provider of importModuleProviders) {
        this.addProvider(provider)
      }
    }
  }

  private addProvider(provider) {
    const injectToken = provider.provide ?? provider
    if (this.providers.has(injectToken)) return

    if (provider.provide && provider.useClass) {
      const Clazz = provider.useClass
      const dependencies = this.resolveDependencies(Clazz)
      const instance = new Clazz(...dependencies)
      this.providers.set(provider.provide, instance)
    } else if (provider.provide && provider.useValue) {
      this.providers.set(provider.provide, provider.useValue)
    } else if (provider.provide && provider.useFactory) {
      const factory = provider.useFactory
      const dependencies = this.resolveDependencies(factory)
      // 执行工厂函数，获取实例
      const instance = factory(...dependencies)
      this.providers.set(provider.provide, instance)
    }
    else {
      const dependencies = this.resolveDependencies(provider)
      const instance = new provider(...dependencies)
      this.providers.set(provider, instance)
    }
  }

  private getProviderParam = (injectToken) => this.providers.get(injectToken) ?? injectToken

  // 解析参数
  private resolveDependencies(target) {
    const injectToken = Reflect.getMetadata('injectToken', target) ?? []
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) ?? []

    return paramTypes.map((param, index) => {
      const token = injectToken[index]
      return this.getProviderParam(token ?? param)
    })
  }

  private resolveParamMetadata(target: any, methodName: string | symbol, req: express.Request, res: express.Response) {
    const paramsMetadata = Reflect.getMetadata('params', target, methodName) || []
    
    const returnParamsMetadata = ({ type, key }) => {
      const map = {
        [ParamType.REQUEST]: req,
        [ParamType.RESPONSE]: res,
        [ParamType.BODY]: req.body,
        [ParamType.QUERY]: req.query[key],
        [ParamType.PARAM]: req.params[key],
        [ParamType.HEADER]: req.headers[key]
      }
      
      return map[type] ?? undefined
    }

    const service = paramsMetadata.map(metadata =>  returnParamsMetadata(metadata))

    return service
  }
  // 获取参数，调用指定的方法执行返回结果
  private callService(fullPath: string, method: string, instance, methodName) {
    this.app[method](fullPath, async (req: express.Request, res: express.Response) => {
      const service = this.resolveParamMetadata(instance, methodName, req, res)
      const result = await instance[methodName](...service)
      
      res.send(result)
    })
  }
  
  async init() {
    // 实例化模块
    const { controllers } = Reflect.getMetadata('moduleOptions', this.module) || []

    Logger.log('[InstanceLoader]', `${this.module.name} dependencies initialized`)

    for (const Controller of controllers) {
      const params = this.resolveDependencies(Controller)
      // 从容器获取已注入依赖的实例
      const instance = new Controller(...params)

      const prefix = Reflect.getMetadata('prefix', Controller)
      Logger.log('[RoutesResolver]', `${Controller.name} {${prefix}}`)

      const prototype = Object.getPrototypeOf(instance)
      const methodNames = Object.getOwnPropertyNames(prototype)

      for (const methodName of methodNames) {
        if (methodName === 'constructor') continue // 跳过构造函数

        // 从原型对象上获取元数据（装饰器存储在原型方法上）
        const routePath = Reflect.getMetadata('path', prototype, methodName)
        const routeMethod = Reflect.getMetadata('method', prototype, methodName)

        Logger.log('[RouterExplorer]', `Mapped {${routePath}, ${routeMethod}} route`)
        
        const fullPath = prefix + routePath

        this.callService(fullPath, routeMethod, instance, methodName)
      }
    }
  }

  async listen(prot: number) {
    await this.init()

    this.app.listen(prot, () => {
      Logger.log('[NestApplication]', `Nest application successfully started`)
      console.log(`NestApplication running: https://localhost:${prot}`)
    })
  }
}