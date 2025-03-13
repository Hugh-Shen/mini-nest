export function Inject(token?: any): ParameterDecorator {
  return (target: any, prototypeKey: string | symbol, paramsIndex: number) => {
    const constructor = target
    const paramsMetadata = Reflect.getMetadata('injectToken', constructor) || []
    
    paramsMetadata[paramsIndex] = token

    // 更新元数据存储
    Reflect.defineMetadata('injectToken', paramsMetadata, constructor)
  }
}
