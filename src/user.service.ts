import { Injectable, Inject } from './@nestjs/common'

@Injectable()
export class UserLogger {}

@Injectable()
export class UserService {
  constructor(private logger: UserLogger) {
  }

  getHello() {
    return 'hello'
  }
}