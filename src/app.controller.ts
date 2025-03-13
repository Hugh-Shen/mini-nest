import { Controller, Get, Request, Response, Query, Inject } from './@nestjs/common'
import { AppService } from './app.service'
import { UserService } from './user.service'


@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    @Inject('kim') private userService: UserService
  ) {}

  @Get()
  getHello(@Request() req, @Response() res, @Query('data') query): string {
    return this.userService.getHello()
  }
}