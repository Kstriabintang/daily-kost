import { createClient } from '@supabase/supabase-js'

// Publishable (anon) key — aman untuk sisi klien. Bisa dioverride via .env.
const URL = import.meta.env.VITE_SUPABASE_URL || 'https://zpypxfzwfcywybfevbeh.supabase.co'
const KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_J9ziMO8H89_n2dW04zPwKQ__2mZroNy'

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
})

export async function dbAll(table) {
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw error
  return data || []
}
export async function dbUpsert(table, row) {
  const { error } = await supabase.from(table).upsert(row)
  if (error) console.warn(`[supabase] upsert ${table}`, error.message)
}
export async function dbBulk(table, rows) {
  if (!rows?.length) return
  const { error } = await supabase.from(table).upsert(rows)
  if (error) console.warn(`[supabase] bulk ${table}`, error.message)
}
export async function dbDelete(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.warn(`[supabase] delete ${table}`, error.message)
}
export async function dbDeleteBy(table, col, val) {
  const { error } = await supabase.from(table).delete().eq(col, val)
  if (error) console.warn(`[supabase] deleteBy ${table}`, error.message)
}
export async function dbClear(table) {
  const { error } = await supabase.from(table).delete().neq('id', '')
  if (error) console.warn(`[supabase] clear ${table}`, error.message)
}
