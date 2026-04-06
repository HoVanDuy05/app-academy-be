const fs = require('fs');
const path = require('path');

const socialSvcPath = path.join(__dirname, 'src/features/social-message/social-message.service.ts');
const socialCtrlPath = path.join(__dirname, 'src/features/social-message/social-message.controller.ts');
const mainPath = path.join(__dirname, 'src/main.ts');
const userCtrlPath = path.join(__dirname, 'src/features/users/users.controller.ts');

if (fs.existsSync(mainPath)) {
  let content = fs.readFileSync(mainPath, 'utf8');
  content = content.replace(/import \* as compression from 'compression';/g, "import * as compression from 'compression';\nconst comp = require('compression');\n");
  content = content.replace(/app\.use\(compression\(\)\);/g, 'app.use(comp());');
  fs.writeFileSync(mainPath, content);
}

if (fs.existsSync(socialSvcPath)) {
  let content = fs.readFileSync(socialSvcPath, 'utf8');
  
  // Mapping Prisma model fixes
  content = content.replace(/\.thread\./g, '.socialPost.');
  content = content.replace(/\.threadLike\./g, '.postLike.');
  content = content.replace(/threadChaId/g, 'parentPostId');
  content = content.replace(/threadId/g, 'postId');  
  
  // Missing properties
  content = content.replace(/lienKet:/g, 'link:');
  content = content.replace(/duongDanTep:/g, 'fileUrl:');
  content = content.replace(/soDienThoai:/g, 'phoneNumber:');
  
  // Fix parameters passing
  content = content.replace(/data\.loai/g, 'data.type');
  content = content.replace(/data\.duongDanTep/g, 'data.fileUrl');
  content = content.replace(/t: any/g, 't');
  content = content.replace(/\(t\)/g, '(t: any)');
  content = content.replace(/f =>/g, '(f: any) =>');
  
  fs.writeFileSync(socialSvcPath, content);
}

if (fs.existsSync(socialCtrlPath)) {
  let content = fs.readFileSync(socialCtrlPath, 'utf8');
  content = content.replace(/@Request\(\) req,/g, '@Request() req: any,');
  content = content.replace(/@Request\(\) req\)/g, '@Request() req: any)');
  content = content.replace(/chatChannelId: Number\(chatChannelId\)/g, 'channelId: Number(chatChannelId)');
  fs.writeFileSync(socialCtrlPath, content);
}

if (fs.existsSync(userCtrlPath)) {
  let content = fs.readFileSync(userCtrlPath, 'utf8');
  content = content.replace(/@Request\(\) req,/g, '@Request() req: any,');
  content = content.replace(/@Request\(\) req\)/g, '@Request() req: any)');
  fs.writeFileSync(userCtrlPath, content);
}
