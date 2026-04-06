import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  // ==================== ACADEMIC YEARS ====================
  async getAcademicYears() {
    return this.prisma.academicYear.findMany({
      include: {
        semesters: true,
        academicClasses: {
          include: {
            class: true,
          },
        },
      },
    });
  }

  async createAcademicYear(data: any) {
    return this.prisma.academicYear.create({
      data: {
        yearName: data.yearName,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive || false,
      },
    });
  }

  // ==================== SEMESTERS ====================
  async getSemesters(academicYearId?: number) {
    const where = academicYearId ? { academicYearId } : {};
    return this.prisma.semester.findMany({
      where,
      include: {
        academicYear: true,
      },
    });
  }

  // ==================== GRADE LEVELS ====================
  async getGradeLevels() {
    return this.prisma.gradeLevel.findMany({
      include: {
        classes: true,
        subjects: true,
      },
    });
  }

  // ==================== CLASSES ====================
  async getClasses() {
    return this.prisma.class.findMany({
      include: {
        gradeLevel: true,
        academicClasses: {
          include: {
            academicYear: true,
            homeroomTeacher: true,
          },
        },
      },
    });
  }

  // ==================== ACADEMIC CLASSES (LỚP NĂM) ====================
  async getAcademicClasses(academicYearId?: number) {
    const where = academicYearId ? { academicYearId } : {};
    return this.prisma.academicClass.findMany({
      where,
      include: {
        class: true,
        academicYear: true,
        homeroomTeacher: true,
        enrollments: {
          include: {
            student: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
  }

  // ==================== SUBJECTS ====================
  async getSubjects() {
    return this.prisma.subject.findMany({
      include: {
        gradeLevel: true,
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });
  }

  // ==================== TEACHER ASSIGNMENTS ====================
  async getTeacherAssignments() {
    return this.prisma.teacherAssignment.findMany({
      include: {
        teacher: true,
        subject: true,
        academicClass: {
          include: {
            class: true,
          },
        },
        academicYear: true,
      },
    });
  }

  // ==================== GRADES (BẢNG ĐIỂM) ====================
  async getGrades(studentId?: number, subjectId?: number, semesterId?: number) {
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (subjectId) where.subjectId = subjectId;
    if (semesterId) where.semesterId = semesterId;

    return this.prisma.gradePoint.findMany({
      where,
      include: {
        student: true,
        subject: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    });
  }

  async updateGrade(data: any) {
    const existing = await this.prisma.gradePoint.findUnique({
      where: {
        studentId_subjectId_semesterId: {
          studentId: data.studentId,
          subjectId: data.subjectId,
          semesterId: data.semesterId,
        },
      },
    });

    const gradeData: any = {
      midtermGrade: data.midterm,
      finalGrade: data.final,
      averageGrade: data.average,
    };

    if (existing) {
      return this.prisma.gradePoint.update({
        where: { id: existing.id },
        data: gradeData,
      });
    }

    return this.prisma.gradePoint.create({
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        semesterId: data.semesterId,
        ...gradeData,
      },
    });
  }

  // ==================== ATTENDANCE ====================
  async getAttendance(userId: number, limit = 50) {
    // Find student profile from user id
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Hồ sơ học sinh không tồn tại');
    }

    return this.prisma.attendance.findMany({
      where: { studentId: student.id },
      include: {
        class: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async recordAttendance(data: { studentId: number; classId: number; status: string; notes?: string }) {
    return this.prisma.attendance.create({
      data: {
        studentId: data.studentId,
        classId: data.classId,
        status: data.status as any,
        notes: data.notes,
        date: new Date(),
      },
    });
  }

  // ==================== SCHEDULES ====================
  async getSchedules(classId?: number) {
    const where = classId ? { classId } : {};
    return this.prisma.schedule.findMany({
      where,
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
      orderBy: { dayOfWeek: 'asc' },
    });
  }
}

