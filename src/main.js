import './style.css'
import { supabase } from './supabase.js'

const fakePupils = [
  'Amelia Brown','Adam Khan','Daniel Wilson','Sophie Ahmed','Lewis Campbell',
  'Ava Robertson','Ethan Stewart','Maya Ali','Callum Fraser','Emily Scott',
  'Noah MacDonald','Hannah Malik','Jack Morrison','Layla Hussain','Oliver Reid'
].map((name, i) => ({ id:`demo-${i+1}`, name, status:null }))

let pupils = structuredClone(fakePupils)

function statusCount(status) {
  return pupils.filter(p => p.status === status).length
}

function markedCount() {
  return pupils.filter(p => p.status).length
}

function render() {
  const marked = markedCount()

  document.querySelector('#app').innerHTML = `
    <header class="topbar">
      <div class="brandwrap">
        <div class="brandmark">R</div>
        <div>
          <div class="brand">Register</div>
          <div class="subtitle">Education attendance prototype</div>
        </div>
      </div>

      <div class="headerRight">
        <span class="demoBadge">DEMO · NO REAL PUPIL DATA</span>
      </div>
    </header>

    <main class="page">
      <section class="welcome">
        <div>
          <div class="eyebrow">THURSDAY · PERIOD 1</div>
          <h1>S3 Mathematics</h1>
          <p>Room B14 · 15 pupils · Demo teacher</p>
        </div>
        <button id="markAll" class="primary">✓ Mark all present</button>
      </section>

      <section class="stats">
        <article>
          <span>Completed</span>
          <strong>${marked}<small>/15</small></strong>
        </article>
        <article>
          <span>Present</span>
          <strong>${statusCount('present')}</strong>
        </article>
        <article>
          <span>Absent</span>
          <strong>${statusCount('absent')}</strong>
        </article>
        <article>
          <span>Late</span>
          <strong>${statusCount('late')}</strong>
        </article>
      </section>

      <section class="registerCard">
        <div class="cardHeader">
          <div>
            <h2>Class register</h2>
            <p>Mark exceptions, then submit.</p>
          </div>
          <span>${markedCount() === pupils.length ? 'Ready' : `${pupils.length - markedCount()} remaining`}</span>
        </div>

        <div class="pupils">
          ${pupils.map((p, i) => `
            <div class="pupil">
              <div class="pupilIdentity">
                <div class="avatar">${p.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
                <div>
                  <strong>${p.name}</strong>
                  <span>Demo pupil ${String(i+1).padStart(2,'0')}</span>
                </div>
              </div>

              <div class="choices">
                ${['present','absent','late'].map(status => `
                  <button
                    class="choice ${status} ${p.status === status ? 'active' : ''}"
                    data-index="${i}"
                    data-status="${status}"
                  >
                    ${status === 'present' ? '✓' : status === 'absent' ? '×' : '⏱'}
                    ${status[0].toUpperCase()+status.slice(1)}
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="footerAction">
        <div>
          <strong>${marked === pupils.length ? 'Register complete' : 'Register incomplete'}</strong>
          <span>${marked === pupils.length ? 'All pupils have a status.' : `${pupils.length-marked} pupil${pupils.length-marked === 1 ? '' : 's'} still need marking.`}</span>
        </div>

        <button id="submitRegister" class="submitButton" ${marked !== pupils.length ? 'disabled' : ''}>
          Submit register
        </button>
      </section>

      <div id="toast"></div>
    </main>
  `

  document.querySelector('#markAll').onclick = () => {
    pupils = pupils.map(p => ({...p, status:'present'}))
    render()
  }

  document.querySelectorAll('.choice').forEach(button => {
    button.onclick = () => {
      pupils[Number(button.dataset.index)].status = button.dataset.status
      render()
    }
  })

  document.querySelector('#submitRegister').onclick = submitDemo
}

async function submitDemo() {
  const payload = {
    submitted_at: new Date().toISOString(),
    class_name: 'S3 Mathematics',
    attendance: pupils
  }

  localStorage.setItem('school-register-demo', JSON.stringify(payload))

  const toast = document.querySelector('#toast')
  toast.innerHTML = `
    <div class="toast success">
      <strong>Register submitted</strong>
      <span>Demo saved safely in this browser. Backend integration is ready for the next build step.</span>
    </div>
  `

  setTimeout(() => {
    if (document.querySelector('#toast')) document.querySelector('#toast').innerHTML = ''
  }, 4500)
}

render()
