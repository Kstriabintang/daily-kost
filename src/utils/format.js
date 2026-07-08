export function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

// Compact: Rp1,2 jt / Rp850 rb
export function rupiahShort(n) {
  const v = n || 0
  if (Math.abs(v) >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(1).replace('.', ',')} M`
  if (Math.abs(v) >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1).replace('.', ',')} jt`
  if (Math.abs(v) >= 1_000) return `Rp${Math.round(v / 1_000)} rb`
  return `Rp${v}`
}

export function tanggal(dateStr, opts = {}) {
  if (!dateStr) return '-'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  })
}

export function tanggalPendek(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export function relatif(dateStr) {
  if (!dateStr) return '-'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  const days = Math.round((d - today) / 86400000)
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Besok'
  if (days === -1) return 'Kemarin'
  if (days > 0) return `${days} hari lagi`
  return `${Math.abs(days)} hari lalu`
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
