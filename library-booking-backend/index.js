const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));
app.post('/api/reset-password', async (req, res) => {
    const { student_id, new_password } = req.body;

    if (!student_id || !new_password) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        const userResult = await db.query(
            'SELECT * FROM users WHERE student_id = $1 OR email = $1',
            [student_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        await db.query(
            'UPDATE users SET password = $1 WHERE student_id = $2 OR email = $2',
            [hashedPassword, student_id]
        );

        res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});