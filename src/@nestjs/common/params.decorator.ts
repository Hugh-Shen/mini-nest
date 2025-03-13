import 'reflect-metadata'
import { ParamType } from '../types/constants'


function storeParamMetadata(target: any, methodName: string | symbol, paramIndex: number, metadata: any) {
  const paramsMetadata = Reflect.getMetadata('params', target, methodName) || []
  paramsMetadata[paramIndex] = metadata
  Reflect.defineMetadata('params', paramsMetadata, target, methodName)
}

const createDecorator = (type: ParamType) => (key?: string): ParameterDecorator => {
  return (target: any, methodName: string | symbol, paramIndex: number) => {
    storeParamMetadata(target, methodName, paramIndex, {
      type,
      key
    })
  }
}


export const Request = createDecorator(ParamType.REQUEST)
export const Response = createDecorator(ParamType.RESPONSE)
export const Body = createDecorator(ParamType.BODY)
export const Header = createDecorator(ParamType.HEADER)
export const Query = createDecorator(ParamType.QUERY)
