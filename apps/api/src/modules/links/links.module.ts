import { Module } from '@nestjs/common';

import { AdminLinksController } from './admin-links.controller';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

@Module({
  controllers: [LinksController, AdminLinksController],
  providers: [LinksService],
})
export class LinksModule {}
