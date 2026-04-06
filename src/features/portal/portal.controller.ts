import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Portal - Cổng thông tin')
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('banners')
  @ApiOperation({ summary: 'Lấy danh sách banner' })
  async getBanners() {
    return this.portalService.getBanners();
  }

  @Get('news')
  @ApiOperation({ summary: 'Lấy danh sách tin tức' })
  async getBaiViets(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.portalService.getBaiViets(type, limit ? Number(limit) : 10);
  }

  @Get('news/:id')
  @ApiOperation({ summary: 'Lấy chi tiết tin tức' })
  async getBaiVietDetail(@Param('id') id: string) {
    return this.portalService.getBaiVietDetail(Number(id));
  }

  @Post('news')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo tin tức mới (Admin)' })
  async createBaiViet(@Body() data: any) {
    return this.portalService.createBaiViet(data);
  }
}
