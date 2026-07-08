import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { dbAll, dbUpsert, dbBulk, dbDelete, dbDeleteBy, dbClear } from '../lib/supabase'

const STORAGE_KEY = 'daily-kost-v5'
const TABLES = ['properties', 'rooms', 'customers', 'bookings', 'payments', 'expenses', 'broadcasts', 'templates']

// ── Utils ───────────────────────────────────────────────────────────────────
const uid = (p = 'x') => p + '_' + Math.random().toString(36).slice(2, 9)

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260709)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const randInt = (min, max) => min + Math.floor(rng() * (max - min + 1))
const p2 = (n) => String(n).padStart(2, '0')

// ── Paket durasi (kos singgah / transit) ─────────────────────────────────────
export const DURATIONS = [
  { key: '3j', label: '3 Jam', short: '3 jam', hours: 3 },
  { key: '6j', label: '6 Jam', short: '6 jam', hours: 6 },
  { key: '12j', label: '12 Jam', short: '12 jam', hours: 12 },
  { key: '1h', label: '1 Hari', short: '24 jam', hours: 24 },
  { key: '3h', label: '3 Hari', short: '3 hari', hours: 72 },
  { key: '1mg', label: '1 Minggu', short: '7 hari', hours: 168 },
]
export const durationByKey = (k) => DURATIONS.find((d) => d.key === k) || DURATIONS[3]

// ── Tanggal & waktu ──────────────────────────────────────────────────────────
export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
}
export function nowStr() {
  const d = new Date()
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`
}
export function addDays(dateStr, n) {
  const d = new Date((dateStr || todayStr()) + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
export function addHours(dt, h) {
  const d = new Date((dt || nowStr()).replace(' ', 'T'))
  d.setHours(d.getHours() + h)
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`
}
export function daysBetween(a, b) {
  const d1 = new Date(a + 'T00:00:00Z')
  const d2 = new Date(b + 'T00:00:00Z')
  return Math.max(1, Math.round((d2 - d1) / 86400000))
}

export const AREAS = [
  'Pontianak Kota',
  'Pontianak Selatan',
  'Pontianak Tenggara',
  'Pontianak Timur',
  'Pontianak Barat',
  'Pontianak Utara',
]

// ── Seed ─────────────────────────────────────────────────────────────────────
function seed() {
  const properties = [
    { id: 'p1', name: 'Green Garden Transit', area: 'Pontianak Kota', address: 'Jl. Gajah Mada No. 88', phone: '0561-730001', type: 'Campur', hue: 158, rating: 4.9 },
    { id: 'p2', name: 'Khatulistiwa Stay', area: 'Pontianak Selatan', address: 'Jl. Ahmad Yani No. 21', phone: '0561-730002', type: 'Campur', hue: 168, rating: 4.7 },
    { id: 'p3', name: 'Mutiara Kapuas Rooms', area: 'Pontianak Tenggara', address: 'Jl. Imam Bonjol No. 45', phone: '0561-730003', type: 'Campur', hue: 148, rating: 4.8 },
    { id: 'p4', name: 'Anggrek Signature Stay', area: 'Pontianak Barat', address: 'Jl. Komyos Sudarso No. 12', phone: '0561-730004', type: 'Campur', hue: 176, rating: 4.6 },
    { id: 'p5', name: 'Katulistiwa Sky Rooms', area: 'Pontianak Utara', address: 'Jl. Khatulistiwa No. 7', phone: '0561-730005', type: 'Campur', hue: 138, rating: 4.5 },
  ]

  const baseFac = ['AC', 'Smart TV', 'Netflix', 'WiFi cepat', 'KM dalam', 'Air panas']
  const classes = [
    { type: 'Standard', rates: { '3j': 40000, '6j': 60000, '12j': 90000, '1h': 130000, '3h': 330000, '1mg': 700000 }, fac: [...baseFac] },
    { type: 'Deluxe', rates: { '3j': 55000, '6j': 80000, '12j': 120000, '1h': 175000, '3h': 450000, '1mg': 950000 }, fac: [...baseFac, 'Kulkas mini', 'Meja kerja'] },
    { type: 'Executive', rates: { '3j': 75000, '6j': 110000, '12j': 160000, '1h': 230000, '3h': 600000, '1mg': 1300000 }, fac: [...baseFac, 'Kulkas mini', 'Sofa', 'Bathtub', 'City view'] },
  ]

  const rooms = []
  for (const p of properties) {
    const floors = randInt(2, 3)
    for (let f = 1; f <= floors; f++) {
      const perFloor = randInt(3, 5)
      for (let n = 1; n <= perFloor; n++) {
        const cl = classes[Math.min(classes.length - 1, f - 1 + (rng() > 0.6 ? 1 : 0))]
        const num = `${f}${p2(n)}`
        const cap = cl.type === 'Executive' ? 3 : 2
        rooms.push({
          id: `r-${p.id}-${num}`,
          propertyId: p.id,
          number: num,
          floor: f,
          type: cl.type,
          rates: { ...cl.rates },
          dailyRate: cl.rates['1h'], // harga headline (1 hari) — kompatibilitas
          facilities: [...cl.fac],
          capacity: cap,
          description: `Kamar ${cl.type} yang nyaman di ${p.name}, ${p.area}. Cocok untuk singgah, transit perjalanan, atau istirahat sejenak. Dilengkapi ${cl.fac.slice(0, 4).join(', ')}. Bersih, wangi, dan siap huni 24 jam.`,
        })
      }
    }
  }

  const firstNames = ['Andi', 'Siti', 'Budi', 'Dewi', 'Rizky', 'Putri', 'Fajar', 'Maya', 'Dimas', 'Nabila', 'Arif', 'Salsa', 'Hendra', 'Intan', 'Yoga', 'Citra', 'Bayu', 'Ratna', 'Galih', 'Wulan']
  const lastNames = ['Pratama', 'Rahma', 'Santoso', 'Lestari', 'Wijaya', 'Anggraini', 'Nugroho', 'Safitri', 'Kurniawan', 'Maharani', 'Setiawan', 'Puspita']
  const customers = []
  for (let i = 0; i < 28; i++) {
    const name = `${pick(firstNames)} ${pick(lastNames)}`
    customers.push({
      id: uid('c'),
      name,
      phone: `08${randInt(11, 89)}-${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
      email: name.toLowerCase().replace(/\s+/g, '.') + '@mail.com',
      idNumber: `61710${randInt(10000000, 99999999)}`,
      joinedAt: addDays(todayStr(), -randInt(5, 200)),
    })
  }

  const methods = ['Transfer', 'QRIS', 'Tunai']
  const sources = ['Walk-in', 'WhatsApp', 'OTA', 'Website']
  const durKeys = ['3j', '3j', '6j', '6j', '12j', '1h', '1h']
  const bookings = []
  const payments = []
  const roomTotal = (room, key) => room.rates[key] ?? room.dailyRate

  // Riwayat (checkout) 45 hari terakhir → tren pendapatan
  for (let i = 0; i < 90; i++) {
    const room = pick(rooms)
    const cust = pick(customers)
    const day = addDays(todayStr(), -randInt(1, 45))
    const hour = randInt(8, 22)
    const dk = pick(durKeys)
    const checkInAt = `${day}T${p2(hour)}:00`
    const b = { id: uid('b'), roomId: room.id, customerId: cust.id, checkInAt, durationKey: dk, status: 'checkout', paid: true, source: pick(sources), guests: randInt(1, 2) }
    bookings.push(b)
    payments.push({ id: uid('pay'), bookingId: b.id, amount: roomTotal(room, dk), method: pick(methods), date: day, status: 'success' })
  }

  // Aktif sekarang — beberapa kamar sedang terisi (window mencakup waktu ini)
  const now = new Date()
  const usedRooms = new Set()
  let active = 0
  const shuffled = [...rooms].sort(() => rng() - 0.5)
  for (const room of shuffled) {
    if (active >= 14) break
    if (usedRooms.has(room.id)) continue
    if (rng() > 0.5) continue
    usedRooms.add(room.id)
    const cust = pick(customers)
    const dk = pick(durKeys)
    const hrs = durationByKey(dk).hours
    // mulai antara beberapa jam lalu s/d beberapa jam ke depan
    const offset = randInt(-Math.min(hrs - 1, 6), 6)
    const start = new Date(now.getTime() + offset * 3600000)
    const checkInAt = `${start.getFullYear()}-${p2(start.getMonth() + 1)}-${p2(start.getDate())}T${p2(start.getHours())}:00`
    const paid = rng() > 0.35
    const b = { id: uid('b'), roomId: room.id, customerId: cust.id, checkInAt, durationKey: dk, status: 'active', paid, source: pick(sources), guests: randInt(1, 2) }
    bookings.push(b)
    if (paid) payments.push({ id: uid('pay'), bookingId: b.id, amount: roomTotal(room, dk), method: pick(methods), date: checkInAt.slice(0, 10), status: 'success' })
    active++
  }

  const expCats = ['Listrik & Air', 'Kebersihan', 'Perawatan', 'Gaji Staff', 'Internet & Netflix', 'Perlengkapan']
  const expenses = []
  for (let i = 0; i < 30; i++) {
    expenses.push({ id: uid('e'), propertyId: pick(properties).id, category: pick(expCats), amount: randInt(8, 90) * 10000, date: addDays(todayStr(), -randInt(0, 45)), note: '' })
  }

  const broadcasts = [
    { id: uid('bc'), title: 'Promo Transit 6 Jam', message: 'Halo! Nikmati promo kamar transit 6 jam mulai Rp60rb — AC, Smart TV, Netflix, kamar mandi dalam. Pesan sekarang di Daily Kost Pontianak 🌿', audience: 'Semua Penghuni', channel: 'Channel', date: addDays(todayStr(), -2), recipients: 128, status: 'terkirim' },
    { id: uid('bc'), title: 'Reminder Check-out', message: 'Halo, waktu sewa kamar Anda akan berakhir dalam 30 menit. Perpanjang? Balas pesan ini 🙏', audience: 'Penghuni Aktif', channel: 'Personal', date: todayStr(), recipients: 9, status: 'terkirim' },
    { id: uid('bc'), title: 'Kamar Bersih & Siap Huni', message: 'Semua kamar telah disterilisasi & dibersihkan. Check-in kapan saja, 24 jam!', audience: 'Semua Penghuni', channel: 'Channel', date: todayStr(), recipients: 128, status: 'terjadwal' },
  ]
  const templates = [
    { id: uid('t'), name: 'Konfirmasi Booking', body: 'Halo {nama}, booking kamar {kamar} di {properti} dikonfirmasi. Check-in: {checkin}, durasi {durasi}. Terima kasih! 🌿' },
    { id: uid('t'), name: 'Reminder Check-out', body: 'Halo {nama}, sewa kamar {kamar} berakhir pukul {checkout}. Mau perpanjang? Balas pesan ini 🙏' },
    { id: uid('t'), name: 'Ucapan Selamat Datang', body: 'Selamat datang di {properti}, {nama}! Nikmati AC, Smart TV & Netflix. Butuh bantuan? Hubungi kami 😊' },
    { id: uid('t'), name: 'Promo Perpanjang', body: 'Halo {nama}, perpanjang sewa sekarang dan dapatkan harga spesial. Kamar {kamar} masih tersedia 🌿' },
  ]

  return { properties, rooms, customers, bookings, payments, expenses, broadcasts, templates }
}

const defaultSettings = {
  businessName: 'Daily Kost Pontianak',
  ownerName: 'Admin',
  waConnected: false,
  waNumber: '',
  waProvider: 'Meta Cloud API',
  currency: 'IDR',
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('load gagal, pakai seed', e)
  }
  return { ...seed(), settings: { ...defaultSettings } }
}

// ── Store ────────────────────────────────────────────────────────────────────
export const useKostStore = defineStore('kost', () => {
  const initial = load()
  const properties = ref(initial.properties)
  const rooms = ref(initial.rooms)
  const customers = ref(initial.customers)
  const bookings = ref(initial.bookings)
  const payments = ref(initial.payments)
  const expenses = ref(initial.expenses)
  const broadcasts = ref(initial.broadcasts)
  const templates = ref(initial.templates)
  const settings = ref(initial.settings ?? { ...defaultSettings })

  const activePropertyId = ref(null)
  const ready = ref(false)

  watch(
    [properties, rooms, customers, bookings, payments, expenses, broadcasts, templates, settings],
    () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        properties: properties.value, rooms: rooms.value, customers: customers.value,
        bookings: bookings.value, payments: payments.value, expenses: expenses.value,
        broadcasts: broadcasts.value, templates: templates.value, settings: settings.value,
      }))
    },
    { deep: true }
  )

  async function init() {
    try {
      const props = await dbAll('properties')
      if (!props.length) {
        const s = seed()
        properties.value = s.properties; rooms.value = s.rooms; customers.value = s.customers
        bookings.value = s.bookings; payments.value = s.payments; expenses.value = s.expenses
        broadcasts.value = s.broadcasts; templates.value = s.templates
        settings.value = { ...defaultSettings }
        await Promise.all([
          dbBulk('properties', s.properties), dbBulk('rooms', s.rooms), dbBulk('customers', s.customers),
          dbBulk('bookings', s.bookings), dbBulk('payments', s.payments), dbBulk('expenses', s.expenses),
          dbBulk('broadcasts', s.broadcasts), dbBulk('templates', s.templates),
        ])
        await dbUpsert('app_settings', { id: 1, data: { ...settings.value } })
      } else {
        const [rms, cus, bk, pay, exp, bc, tpl, st] = await Promise.all([
          dbAll('rooms'), dbAll('customers'), dbAll('bookings'), dbAll('payments'),
          dbAll('expenses'), dbAll('broadcasts'), dbAll('templates'), dbAll('app_settings'),
        ])
        properties.value = props; rooms.value = rms; customers.value = cus
        bookings.value = bk; payments.value = pay; expenses.value = exp
        broadcasts.value = bc.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        templates.value = tpl
        if (st.length && st[0].data) settings.value = { ...defaultSettings, ...st[0].data }
      }
    } catch (e) {
      console.warn('[supabase] init gagal — pakai data lokal', e)
    } finally {
      ready.value = true
    }
  }

  watch(settings, () => { if (ready.value) dbUpsert('app_settings', { id: 1, data: { ...settings.value } }) }, { deep: true })

  // ── Lookups ──
  const propertyById = (id) => properties.value.find((p) => p.id === id) ?? null
  const roomById = (id) => rooms.value.find((r) => r.id === id) ?? null
  const customerById = (id) => customers.value.find((c) => c.id === id) ?? null
  const propertyOfRoom = (roomId) => propertyById(roomById(roomId)?.propertyId)

  // ── Scope ──
  const scopedRooms = computed(() =>
    activePropertyId.value ? rooms.value.filter((r) => r.propertyId === activePropertyId.value) : rooms.value
  )
  const inScopeRoom = (roomId) =>
    !activePropertyId.value || roomById(roomId)?.propertyId === activePropertyId.value

  const activeBookings = computed(() => bookings.value.filter((b) => b.status === 'active'))
  const scopedActiveBookings = computed(() => activeBookings.value.filter((b) => inScopeRoom(b.roomId)))
  const scopedBookings = computed(() => bookings.value.filter((b) => inScopeRoom(b.roomId)))

  // ── Durasi & uang ──
  const bookingDuration = (b) => durationByKey(b.durationKey)
  const bookingCheckOutAt = (b) => addHours(b.checkInAt, bookingDuration(b).hours)
  const bookingTotal = (b) => {
    const room = roomById(b.roomId)
    if (!room) return 0
    return (room.rates && room.rates[b.durationKey]) ?? room.dailyRate ?? 0
  }
  const roomStartingRate = (room) => (room.rates ? room.rates['3j'] : room.dailyRate)

  // ── Status kamar (berbasis waktu sekarang) ──
  const isOccupiedNow = (roomId) => {
    const now = nowStr()
    return activeBookings.value.some((b) => b.roomId === roomId && b.checkInAt <= now && now < bookingCheckOutAt(b))
  }
  const roomStatus = (roomId) => (isOccupiedNow(roomId) ? 'terisi' : 'kosong')
  const bookingForRoom = (roomId) => {
    const now = nowStr()
    return activeBookings.value.find((b) => b.roomId === roomId && b.checkInAt <= now && now < bookingCheckOutAt(b)) ?? null
  }
  const availableRooms = computed(() => scopedRooms.value.filter((r) => roomStatus(r.id) === 'kosong'))

  // ── KPI ──
  const occupancyRate = computed(() => {
    const total = scopedRooms.value.length
    const filled = scopedRooms.value.filter((r) => roomStatus(r.id) === 'terisi').length
    return total ? Math.round((filled / total) * 100) : 0
  })
  const outstanding = computed(() =>
    scopedActiveBookings.value.filter((b) => !b.paid).reduce((s, b) => s + bookingTotal(b), 0)
  )

  const scopedPayments = computed(() =>
    payments.value.filter((pay) => {
      const b = bookings.value.find((x) => x.id === pay.bookingId)
      return b && inScopeRoom(b.roomId)
    })
  )
  const scopedExpenses = computed(() =>
    activePropertyId.value ? expenses.value.filter((e) => e.propertyId === activePropertyId.value) : expenses.value
  )

  const monthKey = (d) => (d || '').slice(0, 7)
  const thisMonth = computed(() => todayStr().slice(0, 7))
  const revenueToday = computed(() =>
    scopedPayments.value.filter((p) => p.date === todayStr()).reduce((s, p) => s + p.amount, 0)
  )
  const revenueMonth = computed(() =>
    scopedPayments.value.filter((p) => monthKey(p.date) === thisMonth.value).reduce((s, p) => s + p.amount, 0)
  )
  const expenseMonth = computed(() =>
    scopedExpenses.value.filter((e) => monthKey(e.date) === thisMonth.value).reduce((s, e) => s + e.amount, 0)
  )
  const totalRevenue = computed(() => scopedPayments.value.reduce((s, p) => s + p.amount, 0))
  const totalExpense = computed(() => scopedExpenses.value.reduce((s, e) => s + e.amount, 0))
  const netProfit = computed(() => totalRevenue.value - totalExpense.value)

  function revenueSeries(days = 14) {
    const out = []
    for (let i = days - 1; i >= 0; i--) {
      const d = addDays(todayStr(), -i)
      const amount = scopedPayments.value.filter((p) => p.date === d).reduce((s, p) => s + p.amount, 0)
      out.push({ date: d, value: amount })
    }
    return out
  }

  const occupancyByProperty = computed(() =>
    properties.value.map((p) => {
      const rs = rooms.value.filter((r) => r.propertyId === p.id)
      const filled = rs.filter((r) => roomStatus(r.id) === 'terisi').length
      return { ...p, rooms: rs.length, filled, rate: rs.length ? Math.round((filled / rs.length) * 100) : 0 }
    })
  )
  const roomTypeDistribution = computed(() => {
    const map = {}
    for (const r of scopedRooms.value) map[r.type] = (map[r.type] || 0) + 1
    return Object.entries(map).map(([label, value]) => ({ label, value }))
  })
  const sourceDistribution = computed(() => {
    const map = {}
    for (const b of scopedBookings.value) map[b.source] = (map[b.source] || 0) + 1
    return Object.entries(map).map(([label, value]) => ({ label, value }))
  })
  const durationDistribution = computed(() => {
    const map = {}
    for (const b of scopedBookings.value) { const l = durationByKey(b.durationKey).label; map[l] = (map[l] || 0) + 1 }
    return DURATIONS.map((d) => ({ label: d.label, value: map[d.label] || 0 })).filter((x) => x.value)
  })
  const upcomingCheckouts = computed(() =>
    [...scopedActiveBookings.value].sort((a, b) => bookingCheckOutAt(a).localeCompare(bookingCheckOutAt(b)))
  )

  const plain = (o) => JSON.parse(JSON.stringify(o))

  // ── Actions: Property ──
  function addProperty(data) { const p = { id: uid('p'), hue: 158, rating: 4.5, type: 'Campur', ...data }; properties.value.push(p); dbUpsert('properties', plain(p)) }
  function updateProperty(id, data) { const p = propertyById(id); if (p) { Object.assign(p, data); dbUpsert('properties', plain(p)) } }
  function removeProperty(id) {
    if (rooms.value.some((r) => r.propertyId === id)) return { ok: false, msg: 'Masih ada kamar di properti ini.' }
    properties.value = properties.value.filter((p) => p.id !== id); dbDelete('properties', id); return { ok: true }
  }

  // ── Actions: Room ──
  function addRoom(data) {
    const rates = data.rates || {}
    const r = { id: uid('r'), facilities: [], capacity: 2, description: '', rates, dailyRate: rates['1h'] ?? data.dailyRate ?? 0, ...data }
    r.rates = rates; r.dailyRate = rates['1h'] ?? r.dailyRate
    rooms.value.push(r); dbUpsert('rooms', plain(r))
    return r
  }
  function updateRoom(id, data) {
    const r = roomById(id); if (!r) return
    Object.assign(r, data)
    if (data.rates) r.dailyRate = data.rates['1h'] ?? r.dailyRate
    dbUpsert('rooms', plain(r))
  }
  function removeRoom(id) {
    if (bookingForRoom(id)) return { ok: false, msg: 'Kamar sedang terisi.' }
    rooms.value = rooms.value.filter((r) => r.id !== id); dbDelete('rooms', id); return { ok: true }
  }

  // ── Actions: Customer ──
  function addCustomer(data) { const c = { id: uid('c'), joinedAt: todayStr(), ...data }; customers.value.push(c); dbUpsert('customers', plain(c)); return c }
  function updateCustomer(id, data) { const c = customerById(id); if (c) { Object.assign(c, data); dbUpsert('customers', plain(c)) } }
  function removeCustomer(id) { customers.value = customers.value.filter((c) => c.id !== id); dbDelete('customers', id) }

  // ── Actions: Booking ──
  function addBooking(data) {
    if (data.checkInAt && data.durationKey && !isRoomAvailable(data.roomId, data.checkInAt, data.durationKey))
      return { ok: false, msg: 'Kamar tidak tersedia untuk waktu tersebut.' }
    const b = { id: uid('b'), status: 'active', paid: false, source: 'Walk-in', guests: 1, durationKey: '1h', checkInAt: nowStr(), ...data }
    bookings.value.push(b); dbUpsert('bookings', plain(b))
    if (b.paid) recordPayment(b.id, bookingTotal(b), 'Transfer')
    return { ok: true, booking: b }
  }
  function checkout(id) {
    const b = bookings.value.find((x) => x.id === id); if (!b) return
    b.status = 'checkout'
    if (!b.paid) { b.paid = true; recordPayment(b.id, bookingTotal(b), 'Tunai') }
    dbUpsert('bookings', plain(b))
  }
  function togglePaid(id) {
    const b = bookings.value.find((x) => x.id === id); if (!b) return
    b.paid = !b.paid; dbUpsert('bookings', plain(b))
    if (b.paid) recordPayment(b.id, bookingTotal(b), 'Transfer')
    else { payments.value = payments.value.filter((p) => p.bookingId !== id); dbDeleteBy('payments', 'bookingId', id) }
  }
  function removeBooking(id) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
    payments.value = payments.value.filter((p) => p.bookingId !== id)
    dbDelete('bookings', id); dbDeleteBy('payments', 'bookingId', id)
  }

  function recordPayment(bookingId, amount, method = 'Transfer') {
    const p = { id: uid('pay'), bookingId, amount, method, date: todayStr(), status: 'success' }
    payments.value.push(p); dbUpsert('payments', plain(p))
  }

  function addExpense(data) { const e = { id: uid('e'), date: todayStr(), note: '', ...data }; expenses.value.push(e); dbUpsert('expenses', plain(e)) }
  function removeExpense(id) { expenses.value = expenses.value.filter((e) => e.id !== id); dbDelete('expenses', id) }

  function sendBroadcast(data) {
    const bc = { id: uid('bc'), date: todayStr(), status: 'terkirim', recipients: data.recipients ?? customers.value.length, ...data }
    broadcasts.value.unshift(bc); dbUpsert('broadcasts', plain(bc)); return bc
  }
  function addTemplate(data) { const t = { id: uid('t'), ...data }; templates.value.push(t); dbUpsert('templates', plain(t)) }
  function removeTemplate(id) { templates.value = templates.value.filter((t) => t.id !== id); dbDelete('templates', id) }

  // ── Publik / booking tamu ──
  function overlap(aS, aE, bS, bE) { return aS < bE && bS < aE }
  function isRoomAvailable(roomId, checkInAt, durationKey) {
    if (!checkInAt || !durationKey) return roomStatus(roomId) === 'kosong'
    const end = addHours(checkInAt, durationByKey(durationKey).hours)
    return !bookings.value.some((b) => b.roomId === roomId && b.status !== 'checkout' && overlap(checkInAt, end, b.checkInAt, bookingCheckOutAt(b)))
  }
  function roomRating(room) { const p = propertyById(room.propertyId); return p ? p.rating : 4.7 }
  function roomReviews(room) { let h = 0; for (const ch of room.id) h = (h * 31 + ch.charCodeAt(0)) % 900; return 40 + h }
  function enrichRoom(room) {
    const p = propertyById(room.propertyId)
    return { ...room, property: p, area: p?.area, rating: roomRating(room), reviews: roomReviews(room), startingRate: roomStartingRate(room) }
  }
  function searchRooms(filters = {}) {
    const { area, type, checkInAt, durationKey, maxPrice, q } = filters
    return rooms.value
      .filter((r) => {
        const p = propertyById(r.propertyId)
        if (area && p?.area !== area) return false
        if (type && r.type !== type) return false
        if (maxPrice && (r.dailyRate ?? 0) > maxPrice) return false
        if (q) { const hay = `${p?.name} ${p?.area} ${r.type} ${r.number}`.toLowerCase(); if (!hay.includes(q.toLowerCase())) return false }
        if (checkInAt && durationKey && !isRoomAvailable(r.id, checkInAt, durationKey)) return false
        return true
      })
      .map(enrichRoom)
  }
  const priceRange = computed(() => {
    if (!rooms.value.length) return { min: 0, max: 0 }
    const rates = rooms.value.map((r) => r.dailyRate ?? 0)
    return { min: Math.min(...rates), max: Math.max(...rates) }
  })

  function createGuestBooking({ roomId, name, phone, email, checkInAt, durationKey, guests }) {
    if (!isRoomAvailable(roomId, checkInAt, durationKey)) return { ok: false, msg: 'Maaf, kamar sudah tidak tersedia untuk waktu tersebut.' }
    let cust = customers.value.find((c) => c.phone === phone && phone)
    if (!cust) cust = addCustomer({ name, phone, email: email || '', idNumber: '' })
    else Object.assign(cust, { name, email: email || cust.email })
    const b = { id: uid('b'), roomId, customerId: cust.id, checkInAt, durationKey, guests: guests || 1, status: 'active', paid: false, source: 'Website' }
    bookings.value.push(b); dbUpsert('bookings', plain(b))
    const code = 'DK' + b.id.slice(-6).toUpperCase()
    return { ok: true, booking: b, code, customer: cust }
  }

  async function resetData() {
    const s = seed()
    properties.value = s.properties; rooms.value = s.rooms; customers.value = s.customers
    bookings.value = s.bookings; payments.value = s.payments; expenses.value = s.expenses
    broadcasts.value = s.broadcasts; templates.value = s.templates
    settings.value = { ...defaultSettings }; activePropertyId.value = null
    await Promise.all(TABLES.map((t) => dbClear(t)))
    await Promise.all([
      dbBulk('properties', s.properties), dbBulk('rooms', s.rooms), dbBulk('customers', s.customers),
      dbBulk('bookings', s.bookings), dbBulk('payments', s.payments), dbBulk('expenses', s.expenses),
      dbBulk('broadcasts', s.broadcasts), dbBulk('templates', s.templates),
    ])
    dbUpsert('app_settings', { id: 1, data: { ...settings.value } })
  }

  return {
    properties, rooms, customers, bookings, payments, expenses, broadcasts, templates, settings,
    activePropertyId, ready, init,
    propertyById, roomById, customerById, propertyOfRoom,
    scopedRooms, scopedActiveBookings, scopedBookings, scopedPayments, scopedExpenses,
    activeBookings, availableRooms,
    roomStatus, bookingForRoom, isOccupiedNow,
    bookingDuration, bookingCheckOutAt, bookingTotal, roomStartingRate,
    occupancyRate, revenueToday, outstanding, revenueMonth, expenseMonth,
    totalRevenue, totalExpense, netProfit, revenueSeries,
    occupancyByProperty, roomTypeDistribution, sourceDistribution, durationDistribution, upcomingCheckouts,
    addProperty, updateProperty, removeProperty,
    addRoom, updateRoom, removeRoom,
    addCustomer, updateCustomer, removeCustomer,
    addBooking, checkout, togglePaid, removeBooking,
    recordPayment, addExpense, removeExpense,
    sendBroadcast, addTemplate, removeTemplate,
    isRoomAvailable, searchRooms, roomRating, roomReviews, enrichRoom, priceRange, createGuestBooking,
    resetData,
  }
})
