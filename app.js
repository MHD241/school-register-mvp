import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  'https://qfqrehdsdrvzxqrottdb.supabase.co',
  'sb_publishable_KjIlrY_vqA9WUHzQ1JE56w_PxI1U419'
)

const app = document.querySelector('#app')

let currentUser = null
let profile = null
let currentClass = null
let pupils = []
let marks = {}

function shell(content) {
  app.innerHTML = `
    <header class="topbar">
      <div class="brandWrap">
        <div class="brandMark">R</div>
        <div>
          <div class="brand">Register</div>
          <div class="small muted">School attendance prototype</div>
        </div>
      </div>

      <div class="account">
        ${currentUser ? `
          <span class="small">${currentUser.email}</span>
          <button id="logout" class="secondary">Sign out</button>
        ` : `<span class="demoBadge">DEMO ONLY</span>`}
      </div>
    </header>

    <main class="page">
      ${content}
    </main>
  `

  document.querySelector('#logout')?.addEventListener('click', async () => {
    await supabase.auth.signOut()
    location.reload()
  })
}

function message(text, good=true) {
  return `<div class="${good ? 'ok' : 'err'}">${text}</div>`
}

async function start() {
  const { data: { user } } = await supabase.auth.getUser()
  currentUser = user

  if (!currentUser) {
    renderLogin()
    return
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', currentUser.id)
    .maybeSingle()

  if (error) {
    shell(message(error.message, false))
    return
  }

  profile = data

  if (!profile) {
    renderBootstrap()
    return
  }

  await loadClass()
}

function renderLogin() {
  shell(`
    <section class="panel authPanel">
      <div class="eyebrow">TEACHER ACCESS</div>
      <h1>Sign in</h1>
      <p class="muted">Enter your email and we’ll send you a secure magic link.</p>

      <label>Email</label>
      <input id="email" type="email" placeholder="teacher@example.com">

      <button id="sendLink" class="primary full">Send sign-in link</button>
      <div id="feedback"></div>

      <p class="tiny muted bottomNote">
        Demo system only. No real pupil data should be entered.
      </p>
    </section>
  `)

  document.querySelector('#sendLink').onclick = async () => {
    const email = document.querySelector('#email').value.trim()
    const feedback = document.querySelector('#feedback')

    if (!email) {
      feedback.innerHTML = message('Enter an email address first.', false)
      return
    }

    const redirectTo = 'https://mhd241.github.io/school-register-mvp/'

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true
      }
    })

    feedback.innerHTML = error
      ? message(error.message, false)
      : message('Sign-in link sent. Check your email.')
  }
}

function renderBootstrap() {
  shell(`
    <section class="panel authPanel">
      <div class="eyebrow">FIRST-TIME SETUP</div>
      <h1>Create demo workspace</h1>
      <p class="muted">
        This creates a fake school, fake S3 Maths class, and 15 fake pupils.
      </p>

      <label>Display name</label>
      <input id="displayName" value="Demo Teacher">

      <button id="createDemo" class="primary full">Create my demo school</button>
      <div id="feedback"></div>
    </section>
  `)

  document.querySelector('#createDemo').onclick = async () => {
    const feedback = document.querySelector('#feedback')
    const displayName = document.querySelector('#displayName').value.trim() || 'Demo Teacher'

    feedback.innerHTML = message('Creating demo workspace...')

    const { error } = await supabase.rpc('create_demo_workspace', {
      p_display_name: displayName
    })

    if (error) {
      feedback.innerHTML = message(error.message, false)
      return
    }

    feedback.innerHTML = message('Demo workspace created.')
    setTimeout(() => location.reload(), 500)
  }
}

async function loadClass() {
  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', profile.school_id)
    .order('created_at')
    .limit(1)

  if (error || !classes?.length) {
    shell(message(error?.message || 'No class found.', false))
    return
  }

  currentClass = classes[0]

  const { data: members, error: memberError } = await supabase
    .from('class_members')
    .select('pupil_id')
    .eq('class_id', currentClass.id)

  if (memberError) {
    shell(message(memberError.message, false))
    return
  }

  const ids = members.map(x => x.pupil_id)

  const { data: pupilRows, error: pupilError } = await supabase
    .from('pupils')
    .select('*')
    .in('id', ids)
    .order('full_name')

  if (pupilError) {
    shell(message(pupilError.message, false))
    return
  }

  pupils = pupilRows
  marks = Object.fromEntries(pupils.map(p => [p.id, null]))

  renderRegister()
}

function count(status) {
  return Object.values(marks).filter(x => x === status).length
}

function renderRegister() {
  const marked = Object.values(marks).filter(Boolean).length

  shell(`
    <section class="hero">
      <div>
        <div class="eyebrow">LIVE DEMO · SUPABASE</div>
        <h1>${currentClass.name}</h1>
        <p class="muted">${currentClass.room || ''} · ${pupils.length} fake pupils</p>
      </div>
      <button id="markAll" class="primary">✓ Mark all present</button>
    </section>

    <section class="stats">
      <article><span>Marked</span><strong>${marked}<small>/${pupils.length}</small></strong></article>
      <article><span>Present</span><strong>${count('present')}</strong></article>
      <article><span>Absent</span><strong>${count('absent')}</strong></article>
      <article><span>Late</span><strong>${count('late')}</strong></article>
    </section>

    <section class="registerCard">
      <div class="cardHeader">
        <div>
          <h2>Class register</h2>
          <p class="muted">Mark exceptions, then submit.</p>
        </div>
        <span class="remaining">${marked === pupils.length ? 'Ready' : `${pupils.length-marked} remaining`}</span>
      </div>

      ${pupils.map((p, i) => `
        <div class="pupilRow">
          <div class="person">
            <div class="avatar">${p.full_name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
            <div>
              <strong>${p.full_name}</strong>
              <span>Demo pupil ${String(i+1).padStart(2,'0')}</span>
            </div>
          </div>

          <div class="choices">
            ${['present','absent','late'].map(status => `
              <button
                data-id="${p.id}"
                data-status="${status}"
                class="choice ${marks[p.id] === status ? `active ${status}` : ''}"
              >
                ${status[0].toUpperCase()+status.slice(1)}
              </button>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </section>

    <section class="submitBar">
      <div>
        <strong>${marked === pupils.length ? 'Register complete' : 'Register incomplete'}</strong>
        <span class="muted small">
          ${marked === pupils.length
            ? 'All pupils have a status.'
            : `${pupils.length-marked} pupils still need marking.`}
        </span>
      </div>

      <button id="submitRegister" class="primary" ${marked !== pupils.length ? 'disabled' : ''}>
        Submit register
      </button>
    </section>

    <div id="feedback"></div>
  `)

  document.querySelector('#markAll').onclick = () => {
    pupils.forEach(p => marks[p.id] = 'present')
    renderRegister()
  }

  document.querySelectorAll('.choice').forEach(btn => {
    btn.onclick = () => {
      marks[btn.dataset.id] = btn.dataset.status
      renderRegister()
    }
  })

  document.querySelector('#submitRegister').onclick = submitRegister
}

async function submitRegister() {
  const feedback = document.querySelector('#feedback')
  feedback.innerHTML = message('Submitting register...')

  const today = new Date().toISOString().slice(0, 10)

  const { data: session, error: sessionError } = await supabase
    .from('register_sessions')
    .insert({
      class_id: currentClass.id,
      session_date: today,
      period_label: 'Period 1',
      opened_by: currentUser.id
    })
    .select()
    .single()

  if (sessionError) {
    feedback.innerHTML = message(sessionError.message, false)
    return
  }

  const rows = pupils.map(p => ({
    register_session_id: session.id,
    pupil_id: p.id,
    status: marks[p.id],
    marked_by: currentUser.id
  }))

  const { error: attendanceError } = await supabase
    .from('attendance')
    .insert(rows)

  if (attendanceError) {
    feedback.innerHTML = message(attendanceError.message, false)
    return
  }

  const { error: submitError } = await supabase
    .from('register_sessions')
    .update({ submitted_at: new Date().toISOString() })
    .eq('id', session.id)

  if (submitError) {
    feedback.innerHTML = message(submitError.message, false)
    return
  }

  feedback.innerHTML = message('Register saved to Supabase successfully.')
}

supabase.auth.onAuthStateChange(() => {
  start()
})

start()
