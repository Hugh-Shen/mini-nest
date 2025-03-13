import 'reflect-metadata'


export const Get = (path: string = ''): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {    
    Reflect.defineMetadata('path', path, target, propertyKey)
    Reflect.defineMetadata('method', 'get', target, propertyKey) 
  }
}