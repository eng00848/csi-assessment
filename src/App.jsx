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

// ── Print styles: preserves all colours, backgrounds, layout ─────────────
const PRINT_STYLE = `
  @page {
    size: A4;
    margin: 14mm 16mm 16mm 16mm;
  }

  @media print {
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    html, body {
      background: #fff !important;
      font-size: 11px !important;
    }

    .no-print { display: none !important; }

    .report-wrap {
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Each print-page becomes its own page */
    .print-page {
      page-break-after: always;
      page-break-inside: avoid;
      break-after: page;
      margin-bottom: 0 !important;
      border-radius: 8px !important;
    }
    .print-page:last-of-type {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* Keep section cards looking like the screen */
    .report-section {
      border: 0.5px solid #e0e0da !important;
      border-radius: 8px !important;
      margin-bottom: 0 !important;
      overflow: visible !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Cover gradient must print */
    .cover-banner {
      background: linear-gradient(135deg, var(--ac) 0%, var(--ac-fade) 100%) !important;
      border-radius: 8px !important;
      color: #fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Coloured score boxes */
    .score-box-blue  { background: #E6F1FB !important; }
    .score-box-gold  { background: #FFF3D6 !important; }
    .score-box-ac    { background: var(--al) !important; }

    /* Green / red SW cards */
    .sw-strengths    { background: #EAF3DE !important; }
    .sw-challenges   { background: #FCEBEB !important; }

    /* Continuum track */
    .cont-track      { background: #f0f0ec !important; }
    .cont-center     { background: #ddddd8 !important; }

    /* Dimension cards, perception cards, tip rows */
    .dim-card, .perc-card, .work-card {
      border: 0.5px solid #e8e8e4 !important;
      border-radius: 8px !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Style reference blocks */
    .style-ref-c { background: #f7f7f4 !important; border-top: 3px solid #185FA5 !important; }
    .style-ref-p { background: #f7f7f4 !important; border-top: 3px solid #3B6D11 !important; }
    .style-ref-o { background: #f7f7f4 !important; border-top: 3px solid #C8860A !important; }

    /* Sub-type narrative box */
    .subtype-box { border-left-width: 3px !important; border-left-style: solid !important; }

    /* Chip badges */
    .chip-badge { border: 0.5px solid !important; }

    /* Pitfall highlight block */
    .pitfall-highlight { border-radius: 8px !important; }

    /* Item response table */
    .resp-table td, .resp-table th { border-bottom: 0.5px solid #f4f4f0 !important; }
    .score-dot-hi { border-radius: 50% !important; color: #fff !important; }
    .score-dot    { background: #f0f0ec !important; border-radius: 50% !important; }

    /* Running page header — shows on every printed page */
    .print-header {
      display: flex !important;
      justify-content: space-between;
      font-size: 9px;
      color: #aaa;
      border-bottom: 0.5px solid #e8e8e4;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
  }

  /* Hide running headers on screen */
  @media screen {
    .print-header { display: none !important; }
  }
`

function injectPrintStyle() {
  if (document.getElementById('csi-print-style')) return
  const s = document.createElement('style')
  s.id = 'csi-print-style'
  s.textContent = PRINT_STYLE
  document.head.appendChild(s)
}

// ── Reusable components ───────────────────────────────────────────────────
function PrintHeader({ name, department, section }) {
  return (
    <div className="print-header">
      <span>Change Style Indicator Assessment — {name}{department ? ` · ${department}` : ''}</span>
      <span>{section}</span>
    </div>
  )
}

function Section({ title, children, accent, pageBreak, noPad }) {
  return (
    <div
      className={`report-section${pageBreak ? ' print-page' : ''}`}
      style={{
        background: '#fff',
        border: '0.5px solid #e0e0da',
        borderRadius: '12px',
        marginBottom: '16px',
        overflow: 'hidden',
      }}
    >
      {title && (
        <div style={{
          padding: '11px 24px',
          borderBottom: '0.5px solid #e8e8e4',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fafaf8',
        }}>
          <div style={{ width: '3px', height: '16px', borderRadius: '99px', background: accent || '#888', flexShrink: 0 }} />
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#444' }}>{title}</div>
        </div>
      )}
      <div style={{ padding: noPad ? '0' : '20px 24px' }}>{children}</div>
    </div>
  )
}

function Chip({ label, color }) {
  return (
    <span className="chip-badge" style={{
      display: 'inline-block', fontSize: '11px', padding: '3px 10px',
      borderRadius: '99px', margin: '2px 3px 2px 0',
      background: color ? color + '18' : '#f0f0ec',
      color: color || '#555',
      border: `0.5px solid ${color ? color + '55' : '#ddddd8'}`,
    }}>{label}</span>
  )
}

function Continuum({ pct, accentColor }) {
  return (
    <div style={{ margin: '8px 0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <span style={{ color: BLUE, fontWeight: 600 }}>Conserver</span>
        <span style={{ color: GREEN, fontWeight: 600 }}>Pragmatist</span>
        <span style={{ color: GOLD, fontWeight: 600 }}>Originator</span>
      </div>
      <div className="cont-track" style={{ height: '14px', background: '#f0f0ec', borderRadius: '99px', position: 'relative', overflow: 'visible' }}>
        <div className="cont-center" style={{ position: 'absolute', top: 0, bottom: 0, left: '33.3%', right: '33.3%', background: '#ddddd8' }} />
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%,-50%)',
          width: '24px', height: '24px', borderRadius: '50%',
          background: accentColor,
          border: '3px solid #fff',
          boxShadow: `0 0 0 2px ${accentColor}55, 0 2px 6px ${accentColor}44`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px' }}>
        {['60','30','17','9','5','0','5','9','17','30','60'].map((t,i) => (
          <div key={i} style={{ textAlign: 'center', flex: 1, fontSize: '9px', color: '#bbb', fontWeight: t==='0'?700:400 }}>{t}</div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#ccc', paddingTop: '2px' }}>
        <span>25%</span><span>50%</span><span>25%</span>
      </div>
    </div>
  )
}

// ── Full inline report ────────────────────────────────────────────────────
function Report({ name, date, department, result, answers, onReset }) {
  const { cScore, oScore, diff, style, subType } = result
  const narr = NARRATIVES[style][subType]
  const info = STYLE_INFO[style]
  const tips = TIPS[style]
  const work = WORKING_WITH[style]
  const pct = continuumPct(style, diff)
  const styleLabel = style.charAt(0).toUpperCase() + style.slice(1)
  const otherStyles = ['conserver','pragmatist','originator'].filter(s => s !== style)
  const ac = info.color, al = info.light, at = info.textColor

  injectPrintStyle()

  // inject CSS vars for cover gradient (needed in print)
  const cssVars = { '--ac': ac, '--ac-fade': ac + 'cc', '--al': al }

  const tipNum = (n) => (
    <div style={{ flexShrink:0, width:'22px', height:'22px', borderRadius:'50%', background: al, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, color: at, marginTop:'1px' }}>{n}</div>
  )

  return (
    <div className="report-wrap" style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 20px 64px', ...cssVars }}>

      {/* ── Screen-only top bar ── */}
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'10px' }}>
        <div>
          <div style={{ fontSize:'10px', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.1em', color:'#999', marginBottom:'4px' }}>Your CSI Report</div>
          <div style={{ fontSize:'22px', fontWeight:400, fontFamily:'Georgia,serif', color:'#1a1a1a' }}>{name}</div>
          <div style={{ fontSize:'12px', color:'#888' }}>{department && <span style={{ marginRight:'10px' }}>{department}</span>}{date}</div>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={() => window.print()} style={{ padding:'9px 20px', fontSize:'12px', borderRadius:'8px', border:`1px solid ${ac}`, background:ac, color:'#fff', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
            🖨 Print / Save as PDF
          </button>
          <button onClick={onReset} style={{ padding:'9px 16px', fontSize:'12px', borderRadius:'8px', border:'1px solid #ddddd8', background:'transparent', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>
            New assessment
          </button>
        </div>
      </div>

      {/* ══ PAGE 1 — COVER ══ */}
      <div className="cover-banner print-page" style={{ background:`linear-gradient(135deg, ${ac} 0%, ${ac}cc 100%)`, borderRadius:'12px', padding:'40px 36px', marginBottom:'16px', color:'#fff', minHeight:'220px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.15em', opacity:0.65, marginBottom:'14px' }}>Change Style Indicator Assessment · Improve Change Effectiveness</div>
          <div style={{ fontSize:'36px', fontFamily:'Georgia,serif', lineHeight:1.1, marginBottom:'6px' }}>{name}</div>
          <div style={{ fontSize:'13px', opacity:0.75, marginBottom:'24px' }}>{department && <span style={{ marginRight:'12px' }}>{department}</span>}{date}</div>
          <div style={{ display:'inline-block', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', borderRadius:'99px', padding:'6px 20px', fontSize:'12px', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>
            {narr.label}
          </div>
        </div>
        <div style={{ display:'flex', gap:'20px', marginTop:'32px', paddingTop:'20px', borderTop:'1px solid rgba(255,255,255,0.2)' }}>
          {[['Conserver Score', cScore],['Difference', diff],['Originator Score', oScore]].map(([l,v]) => (
            <div key={l} style={{ textAlign:'left' }}>
              <div style={{ fontSize:'28px', fontFamily:'Georgia,serif', fontWeight:400, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:'10px', opacity:0.65, marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PAGE 2 — SCORE + RESULT ══ */}
      <Section title="Your Change Style Score" accent={ac} pageBreak>
        <PrintHeader name={name} department={department} section="Your Score" />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'22px' }}>
          {[['Conserver Score', cScore, BLUE, BLUE_LIGHT,'score-box-blue'],
            ['Difference', diff, ac, al,'score-box-ac'],
            ['Originator Score', oScore, GOLD, GOLD_LIGHT,'score-box-gold']].map(([l,v,c,bg,cls]) => (
            <div key={l} className={cls} style={{ background:bg, borderRadius:'12px', padding:'16px 14px', textAlign:'center' }}>
              <div style={{ fontSize:'40px', fontFamily:'Georgia,serif', fontWeight:400, color:c, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:'10px', color:c, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:'5px', fontWeight:600, opacity:0.85 }}>{l}</div>
            </div>
          ))}
        </div>

        <Continuum pct={pct} accentColor={ac} />

        <div className="subtype-box" style={{ background:al, borderLeft:`4px solid ${ac}`, borderRadius:'0 10px 10px 0', padding:'14px 18px', marginTop:'4px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:at, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'7px' }}>{narr.label} — what this means for you</div>
          <div style={{ fontSize:'13px', color:'#1a1a1a', lineHeight:1.72 }}>{narr.intro}</div>
        </div>
      </Section>

      {/* ══ PAGE 3 — STRENGTHS & CHALLENGES ══ */}
      <Section title="Strengths & Potential Challenges" accent={ac} pageBreak>
        <PrintHeader name={name} department={department} section="Strengths & Challenges" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div className="sw-strengths" style={{ background:GREEN_LIGHT, borderRadius:'10px', padding:'18px 16px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:GREEN, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'14px', display:'flex', alignItems:'center', gap:'7px' }}>
              <span style={{ fontSize:'16px' }}>✦</span> Key Strengths
            </div>
            <ul style={{ paddingLeft:'16px' }}>
              {narr.strengths.map((x,i) => (
                <li key={i} style={{ fontSize:'12px', lineHeight:1.7, marginBottom:'7px', color:'#1a3a0a' }}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="sw-challenges" style={{ background:RED_LIGHT, borderRadius:'10px', padding:'18px 16px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:RED, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'14px', display:'flex', alignItems:'center', gap:'7px' }}>
              <span style={{ fontSize:'16px' }}>⚠</span> Potential Challenges
            </div>
            <ul style={{ paddingLeft:'16px' }}>
              {narr.challenges.map((x,i) => (
                <li key={i} style={{ fontSize:'12px', lineHeight:1.7, marginBottom:'7px', color:'#3a0a0a' }}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ══ PAGE 4 — STYLE PROFILE ══ */}
      <Section title={`${styleLabel} Style Profile`} accent={ac} pageBreak>
        <PrintHeader name={name} department={department} section={`${styleLabel} Style Profile`} />
        <p style={{ fontSize:'12px', color:'#555', marginBottom:'16px', lineHeight:1.65 }}>
          Across five key dimensions, here is how your {styleLabel} preference is most likely to show up in the workplace.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
          {[
            ['When Facing Change', info.facing],
            ['When Contributing', info.contributing],
            ['When Leading', info.leading],
            ['When Supporting Innovation', info.innovation],
          ].map(([title, items]) => (
            <div key={title} className="dim-card" style={{ border:`1px solid ${ac}22`, borderRadius:'10px', padding:'14px 16px', background: al + '44' }}>
              <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:ac, marginBottom:'10px', paddingBottom:'6px', borderBottom:`1px solid ${ac}22` }}>{title}</div>
              <ul style={{ paddingLeft:'14px' }}>
                {items.map((x,i) => <li key={i} style={{ fontSize:'11px', lineHeight:1.6, marginBottom:'4px', color:'#2a2a2a' }}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="dim-card" style={{ border:`1px solid ${ac}22`, borderRadius:'10px', padding:'14px 16px', background: al + '44' }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:ac, marginBottom:'10px', paddingBottom:'6px', borderBottom:`1px solid ${ac}22` }}>When Collaborating</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {info.collaborating.map((x,i) => <Chip key={i} label={x} color={ac} />)}
          </div>
        </div>
      </Section>

      {/* ══ PAGE 5 — HOW OTHERS SEE YOU ══ */}
      <Section title="How Others See You — and How You See Them" accent={ac} pageBreak>
        <PrintHeader name={name} department={department} section="Common Perceptions" />
        <p style={{ fontSize:'12px', color:'#555', marginBottom:'16px', lineHeight:1.65 }}>
          These are common perceptions between change styles — not judgments. Awareness is the first step to bridging differences and improving collaboration.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
          {otherStyles.map(os => {
            const ol = os.charAt(0).toUpperCase() + os.slice(1)
            const oc = STYLE_INFO[os].color
            const ocl = STYLE_INFO[os].light
            return (
              <div key={os} className="perc-card" style={{ border:`1px solid ${oc}33`, borderRadius:'10px', padding:'14px 16px', background: ocl + '55' }}>
                <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:oc, marginBottom:'8px', paddingBottom:'6px', borderBottom:`1px solid ${oc}33` }}>
                  {ol}s may see you as
                </div>
                <div style={{ marginBottom:'12px' }}>
                  {(info.perceivedBy[os]||[]).map((x,i) => <Chip key={i} label={x} color={oc} />)}
                </div>
                <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:ac, marginBottom:'8px', paddingBottom:'6px', borderBottom:`1px solid ${ac}33` }}>
                  You may see {ol}s as
                </div>
                <div>
                  {(info.perceives[os]||[]).map((x,i) => <Chip key={i} label={x} color={ac} />)}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ background:GRAY_LIGHT, borderRadius:'8px', padding:'12px 16px', fontSize:'12px', color:'#555', lineHeight:1.65, borderLeft:'3px solid #ccc' }}>
          <strong style={{ color:'#2a2a2a' }}>Remember: </strong>
          These perceptions are natural by-products of style differences, not character flaws. The goal is not to change your style but to adapt it consciously for the situation.
        </div>
      </Section>

      {/* ══ PAGE 6 — TIPS ══ */}
      <Section title={`Tips for ${styleLabel}s`} accent={ac} pageBreak>
        <PrintHeader name={name} department={department} section="Tips for Increasing Effectiveness" />
        <p style={{ fontSize:'12px', color:'#555', marginBottom:'16px', lineHeight:1.65 }}>
          These tips are personalised to your {narr.label} profile. Apply them when your preferred style may be limiting your effectiveness.
        </p>
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:'10px', paddingBottom:'5px', borderBottom:'1px solid #e8e8e4' }}>General tips — all styles</div>
          {TIPS.general.map((t,i) => (
            <div key={i} style={{ display:'flex', gap:'10px', padding:'8px 0', borderBottom:'0.5px solid #f0f0ec', alignItems:'flex-start' }}>
              {tipNum(i+1)}
              <div style={{ fontSize:'12px', lineHeight:1.65, color:'#2a2a2a' }}>{t}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:ac, marginBottom:'10px', paddingBottom:'5px', borderBottom:`1px solid ${ac}33` }}>Specific tips for {styleLabel}s</div>
          {tips.map((t,i) => (
            <div key={i} style={{ display:'flex', gap:'10px', padding:'8px 0', borderBottom:'0.5px solid #f0f0ec', alignItems:'flex-start' }}>
              {tipNum(i+1)}
              <div style={{ fontSize:'12px', lineHeight:1.65, color:'#2a2a2a' }}>{t}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ PAGE 7 — WORKING WITH YOUR STYLE ══ */}
      <Section title={`Working With ${styleLabel}s`} accent={ac} pageBreak>
        <PrintHeader name={name} department={department} section={`Working With ${styleLabel}s`} />
        <p style={{ fontSize:'12px', color:'#555', marginBottom:'16px', lineHeight:1.65 }}>
          Share this section with your colleagues, manager, or direct reports so they understand how to communicate and collaborate most effectively with you.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
          {[['Preferred Work Environment', work.env], ['Communication Tips', work.comms]].map(([title, items]) => (
            <div key={title} className="work-card" style={{ border:`1px solid ${ac}22`, borderRadius:'10px', padding:'14px 16px', background: al + '44' }}>
              <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:ac, marginBottom:'10px', paddingBottom:'6px', borderBottom:`1px solid ${ac}33` }}>{title}</div>
              <ul style={{ paddingLeft:'14px' }}>
                {items.map((x,i) => <li key={i} style={{ fontSize:'11px', lineHeight:1.65, marginBottom:'5px', color:'#2a2a2a' }}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:'12px', paddingBottom:'5px', borderBottom:'1px solid #e8e8e4' }}>All Three Styles — Quick Reference</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
          {[['Conserver',BLUE,'style-ref-c','Prefers gradual, incremental change. Values structure, rules, and proven methods. Reliable and detail-oriented.'],
            ['Pragmatist',GREEN,'style-ref-p','Prefers practical, outcome-driven change. Flexible and adaptable. Natural mediator between the other two styles.'],
            ['Originator',GOLD,'style-ref-o','Prefers fast, radical change. Challenges conventions and thrives on novelty. Visionary and energized by ambiguity.']
          ].map(([s,c,cls,d]) => (
            <div key={s} className={cls} style={{ background:GRAY_LIGHT, borderRadius:'8px', padding:'14px 12px', borderTop:`3px solid ${c}` }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:c, marginBottom:'7px' }}>{s}</div>
              <div style={{ fontSize:'11px', color:'#555', lineHeight:1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ PAGE 8 — POTENTIAL PITFALLS ══ */}
      <Section title="Potential Pitfalls of Each Style" accent={ac} pageBreak>
        <PrintHeader name={name} department={department} section="Potential Pitfalls" />
        <p style={{ fontSize:'12px', color:'#555', marginBottom:'16px', lineHeight:1.65 }}>
          Any strength, when overused, can become a derailer. Below are common challenges for each style — your own are highlighted.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'16px' }}>
          {[
            ['Conserver', BLUE, BLUE_LIGHT, ["May be rigid in thought and action","May discourage innovation by promoting existing processes","May not see broader context beyond present details","May delay completion due to perfectionism","May appear unyielding and set in their ways","May over-focus on irrelevant details"]],
            ['Pragmatist', GREEN, GREEN_LIGHT, ["May over-focus on building consensus","May not adequately promote personal priorities","May try to please too many people at once","May be indecisive or take too long to act","May appear to flip-flop on issues","May negotiate compromise that satisfies no one"]],
            ['Originator', GOLD, GOLD_LIGHT, ["May create chaos and lack of discipline","May become lost in theory, ignoring current realities","Often underestimates the short-term human impact of change","Frequently moves to new ideas before completing existing ones","May not adapt well to new policies once set","May overlook value of engaging key stakeholders"]],
          ].map(([s,c,bg,items]) => (
            <div key={s} style={{ border:`1.5px solid ${s.toLowerCase()===style ? c : '#e8e8e4'}`, borderRadius:'10px', padding:'14px', background: s.toLowerCase()===style ? bg : '#fff' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:c, marginBottom:'10px', paddingBottom:'6px', borderBottom:`0.5px solid ${c}44`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span>{s}</span>
                {s.toLowerCase()===style && <span style={{ fontSize:'9px', background:c, color:'#fff', padding:'2px 8px', borderRadius:'99px' }}>You</span>}
              </div>
              <ul style={{ paddingLeft:'14px' }}>
                {items.map((x,i) => <li key={i} style={{ fontSize:'10px', lineHeight:1.65, marginBottom:'4px', color:'#333' }}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pitfall-highlight" style={{ background:al, borderRadius:'10px', padding:'14px 16px', borderLeft:`4px solid ${ac}` }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:at, marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Your highlighted pitfalls as a {narr.label}</div>
          <div>{narr.challenges.map((x,i) => <Chip key={i} label={x} color={ac} />)}</div>
        </div>
      </Section>

      {/* ══ PAGE 9 — ITEM RESPONSES ══ */}
      <Section title="Your Item Responses — All 20 Items" accent={ac} pageBreak>
        <PrintHeader name={name} department={department} section="Item Responses" />
        <p style={{ fontSize:'12px', color:'#555', marginBottom:'14px', lineHeight:1.65 }}>
          Each pair sums to 3. Filled circles show where you placed the higher weight.
        </p>
        <table className="resp-table" style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
          <thead>
            <tr style={{ background: al }}>
              {['#','Statement A','A','Statement B','B'].map(h => (
                <th key={h} style={{ padding:'7px 8px', textAlign: h==='A'||h==='B' ? 'center':'left', fontSize:'10px', color: at, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((q, i) => {
              const av = parseInt(answers[i].a), bv = parseInt(answers[i].b)
              const rowBg = i % 2 === 0 ? '#fff' : '#fafaf8'
              return (
                <tr key={i} style={{ background: rowBg }}>
                  <td style={{ padding:'6px 8px', color:'#bbb', fontWeight:700, width:'24px', borderBottom:'0.5px solid #f0f0ec' }}>{i+1}</td>
                  <td style={{ padding:'6px 8px', width:'37%', color:'#2a2a2a', borderBottom:'0.5px solid #f0f0ec' }}>{q[0]}</td>
                  <td style={{ padding:'6px 8px', textAlign:'center', width:'36px', borderBottom:'0.5px solid #f0f0ec' }}>
                    <span className={av>bv?'score-dot-hi':'score-dot'} style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'22px', height:'22px', borderRadius:'50%', fontSize:'11px', fontWeight:700, background: av>bv ? ac : '#f0f0ec', color: av>bv ? '#fff':'#888' }}>{answers[i].a}</span>
                  </td>
                  <td style={{ padding:'6px 8px', width:'37%', color:'#2a2a2a', borderBottom:'0.5px solid #f0f0ec' }}>{q[1]}</td>
                  <td style={{ padding:'6px 8px', textAlign:'center', width:'36px', borderBottom:'0.5px solid #f0f0ec' }}>
                    <span className={bv>av?'score-dot-hi':'score-dot'} style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'22px', height:'22px', borderRadius:'50%', fontSize:'11px', fontWeight:700, background: bv>av ? ac : '#f0f0ec', color: bv>av ? '#fff':'#888' }}>{answers[i].b}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Section>

      {/* ── Bottom print button (screen only) ── */}
      <div className="no-print" style={{ display:'flex', gap:'10px', justifyContent:'center', marginTop:'8px', flexWrap:'wrap' }}>
        <button onClick={() => window.print()} style={{ padding:'10px 28px', fontSize:'13px', borderRadius:'8px', border:`1px solid ${ac}`, background:ac, color:'#fff', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
          🖨 Print / Save as PDF
        </button>
        <button onClick={onReset} style={{ padding:'10px 20px', fontSize:'13px', borderRadius:'8px', border:'1px solid #ddddd8', background:'transparent', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>
          Start new assessment
        </button>
      </div>
    </div>
  )
}

// ── Password gate ─────────────────────────────────────────────────────────
const ACCESS_PASSWORD = 'nets2026'

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function attempt(e) {
    e.preventDefault()
    if (pw === ACCESS_PASSWORD) {
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setPw('')
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f7f7f4', padding:'20px' }}>
      <div style={{
        background:'#fff', border:'0.5px solid #e0e0da', borderRadius:'16px',
        padding:'40px 36px', width:'100%', maxWidth:'380px', textAlign:'center',
        boxShadow:'0 4px 24px rgba(0,0,0,0.06)',
        transform: shake ? 'translateX(0)' : 'none',
        animation: shake ? 'shake 0.5s ease' : 'none',
      }}>
        <style>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            15%{transform:translateX(-8px)}
            30%{transform:translateX(8px)}
            45%{transform:translateX(-6px)}
            60%{transform:translateX(6px)}
            75%{transform:translateX(-3px)}
            90%{transform:translateX(3px)}
          }
        `}</style>

        {/* Icon */}
        <div style={{ width:'52px', height:'52px', background:GOLD_LIGHT, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={GOLD}><path d="M12 2L8.5 7.5H3l4.5 4-1.7 6L12 14.5l6.2 3-1.7-6 4.5-4h-5.5z"/></svg>
        </div>

        <div style={{ fontSize:'20px', fontWeight:500, fontFamily:'Georgia,serif', color:'#1a1a1a', marginBottom:'6px' }}>
          Change Style Indicator
        </div>
        <div style={{ fontSize:'12px', color:'#888', marginBottom:'28px', lineHeight:1.5 }}>
          Enter the access password to begin your assessment.
        </div>

        <form onSubmit={attempt}>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false) }}
            placeholder="Password"
            autoFocus
            style={{
              width:'100%', padding:'10px 14px', fontSize:'14px',
              border:`1.5px solid ${error ? '#E24B4A' : '#ddddd8'}`,
              borderRadius:'8px', background: error ? '#FCEBEB' : '#fff',
              color:'#1a1a1a', fontFamily:'inherit', outline:'none',
              marginBottom:'8px', textAlign:'center', letterSpacing:'0.1em',
              transition:'border-color 0.2s, background 0.2s',
            }}
          />
          {error && (
            <div style={{ fontSize:'11px', color:'#A32D2D', marginBottom:'10px' }}>
              Incorrect password. Please try again.
            </div>
          )}
          <button type="submit" style={{
            width:'100%', padding:'10px', fontSize:'13px', fontWeight:600,
            borderRadius:'8px', border:'none', background:'#2E7D6B',
            color:'#fff', cursor:'pointer', fontFamily:'inherit', marginTop:'4px',
          }}>
            Enter →
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Assessment form ───────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [date, setDate] = useState('')
  const [answers, setAnswers] = useState(Array(20).fill(null).map(() => ({ a:'', b:'' })))
  const [errors, setErrors] = useState(Array(20).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(1)

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  function handleA(i, val) {
    const v = parseInt(val)
    const next = [...answers]
    next[i] = (!isNaN(v) && v>=0 && v<=3) ? { a:String(v), b:String(3-v) } : { ...next[i], a:val }
    setAnswers(next)
    const nextE = [...errors]
    const av2=parseInt(next[i].a), bv2=parseInt(next[i].b)
    nextE[i] = (!isNaN(av2)&&!isNaN(bv2)&&av2+bv2!==3) ? `Must total 3 (currently ${av2+bv2})` : null
    setErrors(nextE)
  }

  function handleB(i, val) {
    const v = parseInt(val)
    const next = [...answers]
    next[i] = (!isNaN(v) && v>=0 && v<=3) ? { a:String(3-v), b:String(v) } : { ...next[i], b:val }
    setAnswers(next)
    const nextE = [...errors]
    const av2=parseInt(next[i].a), bv2=parseInt(next[i].b)
    nextE[i] = (!isNaN(av2)&&!isNaN(bv2)&&av2+bv2!==3) ? `Must total 3 (currently ${av2+bv2})` : null
    setErrors(nextE)
  }

  async function calculate() {
    let valid = true
    const nextE = [...errors]
    for (let i=0; i<20; i++) {
      const av=parseInt(answers[i].a), bv=parseInt(answers[i].b)
      if (isNaN(av)||isNaN(bv)) { nextE[i]='Both values required'; valid=false }
      else if (av+bv!==3) { nextE[i]='Must total 3'; valid=false }
    }
    setErrors(nextE)
    if (!valid) { window.scrollTo({ top:0, behavior:'smooth' }); return }
    if (!name.trim()) { alert('Please enter your name.'); return }
    if (!department) { alert('Please select your department.'); return }

    let cScore=0, oScore=0
    for (let i=0; i<20; i++) {
      const av=parseInt(answers[i].a), bv=parseInt(answers[i].b)
      if (ITEM_MAP[i].a==='C') cScore+=av; else oScore+=av
      if (ITEM_MAP[i].b==='C') cScore+=bv; else oScore+=bv
    }
    const { style, diff } = classifyScore(cScore, oScore)
    const subType = getSubType(style, diff)
    setResult({ cScore, oScore, diff, style, subType })

    setSubmitting(true)
    const reportDate = date || new Date().toLocaleDateString('en-GB',{ day:'numeric', month:'long', year:'numeric' })
    await saveToSheets({
      name: name.trim(), email: email.trim(), department: department, date: reportDate,
      conserver_score: cScore, originator_score: oScore, difference: diff,
      style: style.charAt(0).toUpperCase()+style.slice(1),
      sub_type: NARRATIVES[style][subType].label,
      submitted_at: new Date().toISOString(),
      ...Object.fromEntries(answers.map((a,i) => [`q${i+1}_a`, a.a])),
      ...Object.fromEntries(answers.map((a,i) => [`q${i+1}_b`, a.b])),
    })
    setSubmitting(false)
    setStep(2)
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  function reset() {
    setAnswers(Array(20).fill(null).map(()=>({ a:'', b:'' })))
    setErrors(Array(20).fill(null))
    setName(''); setEmail(''); setDepartment(''); setDate('')
    setResult(null); setStep(1)
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  const reportDate = date || new Date().toLocaleDateString('en-GB',{ day:'numeric', month:'long', year:'numeric' })

  if (step===2 && result) {
    return <Report name={name} date={reportDate} department={department} result={result} answers={answers} onReset={reset} />
  }

  const inp = { width:'100%', padding:'8px 12px', fontSize:'13px', border:'1px solid #ddddd8', borderRadius:'8px', background:'#fff', color:'#1a1a1a', fontFamily:'inherit', outline:'none' }
  const numInp = (err,ok) => ({ width:'56px', padding:'6px 8px', textAlign:'center', fontSize:'13px', border:`1px solid ${err?'#E24B4A':ok?GREEN:'#ddddd8'}`, borderRadius:'8px', background:err?RED_LIGHT:ok?GREEN_LIGHT:'#fff', color:'#1a1a1a', fontFamily:'inherit', outline:'none' })

  return (
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'32px 20px 64px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
        <div style={{ width:'42px', height:'42px', background:GOLD_LIGHT, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={GOLD}><path d="M12 2L8.5 7.5H3l4.5 4-1.7 6L12 14.5l6.2 3-1.7-6 4.5-4h-5.5z"/></svg>
        </div>
        <div>
          <div style={{ fontSize:'18px', fontWeight:500, fontFamily:'Georgia,serif' }}>Change Style Indicator Assessment</div>
          <div style={{ fontSize:'11px', color:'#888' }}>Assessment · Your full report appears instantly on screen</div>
        </div>
      </div>

      <div style={{ background:'#fff', border:'0.5px solid #e0e0da', borderRadius:'12px', padding:'24px 28px', marginBottom:'16px' }}>
        <div style={{ background:GRAY_LIGHT, borderRadius:'8px', padding:'12px 14px', marginBottom:'20px', fontSize:'12px', color:'#555', lineHeight:1.7 }}>
          Distribute <strong>3 points</strong> across each pair — A and B must always total exactly 3. Entering A automatically fills B.
          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginTop:'6px' }}>
            {[['0','Almost never'],['1','Sometimes'],['2','Often'],['3','Almost always']].map(([v,l]) => (
              <span key={v} style={{ fontSize:'11px' }}><strong>{v}</strong> = {l}</span>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
          {[['Full name *', name, setName, '', 'text'],
            ['Email (optional)', email, setEmail, '', 'email']].map(([label, val, setter, ph, type]) => (
            <div key={label}>
              <label style={{ display:'block', fontSize:'11px', color:'#666', marginBottom:'4px', fontWeight:500 }}>{label}</label>
              <input type={type} style={inp} value={val} onChange={e => setter(e.target.value)} placeholder={ph} />
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
          <div>
            <label style={{ display:'block', fontSize:'11px', color:'#666', marginBottom:'4px', fontWeight:500 }}>Department *</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              style={{ ...inp, color: department ? '#1a1a1a' : '#999', cursor:'pointer' }}
            >
              <option value="" disabled>Select your department</option>
              {['BCS','NETS Tech','NETS','NETS Solutions','Corporate Functions'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:'11px', color:'#666', marginBottom:'4px', fontWeight:500 }}>Date</label>
            <input type="text" style={inp} value={date} onChange={e => setDate(e.target.value)} placeholder="" />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'24px 1fr 60px 60px', gap:'8px', alignItems:'center', fontSize:'10px', color:'#888', fontWeight:600, paddingBottom:'8px', borderBottom:'1px solid #e8e8e4', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
          <span>#</span><span>Statement</span><span style={{ textAlign:'center' }}>A</span><span style={{ textAlign:'center' }}>B</span>
        </div>

        {QUESTIONS.map((q,i) => {
          const av=parseInt(answers[i].a), bv=parseInt(answers[i].b)
          const ok=!isNaN(av)&&!isNaN(bv)&&av+bv===3
          const err=errors[i]
          return (
            <div key={i}>
              <div style={{ display:'grid', gridTemplateColumns:'24px 1fr 60px 60px', gap:'8px', alignItems:'center', padding:'8px 0', borderBottom:'0.5px solid #f0f0ec' }}>
                <span style={{ fontSize:'11px', color:'#bbb', fontWeight:600 }}>{i+1}</span>
                <div>
                  <div style={{ fontSize:'12px', marginBottom:'3px' }}><span style={{ fontSize:'10px', fontWeight:600, color:'#bbb', marginRight:'4px' }}>A</span>{q[0]}</div>
                  <div style={{ fontSize:'12px' }}><span style={{ fontSize:'10px', fontWeight:600, color:'#bbb', marginRight:'4px' }}>B</span>{q[1]}</div>
                </div>
                <input type="number" min="0" max="3" value={answers[i].a} onChange={e => handleA(i,e.target.value)} style={numInp(err,ok)} />
                <input type="number" min="0" max="3" value={answers[i].b} onChange={e => handleB(i,e.target.value)} style={numInp(err,ok)} />
              </div>
              {err && <div style={{ fontSize:'10px', color:RED, padding:'2px 0 4px 32px' }}>{err}</div>}
            </div>
          )
        })}

        <div style={{ display:'flex', gap:'10px', marginTop:'20px', flexWrap:'wrap', alignItems:'center' }}>
          <button onClick={calculate} disabled={submitting} style={{ padding:'10px 24px', fontSize:'13px', borderRadius:'8px', border:'1px solid #2E7D6B', background:'#2E7D6B', color:'#fff', cursor:submitting?'not-allowed':'pointer', fontFamily:'inherit', fontWeight:600, opacity:submitting?0.7:1 }}>
            {submitting ? 'Saving...' : 'See my results →'}
          </button>
          <button onClick={reset} style={{ padding:'10px 16px', fontSize:'13px', borderRadius:'8px', border:'1px solid #ddddd8', background:'transparent', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>Reset</button>
        </div>
        <div style={{ fontSize:'11px', color:'#aaa', marginTop:'8px' }}>Your full report appears immediately on screen. Use "Print / Save as PDF" to keep a copy.</div>
      </div>
    </div>
  )
}
