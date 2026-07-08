import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'daily-kost-v1'

// ---- helpers ----------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 9)

export function daysBetween(checkIn, checkOut) {
  const a = new Date(checkIn + 'T00:00:00')
  const b = new Date(checkOut + 'T00:00:00')
  const diff = Math.round((b - a) / 86400000)
  return Math.max(1, diff)
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// ---- seed data --------------------------------------------------------------
function seed() {
  const rooms = [
    { id: 'r1', number: '101', type: 'Standard', dailyRate: 120000, facilities: ['Kipas', 'Kamar mandi dalam', 'WiFi'] },
    { id: 'r2', number: '102', type: 'Standard', dailyRate: 120000, facilities: ['Kipas', 'Kamar mandi luar', 'WiFi'] },
    { id: 'r3', number: '201', type: 'AC', dailyRate: 180000, facilities: ['AC', 'Kamar mandi dalam', 'WiFi', 'Meja kerja'] },
    { id: 'r4', number: '202', type: 'AC', dailyRate: 180000, facilities: ['AC', 'Kamar mandi dalam', 'WiFi'] },
    { id: 'r5', number: '301', type: 'Deluxe', dailyRate: 250000, facilities: ['AC', 'Kamar mandi dalam', 'WiFi', 'TV', 'Water heater'] },
    { id: 'r6', number: '302', type: 'Deluxe', dailyRate: 250000, facilities: ['AC', 'Kamar mandi dalam', 'WiFi', 'TV', 'Water heater', 'Balkon'] },
  ]

  const bookings = [
    {
      id: uid(), roomId: 'r1', guestName: 'Andi Pratama', guestPhone: '0812-1111-2222',
      checkIn: todayStr(), checkOut: addDays(todayStr(), 3), status: 'active', paid: true,
    },
    {
      id: uid(), roomId: 'r5', guestName: 'Siti Rahma', guestPhone: '0813-3333-4444',
      checkIn: addDays(todayStr(), -1), checkOut: addDays(todayStr(), 2), status: 'active', paid: false,
    },
  ]

  return { rooms, bookings }
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Gagal load data, pakai seed', e)
  }
  return seed()
}

// ---- store ------------------------------------------------------------------
export const useKostStore = defineStore('kost', () => {
  const initial = load()
  const rooms = ref(initial.rooms)
  const bookings = ref(initial.bookings)

  watch(
    [rooms, bookings],
    () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rooms: rooms.value, bookings: bookings.value }))
    },
    { deep: true }
  )

  // --- room status derived from active bookings ---
  const activeBookings = computed(() => bookings.value.filter((b) => b.status === 'active'))

  function roomStatus(roomId) {
    return activeBookings.value.some((b) => b.roomId === roomId) ? 'terisi' : 'kosong'
  }

  function bookingForRoom(roomId) {
    return activeBookings.value.find((b) => b.roomId === roomId) ?? null
  }

  function roomById(id) {
    return rooms.value.find((r) => r.id === id) ?? null
  }

  const availableRooms = computed(() => rooms.value.filter((r) => roomStatus(r.id) === 'kosong'))

  // --- booking money ---
  function bookingNights(b) {
    return daysBetween(b.checkIn, b.checkOut)
  }
  function bookingTotal(b) {
    const room = roomById(b.roomId)
    return room ? room.dailyRate * bookingNights(b) : 0
  }

  // --- metrics ---
  const occupancyRate = computed(() =>
    rooms.value.length ? Math.round((activeBookings.value.length / rooms.value.length) * 100) : 0
  )

  const revenueToday = computed(() =>
    activeBookings.value.reduce((sum, b) => sum + (roomById(b.roomId)?.dailyRate ?? 0), 0)
  )

  const outstanding = computed(() =>
    activeBookings.value.filter((b) => !b.paid).reduce((sum, b) => sum + bookingTotal(b), 0)
  )

  const totalRevenue = computed(() =>
    bookings.value.filter((b) => b.paid).reduce((sum, b) => sum + bookingTotal(b), 0)
  )

  // --- actions ---
  function addRoom(data) {
    rooms.value.push({ id: uid(), facilities: [], ...data })
  }
  function updateRoom(id, data) {
    const r = roomById(id)
    if (r) Object.assign(r, data)
  }
  function removeRoom(id) {
    if (bookingForRoom(id)) return { ok: false, msg: 'Kamar sedang terisi, tidak bisa dihapus.' }
    rooms.value = rooms.value.filter((r) => r.id !== id)
    return { ok: true }
  }

  function addBooking(data) {
    if (bookingForRoom(data.roomId)) return { ok: false, msg: 'Kamar sudah terisi.' }
    bookings.value.push({ id: uid(), status: 'active', paid: false, ...data })
    return { ok: true }
  }
  function checkout(id) {
    const b = bookings.value.find((x) => x.id === id)
    if (b) {
      b.status = 'checkout'
      b.paid = true
    }
  }
  function togglePaid(id) {
    const b = bookings.value.find((x) => x.id === id)
    if (b) b.paid = !b.paid
  }
  function removeBooking(id) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
  }

  function resetData() {
    const s = seed()
    rooms.value = s.rooms
    bookings.value = s.bookings
  }

  return {
    rooms, bookings, activeBookings, availableRooms,
    roomStatus, bookingForRoom, roomById, bookingNights, bookingTotal,
    occupancyRate, revenueToday, outstanding, totalRevenue,
    addRoom, updateRoom, removeRoom,
    addBooking, checkout, togglePaid, removeBooking, resetData,
  }
})
