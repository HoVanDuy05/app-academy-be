import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApprovalFlowService } from './approval-flow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Approval Flow - Quy trình phê duyệt')
@Controller('approval-flow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApprovalFlowController {
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  // ==================== DANH MỤC ====================
  @Get('danh-muc')
  @ApiOperation({ summary: 'Lấy danh sách danh mục quy trình' })
  async getCategories() {
    return this.approvalFlowService.getCategories();
  }

  @Post('danh-muc')
  @ApiOperation({ summary: 'Tạo danh mục quy trình' })
  async createCategory(@Body() data: { name: string; description?: string }) {
    return this.approvalFlowService.createCategory(data);
  }

  // ==================== QUY TRÌNH ====================
  @Get('quy-trinh')
  @ApiOperation({ summary: 'Lấy danh sách quy trình' })
  async getWorkflows(@Query('categoryId') categoryId?: string) {
    return this.approvalFlowService.getWorkflows(
      categoryId ? Number(categoryId) : undefined,
    );
  }

  @Get('quy-trinh/:id')
  @ApiOperation({ summary: 'Lấy chi tiết quy trình' })
  async getWorkflowDetail(@Param('id') id: string) {
    return this.approvalFlowService.getWorkflowDetail(Number(id));
  }

  @Post('workflow')
  @ApiOperation({ summary: 'Tạo quy trình mới' })
  async createWorkflow(@Request() req: any, @Body() data: any) {
    return this.approvalFlowService.createWorkflow(req.user.userId, data);
  }

  @Put('workflow/:id')
  @ApiOperation({ summary: 'Cập nhật quy trình' })
  async updateWorkflow(@Param('id') id: string, @Body() data: any) {
    return this.approvalFlowService.updateWorkflow(Number(id), data);
  }

  @Delete('workflow/:id')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async deleteWorkflow(@Param('id') id: string) {
    return this.approvalFlowService.deleteWorkflow(Number(id));
  }

  // ==================== BƯỚC QUY TRÌNH ====================
  @Post('quy-trinh/:id/buoc')
  @ApiOperation({ summary: 'Thêm bước vào quy trình' })
  async addWorkflowStep(
    @Param('id') workflowId: string,
    @Body() data: any,
  ) {
    return this.approvalFlowService.addWorkflowStep(Number(workflowId), data);
  }

  @Post('buoc/:id/nguoi-phe-duyet')
  @ApiOperation({ summary: 'Thêm người phê duyệt cho bước' })
  async addStepApprover(
    @Param('id') stepId: string,
    @Body() data: any,
  ) {
    return this.approvalFlowService.addStepApprover(Number(stepId), data);
  }

  // ==================== PHIÊN QUY TRÌNH ====================
  @Get('phien')
  @ApiOperation({ summary: 'Lấy danh sách phiên quy trình' })
  async getPhienWorkflows(
    @Query('workflowId') workflowId?: string,
    @Request() req?: any,
  ) {
    return this.approvalFlowService.getSessions(
      workflowId ? Number(workflowId) : undefined,
      req.user?.userId,
    );
  }

  @Get('phien/can-xu-ly')
  @ApiOperation({ summary: 'Lấy danh sách phiên cần xử lý của người dùng hiện tại' })
  async getPendingSessions(@Request() req: any) {
    return this.approvalFlowService.getPendingSessions(req.user.userId);
  }

  @Get('phien/:id')
  @ApiOperation({ summary: 'Lấy chi tiết phiên quy trình' })
  async getPhienWorkflowDetail(@Param('id') id: string) {
    return this.approvalFlowService.getSessionDetail(Number(id));
  }

  @Post('phien')
  @ApiOperation({ summary: 'Tạo phiên quy trình mới (nộp đơn)' })
  async createWorkflowSession(@Request() req: any, @Body() data: any) {
    return this.approvalFlowService.createWorkflowSession(req.user.userId, data);
  }

  @Post('phien/:sessionId/buoc/:stepId/xu-ly')
  @ApiOperation({ summary: 'Xử lý bước phiên (phê duyệt/từ chối)' })
  async processSessionStep(
    @Param('sessionId') sessionId: string,
    @Param('stepId') stepId: string,
    @Request() req: any,
    @Body() data: { action: string; content?: string },
  ) {
    return this.approvalFlowService.processSessionStep(
      Number(sessionId),
      Number(stepId),
      req.user.userId,
      data,
    );
  }
}
