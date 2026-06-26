import { supabase } from './lib/supabase'

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed')
    return
  }

  const { data: existing } = await supabase.auth.admin.listUsers()
  const adminExists = existing?.users.some((u) => u.email === email)

  if (adminExists) return

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error('Failed to create admin user:', error.message)
    return
  }

  await supabase
    .from('profiles')
    .upsert({ id: data.user.id, role: 'admin', onboarding_completed: true })

  console.log('Admin user created:', email)
}
