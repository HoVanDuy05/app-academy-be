const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'src/features/social-message/social-message.service.ts');
const controllerPath = path.join(__dirname, 'src/features/social-message/social-message.controller.ts');

const replaceMap = {
  // Prisma Models
  'danhMucQuyTrinh': 'workflowCategory',
  'quyTrinh': 'workflow',
  'buocQuyTrinh': 'workflowStep',
  'baiViet': 'post',
  'binhLuan': 'comment', // wait, is comment in schema? social uses Thread!
  // It seems social uses Thread, KetBan, KenhChat, ThanhVienKenh, TinNhan
  'ketBan': 'friendship',
  'kenhChat': 'chatChannel',
  'thanhVienKenh': 'channelMember',
  'tinNhan': 'message',
  'nguoiDung': 'user',

  // Fields and Params
  'tieuDe': 'title',
  'nguoiYeuCauId': 'requesterId',
  'nguoiNhanId': 'receiverId', // wait, friend system is requesterId / receiverId
  'trangThai': 'status',
  'kenhId': 'channelId',
  'loaiKenh': 'type',
  'tenKenh': 'name',
  'nguoiTaoId': 'creatorId',
  'thanhVienId': 'memberId',
  'nguoiGuiId': 'senderId',
  'noiDung': 'content',
  'tepDinhKem': 'attachments',
  'daDoc': 'isRead',
  'ngayTao': 'createdAt',
  
  // Plurals and specific words
  'nguoiYeuCau': 'requester',
  'nguoiNhan': 'receiver',
  'nguoiTao': 'creator',
  'nguoiGui': 'sender',
  'thanhVien': 'member',
  
  '.ketBan': '.friendship',
  '.kenhChat': '.chatChannel',
  '.thanhVienKenh': '.channelMember',
  '.tinNhan': '.message',

  // Enums or constants
  '.CHO_XAC_NHAN': '.PENDING',
  '.DA_DONG_Y': '.ACCEPTED',
  '.daTuChoi': '.REJECTED', // note: verify later
  '.TU_CHOI': '.REJECTED',
  '.BLOCK': '.BLOCKED',
  
  'taiKhoan': 'username',
  'hoTen': 'fullName',
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(replaceMap)) {
    const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeKey, 'g');
    content = content.replace(regex, value);
  }
  
  // Additional safety fixes
  content = content.replace(/Friendships/g, 'Friendship');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Refactored ${filePath}`);
}

processFile(servicePath);
processFile(controllerPath);
