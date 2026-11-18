const maintenanceSeats = [12, 22]; 
        function renderSeats() {
            seatGrid.innerHTML = '';
            
            for (let i = 1; i <= 25; i++) {      
                const seat = document.createElement('button');
                
                if (bookedSeats.includes(i)) {
                    seat.className = 'seat booked';
                    seat.innerHTML = `<span>โต๊ะ ${i}</span><span style="font-size: 11px;">(ไม่ว่าง)</span>`;
                } else if (maintenanceSeats.includes(i)) {
                    seat.className = 'seat maintenance';
                    seat.innerHTML = `<span>โต๊ะ ${i}</span><span style="font-size: 11px;">(ปิดซ่อม)</span>`;
                } else {
                    seat.className = 'seat available';
                    seat.innerHTML = `<span>โต๊ะ ${i}</span><span style="font-size: 11px;">(ว่าง)</span>`;

                    seat.addEventListener('click', () => {
                        if (isSlotPast(currentSlot)) {
                            alert('รอบเวลานี้ผ่านไปแล้ว ไม่สามารถจองได้');
                            return;
                        }
                        const mine = getMine();
                        if (mine[myKey()]) {
                            alert('คุณจองโต๊ะที่ ' + mine[myKey()] + ' ในรอบนี้ไปแล้ว จองได้ 1 โต๊ะต่อ 1 รอบ');
                            return;
                        }
                        chosenSeat = i;
                        
                        const selectedDate = DAY; 

                        const slotNames = {
                            morning: 'รอบเช้า 06:00-12:00',
                            afternoon: 'รอบบ่าย 12:00-18:00',
                            evening: 'รอบเย็น-ค่ำ 18:00-24:00',
                            night: 'รอบดึก 00:00-06:00'
                        };
                        
                       const bookingUserName =
                       localStorage.getItem('user_name') ||
                       localStorage.getItem('student_name') ||'ไม่พบชื่อผู้ใช้งาน';
                       
                       const bookingTime = new Date().toLocaleTimeString('th-TH');
                       
                       selectedSeatText.innerHTML = `คุณต้องการจอง<br>` +
                       `<span style="font-size: 22px; color: #38bdf8; font-weight: bold;">โต๊ะที่ ${i}</span><br>` +
                       `<div style="margin-top: 10px; font-size: 15px; color: #caf4a0; text-align: left; background: #132652; padding: 10px; border-radius: 8px;">` +
                       `<b>วันที่:</b> ${selectedDate}<br>` +
                       `<b>รอบเวลา:</b> ${selectedSlotText}` +
                       `<br><b>ชื่อผู้จอง:</b> ${bookingUserName}` +
                       `<br><b>เวลาที่จอง:</b> ${bookingTime} น.` +
                       `</div>` +
                       `<span style="display:block; margin-top:10px;">ใช่หรือไม่?</span>`;

                        modal.style.display = 'flex';
                    });
                }
                seatGrid.appendChild(seat);
            }
        }

        function handleStudentBooking(seatNumber, studentId, studentName, slotName) {
            localStorage.setItem('student_id', studentId);
            localStorage.setItem('user_name', studentName);
            localStorage.setItem('student_name', studentName);
            
            let bookedSeats = JSON.parse(localStorage.getItem('booked_seats')) || [];
            
            const newBooking = {
                seat: seatNumber,
                studentId: studentId,
                studentName: studentName,
                slot: slotName,
                timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
                date: new Date().toISOString().split('T')[0]
            
            };
            
            bookedSeats = bookedSeats.filter(item => item.seat !== seatNumber);
            bookedSeats.push(newBooking);
            
            localStorage.setItem('booked_seats', JSON.stringify(bookedSeats));
            alert('จองโต๊ะสำเร็จ!')
        }