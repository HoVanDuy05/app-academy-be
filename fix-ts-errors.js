const fs = require('fs');
const path = require('path');

const userSvcPath = path.join(__dirname, 'src/features/users/users.service.ts');
const socialSvcPath = path.join(__dirname, 'src/features/social-message/social-message.service.ts');

// FIXING USERS SERVICE
if (fs.existsSync(userSvcPath)) {
  let content = fs.readFileSync(userSvcPath, 'utf8');
  content = content.replace(/isActive: true/g, 'isActivated: true');
  content = content.replace(/enrollments:/g, 'classEnrollments:');
  fs.writeFileSync(userSvcPath, content);
  console.log('Fixed users.service.ts');
}

// FIXING SOCIAL SERVICE
if (fs.existsSync(socialSvcPath)) {
  let content = fs.readFileSync(socialSvcPath, 'utf8');
  // Friendship
  content = content.replace(/receiverId/g, 'recipientId');
  content = content.replace(/receiver:/g, 'recipient:');
  content = content.replace(/f\.senderId === userId \? f\.recipient : f\.sender/g, 'f.senderId === userId ? f.recipient : f.sender');
  
  // ChatChannel
  content = content.replace(/ngayGui/g, 'sentAt');
  content = content.replace(/type: 'CA_NHAN'/g, 'chatType: "PRIVATE"');
  content = content.replace(/chatChannelId/g, 'channelId');
  
  // Follower
  content = content.replace(/flowTheoDoi/g, 'follower');
  
  // User select
  content = content.replace(/vaiTro:/g, 'role:');
  content = content.replace(/threads:/g, 'socialPosts:');

  fs.writeFileSync(socialSvcPath, content);
  console.log('Fixed social-message.service.ts');
}
