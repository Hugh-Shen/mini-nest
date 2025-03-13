import 'reflect-metadata'

export const Injectable = (): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata('injectable', true, target)
  }
}