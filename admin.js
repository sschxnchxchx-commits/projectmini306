lucide.createIcons();
let currentFilter = 'all';
let desksData = [];

function updateDateTime() {
  const now = new Date();

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const timeFormatter = new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const dateEl = document.getElementById('currentDateDisplay');
  if (dateEl) dateEl.textContent = dateFormatter.format(now);

  const clockEl = document.getElementById('realtimeClock');
  if (clockEl) clockEl.textContent = `${timeFormatter.format(now)} น.`;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// 2. โหลดข้อมูลโต๊ะ 25 ตัว
async function loadDashboardData(showNotify = false) {
  const slotEl = document.getElementById('timeSlotSelect');
  const dateEl = document.getElementById('currentDateDisplay');
  if (!slotEl || !dateEl) return;

  const slotId = slotEl.value;
  const dateStr = dateEl.textContent;

  try {
    const res = await fetch(`/api/bookings/status?date=${dateStr}&slot_id=${slotId}`);
    if (!res.ok) throw new Error('API not connected');
    const data = await res.json();
    desksData = data;
  } catch (err) {
    // Fallback โหมดจำลองข้อมูล 25 โต๊ะ
    if (desksData.length === 0) {
      desksData = Array.from({ length: 25 }, (_, i) => {
        const id = i + 1;
        let status = 'available';
        if (id === 10 || id === 11 || id === 12) status = 'maintenance';

        return {
          desk_id: id,
          desk_number: `โต๊ะที่ ${id}`,
          status: status,
          student_id: null,
          full_name: null,
          booked_at: null
        };
      });
    }
  }

  renderDashboard();

  if (showNotify) {
    showToast('อัปเดตข้อมูลสถานะโต๊ะล่าสุดเรียบร้อยแล้ว', 'success');
  }
}

// 3. เรนเดอร์หน้าจอ
function renderDashboard() {
  const availableCount = desksData.filter(d => d.status === 'available').length;
  const reservedCount = desksData.filter(d => d.status === 'reserved').length;
  const maintenanceCount = desksData.filter(d => d.status === 'maintenance').length;

  document.getElementById('countAvailable').innerHTML = `${availableCount} <span>ตัว</span>`;
  document.getElementById('countReserved').innerHTML = `${reservedCount} <span>ตัว</span>`;
  document.getElementById('countMaintenance').innerHTML = `${maintenanceCount} <span>ตัว</span>`;

  // อัปเดต Dropdown Walk-in
  const walkinSelect = document.getElementById('walkinDeskSelect');

  if (walkinSelect) {
    walkinSelect.innerHTML = '<option value="">เลือกโต๊ะว่าง...</option>';

    desksData
      .filter(d => d.status === 'available')
      .forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.desk_id;
        opt.textContent = d.desk_number;
        walkinSelect.appendChild(opt);
      });
  }

  // กรองโต๊ะตามแท็บ
  const filteredDesks = desksData.filter(d => {
    if (currentFilter === 'all') return true;
    return d.status === currentFilter;
  });

  const tbody = document.getElementById('desksTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  filteredDesks.forEach(desk => {
    let badgeHtml = '';
    let actionHtml = '';
    let userHtml = '<span class="user-cell">- ไม่มีผู้ใช้งาน -</span>';
    let timeHtml = '-';

    if (desk.status === 'available') {
      badgeHtml = `<span class="badge available"><span class="badge-dot"></span> ว่างพร้อมใช้งาน</span>`;

      actionHtml = `
        <button class="btn-sm btn-maint" onclick="toggleMaintenance(${desk.desk_id}, 'maintenance')">
          <i data-lucide="wrench" size="13"></i> ปิดปรับปรุง
        </button>`;

    } else if (desk.status === 'reserved') {
      badgeHtml = `<span class="badge reserved"><span class="badge-dot"></span> ถูกจองแล้ว</span>`;

      userHtml = `<span class="user-cell has-user">${desk.student_id} - ${desk.full_name}</span>`;
      timeHtml = desk.booked_at || '-';

      actionHtml = `
        <button class="btn-sm btn-cancel-booking" onclick="cancelBookingByAdmin(${desk.desk_id})">
          <i data-lucide="x-circle" size="13"></i> ยกเลิกสิทธิ์ / คืนโต๊ะ
        </button>`;

    } else if (desk.status === 'maintenance') {
      badgeHtml = `<span class="badge maintenance"><span class="badge-dot"></span> ปิดปรับปรุง</span>`;

      actionHtml = `
        <button class="btn-sm btn-open" onclick="toggleMaintenance(${desk.desk_id}, 'available')">
          <i data-lucide="check-circle" size="13"></i> เปิดใช้งานปกติ
        </button>`;
    }

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>
        <div class="desk-name">
          <i data-lucide="monitor" size="16"></i> ${desk.desk_number}
        </div>
      </td>
      <td>${badgeHtml}</td>
      <td>${userHtml}</td>
      <td>${timeHtml}</td>
      <td><div class="action-btns">${actionHtml}</div></td>
    `;

    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

// 4. เปลี่ยนแท็บตัวกรอง
function setFilter(filter, btnEl) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

  btnEl.classList.add('active');
  renderDashboard();
}

// 5. จัดการจองแทน Walk-in
async function handleWalkInBooking(e) {
  e.preventDefault();

  const studentId = document.getElementById('walkinStudentId').value.trim();
  const studentName = document.getElementById('walkinStudentName').value.trim();
  const deskId = Number(document.getElementById('walkinDeskSelect').value);
  const slotId = document.getElementById('timeSlotSelect').value;
  const dateStr = document.getElementById('currentDateDisplay').textContent;

  if (!deskId) {
    showToast('กรุณาเลือกโต๊ะว่างก่อนทำรายการ', 'error');
    return;
  }

  const now = new Date();

  const bookedTime = new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now) + ' น.';

  try {
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        desk_id: deskId,
        slot_id: slotId,
        booking_date: dateStr,
        is_walkin: true
      })
    });
  } catch (err) {
    console.log('โหมดจำลองทดสอบหน้าเว็บ');
  }

  const target = desksData.find(d => d.desk_id === deskId);

  if (target) {
    target.status = 'reserved';
    target.student_id = studentId;
    target.full_name = studentName;
    target.booked_at = bookedTime;
  }

  e.target.reset();
  renderDashboard();

  showToast(`จองโต๊ะที่ ${deskId} ให้คุณ ${studentName} (${studentId}) สำเร็จ!`, 'success');
}

// 6. เปลี่ยนสถานะ ปิดปรับปรุง / เปิดใช้งานปกติ
async function toggleMaintenance(deskId, newStatus) {
  try {
    await fetch(`/api/desks/${deskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (err) {
    console.log('โหมดจำลองทดสอบหน้าเว็บ');
  }

  const target = desksData.find(d => d.desk_id === deskId);

  if (target) {
    target.status = newStatus;
  }

  renderDashboard();

  const msg = newStatus === 'maintenance'
    ? `เปลี่ยนสถานะ โต๊ะที่ ${deskId} เป็น "ปิดปรับปรุง" แล้ว`
    : `เปิดใช้งาน โต๊ะที่ ${deskId} ตามปกติแล้ว`;

  showToast(msg, 'success');
}

// 7. ยกเลิกสิทธิ์โดย Admin
async function cancelBookingByAdmin(deskId) {
  if (!confirm(`ยืนยันการยกเลิกสิทธิ์การจองของ โต๊ะที่ ${deskId} และคืนสถานะเป็นว่างใช่หรือไม่?`)) return;

  try {
    await fetch(`/api/bookings/cancel-by-desk/${deskId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.log('โหมดจำลองทดสอบหน้าเว็บ');
  }

  const target = desksData.find(d => d.desk_id === deskId);

  if (target) {
    target.status = 'available';
    target.student_id = null;
    target.full_name = null;
    target.booked_at = null;
  }

  renderDashboard();

  showToast(`คืนสิทธิ์ โต๊ะที่ ${deskId} กลับเป็นสถานะว่างเรียบร้อยแล้ว`, 'success');
}
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');

    if (!container) {
        console.error('ไม่พบ toastContainer ใน admin.html');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success'
        ? 'fa-circle-check'
        : 'fa-circle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// 9. Logout Admin
function logoutAdmin() {
    if (confirm('ต้องการออกจากระบบผู้ดูแลระบบใช่หรือไม่?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'index.html'; 
    }
}

loadDashboardData();

showToast('ทดสอบการแจ้งเตือนแอดมิน', 'success');
// ฟังก์ชันดึงข้อมูลการจองมาแสดงผลในตารางแอดมินแบบเรียลไทม์
function syncAdminTableWithBookings() {
    const bookedSeats = JSON.parse(localStorage.getItem('booked_seats')) || [];
    
    for (let i = 1; i <= 25; i++) {
        // ค้นหาแถวของโต๊ะตัวที่ i ในตาราง 
        const row = document.querySelectorAll('#desksTableBody tr')[i - 1];
        if (!row) continue;

        const cells = row.querySelectorAll('td');
        const booking = bookedSeats.find(item => item.seat == i);

        if (booking) {
            // ถ้ามีคนจอง (เปลี่ยนสถานะเป็นสีแดง และใส่ชื่อ/รหัส)
            if (cells[1]) cells[1].innerHTML = `<span style="color: #ef4444; font-weight: bold;">● ไม่ว่าง (จองแล้ว)</span>`;
            if (cells[2]) cells[2].innerText = `${booking.studentId} / ${booking.studentName}`;
            if (cells[3]) cells[3].innerText = booking.timestamp || '-';
        } else {
            
            // เช็คว่าไม่ใช่โต๊ะปิดซ่อม (โต๊ะ 11, 12 ในรูป) ถึงจะปรับเป็นว่าง
            if (!cells[1].innerText.includes('ปิดปรับปรุง')) {
                if (cells[1]) cells[1].innerHTML = `<span style="color: #22c55e;">● ว่างพร้อมใช้งาน</span>`;
                if (cells[2]) cells[2].innerText = `- ไม่มีผู้ใช้งาน -`;
                if (cells[3]) cells[3].innerText = `-`;
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    syncAdminTableWithBookings();
});