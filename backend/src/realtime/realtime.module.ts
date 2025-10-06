import { Global, Module } from '@nestjs/common';
import { AppGateway } from './gateway';

@Global()
@Module({
  providers: [AppGateway],
  exports: [AppGateway],
})
export class RealtimeModule {}


