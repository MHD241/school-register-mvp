import './style.css'
import { supabase } from './supabase.js'

const pupils = [
  'Amelia Brown','Adam Khan','Daniel Wilson','Sophie Ahmed','Lewis Campbell',
  'Ava Robertson','Ethan Stewart','Maya Ali','Callum Fraser','Emily Scott',
  'Noah MacDonald','Hannah Malik','Jack Morrison','Layla Hussain','Oliver Reid'
].map((name, i) => ({ id: `demo-${i+1}`, name, status: null }))

let state = structuredClone(pupils)

function render() {
  const marked = state.filter(p => p.status).length
  const absent = state.filter(p => p.status === 'absent').length
  const late = state.filter(p => p.status === 'late').length
  document.querySelector('#app').innerHTML = `
    <header class="topbar">
      <div>
        <div class="brand">Register</div>
        <div class="muted">School attendance MVP</div>
      </div>
      <span class="badge">DEMO DATA</span>
    </header>

    <main class="wrap">
      <section class="hero">
        <div>
          <div class="eyebrow">CURRENT CLASS</div>
          <h1>S3 Mathematics</h1>
          <p>Room B14 · 15 pupils</p>
        </div>
        <button id="allPresent" class="primary">Mark all present</button>
      </section>

      <section class="stats">
        <div><strong>${marked}/15</strong><span>Marked</span></div>
        <div><strong>${absent}</strong><span>Absent</span></div>
        <div><strong>${late}</strong><span>Late</span></div>
      </section>

      <section class="card">
        ${state.map((p, idx) => `
          <div class="pupil">
            <div class="name">${p.name}</div>
            <div class="choices">
              ${['present','absent','late'].map(s => `
                <button data-index="${idx}" data-status="${s}" class="choice ${p.status===s?'active':''} ${s}">
                  ${s[0].toUpperCase()+s.slice(1)}
                </button>`).join('')}
            </div>
          </div>
        `).join('')}
      </section>

      <section class="submitrow">
        <div class="muted">${marked === state.length ? 'Register ready to submit.' : `${state.length-marked} pupils still need a status.`}</div>
        <button id="submit" class="submit" ${marked !== state.length ? 'disabled' : ''}>Submit register</button>
      </section>

      <div id="message"></div>
    </main>
  `

  document.querySelector('#allPresent').onclick = () => {
    state = state.map(p => ({...p, status:'present'}))
    render()
  }

  document.querySelectorAll('.choice').forEach(btn => {
    btn.onclick = () => {
      state[Number(btn.dataset.index)].status = btn.dataset.status
      render()
    }
  })

  document.querySelector('#submit').onclick = submitRegister
}

async function submitRegister() {
  const message = document.querySelector('#message')
  const payload = state.map(p => ({
    pupil_id: p.id,
    pupil_name: p.name,
    status: p.status,
    class_name: 'S3 Mathematics'
  }))

  if (!supabase) {
    localStorage.setItem('demo-register', JSON.stringify({submitted_at:new Date().toISOString(), attendance:payload}))
    message.innerHTML = '<div class="success">Saved locally. Add Supabase keys to make this save to the database.</div>'
    return
  }

  const { error } = await supabase.from('attendance').insert(payload)
  if (error) {
    message.innerHTML = `<div class="error">Supabase error: ${error.message}</div>`
  } else {
    message.innerHTML = '<div class="success">Register saved to Supabase successfully.</div>'
  }
}

render()
