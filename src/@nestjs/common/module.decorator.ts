import 'reflect-metadata'

type Providers = any

interface ModuleOptions {
  controllers?: Function[]
  providers?: Providers[]
  imports?: Providers[]
  exports?: Providers[]
}

export function Module(metadata: ModuleOptions): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(
      'moduleOptions',
      {
        controllers: metadata.controllers || [],
        providers: metadata.providers || [],
        imports: metadata.imports || [],
        exports: metadata.exports || [] 
      },
      target
    )

    Reflect.defineMetadata('isModule', true, target)
  }
}