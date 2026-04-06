const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'src/features/approval-flow/approval-flow.service.ts');
const controllerPath = path.join(__dirname, 'src/features/approval-flow/approval-flow.controller.ts');

const replaceMap = {
  // Prisma Models
  'danhMucQuyTrinh': 'workflowCategory',
  'quyTrinh': 'workflow',
  'buocQuyTrinh': 'workflowStep',
  'buocPhienQuyTrinh': 'sessionStep',
  'phienQuyTrinh': 'workflowSession',
  'nhatKyPheDuyetQuyTrinh': 'workflowApprovalLog',
  'truongFormQuyTrinh': 'workflowFormField',
  'nguoiPheDuyetBuoc': 'stepApprover',

  // Relations
  'danhMuc': 'category',
  'cacBuoc': 'steps',
  'cacPhien': 'sessions',
  'cacTruong': 'formFields',
  'buocPhiens': 'sessionSteps',
  'nhatKy': 'approvalLogs',
  'nguoiDuyets': 'approvers',

  // Fields and Params
  'danhMucId': 'categoryId',
  'quyTrinhId': 'workflowId',
  'nguoiTaoId': 'creatorId',
  'thuTuBuoc': 'stepOrder',
  'loaiQuyTac': 'ruleType',
  'tenTruong': 'fieldName',
  'nhan': 'label',
  'batBuoc': 'isRequired',
  'tuyChon': 'options',
  'thuTu': 'order',
  'duLieuForm': 'formData',
  'buocHienTai': 'currentStep',
  'phienId': 'sessionId',
  'nguoiDungId': 'userId',
  'nguoiPheDuyetId': 'approverId',
  'ngayPheDuyet': 'approvedAt',
  'hanhDong': 'action',
  'noiDung': 'content',
  'ngayTao': 'createdAt',
  
  // Specific object properties mapping (avoiding global replace for common words if possible, but fine contextually)
  'ten:': 'name:',
  'ten,': 'name,',
  'moTa:': 'description:',
  'moTa,': 'description,',
  'loai:': 'type:',
  'loai,': 'type,',
  'buoc:': 'step:',
  '.ten': '.name',
  '.moTa': '.description',
  '.loai': '.type',
  '.buoc': '.step',
  '.trangThai': '.status',
  'trangThai:': 'status:',
  
  // Custom queries
  'QuyTrinhs': 'Workflows',
  'DanhMucs': 'Categories',
  'buocId': 'stepId',

  // Enums
  'TrangThaiQuyTrinh': 'WorkflowStatus',
  'LoaiQuyTacBuoc': 'StepRuleType',
  'TrangThaiPhien': 'SessionStatus',
  'TrangThaiBuocPhien': 'SessionStepStatus',
  'HanhDongPheDuyet': 'ApprovalAction',
  'LoaiNguoiPheDuyet': 'ApproverType',
  
  // Enum values
  '.NHAP': '.DRAFT',
  '.HOAT_DONG': '.ACTIVE',
  '.BAT_KY': '.ANY',
  '.TAT_CA': '.ALL',
  '.CHO_DUYET': '.PENDING',
  '.DANG_XU_LY': '.PROCESSING',
  '.DA_DUYET': '.APPROVED',
  '.TU_CHOI': '.REJECTED',
  '.BO_QUA': '.SKIPPED',
  '.PHE_DUYET': '.APPROVE',
  '.NGUOI_DUNG': '.USER',
  '.VAI_TRO': '.ROLE',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(replaceMap)) {
    // Escape regex chars just in case
    const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeKey, 'g');
    content = content.replace(regex, value);
  }
  
  // Fix minor typo mappings if they overlap
  content = content.replace(/QuyTrinhDetail/g, 'WorkflowDetail');
  content = content.replace(/PhienQuyTrinh/g, 'WorkflowSession');
  content = content.replace(/BuocQuyTrinh/g, 'WorkflowStep');
  content = content.replace(/PhienCanXuLy/g, 'PendingSessions');
  content = content.replace(/NguoiPheDuyetBuoc/g, 'StepApprover');
  content = content.replace(/createDanhMuc/g, 'createCategory');
  content = content.replace(/xuLyBuocPhien/g, 'processSessionStep');
  
  // user mapping
  content = content.replace(/nguoiDung/g, 'user');
  content = content.replace(/taiKhoan/g, 'username');
  content = content.replace(/hoTen/g, 'fullName');
  content = content.replace(/nguoiTao/g, 'creator');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Refactored ${filePath}`);
}

processFile(servicePath);
processFile(controllerPath);
