const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  const hash = await bcrypt.hash('1234', 10);  

  const users = [
    ['66166638', 'นางส่วสมศรี ใจดีหลาย', 'student'],
    ['67456789', 'นางสาวสมหญิง มีบุญ', 'student'],
    ['68008863', 'นางสาวสุรนารี มาจำศีล', 'student'],
    ['65111123', 'นายธนดล เสียใจมาก', 'student'],
    ['66456789', 'นางสาวฮาวา จิตใจดี', 'student'],
    ['66008863', 'นางสาวสุรนารี จำศีล', 'student'],
    ['65121212', 'นายสมัครเรียน เชิดชู', 'student'],
    ['66000000', 'นายศิลา มาหาสีดา', 'student'],
    ['68008555', 'นางสาวจินดา จำศีล', 'student'],
    ['68108900', 'นายมารยาทดี รานด์ เวย์', 'student'],
    ['67451284', 'นาย"ซลาส สีน้ำเงิน', 'student'],
    ['67009999', 'นายจิมมี่ รอล์ นาคา', 'student'],
    ['65102345', 'นางสาวลาเซีย นพคุณ', 'student'],
    ['67213777', 'นายลู้คัส กบฎ', 'student'],
    ['67324578', 'นางสาวธิดารัตน์ จากสวรรค์', 'student'],
    ['68444440', 'นายลีโอ ราชาองค์น้อย', 'student'],
    ['68546798', 'นางสาวภัทราภรณ์ มีใจให้', 'student'],
    ['66111119', 'นายมาร์คัส ไทม์ดารา', 'student'],
    ['66769890', 'นายธีโอ เฟื่องฟ้า', 'student'],
    ['66877779', 'นายนาธาน สำลี', 'student'],
    ['65678901', 'นายโจอี้ พลังบวก', 'student'],
    ['65191243', 'นางสาวมีอา มือหาย', 'student'],
    ['66205454', 'นางสาวลูน่า ฉันจอง', 'student'],
    ['67313222', 'นายชนินทร์ เกิดแล้ว', 'student'],
    ['68424576', 'นายเหนือรพี มองท้องฟ้า', 'student'],
    ['66535687', 'นายเรนเดียร์ กวางน้อย', 'student'],
    ['66646798', 'นางสาวไอรีส ฝรั่งเศส', 'student'],
    ['67757809', 'นายอนุชา หาน้อง', 'student'],
    ['67875867', 'นางสาวพิมพ์ นก ทองคำ', 'student'],
    ['68979021', 'นายสมคิด หาเรื่องรือ', 'student'],
    ['66122343', 'นางสาวสมสุขใจ พอดีคำ', 'student'],
    ['66222223', 'นายเมธา ชอบเทอ', 'student'],
    ['68998989', 'นางสาวริเดียร์ สวยงาม', 'student'],
    ['68100076', 'นายทัฟฟ้า สีสายรุ้ง', 'student'],
    ['68233332', 'นายมองหา ชอบจัง', 'student'],
    ['991234567890', 'เจ้าหน้าที่ ห้องสมุด', 'admin'],
  ];

  for (const [id, name, role] of users) {
    await db.query(
      `INSERT INTO students (student_id, full_name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id) DO NOTHING`,
      [id, name, hash, role]
    );
  }

  for (let i = 1; i <= 25; i++) {
    await db.query(
      `INSERT INTO desks (desk_number, status)
       VALUES ($1, 'available')
       ON CONFLICT (desk_number) DO NOTHING`,
      [i]
    );
  }

  console.log('Seed database completed: 35 Users & 25 Desks ready!');
  await db.pool.end();
}

seed().catch(e => { console.error('seed error:', e.message); process.exit(1); });