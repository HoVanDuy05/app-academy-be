const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'src');

const replacements = [
  { from: /tacGiaId/g, to: 'authorId' },
  { from: /tacGia/g, to: 'author' },
  { from: /getKenhChats/g, to: 'getChannels' },
  { from: /taiKhoan/g, to: 'username' },
  { from: /matKhau/g, to: 'password' },
  { from: /vaiTro/g, to: 'role' },
  { from: /hoTen/g, to: 'fullName' },
  { from: /trangThai/g, to: 'status' },
  { from: /quyTrinh/g, to: 'workflow' },
  { from: /hoSoHocSinh/g, to: 'studentProfile' },
  { from: /hoSoGiaoVien/g, to: 'teacherProfile' },
  { from: /ngayTao/g, to: 'createdAt' },
  { from: /noiDung/g, to: 'content' },
];

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            replacements.forEach(r => {
                if (r.from.test(content)) {
                    content = content.replace(r.from, r.to);
                    changed = true;
                }
            });
            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

walk(projectRoot);
console.log('Backend Internationalization Complete.');
