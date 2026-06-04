'use strict';
require('dotenv').config();
const { sequelize, User, Doctor, Patient, Diagnosis, Appointment, Notification } = require('../models');
const { hashPassword } = require('../token');

async function seed() {
  // Doctors
  const docs = await Doctor.bulkCreate([
    { full_name: 'Jasur Yusupov',     specialty: 'Kardiolog',                  department: 'Kardiologiya',     phone: '+998 90 123 45 67', email: 'j.yusupov@caretrack.uz',    available_status: 'Available', emergency_contact: '+998 90 100 10 01' },
    { full_name: 'Malika Karimova',    specialty: 'Klinik Nevropatolog',         department: 'Nevrologiya',      phone: '+998 90 234 56 78', email: 'm.karimova@caretrack.uz',   available_status: 'Available', emergency_contact: '+998 90 100 10 02' },
    { full_name: 'Bekzod Sattorov',    specialty: 'Dermatolog',                  department: 'Dermatologiya',    phone: '+998 90 345 67 89', email: 'b.sattorov@caretrack.uz',   available_status: 'Available', emergency_contact: '' },
    { full_name: 'Nilufar Tursunova',  specialty: 'Ortopediya Jarrohi',          department: 'Ortopediya',       phone: '+998 90 456 78 90', email: 'n.tursunova@caretrack.uz',  available_status: 'Available', emergency_contact: '' },
    { full_name: 'Akmal Rashidov',     specialty: 'Umumiy Amaliyot Shifokori',   department: 'Umumiy Amaliyot',  phone: '+998 90 567 89 01', email: 'a.rashidov@caretrack.uz',   available_status: 'Available', emergency_contact: '' },
    { full_name: 'Dilnoza Abdullaeva', specialty: 'Radiolog',                    department: 'Diagnostika',      phone: '+998 90 678 90 12', email: 'd.abdullaeva@caretrack.uz', available_status: 'Available', emergency_contact: '' },
    { full_name: 'Sherzod Mirzaev',    specialty: 'Yurak Elektrofiziologi',      department: 'Kardiologiya',     phone: '+998 90 789 01 23', email: 's.mirzaev@caretrack.uz',    available_status: 'Off-duty',  emergency_contact: '+998 90 100 10 07' },
    { full_name: 'Gulnora Hamidova',   specialty: 'Bolalar Nevropatologa',       department: 'Nevrologiya',      phone: '+998 90 890 12 34', email: 'g.hamidova@caretrack.uz',   available_status: 'Off-duty',  emergency_contact: '' },
  ], { returning: true });

  // Users
  const users = [
    { username: 'admin@gmail.com', password: 'admin123',    full_name: 'Bobur Xolmatov',    role: 'admin',        doctor_id: null },
    { username: 'receptionist',    password: 'reception123',full_name: 'Shahlo Raximova',   role: 'receptionist', doctor_id: null },
    { username: 'bemor1',          password: 'bemor123',    full_name: 'Alisher Nazarov',   role: 'patient',      doctor_id: null },
    { username: 'bemor2',          password: 'bemor123',    full_name: 'Nilufar Xasanova',  role: 'patient',      doctor_id: null },
  ];
  // Clinician users (one per doctor)
  for (const doc of docs) {
    const uname = doc.email;
    const pass  = doc.email.split('@')[0];
    users.push({ username: uname, password: pass, full_name: doc.full_name, role: 'clinician', doctor_id: doc.id });
  }
  for (const u of users) {
    u.password_hash = await hashPassword(u.password);
  }
  await User.bulkCreate(users.map(u => ({ ...u, password: undefined })));

  // Patients
  const patients = await Patient.bulkCreate([
    { full_name: 'Aziz Karimov',      date_of_birth: '1985-03-12', gender: 'Erkak', phone: '+998 91 111 22 33', address: 'Toshkent, Yunusobod 14-5',        doctor_id: docs[0].id },
    { full_name: 'Madina Saidova',    date_of_birth: '1992-07-25', gender: 'Ayol',  phone: '+998 91 222 33 44', address: 'Toshkent, Chilonzor 8-21',         doctor_id: docs[1].id },
    { full_name: 'Olim Toshmatov',    date_of_birth: '1978-11-03', gender: 'Erkak', phone: '+998 91 333 44 55', address: "Samarqand, Registon ko'chasi 4",   doctor_id: docs[0].id },
    { full_name: 'Zarina Yuldasheva', date_of_birth: '2001-02-18', gender: 'Ayol',  phone: '+998 91 444 55 66', address: "Toshkent, Mirzo Ulug'bek 22",      doctor_id: docs[2].id },
    { full_name: 'Jamshid Otaboev',   date_of_birth: '1965-09-09', gender: 'Erkak', phone: '+998 91 555 66 77', address: "Buxoro, Mustaqillik ko'chasi 11",  doctor_id: docs[3].id },
    { full_name: 'Sevara Rustamova',  date_of_birth: '1988-04-30', gender: 'Ayol',  phone: '+998 91 666 77 88', address: 'Toshkent, Sergeli 7-3',            doctor_id: docs[4].id },
    { full_name: 'Sardor Nazarov',    date_of_birth: '1995-12-14', gender: 'Erkak', phone: '+998 91 777 88 99', address: "Andijon, Bobur ko'chasi 9",        doctor_id: docs[1].id },
    { full_name: 'Laylo Kamilova',    date_of_birth: '1972-06-22', gender: 'Ayol',  phone: '+998 91 888 99 00', address: 'Toshkent, Olmazor 33',             doctor_id: docs[3].id },
    { full_name: 'Davron Ergashev',   date_of_birth: '1982-08-17', gender: 'Erkak', phone: '+998 91 999 00 11', address: "Farg'ona, Mustaqillik ko'chasi 12",doctor_id: docs[0].id },
    { full_name: 'Nodira Ismoilova',  date_of_birth: '1999-01-05', gender: 'Ayol',  phone: '+998 91 000 11 22', address: 'Toshkent, Yashnobod 18',           doctor_id: docs[4].id },
    { full_name: 'Otabek Sobirov',    date_of_birth: '1968-10-28', gender: 'Erkak', phone: '+998 91 121 32 43', address: "Namangan, Navoiy ko'chasi 5",      doctor_id: docs[6].id },
    { full_name: 'Kamola Yusupova',   date_of_birth: '1990-05-11', gender: 'Ayol',  phone: '+998 91 232 43 54', address: 'Toshkent, Bektemir 9',             doctor_id: docs[7].id },
    { full_name: 'Rustam Boboev',     date_of_birth: '1955-03-19', gender: 'Erkak', phone: '+998 91 343 54 65', address: 'Toshkent, Shayxontohur 4',         doctor_id: docs[3].id },
    { full_name: 'Feruza Akramova',   date_of_birth: '1986-11-27', gender: 'Ayol',  phone: '+998 91 454 65 76', address: "Qarshi, Amir Temur ko'chasi 16",   doctor_id: docs[2].id },
    { full_name: 'Bobur Xolmatov',    date_of_birth: '1979-07-08', gender: 'Erkak', phone: '+998 91 565 76 87', address: 'Toshkent, Uchtepa 12',             doctor_id: docs[4].id },
    { full_name: 'Mavluda Nazirova',  date_of_birth: '2003-09-15', gender: 'Ayol',  phone: '+998 91 676 87 98', address: 'Toshkent, Mirobod 6',              doctor_id: docs[7].id },
    { full_name: 'Anvar Ismatullaev', date_of_birth: '1971-04-02', gender: 'Erkak', phone: '+998 91 787 98 09', address: "Xorazm, Pahlavon Mahmud ko'chasi 3",doctor_id: docs[5].id },
    { full_name: 'Shahnoza Olimova',  date_of_birth: '1994-12-23', gender: 'Ayol',  phone: '+998 91 898 09 10', address: 'Toshkent, Yakkasaroy 19',          doctor_id: docs[1].id },
    { full_name: 'Timur Ergashov',    date_of_birth: '1960-02-14', gender: 'Erkak', phone: '+998 91 909 10 21', address: 'Toshkent, Yunusobod 21',           doctor_id: docs[0].id },
    { full_name: 'Iroda Mahmudova',   date_of_birth: '1989-06-06', gender: 'Ayol',  phone: '+998 91 010 21 32', address: 'Toshkent, Chilonzor 15',           doctor_id: docs[4].id },
    // Demo patient users uchun yozuvlar
    { full_name: 'Alisher Nazarov',   date_of_birth: '1995-04-15', gender: 'Erkak', phone: '+998 90 111 22 33', address: 'Toshkent, Mirzo Ulug\'bek tumani', doctor_id: docs[0].id },
    { full_name: 'Nilufar Xasanova',  date_of_birth: '1998-08-22', gender: 'Ayol',  phone: '+998 90 222 33 44', address: 'Toshkent, Yunusobod tumani',        doctor_id: docs[1].id },
  ], { returning: true });

  // Diagnoses
  await Diagnosis.bulkCreate([
    { patient_id: patients[0].id,  doctor_id: docs[0].id, icd_code: 'I10',      title: 'Arterial gipertenziya',               description: 'Qon bosimi doimiy ravishda 140/90 dan yuqori',            severity: 'High',     diagnosis_date: '2025-11-08', notes: 'Lisinopril 10mg kuniga bir marta.' },
    { patient_id: patients[1].id,  doctor_id: docs[1].id, icd_code: 'G43.909',  title: 'Migren, aniqlanmagan',                description: 'Aura bilan takrorlanuvchi bir tomonlama bosh og\'riqlari', severity: 'Medium',   diagnosis_date: '2026-03-02', notes: 'Sumatriptan kerak bo\'lganda.' },
    { patient_id: patients[2].id,  doctor_id: docs[0].id, icd_code: 'I21.4',    title: 'ST ko\'tarilmasiz miokard infarkti',  description: 'O\'tkir MI, troponin ko\'tarilgan',                         severity: 'Critical', diagnosis_date: '2026-04-21', notes: 'Yotqizildi, PCI o\'tkazildi.' },
    { patient_id: patients[3].id,  doctor_id: docs[2].id, icd_code: 'L70.0',    title: 'Akne vulgaris',                       description: 'Yuz va orqada o\'rtacha darajadagi yallig\'lanishli akne', severity: 'Low',      diagnosis_date: '2026-01-19', notes: 'Mahalliy retinoid tayinlandi.' },
    { patient_id: patients[4].id,  doctor_id: docs[3].id, icd_code: 'M17.11',   title: 'O\'ng tizza birlamchi osteoartriti', description: 'Surunkali og\'riq, harakat doirasi cheklangan',             severity: 'High',     diagnosis_date: '2025-12-04', notes: 'Tizza almashtirish ko\'rib chiqilmoqda.' },
    { patient_id: patients[5].id,  doctor_id: docs[4].id, icd_code: 'E11.9',    title: '2-toifa qandli diabet',               description: 'Yangi aniqlangan, HbA1c 7.8%',                            severity: 'Medium',   diagnosis_date: '2026-02-28', notes: 'Metformin boshlandi.' },
    { patient_id: patients[6].id,  doctor_id: docs[1].id, icd_code: 'G40.909',  title: 'Epilepsiya, aniqlanmagan',            description: 'Birinchi provokatsiyasiz tutqanoq',                         severity: 'High',     diagnosis_date: '2026-03-15', notes: 'Levetirasetam boshlandi.' },
    { patient_id: patients[7].id,  doctor_id: docs[3].id, icd_code: 'M81.0',    title: 'Menopauzadan keyingi osteoporoz',    description: 'DEXA T-ko\'rsatkichi -2.7',                               severity: 'Medium',   diagnosis_date: '2026-01-30', notes: 'Bifosfonat terapiyasi.' },
    { patient_id: patients[8].id,  doctor_id: docs[0].id, icd_code: 'I48.91',   title: 'Qorincha fibrillyatsiyasi',          description: 'Paroksizmal epizodlar, yurak urishi',                      severity: 'High',     diagnosis_date: '2026-04-05', notes: 'Antikoagulyatsiya boshlandi.' },
    { patient_id: patients[9].id,  doctor_id: docs[4].id, icd_code: 'J45.40',   title: 'O\'rtacha darajali bronxial astma',  description: 'Kunlik alomatlar, ingalatsion steroidlar bilan',           severity: 'Medium',   diagnosis_date: '2025-10-12', notes: 'ICS/LABA kombinatsiyasi.' },
    { patient_id: patients[10].id, doctor_id: docs[6].id, icd_code: 'I50.9',    title: 'Yurak etishmovchiligi',              description: 'NYHA III sinf, chiqarish fraktsiyasi kamaygan',           severity: 'Critical', diagnosis_date: '2026-03-22', notes: 'CRT ko\'rib chiqilmoqda.' },
    { patient_id: patients[11].id, doctor_id: docs[7].id, icd_code: 'G35',      title: 'Ko\'p skleroz',                      description: 'Qaytib keladigan-remissiyalovchi MS',                       severity: 'High',     diagnosis_date: '2025-09-18', notes: 'Kasallikni modifitsiyalovchi terapiya davom etmoqda.' },
    { patient_id: patients[12].id, doctor_id: docs[3].id, icd_code: 'S72.001A', title: 'O\'ng son suyagi sinishi',           description: 'Balanddan yiqilish, jarrohlik fiksatsiyasi',               severity: 'Critical', diagnosis_date: '2026-04-30', notes: 'Operatsiyadan keyingi 5-kun.' },
    { patient_id: patients[13].id, doctor_id: docs[2].id, icd_code: 'L40.0',    title: 'Taqsimchasimon psoriaz',             description: 'Tirsak va boshda o\'rtacha taqsimchalar',                  severity: 'Medium',   diagnosis_date: '2026-02-08', notes: 'Mahalliy steroidlar.' },
    { patient_id: patients[14].id, doctor_id: docs[4].id, icd_code: 'J44.9',    title: 'OOSB, aniqlanmagan',                description: 'Uzoq muddatli chekuvchi, tez-tez alevlamalar',             severity: 'High',     diagnosis_date: '2025-08-25', notes: 'LAMA tayinlandi.' },
    { patient_id: patients[16].id, doctor_id: docs[5].id, icd_code: 'C50.911',  title: 'Ko\'krak bezi xavfli o\'smasi',     description: 'Tasvirlashda shubhali massa, biopsiya kutilmoqda',          severity: 'Critical', diagnosis_date: '2026-05-01', notes: 'Shoshilinch onkologiya yo\'nalishi.' },
    { patient_id: patients[17].id, doctor_id: docs[1].id, icd_code: 'F41.1',    title: 'Umumlashgan tashvish buzilishi',    description: 'Doimiy tashvish, uyqu buzilishi',                          severity: 'Medium',   diagnosis_date: '2026-03-10', notes: 'KBT yo\'nalishi, SSRI boshlandi.' },
    { patient_id: patients[18].id, doctor_id: docs[0].id, icd_code: 'I63.9',    title: 'Miya infarkti (insult)',             description: 'So\'nggi ishemik insult, engil qoldiq nuqson',             severity: 'Critical', diagnosis_date: '2026-02-19', notes: 'Antitrombositar terapiya, reabilitatsiya.' },
    { patient_id: patients[19].id, doctor_id: docs[4].id, icd_code: 'N39.0',    title: 'Siydik yo\'llari infeksiyasi',      description: 'Asoratsiz sistitit',                                       severity: 'Low',      diagnosis_date: '2026-04-25', notes: 'Antibiotik kursi yakunlandi.' },
    // Demo bemorlar (bemor1, bemor2) uchun tashxislar
    { patient_id: patients[20].id, doctor_id: docs[0].id, icd_code: 'J06.9',    title: 'O\'tkir yuqori nafas yo\'llari infeksiyasi', description: 'Yo\'tal, burun qiqimi, past harorat',                 severity: 'Low',      diagnosis_date: '2026-05-10', notes: 'Simptomatik davolash, ko\'p suyuqlik ichish.' },
    { patient_id: patients[20].id, doctor_id: docs[0].id, icd_code: 'K29.70',   title: 'Gastrit, aniqlanmagan',               description: 'Qorin og\'rig\'i, ko\'ngil aynish',                       severity: 'Medium',   diagnosis_date: '2026-03-18', notes: 'Omeprazol 20mg, 14 kun.' },
    { patient_id: patients[21].id, doctor_id: docs[1].id, icd_code: 'G44.209',  title: 'Taranglik turidagi bosh og\'rig\'i',  description: 'Ikki tomonlama, epizodik, bosim hissi',                    severity: 'Low',      diagnosis_date: '2026-04-30', notes: 'Ibuprofen kerak bo\'lganda, stressni kamaytirish.' },
  ]);

  console.log('✅ Seed ma\'lumotlari yuklandi!');
}

if (require.main === module) {
  (async () => {
    await sequelize.sync({ force: true });
    await seed();
    process.exit(0);
  })();
}

module.exports = seed;
