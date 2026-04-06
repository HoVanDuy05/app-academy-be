const fs = require('fs');
const path = require('path');

const userCtrlPath = path.join(__dirname, 'src/features/users/users.controller.ts');
const socialSvcPath = path.join(__dirname, 'src/features/social-message/social-message.service.ts');

if (fs.existsSync(userCtrlPath)) {
  let content = fs.readFileSync(userCtrlPath, 'utf8');
  content = content.replace(/@Request\(\) req,/g, '@Request() req: any,');
  fs.writeFileSync(userCtrlPath, content);
  console.log('Fixed users.controller.ts');
}

if (fs.existsSync(socialSvcPath)) {
  let content = fs.readFileSync(socialSvcPath, 'utf8');
  
  // Fix notifications types
  content = content.replace(/loai: 'XA_HOI'/g, 'type: "SOCIAL"');
  content = content.replace(/loai: 'TIN_NHAN'/g, 'type: "MESSAGE"');
  content = content.replace(/loai: 'HE_THONG'/g, 'type: "SYSTEM"');
  content = content.replace(/loai: data.loai as any \|\| 'VAN_BAN'/g, 'type: data.type as any || "TEXT"');

  // Fix Follower relation
  content = content.replace(/nguoiTheoDoiId_nguoiDuocTheoDoiId/g, 'followingId_followerId');
  content = content.replace(/nguoiTheoDoiId:/g, 'followerId:');
  content = content.replace(/nguoiDuocTheoDoiId:/g, 'followingId:');
  content = content.replace(/nguoiTheoDoi:/g, 'follower:');
  content = content.replace(/nguoiDuocTheoDoi:/g, 'following:');
  content = content.replace(/f\.nguoiTheoDoi/g, 'f.follower');
  content = content.replace(/f\.nguoiDuocTheoDoi/g, 'f.following');
  
  // Fix friend recipient mapping
  content = content.replace(/f\.receiver/g, 'f.recipient');
  
  // Fix User relations
  content = content.replace(/hoSoHocSinh:/g, 'studentProfile:');
  
  fs.writeFileSync(socialSvcPath, content);
  console.log('Fixed social-message.service.ts');
}
