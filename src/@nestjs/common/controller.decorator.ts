import 'reflect-metadata'

interface Prefix {
  path: string
}

export function Controller(): ClassDecorator
export function Controller(path: string): ClassDecorator
export function Controller(prefix: Prefix): ClassDecorator
export function Controller(prefix?: string | Prefix): ClassDecorator {
  return (target: any) => {
    const path = typeof prefix === 'string' ? prefix : prefix?.path ?? '/'
  
    Reflect.defineMetadata('prefix', path, target)
  }
}