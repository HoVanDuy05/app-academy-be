import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Academic')
@Controller('academic')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // ==================== ATTENDANCE (ĐIỂM DANH) ====================
  @Get('attendance')
  @ApiOperation({ summary: 'Lấy lịch sử điểm danh của sinh viên hiện tại' })
  async getMyAttendance(@Request() req: any, @Query('limit') limit?: string) {
    return this.academicService.getAttendance(req.user.id, limit ? Number(limit) : 50);
  }

  @Post('attendance')
  @ApiOperation({ summary: 'Ghi nhận điểm danh (dành cho giáo viên/admin)' })
  async recordAttendance(@Body() data: any) {
    return this.academicService.recordAttendance(data);
  }

  // ==================== ACADEMIC YEARS ====================
  @Get('academic-years')
  @ApiOperation({ summary: 'Lấy danh sách năm học' })
  async getAcademicYears() {
    return this.academicService.getAcademicYears();
  }

  @Post('academic-years')
  @ApiOperation({ summary: 'Tạo năm học mới' })
  async createAcademicYear(@Body() data: any) {
    return this.academicService.createAcademicYear(data);
  }

  // ==================== SEMESTERS ====================
  @Get('semesters')
  @ApiOperation({ summary: 'Lấy danh sách học kỳ' })
  async getSemesters(@Query('academicYearId') academicYearId?: string) {
    return this.academicService.getSemesters(academicYearId ? Number(academicYearId) : undefined);
  }

  // ==================== GRADE LEVELS ====================
  @Get('grade-levels')
  @ApiOperation({ summary: 'Lấy danh sách khối' })
  async getGradeLevels() {
    return this.academicService.getGradeLevels();
  }

  // ==================== CLASSES ====================
  @Get('classes')
  @ApiOperation({ summary: 'Lấy danh sách lớp học' })
  async getClasses() {
    return this.academicService.getClasses();
  }

  // ==================== ACADEMIC CLASSES ====================
  @Get('academic-classes')
  @ApiOperation({ summary: 'Lấy danh sách lớp học theo năm học' })
  async getAcademicClasses(@Query('academicYearId') academicYearId?: string) {
    return this.academicService.getAcademicClasses(academicYearId ? Number(academicYearId) : undefined);
  }

  // ==================== SUBJECTS ====================
  @Get('subjects')
  @ApiOperation({ summary: 'Lấy danh sách môn học' })
  async getSubjects() {
    return this.academicService.getSubjects();
  }

  // ==================== TEACHER ASSIGNMENTS ====================
  @Get('teacher-assignments')
  @ApiOperation({ summary: 'Lấy danh sách phân công giáo viên' })
  async getTeacherAssignments() {
    return this.academicService.getTeacherAssignments();
  }

  // ==================== GRADES ====================
  @Get('grades')
  @ApiOperation({ summary: 'Lấy bảng điểm' })
  async getGrades(
    @Query('studentId') studentId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('semesterId') semesterId?: string,
  ) {
    return this.academicService.getGrades(
      studentId ? Number(studentId) : undefined,
      subjectId ? Number(subjectId) : undefined,
      semesterId ? Number(semesterId) : undefined,
    );
  }

  @Post('grades')
  @ApiOperation({ summary: 'Cập nhật điểm' })
  async updateGrade(@Body() data: any) {
    return this.academicService.updateGrade(data);
  }

  // ==================== SCHEDULES ====================
  @Get('schedules')
  @ApiOperation({ summary: 'Lấy thời khóa biểu' })
  async getSchedules(@Query('classId') classId?: string) {
    return this.academicService.getSchedules(classId ? Number(classId) : undefined);
  }
}

