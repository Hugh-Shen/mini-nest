import { Module } from './@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserService, UserLogger } from './user.service'

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'kim', useClass: UserService },
    {
      provide: 'log',
      useFactory: () => new UserLogger()
    }
  ],
})
export class AppModule {
  
}