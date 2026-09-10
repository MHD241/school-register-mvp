import './style.css'
import { supabase } from './supabase.js'

const app = document.querySelector('#app')
let currentUser=null, profile=null, currentClass=null, pupils=[], marks={}

function shell(content){
  app.innerHTML = `<header><div class="brand">Register</div><div>${currentUser?`<span>${currentUser.email}</span> <button id="logout">Sign out</button>`:''}</div></header><main>${content}</main>`
  document.querySelector('#logout')?.addEventListener('click', async()=>{await supabase.auth.signOut();location.reload()})
}
function msg(t,ok=true){return `<div class="${ok?'ok':'err'}">${t}</div>`}

async function render(){
  const {data:{user}}=await supabase.auth.getUser(); currentUser=user
  if(!user) return renderLogin()
  const {data:p}=await supabase.from('profiles').select('*').eq('user_id',user.id).maybeSingle()
  profile=p
  if(!profile) return renderBootstrap()
  await loadClass()
}
function renderLogin(){
  shell(`<section class="panel narrow"><h1>Teacher sign in</h1><p>Use your email to receive a secure magic link.</p><input id="email" type="email" placeholder="teacher@example.com"><button id="send" class="primary">Send sign-in link</button><div id="m"></div></section>`)
  document.querySelector('#send').onclick=async()=>{
    const email=document.querySelector('#email').value.trim()
    const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.href,shouldCreateUser:true}})
    document.querySelector('#m').innerHTML=error?msg(error.message,false):msg('Check your email for the sign-in link.')
  }
}
function renderBootstrap(){
  shell(`<section class="panel narrow"><h1>Welcome</h1><p>Your account is signed in, but it has no demo workspace yet.</p><input id="name" placeholder="Display name" value="Demo Teacher"><button id="create" class="primary">Create my demo school</button><div id="m"></div></section>`)
  document.querySelector('#create').onclick=async()=>{
    const {data,error}=await supabase.rpc('create_demo_workspace',{p_display_name:document.querySelector('#name').value})
    document.querySelector('#m').innerHTML=error?msg(error.message,false):msg('Demo school created.')
    if(!error) setTimeout(()=>location.reload(),500)
  }
}
async function loadClass(){
  const {data:classes,error}=await supabase.from('classes').select('*').eq('school_id',profile.school_id).order('created_at').limit(1)
  if(error||!classes?.length){shell(msg(error?.message||'No class found',false));return}
  currentClass=classes[0]
  const {data:members,error:me}=await supabase.from('class_members').select('pupil_id').eq('class_id',currentClass.id)
  if(me){shell(msg(me.message,false));return}
  const ids=members.map(x=>x.pupil_id)
  const {data:ps,error:pe}=await supabase.from('pupils').select('*').in('id',ids).order('full_name')
  if(pe){shell(msg(pe.message,false));return}
  pupils=ps; marks=Object.fromEntries(pupils.map(p=>[p.id,null])); renderRegister()
}
function renderRegister(){
  const marked=Object.values(marks).filter(Boolean).length
  const count=s=>Object.values(marks).filter(x=>x===s).length
  shell(`<section class="hero"><div><div class="eyebrow">LIVE DEMO · SUPABASE</div><h1>${currentClass.name}</h1><p>${currentClass.room||''} · ${pupils.length} fake pupils</p></div><button id="all" class="primary">Mark all present</button></section>
  <section class="stats">${[['Marked',`${marked}/${pupils.length}`],['Present',count('present')],['Absent',count('absent')],['Late',count('late')]].map(x=>`<div><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}</section>
  <section class="list">${pupils.map(p=>`<div class="row"><b>${p.full_name}</b><div class="choices">${['present','absent','late'].map(s=>`<button data-id="${p.id}" data-s="${s}" class="${marks[p.id]===s?'active '+s:''}">${s}</button>`).join('')}</div></div>`).join('')}</section>
  <section class="submit"><span>${marked===pupils.length?'Ready to submit':`${pupils.length-marked} left`}</span><button id="submit" class="primary" ${marked!==pupils.length?'disabled':''}>Submit register</button></section><div id="m"></div>`)
  document.querySelector('#all').onclick=()=>{pupils.forEach(p=>marks[p.id]='present');renderRegister()}
  document.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{marks[b.dataset.id]=b.dataset.s;renderRegister()})
  document.querySelector('#submit').onclick=submitRegister
}
async function submitRegister(){
  const m=document.querySelector('#m')
  const today=new Date().toISOString().slice(0,10)
  const {data:session,error:e1}=await supabase.from('register_sessions').insert({class_id:currentClass.id,session_date:today,period_label:'Period 1',opened_by:currentUser.id}).select().single()
  if(e1){m.innerHTML=msg(e1.message,false);return}
  const rows=pupils.map(p=>({register_session_id:session.id,pupil_id:p.id,status:marks[p.id],marked_by:currentUser.id}))
  const {error:e2}=await supabase.from('attendance').insert(rows)
  if(e2){m.innerHTML=msg(e2.message,false);return}
  const {error:e3}=await supabase.from('register_sessions').update({submitted_at:new Date().toISOString()}).eq('id',session.id)
  if(e3){m.innerHTML=msg(e3.message,false);return}
  m.innerHTML=msg('Register saved to Supabase successfully.')
}
supabase.auth.onAuthStateChange(()=>render())
render()
