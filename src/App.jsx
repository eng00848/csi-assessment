import { useState } from 'react'
import { QUESTIONS, ITEM_MAP, NARRATIVES, STYLE_INFO, TIPS, WORKING_WITH } from './data.js'
import { classifyScore, getSubType, continuumPct } from './reportBuilder.js'

const SHEETS_URL = import.meta.env.VITE_SHEETS_URL || ''

const BLUE = '#185FA5', BLUE_LIGHT = '#E6F1FB'
const GOLD = '#C8860A', GOLD_LIGHT = '#FFF3D6'
const GREEN = '#3B6D11', GREEN_LIGHT = '#EAF3DE'
const RED = '#A32D2D', RED_LIGHT = '#FCEBEB'
const GRAY_LIGHT = '#f7f7f4'

async function saveToSheets(payload) {
  if (!SHEETS_URL) return
  try {
    await fetch(SHEETS_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) { console.warn('Sheet save failed:', e) }
}

// ── inline print styles injected into <head> ──────────────────────────────
const PRINT_STYLE = `
@media print {
  .no-print { display: none !important; }
  .print-page { page-break-after: always; }
  .print-page:last-child { page-break-after: avoid; }
  body { background: #fff !important; }
  .report-wrap { max-width: 100% !important; padding: 0 !important; }
  .report-section { box-shadow: none !important; border: none !important; margin-bottom: 0 !important; border-radius: 0 !important; }
}
`

function injectPrintStyle() {
  if (document.getElementById('csi-print-style')) return
  const s = document.createElement('style')
  s.id = 'csi-print-style'
  s.textContent = PRINT_STYLE
  document.head.appendChild(s)
}

// ── Section wrapper ───────────────────────────────────────────────────────
function Section({ title, children, accent, pageBreak }) {
  return (
    <div className={pageBreak ? 'report-section print-page' : 'report-section'} style={{
      background: '#fff', border: '0.5px solid #e0e0da', borderRadius: '12px',
      marginBottom: '16px', overflow: 'hidden',
    }}>
      {title && (
        <div style={{
          padding: '12px 24px', borderBottom: '0.5px solid #e8e8e4',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <div style={{ width: '3px', height: '16px', borderRadius: '99px', background: accent || '#888', flexShrink: 0 }} />
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555' }}>{title}</div>
        </div>
      )}
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  )
}

// ── Chip ──────────────────────────────────────────────────────────────────
function Chip({ label, color }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: '11px', padding: '3px 10px',
      borderRadius: '99px', margin: '2px 3px 2px 0',
      background: color ? color + '22' : '#f0f0ec',
      color: color || '#555', border: `0.5px solid ${color ? color + '44' : '#ddddd8'}`,
    }}>{label}</span>
  )
}

// ── Continuum bar ─────────────────────────────────────────────────────────
function Continuum({ pct, accentColor }) {
  return (
    <div style={{ margin: '8px 0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <span style={{ color: BLUE }}>Conserver</span>
        <span style={{ color: GREEN }}>Pragmatist</span>
        <span style={{ color: GOLD }}>Originator</span>
      </div>
      <div style={{ height: '12px', background: '#f0f0ec', borderRadius: '99px', position: 'relative', overflow: 'visible' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33.3%', right: '33.3%', background: '#ddddd8' }} />
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%,-50%)', width: '22px', height: '22px',
          borderRadius: '50%', background: accentColor, border: '3px solid #fff',
          boxShadow: `0 0 0 2px ${accentColor}44`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px' }}>
        {['60','30','17','9','5','0','5','9','17','30','60'].map((t,i) => (
          <div key={i} style={{ textAlign: 'center', flex: 1, fontSize: '9px', color: '#bbb' }}>{t}</div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#ccc', paddingTop: '2px' }}>
        <span>25%</span><span>50%</span><span>25%</span>
      </div>
    </div>
  )
}

// ── Full inline report ────────────────────────────────────────────────────
function Report({ name, email, date, result, answers, onReset }) {
  const { cScore, oScore, diff, style, subType } = result
  const narr = NARRATIVES[style][subType]
  const info = STYLE_INFO[style]
  const tips = TIPS[style]
  const work = WORKING_WITH[style]
  const pct = continuumPct(style, diff)
  const styleLabel = style.charAt(0).toUpperCase() + style.slice(1)
  const otherStyles = ['conserver','pragmatist','originator'].filter(s => s !== style)
  const ac = info.color, al = info.light, at = info.textColor

  return (
    <div className="report-wrap" style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 20px 64px' }}>

      {/* ── Print style tag ── */}
      {injectPrintStyle()}

      {/* ── Top bar ── */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '4px' }}>Your CSI Report</div>
          <div style={{ fontSize: '22px', fontWeight: 400, fontFamily: 'Georgia,serif', color: '#1a1a1a' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{date}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.print()}
            style={{ padding: '9px 18px', fontSize: '12px', borderRadius: '8px', border: `1px solid ${ac}`, background: ac, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
          >
            🖨 Print / Save as PDF
          </button>
          <button
            onClick={onReset}
            style={{ padding: '9px 16px', fontSize: '12px', borderRadius: '8px', border: '1px solid #ddddd8', background: 'transparent', color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            New assessment
          </button>
        </div>
      </div>

      {/* ── PAGE 1: Cover banner ── */}
      <div className="print-page" style={{ background: `linear-gradient(135deg, ${ac} 0%, ${ac}cc 100%)`, borderRadius: '12px', padding: '36px 32px', marginBottom: '16px', color: '#fff' }}>
        <div style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.7, marginBottom: '6px' }}>Change Style Indicator</div>
        <div style={{ fontSize: '32px', fontFamily: 'Georgia,serif', lineHeight: 1.15, marginBottom: '6px' }}>{name}</div>
        <div style={{ fontSize: '13px', opacity: 0.75, marginBottom: '20px' }}>{date}</div>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '99px', padding: '5px 16px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {narr.label}
        </div>
      </div>

      {/* ── PAGE 2: Score + continuum ── */}
      <Section title="Your Score" accent={ac} pageBreak>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[['Conserver Score', cScore, BLUE, BLUE_LIGHT],['Difference', diff, ac, al],['Originator Score', oScore, GOLD, GOLD_LIGHT]].map(([l,v,c,bg]) => (
            <div key={l} style={{ background: bg, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontFamily: 'Georgia,serif', fontWeight: 400, color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: '10px', color: c, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px', opacity: 0.8 }}>{l}</div>
            </div>
          ))}
        </div>
        <Continuum pct={pct} accentColor={ac} />
        <div style={{ background: al, borderLeft: `3px solid ${ac}`, borderRadius: '0 8px 8px 0', padding: '14px 16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: at, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{narr.label}</div>
          <div style={{ fontSize: '13px', color: '#2a2a2a', lineHeight: 1.7 }}>{narr.intro}</div>
        </div>
      </Section>

      {/* ── PAGE 3: Strengths & Challenges ── */}
      <Section title="Strengths & Potential Challenges" accent={ac} pageBreak>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: GREEN_LIGHT, borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>✦</span> Key Strengths
            </div>
            <ul style={{ paddingLeft: '16px' }}>
              {narr.strengths.map((x,i) => <li key={i} style={{ fontSize: '12px', lineHeight: 1.65, marginBottom: '6px', color: '#1a3a0a' }}>{x}</li>)}
            </ul>
          </div>
          <div style={{ background: RED_LIGHT, borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: RED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>⚠</span> Potential Challenges
            </div>
            <ul style={{ paddingLeft: '16px' }}>
              {narr.challenges.map((x,i) => <li key={i} style={{ fontSize: '12px', lineHeight: 1.65, marginBottom: '6px', color: '#3a0a0a' }}>{x}</li>)}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── PAGE 4: Style profile across 5 dimensions ── */}
      <Section title={`${styleLabel} Style Profile`} accent={ac} pageBreak>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', lineHeight: 1.65 }}>
          Across five key dimensions, here is how your {styleLabel} preference is most likely to show up in the workplace.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {[
            ['When Facing Change', info.facing],
            ['When Contributing', info.contributing],
            ['When Leading', info.leading],
            ['When Supporting Innovation', info.innovation],
          ].map(([title, items]) => (
            <div key={title} style={{ border: '0.5px solid #e8e8e4', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: ac, marginBottom: '10px' }}>{title}</div>
              <ul style={{ paddingLeft: '14px' }}>
                {items.map((x,i) => <li key={i} style={{ fontSize: '11px', lineHeight: 1.6, marginBottom: '3px', color: '#333' }}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ border: '0.5px solid #e8e8e4', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: ac, marginBottom: '10px' }}>When Collaborating</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {info.collaborating.map((x,i) => <Chip key={i} label={x} color={ac} />)}
          </div>
        </div>
      </Section>

      {/* ── PAGE 5: How others see you ── */}
      <Section title="How Others See You — and How You See Them" accent={ac} pageBreak>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', lineHeight: 1.65 }}>
          These are common perceptions between styles — not judgments. Awareness of them is the first step to bridging differences and reducing conflict.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: otherStyles.length === 2 ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '12px' }}>
          {otherStyles.map(os => {
            const ol = os.charAt(0).toUpperCase() + os.slice(1)
            const oc = STYLE_INFO[os].color
            return (
              <div key={os} style={{ border: '0.5px solid #e8e8e4', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: oc, marginBottom: '8px', paddingBottom: '6px', borderBottom: '0.5px solid #f0f0ec' }}>
                  {ol}s may see you as
                </div>
                <div style={{ marginBottom: '10px' }}>
                  {(info.perceivedBy[os] || []).map((x,i) => <Chip key={i} label={x} color={oc} />)}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: ac, marginBottom: '8px', paddingBottom: '6px', borderBottom: '0.5px solid #f0f0ec' }}>
                  You may see {ol}s as
                </div>
                <div>
                  {(info.perceives[os] || []).map((x,i) => <Chip key={i} label={x} color={ac} />)}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ background: GRAY_LIGHT, borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#555', lineHeight: 1.65 }}>
          <strong style={{ color: '#2a2a2a' }}>Remember: </strong>
          These perceptions are natural by-products of style differences — not character flaws. The goal is not to change your style, but to adapt it consciously for the situation.
        </div>
      </Section>

      {/* ── PAGE 6: Tips ── */}
      <Section title={`Tips for ${styleLabel}s`} accent={ac} pageBreak>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', lineHeight: 1.65 }}>
          These tips are specific to your {narr.label} profile. Apply them when your preferred style may be limiting your effectiveness.
        </p>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: '10px' }}>General tips — all styles</div>
          {TIPS.general.map((t,i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '0.5px solid #f0f0ec', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: al, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: at, marginTop: '1px' }}>{i+1}</div>
              <div style={{ fontSize: '12px', lineHeight: 1.65, color: '#2a2a2a' }}>{t}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: ac, marginBottom: '10px' }}>Specific tips for {styleLabel}s</div>
          {tips.map((t,i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '0.5px solid #f0f0ec', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: al, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: at, marginTop: '1px' }}>{i+1}</div>
              <div style={{ fontSize: '12px', lineHeight: 1.65, color: '#2a2a2a' }}>{t}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PAGE 7: Working with your style ── */}
      <Section title={`Working With ${styleLabel}s`} accent={ac} pageBreak>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', lineHeight: 1.65 }}>
          Share this section with your colleagues, manager, or direct reports so they know how to communicate and collaborate most effectively with you.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[['Preferred Work Environment', work.env], ['Communication Tips', work.comms]].map(([title, items]) => (
            <div key={title} style={{ border: '0.5px solid #e8e8e4', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: ac, marginBottom: '10px' }}>{title}</div>
              <ul style={{ paddingLeft: '14px' }}>
                {items.map((x,i) => <li key={i} style={{ fontSize: '11px', lineHeight: 1.65, marginBottom: '4px', color: '#333' }}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: '10px' }}>All Three Styles — Quick Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
          {[['Conserver',BLUE,'Prefers gradual, incremental change. Values structure, rules, and proven methods. Reliable and detail-oriented.'],
            ['Pragmatist',GREEN,'Prefers practical, outcome-driven change. Flexible and adaptable. Natural mediator between the other two styles.'],
            ['Originator',GOLD,'Prefers fast, radical change. Challenges conventions and thrives on novelty. Visionary and energized by ambiguity.']].map(([s,c,d]) => (
            <div key={s} style={{ background: GRAY_LIGHT, borderRadius: '8px', padding: '12px', borderTop: `3px solid ${c}` }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: c, marginBottom: '6px' }}>{s}</div>
              <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PAGE 8: Potential pitfalls ── */}
      <Section title="Potential Pitfalls of Each Style" accent={ac} pageBreak>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', lineHeight: 1.65 }}>
          Any strength, when overused, can become a derailer. Below are common challenges for each style — your own pitfalls are highlighted.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
          {[['Conserver', BLUE, ["May be rigid in thought and action","May discourage innovation by promoting existing processes","May not see broader context beyond present details","May delay completion due to perfectionism","May appear unyielding or set in their ways","May over-focus on irrelevant details"]],
            ['Pragmatist', GREEN, ["May over-focus on building consensus","May not adequately promote personal priorities","May try to please too many people at once","May be indecisive or take too long to act","May appear to flip-flop on issues","May negotiate compromise that satisfies no one"]],
            ['Originator', GOLD, ["May create chaos and lack of discipline","May become lost in theory, ignoring realities","Often underestimates the human impact of change","Frequently moves to new ideas before finishing","May not adapt well to new policies once set","May overlook key stakeholders for implementation"]]
          ].map(([s,c,items]) => (
            <div key={s} style={{ border: `1px solid ${s.toLowerCase() === style ? c : '#e8e8e4'}`, borderRadius: '10px', padding: '14px', background: s.toLowerCase() === style ? c + '08' : '#fff' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: c, marginBottom: '10px', paddingBottom: '6px', borderBottom: `0.5px solid ${c}33` }}>
                {s} {s.toLowerCase() === style && <span style={{ fontSize: '9px', background: c, color: '#fff', padding: '1px 6px', borderRadius: '99px', marginLeft: '4px' }}>You</span>}
              </div>
              <ul style={{ paddingLeft: '14px' }}>
                {items.map((x,i) => <li key={i} style={{ fontSize: '10px', lineHeight: 1.6, marginBottom: '3px', color: '#444' }}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ background: al, borderRadius: '8px', padding: '12px 14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: at, marginBottom: '6px' }}>Your highlighted pitfalls as a {narr.label}</div>
          <div>{narr.challenges.map((x,i) => <Chip key={i} label={x} color={ac} />)}</div>
        </div>
      </Section>

      {/* ── PAGE 9: Item responses ── */}
      <Section title="Your Item Responses" accent={ac} pageBreak>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '14px', lineHeight: 1.65 }}>
          Each pair sums to 3. Filled circles show where you placed the higher weight.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e8e8e4' }}>
              {['#','Statement A','A','Statement B','B'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: h === 'A' || h === 'B' ? 'center' : 'left', fontSize: '10px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((q, i) => {
              const av = parseInt(answers[i].a), bv = parseInt(answers[i].b)
              return (
                <tr key={i} style={{ borderBottom: '0.5px solid #f4f4f0' }}>
                  <td style={{ padding: '6px 8px', color: '#bbb', fontWeight: 600, width: '24px' }}>{i+1}</td>
                  <td style={{ padding: '6px 8px', width: '38%', color: '#333' }}>{q[0]}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', width: '36px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', fontWeight: 600, background: av > bv ? ac : '#f0f0ec', color: av > bv ? '#fff' : '#888' }}>{answers[i].a}</span>
                  </td>
                  <td style={{ padding: '6px 8px', width: '38%', color: '#333' }}>{q[1]}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', width: '36px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', fontWeight: 600, background: bv > av ? ac : '#f0f0ec', color: bv > av ? '#fff' : '#888' }}>{answers[i].b}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Section>

      {/* ── Bottom action bar ── */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => window.print()} style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '8px', border: `1px solid ${ac}`, background: ac, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
          🖨 Print / Save as PDF
        </button>
        <button onClick={onReset} style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '8px', border: '1px solid #ddddd8', background: 'transparent', color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>
          Start new assessment
        </button>
      </div>

    </div>
  )
}

// ── Assessment form ───────────────────────────────────────────────────────
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
    next[i] = (!isNaN(v) && v >= 0 && v <= 3) ? { a: String(v), b: String(3 - v) } : { ...next[i], a: val }
    setAnswers(next)
    const nextE = [...errors]
    const av2 = parseInt(next[i].a), bv2 = parseInt(next[i].b)
    nextE[i] = (!isNaN(av2) && !isNaN(bv2) && av2 + bv2 !== 3) ? `Must total 3 (currently ${av2+bv2})` : null
    setErrors(nextE)
  }

  function handleB(i, val) {
    const v = parseInt(val)
    const next = [...answers]
    next[i] = (!isNaN(v) && v >= 0 && v <= 3) ? { a: String(3 - v), b: String(v) } : { ...next[i], b: val }
    setAnswers(next)
    const nextE = [...errors]
    const av2 = parseInt(next[i].a), bv2 = parseInt(next[i].b)
    nextE[i] = (!isNaN(av2) && !isNaN(bv2) && av2 + bv2 !== 3) ? `Must total 3 (currently ${av2+bv2})` : null
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
    const res = { cScore, oScore, diff, style, subType }
    setResult(res)

    setSubmitting(true)
    const reportDate = date || new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
    await saveToSheets({
      name: name.trim(), email: email.trim(), date: reportDate,
      conserver_score: cScore, originator_score: oScore, difference: diff,
      style: style.charAt(0).toUpperCase() + style.slice(1),
      sub_type: NARRATIVES[style][subType].label,
      submitted_at: new Date().toISOString(),
      ...Object.fromEntries(answers.map((a,i) => [`q${i+1}_a`, a.a])),
      ...Object.fromEntries(answers.map((a,i) => [`q${i+1}_b`, a.b])),
    })
    setSubmitting(false)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setAnswers(Array(20).fill(null).map(() => ({ a: '', b: '' })))
    setErrors(Array(20).fill(null))
    setName(''); setEmail(''); setDate('')
    setResult(null); setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reportDate = date || new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })

  if (step === 2 && result) {
    return <Report name={name} email={email} date={reportDate} result={result} answers={answers} onReset={reset} />
  }

  const inp = { width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #ddddd8', borderRadius: '8px', background: '#fff', color: '#1a1a1a', fontFamily: 'inherit', outline: 'none' }
  const numInp = (err, ok) => ({ width: '56px', padding: '6px 8px', textAlign: 'center', fontSize: '13px', border: `1px solid ${err ? '#E24B4A' : ok ? GREEN : '#ddddd8'}`, borderRadius: '8px', background: err ? RED_LIGHT : ok ? GREEN_LIGHT : '#fff', color: '#1a1a1a', fontFamily: 'inherit', outline: 'none' })

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '42px', height: '42px', background: GOLD_LIGHT, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={GOLD}><path d="M12 2L8.5 7.5H3l4.5 4-1.7 6L12 14.5l6.2 3-1.7-6 4.5-4h-5.5z"/></svg>
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 500, fontFamily: 'Georgia,serif' }}>Change Style Indicator</div>
          <div style={{ fontSize: '11px', color: '#888' }}>Assessment · Your report appears instantly on screen</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #e0e0da', borderRadius: '12px', padding: '24px 28px', marginBottom: '16px' }}>
        <div style={{ background: GRAY_LIGHT, borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', fontSize: '12px', color: '#555', lineHeight: 1.7 }}>
          Distribute <strong>3 points</strong> across each pair — A and B must always total exactly 3. Entering A automatically fills B.
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
            {[['0','Almost never'],['1','Sometimes'],['2','Often'],['3','Almost always']].map(([v,l]) => (
              <span key={v} style={{ fontSize: '11px' }}><strong>{v}</strong> = {l}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {[['Full name *', name, setName, 'e.g. John Doe', 'text'],
            ['Email (optional)', email, setEmail, 'e.g. name@nets.com.sg', 'email'],
            ['Date', date, setDate, 'e.g. 1 Apr 2026', 'text']].map(([label, val, setter, ph, type]) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: 500 }}>{label}</label>
              <input type={type} style={inp} value={val} onChange={e => setter(e.target.value)} placeholder={ph} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 60px 60px', gap: '8px', alignItems: 'center', fontSize: '10px', color: '#888', fontWeight: 600, paddingBottom: '8px', borderBottom: '1px solid #e8e8e4', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>#</span><span>Statement</span><span style={{ textAlign: 'center' }}>A</span><span style={{ textAlign: 'center' }}>B</span>
        </div>

        {QUESTIONS.map((q, i) => {
          const av = parseInt(answers[i].a), bv = parseInt(answers[i].b)
          const ok = !isNaN(av) && !isNaN(bv) && av + bv === 3
          const err = errors[i]
          return (
            <div key={i}>
              <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 60px 60px', gap: '8px', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f0f0ec' }}>
                <span style={{ fontSize: '11px', color: '#bbb', fontWeight: 600 }}>{i+1}</span>
                <div>
                  <div style={{ fontSize: '12px', marginBottom: '3px' }}><span style={{ fontSize: '10px', fontWeight: 600, color: '#bbb', marginRight: '4px' }}>A</span>{q[0]}</div>
                  <div style={{ fontSize: '12px' }}><span style={{ fontSize: '10px', fontWeight: 600, color: '#bbb', marginRight: '4px' }}>B</span>{q[1]}</div>
                </div>
                <input type="number" min="0" max="3" value={answers[i].a} onChange={e => handleA(i, e.target.value)} style={numInp(err, ok)} />
                <input type="number" min="0" max="3" value={answers[i].b} onChange={e => handleB(i, e.target.value)} style={numInp(err, ok)} />
              </div>
              {err && <div style={{ fontSize: '10px', color: RED, padding: '2px 0 4px 32px' }}>{err}</div>}
            </div>
          )
        })}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={calculate} disabled={submitting} style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '8px', border: '1px solid #2E7D6B', background: '#2E7D6B', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 500, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Saving...' : 'See my results →'}
          </button>
          <button onClick={reset} style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '8px', border: '1px solid #ddddd8', background: 'transparent', color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
        </div>
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>Your full report appears immediately on screen. No download needed.</div>
      </div>
    </div>
  )
}
