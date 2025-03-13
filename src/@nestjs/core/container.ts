export class Container {
  static instance = null
  private map = new Map()
  private constructor() {}
  
  private getDependencies(providerClass) {
    const tokens = Reflect.getMetadata('injectToken', providerClass) || []
    const paramTypes = Reflect.getMetadata('design:paramtypes', providerClass) || []
    
    return paramTypes.map((type, index) => {
      return this.getProvider(tokens[index]) || this.getProvider(type)
    })
  }

  getProvider(key) {
    return this.map.get(key)
  }
  
  addProvider(providers) {
    for (const provider of providers) {
      // 处理标准类provider
      if (provider.provide && provider.useClass) {
        const dependencies = [provider.provide, ...this.getDependencies(provider.useClass)]
        this.map.set(provider.provide, new provider.useClass(...dependencies))
      }
      // 处理值provider
      else if (provider.provide && provider.useValue) {
        this.map.set(provider.provide, provider.useValue)
      }
      // 处理工厂provider
      else if (provider.provide && provider.useFactory) {
        const dependencies = provider.inject?.map(dep => this.getProvider(dep)) || []
        this.map.set(provider.provide, provider.useFactory(...dependencies))
      }
      // 处理直接传入的类
      else if (typeof provider === 'function') {
        const dependencies = this.getDependencies(provider)
        this.map.set(provider, new provider(...dependencies))
      }
    }
  }

  static getInstance() {
    if (!Container.instance) {
      Container.instance = new Container()
    }

    return Container.instance
  }
}