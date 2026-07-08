import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'daily-kost-v2'

// ── Utils ───────────────────────────────────────────────────────────────────
const uid = (p = 'x') => p + '_' + Math.random().toString(36).slice(2, 9)

// Deterministic PRNG so seed data is stable across reloads
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260708)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const randInt = (min, max) => min + Math.floor(rng() * (max - min + 1))

export function daysBetween(a, b) {
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  return Math.max(1, Math.round((d2 - d1) / 86400000))
}
export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
export function addDays(dateStr, n) {
  const d = new Date((dateStr || todayStr()) + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
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
    { id: 'p1', name: 'Green Garden Residence', area: 'Pontianak Kota', address: 'Jl. Gajah Mada No. 88', phone: '0561-730001', type: 'Campur', hue: 158, rating: 4.9 },
    { id: 'p2', name: 'Wisma Khatulistiwa', area: 'Pontianak Selatan', address: 'Jl. Ahmad Yani No. 21', phone: '0561-730002', type: 'Putra', hue: 168, rating: 4.7 },
    { id: 'p3', name: 'Mutiara Kapuas Living', area: 'Pontianak Tenggara', address: 'Jl. Imam Bonjol No. 45', phone: '0561-730003', type: 'Putri', hue: 148, rating: 4.8 },
    { id: 'p4', name: 'Griya Anggrek Signature', area: 'Pontianak Barat', address: 'Jl. Komyos Sudarso No. 12', phone: '0561-730004', type: 'Campur', hue: 176, rating: 4.6 },
    { id: 'p5', name: 'Katulistiwa Sky House', area: 'Pontianak Utara', address: 'Jl. Khatulistiwa No. 7', phone: '0561-730005', type: 'Putra', hue: 138, rating: 4.5 },
  ]

  const roomTypes = [
    { type: 'Standard', daily: 120000, monthly: 1500000, fac: ['Kipas', 'Kasur', 'WiFi', 'KM luar'] },
    { type: 'Superior', daily: 165000, monthly: 2100000, fac: ['AC', 'Kasur', 'WiFi', 'KM dalam', 'Meja kerja'] },
    { type: 'Deluxe', daily: 235000, monthly: 3000000, fac: ['AC', 'Spring bed', 'WiFi', 'KM dalam', 'TV', 'Water heater'] },
    { type: 'Suite', daily: 340000, monthly: 4500000, fac: ['AC', 'King bed', 'WiFi', 'KM dalam', 'Smart TV', 'Water heater', 'Balkon', 'Mini pantry'] },
  ]

  const rooms = []
  for (const p of properties) {
    const floors = randInt(2, 3)
    for (let f = 1; f <= floors; f++) {
      const perFloor = randInt(3, 5)
      for (let n = 1; n <= perFloor; n++) {
        const rt = roomTypes[Math.min(roomTypes.length - 1, f - 1 + (rng() > 0.6 ? 1 : 0))]
        rooms.push({
          id: uid('r'),
          propertyId: p.id,
          number: `${f}${String(n).padStart(2, '0')}`,
          floor: f,
          type: rt.type,
          dailyRate: rt.daily,
          monthlyRate: rt.monthly,
          facilities: rt.fac,
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
      joinedAt: addDays(todayStr(), -randInt(20, 400)),
    })
  }

  const methods = ['Transfer', 'QRIS', 'Tunai']
  const sources = ['Walk-in', 'WhatsApp', 'OTA', 'Referral']
  const bookings = []
  const payments = []

  // Historical bookings (checked out) across the last ~60 days → revenue trend
  for (let i = 0; i < 70; i++) {
    const room = pick(rooms)
    const cust = pick(customers)
    const start = addDays(todayStr(), -randInt(1, 60))
    const nights = randInt(1, 8)
    const end = addDays(start, nights)
    const total = room.dailyRate * nights
    const b = {
      id: uid('b'),
      roomId: room.id,
      customerId: cust.id,
      checkIn: start,
      checkOut: end,
      status: 'checkout',
      paid: true,
      source: pick(sources),
    }
    bookings.push(b)
    payments.push({
      id: uid('pay'),
      bookingId: b.id,
      amount: total,
      method: pick(methods),
      date: end,
      status: 'success',
    })
  }

  // Active bookings — ensure a spread, but never double-book a room
  const usedRooms = new Set()
  let active = 0
  const shuffled = [...rooms].sort(() => rng() - 0.5)
  for (const room of shuffled) {
    if (active >= 22) break
    if (usedRooms.has(room.id)) continue
    if (rng() > 0.55) continue
    usedRooms.add(room.id)
    const cust = pick(customers)
    const start = addDays(todayStr(), -randInt(0, 4))
    const nights = randInt(2, 14)
    const end = addDays(start, nights)
    const paid = rng() > 0.4
    const b = {
      id: uid('b'),
      roomId: room.id,
      customerId: cust.id,
      checkIn: start,
      checkOut: end,
      status: 'active',
      paid,
      source: pick(sources),
    }
    bookings.push(b)
    if (paid) {
      payments.push({
        id: uid('pay'),
        bookingId: b.id,
        amount: room.dailyRate * nights,
        method: pick(methods),
        date: start,
        status: 'success',
      })
    }
    active++
  }

  const expCats = ['Listrik & Air', 'Kebersihan', 'Perawatan', 'Gaji Staff', 'Internet', 'Perlengkapan']
  const expenses = []
  for (let i = 0; i < 34; i++) {
    expenses.push({
      id: uid('e'),
      propertyId: pick(properties).id,
      category: pick(expCats),
      amount: randInt(8, 95) * 10000,
      date: addDays(todayStr(), -randInt(0, 60)),
      note: '',
    })
  }

  const broadcasts = [
    { id: uid('bc'), title: 'Promo Sewa Bulanan Juli', message: 'Halo! Dapatkan diskon 15% untuk sewa bulanan di seluruh cabang Daily Kost Pontianak. Berlaku s/d akhir bulan 🌿', audience: 'Semua Penghuni', channel: 'Channel', date: addDays(todayStr(), -3), recipients: 128, status: 'terkirim' },
    { id: uid('bc'), title: 'Reminder Pembayaran', message: 'Pengingat: tagihan sewa Anda jatuh tempo dalam 3 hari. Terima kasih 🙏', audience: 'Tunggakan', channel: 'Personal', date: addDays(todayStr(), -1), recipients: 14, status: 'terkirim' },
    { id: uid('bc'), title: 'Info Maintenance Air', message: 'Pemberitahuan: perbaikan saluran air di cabang Pontianak Kota besok pukul 09.00-12.00.', audience: 'Green Garden Residence', channel: 'Channel', date: todayStr(), recipients: 24, status: 'terjadwal' },
  ]

  const templates = [
    { id: uid('t'), name: 'Konfirmasi Booking', body: 'Halo {nama}, booking kamar {kamar} di {properti} dikonfirmasi. Check-in: {checkin}. Terima kasih telah memilih Daily Kost! 🌿' },
    { id: uid('t'), name: 'Reminder Pembayaran', body: 'Halo {nama}, tagihan sewa sebesar {total} akan jatuh tempo pada {tanggal}. Silakan lakukan pembayaran. 🙏' },
    { id: uid('t'), name: 'Ucapan Selamat Datang', body: 'Selamat datang di {properti}, {nama}! Semoga betah. Hubungi kami kapan saja bila butuh bantuan. 😊' },
    { id: uid('t'), name: 'Reminder Check-out', body: 'Halo {nama}, jadwal check-out kamar {kamar} adalah {checkout}. Terima kasih! 🌿' },
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

  // Active property filter (null = semua)
  const activePropertyId = ref(null)

  watch(
    [properties, rooms, customers, bookings, payments, expenses, broadcasts, templates, settings],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          properties: properties.value, rooms: rooms.value, customers: customers.value,
          bookings: bookings.value, payments: payments.value, expenses: expenses.value,
          broadcasts: broadcasts.value, templates: templates.value, settings: settings.value,
        })
      )
    },
    { deep: true }
  )

  // ── Lookups ──
  const propertyById = (id) => properties.value.find((p) => p.id === id) ?? null
  const roomById = (id) => rooms.value.find((r) => r.id === id) ?? null
  const customerById = (id) => customers.value.find((c) => c.id === id) ?? null
  const propertyOfRoom = (roomId) => propertyById(roomById(roomId)?.propertyId)

  // ── Scope helpers (respect active property filter) ──
  const scopedRooms = computed(() =>
    activePropertyId.value ? rooms.value.filter((r) => r.propertyId === activePropertyId.value) : rooms.value
  )
  const inScopeRoom = (roomId) =>
    !activePropertyId.value || roomById(roomId)?.propertyId === activePropertyId.value

  const activeBookings = computed(() => bookings.value.filter((b) => b.status === 'active'))
  const scopedActiveBookings = computed(() => activeBookings.value.filter((b) => inScopeRoom(b.roomId)))
  const scopedBookings = computed(() => bookings.value.filter((b) => inScopeRoom(b.roomId)))

  // ── Room status ──
  const roomStatus = (roomId) =>
    activeBookings.value.some((b) => b.roomId === roomId) ? 'terisi' : 'kosong'
  const bookingForRoom = (roomId) =>
    activeBookings.value.find((b) => b.roomId === roomId) ?? null
  const availableRooms = computed(() => scopedRooms.value.filter((r) => roomStatus(r.id) === 'kosong'))

  // ── Booking money ──
  const bookingNights = (b) => daysBetween(b.checkIn, b.checkOut)
  const bookingTotal = (b) => {
    const room = roomById(b.roomId)
    return room ? room.dailyRate * bookingNights(b) : 0
  }

  // ── KPIs ──
  const occupancyRate = computed(() => {
    const total = scopedRooms.value.length
    return total ? Math.round((scopedActiveBookings.value.length / total) * 100) : 0
  })
  const revenueToday = computed(() =>
    scopedActiveBookings.value.reduce((s, b) => s + (roomById(b.roomId)?.dailyRate ?? 0), 0)
  )
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

  const monthKey = (d) => d.slice(0, 7)
  const thisMonth = computed(() => todayStr().slice(0, 7))

  const revenueMonth = computed(() =>
    scopedPayments.value.filter((p) => monthKey(p.date) === thisMonth.value).reduce((s, p) => s + p.amount, 0)
  )
  const expenseMonth = computed(() =>
    scopedExpenses.value.filter((e) => monthKey(e.date) === thisMonth.value).reduce((s, e) => s + e.amount, 0)
  )
  const totalRevenue = computed(() => scopedPayments.value.reduce((s, p) => s + p.amount, 0))
  const totalExpense = computed(() => scopedExpenses.value.reduce((s, e) => s + e.amount, 0))
  const netProfit = computed(() => totalRevenue.value - totalExpense.value)

  // Revenue series for last N days
  function revenueSeries(days = 14) {
    const out = []
    for (let i = days - 1; i >= 0; i--) {
      const d = addDays(todayStr(), -i)
      const amount = scopedPayments.value.filter((p) => p.date === d).reduce((s, p) => s + p.amount, 0)
      out.push({ date: d, value: amount })
    }
    return out
  }

  // Occupancy per property
  const occupancyByProperty = computed(() =>
    properties.value.map((p) => {
      const rs = rooms.value.filter((r) => r.propertyId === p.id)
      const filled = rs.filter((r) => roomStatus(r.id) === 'terisi').length
      return { ...p, rooms: rs.length, filled, rate: rs.length ? Math.round((filled / rs.length) * 100) : 0 }
    })
  )

  // Room type distribution (scoped)
  const roomTypeDistribution = computed(() => {
    const map = {}
    for (const r of scopedRooms.value) map[r.type] = (map[r.type] || 0) + 1
    return Object.entries(map).map(([label, value]) => ({ label, value }))
  })

  // Booking sources distribution (scoped)
  const sourceDistribution = computed(() => {
    const map = {}
    for (const b of scopedBookings.value) map[b.source] = (map[b.source] || 0) + 1
    return Object.entries(map).map(([label, value]) => ({ label, value }))
  })

  // Upcoming check-outs
  const upcomingCheckouts = computed(() =>
    [...scopedActiveBookings.value].sort((a, b) => a.checkOut.localeCompare(b.checkOut))
  )

  // ── Actions: Property ──
  function addProperty(data) { properties.value.push({ id: uid('p'), hue: 158, rating: 4.5, ...data }) }
  function updateProperty(id, data) { const p = propertyById(id); if (p) Object.assign(p, data) }
  function removeProperty(id) {
    if (rooms.value.some((r) => r.propertyId === id)) return { ok: false, msg: 'Masih ada kamar di properti ini.' }
    properties.value = properties.value.filter((p) => p.id !== id)
    return { ok: true }
  }

  // ── Actions: Room ──
  function addRoom(data) { rooms.value.push({ id: uid('r'), facilities: [], ...data }) }
  function updateRoom(id, data) { const r = roomById(id); if (r) Object.assign(r, data) }
  function removeRoom(id) {
    if (bookingForRoom(id)) return { ok: false, msg: 'Kamar sedang terisi.' }
    rooms.value = rooms.value.filter((r) => r.id !== id)
    return { ok: true }
  }

  // ── Actions: Customer ──
  function addCustomer(data) {
    const c = { id: uid('c'), joinedAt: todayStr(), ...data }
    customers.value.push(c)
    return c
  }
  function updateCustomer(id, data) { const c = customerById(id); if (c) Object.assign(c, data) }
  function removeCustomer(id) { customers.value = customers.value.filter((c) => c.id !== id) }

  // ── Actions: Booking ──
  function addBooking(data) {
    if (bookingForRoom(data.roomId)) return { ok: false, msg: 'Kamar sudah terisi.' }
    const b = { id: uid('b'), status: 'active', paid: false, source: 'Walk-in', ...data }
    bookings.value.push(b)
    if (b.paid) recordPayment(b.id, bookingTotal(b), 'Transfer')
    return { ok: true, booking: b }
  }
  function checkout(id) {
    const b = bookings.value.find((x) => x.id === id)
    if (!b) return
    b.status = 'checkout'
    if (!b.paid) { b.paid = true; recordPayment(b.id, bookingTotal(b), 'Tunai') }
  }
  function togglePaid(id) {
    const b = bookings.value.find((x) => x.id === id)
    if (!b) return
    b.paid = !b.paid
    if (b.paid) recordPayment(b.id, bookingTotal(b), 'Transfer')
    else payments.value = payments.value.filter((p) => p.bookingId !== id)
  }
  function removeBooking(id) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
    payments.value = payments.value.filter((p) => p.bookingId !== id)
  }

  // ── Actions: Payment ──
  function recordPayment(bookingId, amount, method = 'Transfer') {
    payments.value.push({ id: uid('pay'), bookingId, amount, method, date: todayStr(), status: 'success' })
  }

  // ── Actions: Expense ──
  function addExpense(data) { expenses.value.push({ id: uid('e'), date: todayStr(), note: '', ...data }) }
  function removeExpense(id) { expenses.value = expenses.value.filter((e) => e.id !== id) }

  // ── Actions: WhatsApp ──
  function sendBroadcast(data) {
    const bc = { id: uid('bc'), date: todayStr(), status: 'terkirim', recipients: data.recipients ?? customers.value.length, ...data }
    broadcasts.value.unshift(bc)
    return bc
  }
  function addTemplate(data) { templates.value.push({ id: uid('t'), ...data }) }
  function removeTemplate(id) { templates.value = templates.value.filter((t) => t.id !== id) }

  function resetData() {
    const s = seed()
    properties.value = s.properties; rooms.value = s.rooms; customers.value = s.customers
    bookings.value = s.bookings; payments.value = s.payments; expenses.value = s.expenses
    broadcasts.value = s.broadcasts; templates.value = s.templates
    settings.value = { ...defaultSettings }
    activePropertyId.value = null
  }

  return {
    // state
    properties, rooms, customers, bookings, payments, expenses, broadcasts, templates, settings,
    activePropertyId,
    // lookups
    propertyById, roomById, customerById, propertyOfRoom,
    // scoped
    scopedRooms, scopedActiveBookings, scopedBookings, scopedPayments, scopedExpenses,
    activeBookings, availableRooms,
    // room
    roomStatus, bookingForRoom, bookingNights, bookingTotal,
    // kpis
    occupancyRate, revenueToday, outstanding, revenueMonth, expenseMonth,
    totalRevenue, totalExpense, netProfit, revenueSeries,
    occupancyByProperty, roomTypeDistribution, sourceDistribution, upcomingCheckouts,
    // actions
    addProperty, updateProperty, removeProperty,
    addRoom, updateRoom, removeRoom,
    addCustomer, updateCustomer, removeCustomer,
    addBooking, checkout, togglePaid, removeBooking,
    recordPayment, addExpense, removeExpense,
    sendBroadcast, addTemplate, removeTemplate,
    resetData,
  }
})
