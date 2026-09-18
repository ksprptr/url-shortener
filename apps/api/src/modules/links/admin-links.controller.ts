import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ResponseEntity } from '@/common/entities/response.entity';

import { AdminCreateLinkDto } from './dto/admin-create-link.dto';
import { ListLinksDto } from './dto/list-links.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinkEntity } from './entities/link.entity';
import { LinkPageEntity } from './entities/link-page.entity';
import { LinkStatsEntity } from './entities/link-stats.entity';
import { LinksService } from './links.service';

/**
 * Admin link management — every route sits behind the global AuthGuard.
 **/
@ApiTags('Admin')
@ApiCookieAuth('accessToken')
@ApiUnauthorizedResponse({ type: ResponseEntity, description: 'Unauthorized' })
@Controller('admin')
export class AdminLinksController {
  constructor(private readonly linksService: LinksService) {}

  @ApiOperation({ summary: 'Dashboard totals, most-visited links and the 30-day series' })
  @ApiOkResponse({ type: LinkStatsEntity, description: 'Successful' })
  @Get('stats')
  stats(): Promise<LinkStatsEntity> {
    return this.linksService.stats();
  }

  @ApiOperation({ summary: 'List links' })
  @ApiOkResponse({ type: LinkPageEntity, description: 'Successful' })
  @Get('links')
  list(@Query() query: ListLinksDto): Promise<LinkPageEntity> {
    return this.linksService.list(query);
  }

  @ApiOperation({ summary: 'Create a link' })
  @ApiCreatedResponse({ type: LinkEntity, description: 'Link created' })
  @ApiBadRequestResponse({ type: ResponseEntity, description: 'Invalid target URL' })
  @ApiConflictResponse({ type: ResponseEntity, description: 'Slug taken or reserved' })
  @Post('links')
  create(@Body() dto: AdminCreateLinkDto): Promise<LinkEntity> {
    return this.linksService.createAsAdmin(dto);
  }

  @ApiOperation({ summary: 'Get a single link' })
  @ApiOkResponse({ type: LinkEntity, description: 'Successful' })
  @ApiNotFoundResponse({ type: ResponseEntity, description: 'Link not found' })
  @Get('links/:id')
  findOne(@Param('id') id: string): Promise<LinkEntity> {
    return this.linksService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a link' })
  @ApiOkResponse({ type: LinkEntity, description: 'Link updated' })
  @ApiNotFoundResponse({ type: ResponseEntity, description: 'Link not found' })
  @ApiConflictResponse({ type: ResponseEntity, description: 'Slug taken or reserved' })
  @Patch('links/:id')
  update(@Param('id') id: string, @Body() dto: UpdateLinkDto): Promise<LinkEntity> {
    return this.linksService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a link' })
  @ApiNoContentResponse({ description: 'Link deleted' })
  @ApiNotFoundResponse({ type: ResponseEntity, description: 'Link not found' })
  @HttpCode(204)
  @Delete('links/:id')
  remove(@Param('id') id: string): Promise<void> {
    return this.linksService.remove(id);
  }
}
