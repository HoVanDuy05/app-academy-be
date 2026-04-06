const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'src/features/academic/academic.service.ts');
const controllerPath = path.join(__dirname, 'src/features/academic/academic.controller.ts');

const replaceMap = {
  // Prisma Models
  'diem': 'grade',
  'lopHoc': 'class',
  'lopNam': 'academicClass', // Note: lopHoc is class (general), lopNam is specific class for academic year
  'hocSinhLopNam': 'studentEnrollment',
  'monHoc': 'subject',
  'khoi': 'gradeLevel',
  'hocKy': 'semester',
  'namHoc': 'academicYear',
  'lichHocNew': 'schedule', // wait, lichHocNew -> schedule
  'lichHoc': 'schedule', // we merged this into schedule? Let's map lichHoc to schedule directly.
  'phanCongGv': 'teachingAssignment',

  // Fields and query params
  'tenNamHoc': 'yearName',
  'batDau': 'startDate',
  'ketThuc': 'endDate',
  'kichHoat': 'isActive',
  'nhiemKy': 'term',
  'tenHocKy': 'termName', // or name
  'namHocId': 'academicYearId',
  'tenKhoi': 'levelName', // or name
  'tenLop': 'className',
  'khoiId': 'gradeLevelId',
  'giaoVienChuNhiemId': 'homeroomTeacherId', // check this
  'lopHocId': 'classId',
  'tenMon': 'subjectName',
  'maMon': 'subjectCode',
  'tinChi': 'credits',
  'loaiMon': 'subjectType',
  'hocSinhId': 'studentId',
  'lopNamId': 'academicClassId',
  'trangThai': 'status', // usually
  'giaoVienId': 'teacherId',
  'monHocId': 'subjectId',
  'diemSo': 'score',
  'heSo': 'weight',
  'loaiDiem': 'gradeType',
  'lanThi': 'examCount',
  'nhanXet': 'remarks',
  'thu': 'dayOfWeek',
  'tietBatDau': 'startPeriod',
  'tietKetThuc': 'endPeriod',
  'phongHoc': 'roomName', // or room
  
  // Plurals and specific replacements
  'namHocs': 'academicYears',
  'hocKys': 'semesters',
  'khois': 'gradeLevels',
  'lopHocs': 'classes',
  'lopNams': 'academicClasses',
  'monHocs': 'subjects',
  'hocSinhLopNams': 'studentEnrollments',
  'phanCongGvs': 'teachingAssignments',
  'diems': 'grades',
  'lichHocs': 'schedules',
  
  '.namHoc': '.academicYear',
  '.hocKy': '.semester',
  '.khoi': '.gradeLevel',
  '.lopHoc': '.class',
  '.lopNam': '.academicClass',
  '.monHoc': '.subject',
  '.hocSinhLopNam': '.studentEnrollment',
  '.diem(': '.grade(',
  '.diem.': '.grade.',
  '.lichHocNew': '.schedule',
  '.lichHoc': '.schedule',
  '.phanCongGv': '.teachingAssignment',
  
  // Relations
  'giaoVien': 'teacher',
  'hocSinh': 'student',
  'cacLopNam': 'enrollments', // hocSinh.cacLopNam -> hocSinh.enrollments
  'cacHocSinh': 'students',
  'cacGiaoVien': 'teachers',
  'diemList': 'grades', // if used

  // Some common phrases for the script
  'getNamHocs': 'getAcademicYears',
  'getHocKys': 'getSemesters',
  'getKhois': 'getGradeLevels',
  'getLopHocs': 'getClasses',
  'getLopNams': 'getAcademicClasses',
  'getMonHocs': 'getSubjects',
  'getHocSinhLopNams': 'getStudentEnrollments',
  'getPhanCongGvs': 'getTeachingAssignments',
  'getDiems': 'getGrades',
  'getLichHocs': 'getSchedules',

  'createNamHoc': 'createAcademicYear',
  'createHocKy': 'createSemester',
  'createKhoi': 'createGradeLevel',
  'createLopHoc': 'createClass',
  'createLopNam': 'createAcademicClass',
  'createMonHoc': 'createSubject',
  'createHocSinhLopNam': 'createStudentEnrollment',
  'createPhanCongGv': 'createTeachingAssignment',
  'nhapDiem': 'inputGrade',
  'createLichHoc': 'createSchedule',
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(replaceMap)) {
    const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeKey, 'g');
    content = content.replace(regex, value);
  }
  
  // Manual string replacements to cover loose variables
  content = content.replace(/nguoiDung/g, 'user');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Refactored ${filePath}`);
}

processFile(servicePath);
processFile(controllerPath);
