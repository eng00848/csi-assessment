import { NARRATIVES, STYLE_INFO, TIPS, WORKING_WITH, QUESTIONS } from './data.js'

export function getSubType(style, diff) {
if (style === 'pragmatist') {
  if (diff <= 4) return 'strong'
  if (diff <= 7) return 'moderate'
  return 'mild'
}
  if (diff <= 16) return 'mild'
  if (diff <= 29) return 'moderate'
  return 'strong'
}

export function classifyScore(cScore, oScore) {
  const diff = Math.abs(cScore - oScore)
  if (diff <= 9) return { style: 'pragmatist', diff }
  if (cScore > oScore) return { style: 'conserver', diff }
  return { style: 'originator', diff }
}

export function continuumPct(style, diff, cScore, oScore) {
  function diffToPct(d) {
    const ticks = [0, 5, 9, 17, 30, 60]
    const positions = [0, 10, 20, 30, 40, 50]
    for (let i = 0; i < ticks.length - 1; i++) {
      if (d <= ticks[i + 1]) {
        const range = ticks[i + 1] - ticks[i]
        return positions[i] + ((d - ticks[i]) / range) * (positions[i + 1] - positions[i])
      }
    }
    return 50
  }
  if (cScore > oScore) return 50 - diffToPct(diff)
  if (oScore > cScore) return 50 + diffToPct(diff)
  return 50
}
  // Marker position depends on which side of center the scores lean
  if (cScore > oScore) return 50 - diffToPct(diff)
  if (oScore > cScore) return 50 + diffToPct(diff)
  return 50
}

export function buildReportHTML(name, date, cScore, oScore, scores) {
  const { style, diff } = classifyScore(cScore, oScore)
  const subType = getSubType(style, diff)
  const narr = NARRATIVES[style][subType]
  const info = STYLE_INFO[style]
  const tips = TIPS[style]
  const work = WORKING_WITH[style]
  const pct = continuumPct(style, diff)
  const styleLabel = style.charAt(0).toUpperCase() + style.slice(1)
  const ac = info.color
  const al = info.light
  const at = info.textColor
  const BLUE = '#185FA5', GOLD = '#C8860A', GREEN = '#3B6D11'
  const otherStyles = ['conserver','pragmatist','originator'].filter(s => s !== style)

  const li = arr => arr.map(x => `<li>${x}</li>`).join('')
  const chips = arr => arr.map(x => `<span class="chip">${x}</span>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CSI Report — ${name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;color:#1a1a1a;background:#fff;font-size:12px;line-height:1.65}
.page{width:210mm;min-height:297mm;padding:16mm 18mm;page-break-after:always;position:relative}
.page:last-child{page-break-after:avoid}
.cover{display:flex;flex-direction:column;justify-content:space-between}
.cover-bar{height:6px;background:linear-gradient(90deg,${ac} 0%,${ac} 60%,#b0b0a8 60%,#b0b0a8 80%,${ac}80 80%)}
.cover-logo{margin:32px 0 0;display:flex;align-items:center;gap:14px}
.logo-mark{width:52px;height:52px;background:${al};border-radius:10px;display:flex;align-items:center;justify-content:center}
.logo-mark svg{fill:${ac}}
.logo-text{font-family:'DM Serif Display',serif;font-size:26px;color:#1a1a1a;line-height:1.1}
.logo-sub{font-size:10px;color:#888;margin-top:2px;letter-spacing:0.04em}
.cover-center{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 0}
.cover-badge{display:inline-block;background:${al};color:${at};font-size:10px;font-weight:500;padding:4px 14px;border-radius:99px;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:18px;width:fit-content}
.cover-name{font-family:'DM Serif Display',serif;font-size:42px;color:#1a1a1a;line-height:1.1;margin-bottom:8px}
.cover-date{font-size:13px;color:#888}
.cover-footer{background:#4a4a46;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
.cover-footer-text{font-family:'DM Serif Display',serif;font-size:15px;color:#fff}
.cover-footer-sub{font-size:10px;color:#aaa;margin-top:2px}
.page-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid #e8e8e4;margin-bottom:18px}
.page-header-title{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:#888}
.page-header-name{font-size:10px;color:#888}
.section-title{font-size:18px;font-weight:400;font-family:'DM Serif Display',serif;color:${ac};margin-bottom:4px}
.section-sub{font-size:12px;color:#555;margin-bottom:16px}
.label{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin-bottom:6px}
p{margin-bottom:10px;color:#2a2a2a}
.score-row{display:flex;gap:10px;margin:14px 0}
.sc{flex:1;border:1px solid #e8e8e4;border-radius:10px;padding:12px 16px;text-align:center}
.sc .n{font-family:'DM Serif Display',serif;font-size:34px}
.sc .l{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px}
.sc.c .n{color:${BLUE}}.sc.o .n{color:${GOLD}}.sc.d .n{color:${ac}}
.cont-wrap{margin:16px 0 20px}
.cont-labels{display:flex;justify-content:space-between;font-size:10px;color:#888;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.06em}
.cont-outer{height:10px;background:#f0f0ec;border-radius:99px;position:relative}
.cont-center{position:absolute;top:0;bottom:0;left:33.3%;right:33.3%;background:#ddddd8}
.cont-dot{position:absolute;top:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:${ac};border:3px solid #fff;left:${pct}%}
.cont-ticks{display:flex;justify-content:space-between;padding-top:4px}
.cont-tick{text-align:center;flex:1;font-size:9px;color:#aaa}
.subtype-box{background:${al};border-left:3px solid ${ac};border-radius:0 8px 8px 0;padding:12px 16px;margin:14px 0}
.subtype-box .st-label{font-size:11px;font-weight:500;color:${ac};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px}
.subtype-box p{margin:0;font-size:12px;color:#2a2a2a;line-height:1.65}
.sw-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0}
.sw-card{border-radius:8px;padding:12px 14px}
.sw-card.s{background:#EAF3DE}.sw-card.w{background:#FCEBEB}
.sw-card .sw-title{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px}
.sw-card.s .sw-title{color:${GREEN}}.sw-card.w .sw-title{color:#A32D2D}
.sw-card ul{padding-left:14px}
.sw-card li{font-size:11px;line-height:1.6;margin-bottom:2px;color:#2a2a2a}
.dim-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
.dim-card{border:1px solid #e8e8e4;border-radius:8px;padding:10px 12px}
.dim-card .dim-title{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#888;margin-bottom:6px}
.dim-bar-wrap{height:5px;background:#f0f0ec;border-radius:99px;overflow:hidden;margin-bottom:8px}
.dim-bar{height:100%;border-radius:99px;background:${ac}}
.dim-card ul{padding-left:12px}
.dim-card li{font-size:10px;line-height:1.55;margin-bottom:1px;color:#444}
.perc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
.perc-card{border:1px solid #e8e8e4;border-radius:8px;padding:10px 12px}
.perc-title{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e8e8e4}
.chip{display:inline-block;font-size:10px;padding:2px 8px;border-radius:99px;margin:2px 2px 2px 0;background:#f0f0ec;color:#555}
.tips-list{margin:10px 0}
.tip-row{display:flex;gap:10px;padding:7px 0;border-bottom:0.5px solid #f0f0ec;align-items:flex-start}
.tip-row:last-child{border-bottom:none}
.tip-num{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:${al};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:500;color:${at}}
.tip-text{font-size:11px;line-height:1.6;color:#2a2a2a}
.work-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
.work-card{border:1px solid #e8e8e4;border-radius:8px;padding:10px 12px}
.work-card .wc-title{font-size:10px;font-weight:500;color:${ac};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px}
.work-card ul{padding-left:12px}
.work-card li{font-size:11px;line-height:1.6;margin-bottom:2px;color:#2a2a2a}
.resp-table{width:100%;border-collapse:collapse;font-size:10px}
.resp-table th{text-align:left;padding:5px 6px;font-weight:500;color:#888;border-bottom:1px solid #e8e8e4;text-transform:uppercase;letter-spacing:0.04em;font-size:9px}
.resp-table td{padding:5px 6px;border-bottom:0.5px solid #f4f4f0;vertical-align:top}
.resp-table tr:last-child td{border-bottom:none}
.score-chip{display:inline-block;width:18px;height:18px;border-radius:50%;background:#f0f0ec;text-align:center;line-height:18px;font-size:10px;font-weight:500}
.score-chip.hi{background:${ac};color:#fff}
.footer{position:absolute;bottom:12mm;left:18mm;right:18mm;display:flex;justify-content:space-between;font-size:9px;color:#bbb;border-top:0.5px solid #e8e8e4;padding-top:6px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{page-break-after:always}.page:last-child{page-break-after:avoid}}
</style>
</head>
<body>

<div class="page cover">
  <div class="cover-bar"></div>
  <div class="cover-logo">
    <div class="logo-mark"><svg width="28" height="28" viewBox="0 0 24 24"><path d="M12 2L8.5 7.5H3l4.5 4-1.7 6L12 14.5l6.2 3-1.7-6 4.5-4h-5.5z"/></svg></div>
    <div><div class="logo-text">Change Style Indicator</div><div class="logo-sub">IMPROVE CHANGE EFFECTIVENESS</div></div>
  </div>
  <div class="cover-center">
    <div class="cover-badge">${narr.label}</div>
    <div class="cover-name">${name}</div>
    <div class="cover-date">${date}</div>
  </div>
  <div class="cover-footer">
    <div><div class="cover-footer-text">Discovery Learning Inc.</div><div class="cover-footer-sub">© 2014 Discovery Learning, Inc. All Rights Reserved.</div></div>
    <div style="text-align:right"><div style="color:#fff;font-size:11px">Conserver · Pragmatist · Originator</div><div style="color:#aaa;font-size:9px;margin-top:2px">Change Style Continuum</div></div>
  </div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">Introduction</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">Introduction to Change</div>
  <p>Change is a natural and powerful force — a constant and continuing phenomenon. It may occur in regular, predictable cycles, erupt abruptly and unexpectedly, or develop as an anticipated but highly unpredictable event. Change can create a crisis, and change may be the solution to a crisis. One thing is certain: everyone believes their response to change is justified.</p>
  <div class="section-title" style="margin-top:16px">Change Style Preferences</div>
  <p>Regardless of how we experience change, it is here to stay. By understanding our change preferences and those of others, we can become better able to lead, manage, and support others through the inevitable changes in our lives and organizations.</p>
  <p>Our research shows that people demonstrate one of three preferences when creating or reacting to change. The Change Style Indicator (CSI) measures your preferred style when faced with change, placing you on a continuum ranging from a <strong>Conserver</strong> style to an <strong>Originator</strong> style, with the <strong>Pragmatist</strong> style occupying the middle range.</p>
  <p>Your CSI score does not indicate your effectiveness at using your preferred style. Awareness of change preference allows you to choose from a range of responses. There is no right or wrong, "better" or "worse" style. The key is in understanding your preference and knowing when to adapt it for the situation.</p>
  <div class="section-title" style="margin-top:16px">Why Change Preferences Matter</div>
  <p>By understanding these change style preferences you are better able to:</p>
  <ul style="padding-left:18px;margin-bottom:10px">${["Manage your response to change and its consequences, both as a leader and a support person","Understand the sources of emotion and conflict associated with change","Recognize and optimize the contributions that each change style offers to your team","Increase productivity through more effective response to style differences","Respond to others in a way that enhances collaboration and encourages innovation"].map(x=>`<li style="margin-bottom:4px;font-size:12px">${x}</li>`).join('')}</ul>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 2</span></div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">Change Preferences</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">The Change Style Continuum</div>
  <p>The CSI places you on a continuum ranging from a Conserver style to an Originator style. The closer you are to one end, the stronger your preference. The closer to the center, the stronger the Pragmatist preference.</p>
  <div style="border:1px solid #e8e8e4;border-radius:10px;padding:14px 18px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:500;color:#555;margin-bottom:10px"><span style="color:${BLUE}">Conserver</span><span style="color:${GREEN}">Pragmatist</span><span style="color:${GOLD}">Originator</span></div>
    <div style="height:10px;background:#f0f0ec;border-radius:99px;position:relative"><div style="position:absolute;top:0;bottom:0;left:33.3%;right:33.3%;background:#ddddd8"></div><div style="position:absolute;top:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:${ac};border:3px solid #fff;left:${pct}%"></div></div>
    <div style="display:flex;justify-content:space-between;padding-top:4px">${["60","30","17","9","5","0","5","9","17","30","60"].map(t=>`<div style="text-align:center;flex:1;font-size:9px;color:#aaa">${t}</div>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;font-size:9px;color:#bbb;padding-top:2px"><span>25%</span><span>50%</span><span>25%</span></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:16px 0">
    ${[['conserver',BLUE,'Prefer the known to the unknown. Favour gradual, incremental change that improves efficiency while minimizing chaos. Work within existing rules and policies.'],['pragmatist',GREEN,'Prefer to explore the current situation objectively. Advocate for change that is practical and reflective of real demands. Natural mediators between Conservers and Originators.'],['originator',GOLD,'Prefer a faster and more radical approach to change. Challenge existing rules, politics, and structures. Comfortable with ambiguity and driven by future possibilities.']].map(([s,c,d])=>`<div style="border:1px solid #e8e8e4;border-radius:8px;padding:10px 12px"><div style="font-size:11px;font-weight:500;color:${c};margin-bottom:6px">${s.toUpperCase()}</div><div style="font-size:10px;line-height:1.6;color:#444">${d}</div></div>`).join('')}
  </div>
  <div style="background:#f7f7f4;border-radius:8px;padding:12px 14px;font-size:11px;color:#555;line-height:1.65"><strong style="color:#2a2a2a">A note on scoring:</strong> The Pragmatist style represents the middle 50% of the general population (diff 0–9). Conservers and Originators each occupy 25% at either end. Within each extreme style, scores are classified as Mild (diff 10–16), Moderate (diff 17–29), or Strong (diff 30–60).</div>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 3</span></div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">Your Change Style Preference</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">Your Result: ${narr.label}</div>
  <div class="score-row">
    <div class="sc c"><div class="n">${cScore}</div><div class="l">Conserver score</div></div>
    <div class="sc d"><div class="n">${diff}</div><div class="l">Difference</div></div>
    <div class="sc o"><div class="n">${oScore}</div><div class="l">Originator score</div></div>
  </div>
  <div class="cont-wrap">
    <div class="cont-labels"><span>Conserver</span><span>Pragmatist</span><span>Originator</span></div>
    <div class="cont-outer"><div class="cont-center"></div><div class="cont-dot"></div></div>
    <div class="cont-ticks">${["60","30","17","9","5","0","5","9","17","30","60"].map(t=>`<div class="cont-tick">${t}</div>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;font-size:9px;color:#bbb;padding-top:2px"><span>25%</span><span>50%</span><span>25%</span></div>
  </div>
  <div class="subtype-box"><div class="st-label">${narr.label} — what this means for you</div><p>${narr.intro}</p></div>
  <div class="sw-grid">
    <div class="sw-card s"><div class="sw-title">Your key strengths</div><ul>${li(narr.strengths)}</ul></div>
    <div class="sw-card w"><div class="sw-title">Potential challenges to watch</div><ul>${li(narr.challenges)}</ul></div>
  </div>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 4</span></div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">${styleLabel} Style Profile</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">How Your ${styleLabel} Style Shows Up</div>
  <p class="section-sub">Across five key dimensions, here is how your preferences are most likely to manifest in the workplace.</p>
  <div class="dim-grid">
    ${[['When facing change',info.facing,82],['When contributing to the organization',info.contributing,78],['When leading',info.leading,75],['When supporting innovation',info.innovation,85]].map(([title,items,w])=>`<div class="dim-card"><div class="dim-title">${title}</div><div class="dim-bar-wrap"><div class="dim-bar" style="width:${w}%"></div></div><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('')}
  </div>
  <div class="dim-card" style="margin-top:0;border:1px solid #e8e8e4;border-radius:8px;padding:10px 12px">
    <div class="dim-title">When collaborating</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${info.collaborating.map(x=>`<span style="font-size:10px;padding:3px 10px;border-radius:99px;background:${al};color:${at}">${x}</span>`).join('')}</div>
  </div>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 5</span></div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">Common Perceptions</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">How Others See You — and How You See Them</div>
  <p>Understanding how different styles perceive one another is key to reducing conflict and improving collaboration. These are common patterns — not judgments — and awareness is the first step to bridging style differences.</p>
  <div class="perc-grid">
    ${otherStyles.map(os=>{const ol=os.charAt(0).toUpperCase()+os.slice(1);const oc=STYLE_INFO[os].color;const theySeeMe=info.perceivedBy[os]||[];const iSeeThem=info.perceives[os]||[];return`<div class="perc-card"><div class="perc-title" style="color:${oc}">${ol}s may see you as</div><div>${chips(theySeeMe)}</div><div style="height:1px;background:#f0f0ec;margin:8px 0"></div><div class="perc-title" style="color:${ac}">You may see ${ol}s as</div><div>${chips(iSeeThem)}</div></div>`;}).join('')}
  </div>
  <div style="background:#f7f7f4;border-radius:8px;padding:12px 14px;margin-top:14px"><div style="font-size:11px;font-weight:500;color:#2a2a2a;margin-bottom:6px">Remember</div><p style="font-size:11px;margin:0;color:#555">These perceptions are natural by-products of style differences — not character flaws. Awareness allows you to reframe your reactions and engage more productively with people whose styles differ from yours.</p></div>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 6</span></div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">Tips for Increasing Effectiveness</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">Tips Tailored to ${styleLabel}s</div>
  <p class="section-sub">These tips are specific to your ${narr.label} profile. Apply them when you notice your preferred style may be limiting your effectiveness.</p>
  <div style="margin-bottom:14px"><div class="label">General tips for all styles</div><div class="tips-list">${TIPS.general.map((t,i)=>`<div class="tip-row"><div class="tip-num">${i+1}</div><div class="tip-text">${t}</div></div>`).join('')}</div></div>
  <div><div class="label">Specific tips for ${styleLabel}s</div><div class="tips-list">${tips.map((t,i)=>`<div class="tip-row"><div class="tip-num">${i+1}</div><div class="tip-text">${t}</div></div>`).join('')}</div></div>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 7</span></div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">Working With ${styleLabel}s</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">How to Work Effectively with ${styleLabel}s</div>
  <p>Share this page with colleagues, managers, and direct reports so they can understand how to communicate and collaborate most effectively with you.</p>
  <div class="work-grid">
    <div class="work-card"><div class="wc-title">Preferred work environment</div><ul>${work.env.map(x=>`<li>${x}</li>`).join('')}</ul></div>
    <div class="work-card"><div class="wc-title">Communication tips</div><ul>${work.comms.map(x=>`<li>${x}</li>`).join('')}</ul></div>
  </div>
  <div class="section-title" style="margin-top:20px">All Three Change Styles — Quick Reference</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:12px">
    ${[['conserver',BLUE,'Prefers gradual, incremental change. Values structure, rules, and proven methods. Reliable and detail-oriented.'],['pragmatist',GREEN,'Prefers practical, outcome-driven change. Flexible and adaptable. Natural mediator between the other two styles.'],['originator',GOLD,'Prefers fast, radical change. Challenges conventions and thrives on novelty. Visionary and energized by ambiguity.']].map(([s,c,d])=>`<div style="border:1px solid #e8e8e4;border-radius:8px;padding:10px 12px"><div style="font-size:11px;font-weight:500;color:${c};margin-bottom:6px">${s.charAt(0).toUpperCase()+s.slice(1).toUpperCase()}</div><div style="font-size:10px;color:#444;line-height:1.6">${d}</div></div>`).join('')}
  </div>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 8</span></div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">Potential Pitfalls</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">Potential Pitfalls of Each Style</div>
  <p>Change styles can be a source of great strength. However, when overused they can become derailers. Below are common challenges faced by each style — including your own.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:14px">
    <div><div style="font-size:11px;font-weight:500;color:${BLUE};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e8e8e4">Conserver pitfalls</div><ul style="padding-left:14px">${["May be rigid in thought and action","May discourage innovation by promoting existing processes","May not see the broader context beyond present details","May delay completion due to perfectionism","May appear unyielding and set in their ways","May over-focus on irrelevant details and inconsistencies"].map(x=>`<li style="font-size:10px;line-height:1.6;margin-bottom:3px;color:#444">${x}</li>`).join('')}</ul></div>
    <div><div style="font-size:11px;font-weight:500;color:${GREEN};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e8e8e4">Pragmatist pitfalls</div><ul style="padding-left:14px">${["May over-focus on building consensus","May not adequately promote personal ideas","May try to please too many people at once","May be indecisive or take too long to act","May appear to flip-flop on issues","May negotiate compromise that satisfies no one"].map(x=>`<li style="font-size:10px;line-height:1.6;margin-bottom:3px;color:#444">${x}</li>`).join('')}</ul></div>
    <div><div style="font-size:11px;font-weight:500;color:${GOLD};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e8e8e4">Originator pitfalls</div><ul style="padding-left:14px">${["May create significant chaos and lack of discipline","Can become lost in theory, ignoring current realities","Often underestimates the short-term human impact of change","Frequently moves to new ideas before completing existing ones","May not adapt well to new policies once established","May overlook the value of engaging key stakeholders"].map(x=>`<li style="font-size:10px;line-height:1.6;margin-bottom:3px;color:#444">${x}</li>`).join('')}</ul></div>
  </div>
  <div style="background:${al};border-radius:8px;padding:12px 14px;margin-top:16px"><div style="font-size:11px;font-weight:500;color:${at};margin-bottom:4px">Your highlighted pitfalls as a ${narr.label}</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${narr.challenges.map(x=>`<span style="font-size:10px;padding:3px 10px;border-radius:99px;background:#fff;color:${at};border:0.5px solid ${ac}40">${x}</span>`).join('')}</div></div>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 9</span></div>
</div>

<div class="page">
  <div class="page-header"><div class="page-header-title">Item Responses</div><div class="page-header-name">${name} · ${date}</div></div>
  <div class="section-title">Your Responses — All 20 Items</div>
  <p style="margin-bottom:12px">Each pair sums to 3. Filled circles indicate where you assigned the higher weight.</p>
  <table class="resp-table">
    <thead><tr><th>#</th><th>Statement A</th><th style="text-align:center">A</th><th>Statement B</th><th style="text-align:center">B</th></tr></thead>
    <tbody>${scores.map((s,i)=>`<tr><td style="color:#aaa;font-weight:500;width:20px">${i+1}</td><td style="width:35%">${QUESTIONS[i][0]}</td><td style="text-align:center;width:28px"><span class="score-chip ${parseInt(s.a)>parseInt(s.b)?'hi':''}">${s.a}</span></td><td style="width:35%">${QUESTIONS[i][1]}</td><td style="text-align:center;width:28px"><span class="score-chip ${parseInt(s.b)>parseInt(s.a)?'hi':''}">${s.b}</span></td></tr>`).join('')}</tbody>
  </table>
  <div class="footer"><span>Change Style Indicator · ${name}</span><span>Page 10</span></div>
</div>

</body></html>`
}
