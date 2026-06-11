import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

const json = (res, status, data) => {
  res.status(status).setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  let body = ''
  for await (const chunk of req) body += chunk
  return body ? JSON.parse(body) : {}
}

const getPath = (req) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  return url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
}

const now = () => new Date().toISOString()

export default async function handler(req, res) {
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, {
      error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    })
  }

  const path = getPath(req)
  const [a, b, c, d] = path
  const url = new URL(req.url, `http://${req.headers.host}`)

  try {
    if (req.method === 'GET' && a === 'users' && !b) {
      const { data, error } = await supabase.from('users').select('*').order('id')
      if (error) throw error
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'users' && b === 'register') {
      const body = await readBody(req)
      const { username, email } = body
      if (!username || !email) return json(res, 400, { error: 'username and email are required' })

      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()
      if (existing) return json(res, 400, { error: 'Email already registered' })

      const { data, error } = await supabase
        .from('users')
        .insert([{ username, email, status: 'online', created_at: now() }])
        .select('*')
        .single()
      if (error) throw error
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'users' && b === 'login') {
      const email = url.searchParams.get('email')
      if (!email) return json(res, 400, { error: 'email is required' })
      const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
      if (error) throw error
      if (!data) return json(res, 401, { error: 'User not found' })
      return json(res, 200, data)
    }

    if (req.method === 'GET' && a === 'users' && b) {
      const userId = Number(b)
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle()
      if (error) throw error
      if (!data) return json(res, 404, { error: 'User not found' })
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'users' && c === 'friends') {
      const userId = Number(b)
      const friendId = Number(d)
      const { error } = await supabase.from('friends').upsert([{ user_id: userId, friend_id: friendId }])
      if (error) throw error
      return json(res, 200, { message: 'Friend added successfully' })
    }

    if (req.method === 'GET' && a === 'users' && c === 'friends') {
      const userId = Number(b)
      const { data, error } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId)
      if (error) throw error
      const friendIds = data.map((row) => row.friend_id)
      if (friendIds.length === 0) return json(res, 200, [])
      const { data: friends, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', friendIds)
      if (usersError) throw usersError
      return json(res, 200, friends)
    }

    if (req.method === 'GET' && a === 'messages' && b === 'direct') {
      const userId = Number(c)
      const friendId = Number(d)
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${userId})`
        )
        .order('created_at')
      if (error) throw error
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'messages' && b === 'direct') {
      const body = await readBody(req)
      const { sender_id, recipient_id, content } = body
      const { data, error } = await supabase
        .from('direct_messages')
        .insert([{ sender_id, recipient_id, content, created_at: now() }])
        .select('*')
        .single()
      if (error) throw error
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'groups') {
      const userId = Number(url.searchParams.get('user_id'))
      const body = await readBody(req)
      const { name, description } = body
      const { data, error } = await supabase
        .from('groups')
        .insert([{ name, description: description || null, created_by: userId, created_at: now() }])
        .select('*')
        .single()
      if (error) throw error
      await supabase.from('group_members').insert([{ group_id: data.id, user_id: userId }])
      return json(res, 200, data)
    }

    if (req.method === 'GET' && a === 'groups' && b) {
      const { data, error } = await supabase.from('groups').select('*').eq('id', Number(b)).maybeSingle()
      if (error) throw error
      if (!data) return json(res, 404, { error: 'Group not found' })
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'groups' && c === 'members') {
      const groupId = Number(b)
      const userId = Number(d)
      const { error } = await supabase.from('group_members').upsert([{ group_id: groupId, user_id: userId }])
      if (error) throw error
      return json(res, 200, { message: 'User added to group' })
    }

    if (req.method === 'GET' && a === 'groups' && c === 'members') {
      const groupId = Number(b)
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
      if (error) throw error
      const userIds = data.map((row) => row.user_id)
      if (userIds.length === 0) return json(res, 200, [])
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)
      if (usersError) throw usersError
      return json(res, 200, users)
    }

    if (req.method === 'GET' && a === 'messages' && b === 'group') {
      const groupId = Number(c)
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at')
      if (error) throw error
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'messages' && b === 'group') {
      const senderId = Number(url.searchParams.get('sender_id'))
      const body = await readBody(req)
      const { group_id, content } = body
      const { data, error } = await supabase
        .from('group_messages')
        .insert([{ group_id, sender_id: senderId, content, created_at: now() }])
        .select('*')
        .single()
      if (error) throw error
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'calls') {
      const initiatorId = Number(url.searchParams.get('initiator_id'))
      const body = await readBody(req)
      const { max_participants = 30 } = body
      const { data, error } = await supabase
        .from('calls')
        .insert([{ initiator_id: initiatorId, max_participants, started_at: now(), is_active: true }])
        .select('*')
        .single()
      if (error) throw error
      await supabase.from('call_participants').insert([{ call_id: data.id, user_id: initiatorId }])
      return json(res, 200, data)
    }

    if (req.method === 'GET' && a === 'calls' && b) {
      const { data, error } = await supabase.from('calls').select('*').eq('id', Number(b)).maybeSingle()
      if (error) throw error
      if (!data) return json(res, 404, { error: 'Call not found' })
      return json(res, 200, data)
    }

    if (req.method === 'POST' && a === 'calls' && c === 'join') {
      const callId = Number(b)
      const userId = Number(url.searchParams.get('user_id'))
      const { data: call, error: callError } = await supabase.from('calls').select('*').eq('id', callId).maybeSingle()
      if (callError) throw callError
      if (!call) return json(res, 404, { error: 'Call not found' })

      const { data: participantRows, error: participantError } = await supabase
        .from('call_participants')
        .select('*')
        .eq('call_id', callId)
      if (participantError) throw participantError
      if (participantRows.length >= call.max_participants) return json(res, 400, { error: 'Call is full' })

      const { error } = await supabase.from('call_participants').upsert([{ call_id: callId, user_id: userId }])
      if (error) throw error
      return json(res, 200, { message: 'Joined call successfully' })
    }

    if (req.method === 'POST' && a === 'games' && b === 'vote') {
      const userId = Number(url.searchParams.get('user_id'))
      const body = await readBody(req)
      const { game_name } = body
      const { error } = await supabase
        .from('game_votes')
        .insert([{ game_name, user_id: userId, voted_at: now() }])
      if (error) throw error
      return json(res, 200, { message: 'Vote recorded' })
    }

    if (req.method === 'GET' && a === 'games' && b === 'top-votes') {
      const { data, error } = await supabase.from('game_vote_counts').select('*').order('vote_count', { ascending: false })
      if (error) throw error
      return json(res, 200, data)
    }

    return json(res, 404, { error: 'Not found', path })
  } catch (error) {
    return json(res, 500, { error: error.message || 'Internal server error' })
  }
}
