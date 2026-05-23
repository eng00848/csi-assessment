import { useState } from 'react'
import { QUESTIONS, ITEM_MAP } from './data.js'
import { classifyScore, getSubType, continuumPct, buildReportHTML } from './reportBuilder.js'
import { NARRATIVES, STYLE_INFO, TIPS } from './data.js'

// ─── PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ───────────────────────
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL || ''
// ──────────────────────────────────────────────────────────────────────────

const GREEN = '#3B6D11'
const RED = '#A32D2D'
const GREEN_LIGHT = '#EAF3DE'
const RED_LIGHT = '#FCEBEB'

async function saveToSheets(payload) {
  if (!SHEETS_URL) return
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.warn('Sheet save failed (non-critical):', e)
  }
}

export default function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState('')
  const [answers, setAnswers] = useState(Array(20).fill(null).map(() => ({ a: '', b: '' })))
  const [errors, setErrors] = useState(Array(20).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1)

  function handleA(i, val) {
    const v = parseInt(val)
    const next = [...answers]
    if (!isNaN(v) && v >= 0 && v <= 3) {
      next[i] = { a: String(v), b: String(3 - v) }
    } else {
      next[i] = { ...next[i], a: val }
    }
    setAnswers(next)
    const av = parseInt(next[i].a), bv = parseInt(next[i].b)
    const nextE = [...errors]
    nextE[i] = (!isNaN(av) && !isNaN(bv) && av + bv !== 3) ? `Must total 3 (currently ${av+bv})` : null
    setErrors(nextE)
  }

  function handleB(i, val) {
    const v = parseInt(val)
    const next = [...answers]
    if (!isNaN(v) && v >= 0 && v <= 3) {
      next[i] = { a: String(3 - v), b: String(v) }
    } else {
      next[i] = { ...next[i], b: val }
    }
    setAnswers(next)
    const av = parseInt(next[i].a), bv = parseInt(next[i].b)
    const nextE = [...errors]
    nextE[i] = (!isNaN(av) && !isNaN(bv) && av + bv !== 3) ? `Must total 3 (currently ${av+bv})` : null
    setErrors(nextE)
  }

  async function calculate() {
    let valid = true
    const nextE = [...errors]
    for (let i = 0; i < 20; i++) {
      const av = parseInt(answers[i].a), bv = parseInt(answers[i].b)
      if (isNaN(av) || isNaN(bv)) { nextE[i] = 'Both values required'; valid = false }
      else if (av + bv !== 3) { nextE[i] = 'Must total 3'; valid = false }
    }
    setErrors(nextE)
    if (!valid) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    if (!name.trim()) { alert('Please enter your name.'); return }

    let cScore = 0, oScore = 0
    for (let i = 0; i < 20; i++) {
      const av = parseInt(answers[i].a), bv = parseInt(answers[i].b)
      if (ITEM_MAP[i].a === 'C') cScore += av; else oScore += av
      if (ITEM_MAP[i].b === 'C') cScore += bv; else oScore += bv
    }

    const { style, diff } = classifyScore(cScore, oScore)
    const subType = getSubType(style, diff)
    const narr = NARRATIVES[style][subType]
    const res = { cScore, oScore, diff, style, subType, label: narr.label }
    setResult(res)

    setSubmitting(true)
    const payload = {
      name: name.trim(),
      email: email.trim(),
      date: date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      conserver_score: cScore,
      originator_score: oScore,
      difference: diff,
      style: style.charAt(0).toUpperCase() + style.slice(1),
      sub_type: narr.label,
      submitted_at: new Date().toISOString(),
      ...Object.fromEntries(answers.map((a, i) => [`q${i+1}_a`, a.a])),
      ...Object.fromEntries(answers.map((a, i) => [`q${i+1}_b`, a.b])),
    }
    await saveToSheets(payload)
    setSubmitting(false)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function downloadReport() {
    const reportDate = date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const html = buildReportHTML(name, reportDate, result.cScore, result.oScore, answers)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CSI_Report_${name.replace(/\s+/g, '_')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setAnswers(Array(20).fill(null).map(() => ({ a: '', b: '' })))
    setErrors(Array(20).fill(null))
    setName(''); setEmail(''); setDate('')
    setResult(null); setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const s = {
    wrap: { maxWidth: '720px', margin: '0 auto', padding: '32px 20px 64px' },
    card: { background: '#fff', border: '0.5px solid #e0e0da', borderRadius: '12px', padding: '24px 28px', marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: 500 },
    input: { width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #ddddd8', borderRadius: '8px', background: '#fff', color: '#1a1a1a', fontFamily: 'inherit', outline: 'none' },
    numInput: (err, ok) => ({ width: '56px', padding: '6px 8px', textAlign: 'center', fontSize: '13px', border: `1px solid ${err ? '#E24B4A' : ok ? '#3B6D11' : '#ddddd8'}`, borderRadius: '8px', background: err ? '#FCEBEB' : ok ? '#EAF3DE' : '#fff', color: '#1a1a1a', fontFamily: 'inherit', outline: 'none' }),
    btn: (color, light) => ({ padding: '10px 24px', fontSize: '13px', borderRadius: '8px', border: `1px solid ${color}`, background: color, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }),
    btnOut: { padding: '10px 20px', fontSize: '13px', borderRadius: '8px', border: '1px solid #ddddd8', background: 'transparent', color: '#1a1a1a', cursor: 'pointer', fontFamily: 'inherit' },
  }

  if (step === 2 && result) {
    const info = STYLE_INFO[result.style]
    const narr = NARRATIVES[result.style][result.subType]
    const pct = continuumPct(result.style, result.diff)
    const BLUE = '#185FA5', GOLD = '#C8860A'

    return (
      <div style={s.wrap}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '6px' }}>Your result</div>
          <div style={{ fontSize: '28px', fontWeight: 400, fontFamily: 'Georgia, serif', color: '#1a1a1a', marginBottom: '4px' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{date}</div>
        </div>

        <div style={{ ...s.card, borderLeft: `4px solid ${info.color}` }}>
          <div style={{ display: 'inline-block', background: info.light, color: info.textColor, fontSize: '10px', fontWeight: 500, padding: '3px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{narr.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {[['Conserver', result.cScore, BLUE], ['Difference', result.diff, info.color], ['Originator', result.oScore, GOLD]].map(([l, v, c]) => (
              <div key={l} style={{ background: '#f7f7f4', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 500, color: c, fontFamily: 'Georgia, serif' }}>{v}</div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Conserver</span><span>Pragmatist</span><span>Originator</span>
            </div>
            <div style={{ height: '10px', background: '#f0f0ec', borderRadius: '99px', position: 'relative', overflow: 'visible' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33.3%', right: '33.3%', background: '#ddddd8' }} />
              <div style={{ position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)', width: '20px', height: '20px', borderRadius: '50%', background: info.color, border: '3px solid #fff', left: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
              {['60','30','17','9','5','0','5','9','17','30','60'].map((t, i) => (
                <div key={i} style={{ textAlign: 'center', flex: 1, fontSize: '9px', color: '#aaa' }}>{t}</div>
              ))}
            </div>
          </div>

          <div style={{ background: info.light, borderLeft: `3px solid ${info.color}`, borderRadius: '0 8px 8px 0', padding: '12px 14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 500, color: info.textColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{narr.label}</div>
            <div style={{ fontSize: '12px', lineHeight: 1.65, color: '#2a2a2a' }}>{narr.intro}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[['Key strengths', narr.strengths, GREEN_LIGHT, GREEN], ['Potential challenges', narr.challenges, RED_LIGHT, RED]].map(([title, items, bg, tc]) => (
              <div key={title} style={{ background: bg, borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: tc, marginBottom: '8px' }}>{title}</div>
                <ul style={{ paddingLeft: '14px' }}>
                  {items.map((x, i) => <li key={i} style={{ fontSize: '11px', lineHeight: 1.6, marginBottom: '2px' }}>{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e0e0da', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Download your full 10-page report</div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '14px', lineHeight: 1.6 }}>
            Your report includes your style profile, strengths &amp; challenges, cross-style perceptions, personalized tips, and all item responses. Open the downloaded file in your browser, then use <strong>File → Print → Save as PDF</strong>.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={downloadReport} style={s.btn(info.color)}>Download report</button>
            <button onClick={reset} style={s.btnOut}>Start new assessment</button>
          </div>
        </div>

        {submitting && <div style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>Saving your results...</div>}
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', background: '#FFF3D6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#C8860A"><path d="M12 2L8.5 7.5H3l4.5 4-1.7 6L12 14.5l6.2 3-1.7-6 4.5-4h-5.5z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 500, fontFamily: 'Georgia, serif' }}>Change Style Indicator</div>
            <div style={{ fontSize: '11px', color: '#888' }}>Assessment &amp; Report Generator</div>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.7, background: '#f7f7f4', borderRadius: '8px', padding: '12px 14px' }}>
          Distribute <strong>3 points</strong> across each pair of statements — A and B must always total exactly 3. Entering a value for A automatically fills B. Respond as you <em>think you are</em>, not as you want to be.
          <div style={{ marginTop: '8px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[['0','Almost never'],['1','Sometimes'],['2','Often'],['3','Almost always']].map(([v,l]) => (
              <span key={v} style={{ fontSize: '11px', color: '#555' }}><strong>{v}</strong> = {l}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[['Full name *', name, setName, 'e.g. ChienPing Tham', 'text'],
            ['Email (optional)', email, setEmail, 'e.g. name@company.com', 'email'],
            ['Date', date, setDate, 'e.g. 23 May 2026', 'text']].map(([label, val, setter, ph, type]) => (
            <div key={label}>
              <label style={s.label}>{label}</label>
              <input type={type} style={s.input} value={val} onChange={e => setter(e.target.value)} placeholder={ph} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 60px 60px', gap: '8px', alignItems: 'center', fontSize: '10px', color: '#888', fontWeight: 500, paddingBottom: '8px', borderBottom: '1px solid #e8e8e4', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>#</span><span>Statement</span><span style={{ textAlign: 'center' }}>A</span><span style={{ textAlign: 'center' }}>B</span>
        </div>

        {QUESTIONS.map((q, i) => {
          const av = parseInt(answers[i].a), bv = parseInt(answers[i].b)
          const ok = !isNaN(av) && !isNaN(bv) && av + bv === 3
          const err = errors[i]
          return (
            <div key={i}>
              <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 60px 60px', gap: '8px', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f0f0ec' }}>
                <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 500 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: '12px', marginBottom: '3px' }}><span style={{ fontSize: '10px', fontWeight: 500, color: '#aaa', marginRight: '4px' }}>A</span>{q[0]}</div>
                  <div style={{ fontSize: '12px' }}><span style={{ fontSize: '10px', fontWeight: 500, color: '#aaa', marginRight: '4px' }}>B</span>{q[1]}</div>
                </div>
                <input type="number" min="0" max="3" value={answers[i].a} onChange={e => handleA(i, e.target.value)} style={s.numInput(err, ok)} />
                <input type="number" min="0" max="3" value={answers[i].b} onChange={e => handleB(i, e.target.value)} style={s.numInput(err, ok)} />
              </div>
              {err && <div style={{ fontSize: '10px', color: '#A32D2D', padding: '2px 0 4px 32px' }}>{err}</div>}
            </div>
          )
        })}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={calculate} disabled={submitting} style={{ ...s.btn('#2E7D6B'), opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Saving...' : 'Calculate my style & generate report'}
          </button>
          <button onClick={reset} style={s.btnOut}>Reset</button>
        </div>
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>
          Each pair must total 3. Typing A auto-fills B. Your results are saved privately.
        </div>
      </div>
    </div>
  )
}
