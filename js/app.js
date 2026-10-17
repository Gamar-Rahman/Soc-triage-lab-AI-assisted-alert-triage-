(() => {
  'use strict';
  const C = window.SOC_CORE;
  const cases = window.SOC_SCENARIOS.filter(C.validateCase);
  const STORE = 'evidencegraph-demo-v2';
  const nav = { tab: 'overview', filter: 'all', query: '', selected: cases[0]?.id, apiAvailable: false, modelEnabled: false, ai: {} };
  let saved = { cases: {}, audit: [] };
  try { const x = JSON.parse(localStorage.getItem(STORE) || '{}'); if (x && typeof x === 'object') saved = { cases: x.cases || {}, audit: x.audit || [] }; } catch (_) { /* clean state */ }
  try { if (localStorage.getItem('evidencegraph-theme') === 'light') document.documentElement.classList.add('light'); } catch (_) { /* nothing */ }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
  function store() { try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (_) { notify('Browser storage is unavailable. Decisions will be temporary.'); } }
  function sCase(c) {
    return saved.cases[c.id] || (saved.cases[c.id] = { note: '', decision: '', verified: [], gapAcknowledged: false });
  }
  function current() { return cases.find(x => x.id === nav.selected) || cases[0]; }
  function dateShort(value) { const d = new Date(value); return isNaN(d) ? String(value) : d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'UTC',hour12:false}) + ' UTC'; }
  function pill(level) { return `<span class="pill ${level.toLowerCase()}">${esc(level.toUpperCase())}</span>`; }
  function notify(message) { const e = document.getElementById('toast'); e.textContent = message; e.classList.add('visible'); window.clearTimeout(notify.timer); notify.timer = setTimeout(() => e.classList.remove('visible'), 3700); }
  function renderQueue() {
    const visible = cases.filter(c => (nav.filter === 'all' || C.level(C.scoreCase(c)) === nav.filter) && `${c.id} ${c.title} ${c.category}`.toLowerCase().includes(nav.query));
    document.getElementById('queue-count').textContent = String(visible.length).padStart(2,'0');
    document.getElementById('queue-list').innerHTML = visible.map(c => {
      const s = C.scoreCase(c), level = C.level(s), d = sCase(c).decision;
      return `<button class="queue-item ${c.id===nav.selected?'selected':''}" data-case="${esc(c.id)}" aria-pressed="${c.id===nav.selected}"><div class="queue-top"><span class="queue-id">${esc(c.id)}</span><span class="queue-score">${s}/100</span></div><div class="queue-title">${esc(c.title)}</div><div class="queue-bottom">${pill(level)}<span>${d ? '✓ ' + esc(d) : esc(c.category)}</span></div></button>`;
    }).join('') || '<div class="empty-state">No matching alerts.</div>';
    document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b.dataset.filter === nav.filter));
  }
  function renderMetrics() {
    const count = cases.length, high = cases.filter(c => C.level(C.scoreCase(c)) === 'High').length;
    const reviewed = cases.filter(c => !!sCase(c).decision).length;
    const sourceChecks = cases.reduce((sum,c) => sum + sCase(c).verified.length,0);
    document.getElementById('metrics').innerHTML = [
      ['ALERTS IN QUEUE',count,'Cases in lab','▦',''],['HIGH PRIORITY',high,'Illustrative severity','⚑','red'],['CASES REVIEWED',reviewed,`of ${count} demo cases`,'◉','teal'],['SOURCES VERIFIED',sourceChecks,'Raw records checked','⌁','']
    ].map(([label,num,suffix,icon,cls])=>`<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value ${cls}">${num}<span class="stat-suffix">${esc(suffix)}</span></div><span class="stat-icon">${icon}</span></div>`).join('');
  }
  function renderSummary(c) {
    const score = C.scoreCase(c), level = C.level(score), cov = C.coverageCase(c);
    document.getElementById('case-summary').innerHTML = `<div class="case-summary-top"><div><div class="case-kicker">CASE ${esc(c.id)} <span class="mid-dot">·</span> ${esc(c.category.toUpperCase())} SECURITY ALERT</div><h2 class="case-headline">${esc(c.title)}</h2><div class="case-meta">${pill(level)}<span>${esc(c.asset_criticality)} impact asset</span><span class="mid-dot">•</span><span>${esc(dateShort(c.timestamp))}</span><span class="mid-dot">•</span><span>Scenario / synthetic</span></div><p class="case-desc">${esc(c.summary)}</p></div><div class="score-badge"><div class="score-number ${level.toLowerCase()}-score">${score}<span style="font-size:15px;color:var(--faint)">/100</span></div><div class="score-caption">EXPLAINABLE RULE SCORE<br />NOT A PROBABILITY</div></div></div><div class="case-summary-bottom"><span>◈ &nbsp; <b>${esc(c.signals.length)} traceable risk factors</b></span><span>◫ &nbsp; <b>${cov.count}/${cov.total} evidence sources available</b></span><span>◷ &nbsp; ${cov.gaps.length ? `${cov.gaps.length} unresolved evidence gaps` : 'No documented gaps'}</span></div>`;
  }
  function sourceBtns(ids) { return ids.map(id=>`<button class="source-link" data-source="${esc(id)}" title="Open original source record">↗ ${esc(id)} raw</button>`).join(''); }
  function renderOverview(c) {
    const cov = C.coverageCase(c);
    return `<h2 class="section-title">Evidence-first case overview</h2><p class="section-description">Observed facts are separated from analyst inferences. Open any source tag to inspect the underlying event.</p><div class="facts-strip"><div class="fact-box"><div class="fact-label">IDENTITY</div><div class="fact-value">${esc(c.user)}</div></div><div class="fact-box"><div class="fact-label">ASSET</div><div class="fact-value">${esc(c.asset)}</div></div><div class="fact-box"><div class="fact-label">SOURCE / IP</div><div class="fact-value">${esc(c.source_ip)}</div></div></div><div class="subhead"><h3>Risk explanation</h3><span>10 base points + evidence weights · capped at 100</span></div>${c.signals.map(f=>`<article class="finding"><div class="finding-header"><div class="finding-label"><span class="number-circle">${esc(f.id)}</span>${esc(f.label)}<span class="fact-tag ${f.type==='inference'?'inference-tag':''}">${f.type==='observed'?'SOURCE FACT':'ANALYST INFERENCE'}</span></div><span class="risk-points">+${f.weight} pts</span></div><p>${esc(f.detail)}</p><div>${sourceBtns(f.source_ids)}</div></article>`).join('')}<div class="subhead"><h3>Suggested investigation path</h3><span>Analyst verifies every step</span></div><ul class="guidance-list">${c.next_steps.map((s,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div>${esc(s)}</div></li>`).join('')}</ul><div class="soft-warning"><strong>Evidence gap / limitations</strong>${cov.gaps.length ? cov.gaps.map(x=>esc(x)).join(' · ') : 'No missing streams listed. Source quality still requires analyst review.'}</div>`;
  }
  function renderGraph(c) {
    const nodes = c.entities || [], edges = c.edges || [];
    const pos = nodes.map((n,i)=>({ ...n, x: nodes.length===4 ? [135,330,530,330][i] : [110,345,570][i], y: nodes.length===4 ? [105,250,105,80][i] : [160,85,160][i] }));
    const byId = Object.fromEntries(pos.map(n=>[n.id,n]));
    const lines = edges.map(e=>{const a=byId[e.from],b=byId[e.to];if(!a||!b)return '';const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#24a8aa" stroke-opacity=".65" stroke-width="2" marker-end="url(#arr)"/><rect x="${mx-52}" y="${my-19}" width="104" height="18" rx="5" fill="var(--panel)" stroke="var(--border)"/><text x="${mx}" y="${my-7}" text-anchor="middle" font-size="10" fill="var(--muted)">${esc(e.label.slice(0,19))}</text>`;}).join('');
    const circles = pos.map(n=>`<g><circle cx="${n.x}" cy="${n.y}" r="36" fill="var(--panel)" stroke="${n.kind==='Identity'?'#21c2b6':n.kind==='Device'?'#68aefc':'#f9b85b'}" stroke-width="2"/><text x="${n.x}" y="${n.y-1}" text-anchor="middle" font-size="10" font-weight="750" fill="var(--text)">${esc(n.kind.slice(0,9))}</text><text x="${n.x}" y="${n.y+16}" text-anchor="middle" font-size="9" fill="var(--muted)">${esc(n.id)}</text><text x="${n.x}" y="${n.y+54}" text-anchor="middle" font-size="11" fill="var(--text)">${esc(n.label.length>25?n.label.slice(0,23)+'…':n.label)}</text></g>`).join('');
    return `<h2 class="section-title">Evidence relationship map</h2><p class="section-description">These relationships represent source-linked synthetic events, not inferred malware attribution.</p><div class="graph-board"><svg viewBox="0 0 680 340" role="img" aria-label="Entity relationship diagram"><defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#24a8aa"/></marker></defs>${lines}${circles}</svg></div><div class="graph-legend"><span><i class="legend-dot" style="background:var(--accent)"></i>Identity</span><span><i class="legend-dot" style="background:var(--blue)"></i>Device</span><span><i class="legend-dot" style="background:var(--amber)"></i>Other entities</span></div><div class="subhead"><h3>Evidence links</h3><span>Select an event to verify</span></div>${edges.map(e=>`<div class="coverage-row"><span>${esc(byId[e.from]?.label)} → ${esc(byId[e.to]?.label)} · ${esc(e.label)}</span>${sourceBtns([e.source_id])}</div>`).join('')}<div class="subhead"><h3>Candidate ATT&CK techniques</h3><span>Not proof of adversary behavior</span></div><p class="section-description">${c.mitre.length ? esc(c.mitre.join(' · ')) : 'No technique assigned for this benign example.'}</p>`;
  }
  function renderLogs(c) { const sc=sCase(c);return `<h2 class="section-title">Source records and verification</h2><p class="section-description">Read-only simulated events. Open a record and explicitly verify its fields before citing it in your decision.</p><div class="timeline">${c.events.map(e=>`<article class="event"><div class="event-time">${esc(dateShort(e.at))} · ${esc(e.source)}</div><h4>${esc(e.type)} ${sc.verified.includes(e.id)?'<span class="verified-badge">✓ Checked</span>':''}</h4><p>${esc(e.summary)}</p>${sourceBtns([e.id])}</article>`).join('')}</div><div class="subhead"><h3>Telemetry completeness</h3><span>${C.coverageCase(c).percent}% available</span></div><div class="progress-track"><div class="progress-fill" style="width:${C.coverageCase(c).percent}%"></div></div><div class="coverage-list">${c.coverage.map(item=>`<div class="coverage-row"><span>${esc(item.name)}</span><strong class="${item.status==='available'?'is-available':'is-missing'}">${item.status==='available'?'✓ Available':'! Missing'}</strong></div>`).join('')}</div>`; }
  function renderHandoff(c) { const sc = sCase(c);return `<h2 class="section-title">Editable escalation / disposition handoff</h2><p class="section-description">The report includes the score explanation, observed vs inferred claims, linked evidence, gaps, and the analyst's own rationale.</p><pre class="handoff-code">${esc(C.buildHandoff(c,sc.decision,sc.note,sc.verified))}</pre><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:13px"><button class="outline-button" data-copy-report>Copy Markdown</button><button class="outline-button" data-download-report>Download .md</button></div><div class="subhead"><h3>Local decision audit</h3><span>Stored in this browser only</span></div><div class="audit-list">${saved.audit.filter(x=>x.case_id===c.id).slice().reverse().map(x=>`<div>${esc(x.at)} · ${esc(x.action)} · ${esc(x.note)}</div>`).join('') || '<div>No dispositions recorded yet.</div>'}</div>`; }
  function renderWorkspace(c) {
    const renders={overview:renderOverview,graph:renderGraph,logs:renderLogs,handoff:renderHandoff};
    document.getElementById('workspace-body').innerHTML=(renders[nav.tab] || renderOverview)(c);
    document.querySelectorAll('.tab').forEach(b=>{ const active=b.dataset.tab===nav.tab;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active)); });
  }
  function renderDecision(c) {
    const sc=sCase(c), cov=C.coverageCase(c), score=C.scoreCase(c), live=nav.apiAvailable;
    const ai=nav.ai[c.id];
    document.getElementById('decision-panel').innerHTML=`<div class="panel-topline"><h2>Analyst decision</h2><span class="status-dot">● HUMAN-IN-THE-LOOP</span></div><hr /><div class="micro-label">OFFLINE RULE-BASED ASSESSMENT</div><div class="suggestion"><strong>↗ ${esc(c.recommendation)}</strong><p>${esc(c.rationale)}</p></div><p class="tiny-note">This recommendation is scenario-authored. It is not generated by an LLM.</p><hr /><div class="micro-label">OPTIONAL LIVE MODEL</div><button class="api-button" data-ai ${!live||!nav.modelEnabled?'disabled':''}>✦ Generate evidence-cited brief</button><p class="tiny-note">${live ? nav.modelEnabled?'Server-side model available; review output independently.':'Backend is running. Configure OPENAI_API_KEY to enable.' : 'Offline mode. To use an LLM, launch the optional API backend with a server-side key.'}</p>${ai?`<div class="ai-analysis"><strong>Model-generated brief <span class="model-tag">UNVERIFIED</span></strong><p>${esc(ai.summary)}</p><div>${sourceBtns(ai.cited_event_ids||[])}</div><p><b>Uncertainty:</b> ${esc((ai.uncertainties||[]).join(' · '))}</p></div>`:''}<hr /><div class="micro-label">YOUR DISPOSITION</div><div class="decision-radio-list">${[['escalate','Escalate to IR / Tier 2'],['investigate','Request more evidence'],['close','Close as benign']].map(([v,label])=>`<label class="decision-radio"><input type="radio" name="action" value="${v}" ${sc.proposed===v || (!sc.proposed&&sc.decision===v)?'checked':''}/>${label}</label>`).join('')}</div><hr /><label class="input-label" for="analyst-note">Analyst reasoning / case notes</label><textarea id="analyst-note" class="decision-note" placeholder="What did you verify? Why are you choosing this action?">${esc(sc.note)}</textarea>${cov.gaps.length?`<label class="check-line"><input id="gap-ack" type="checkbox" ${sc.gapAcknowledged?'checked':''}/><span>I reviewed the missing evidence (${esc(cov.gaps.join(', '))}) and understand that it limits the conclusion.</span></label>`:''}<button class="decision-button" data-save-decision>✓ &nbsp; Record analyst decision</button><p class="tiny-note">No network remediation is executed. ${score >=75?'High-risk closures require inspection of 2 source records.':''} Decisions and notes stay in this browser.</p>${sc.decision?`<div class="outcome-box"><strong>✓ Recorded: ${esc(sc.decision.toUpperCase())}</strong><p>${esc(sc.lastAt || 'Stored locally')} · Human-approved disposition</p>${sc.decision===c.recommendation?'<p>Matches training scenario recommendation; independently confirm supporting evidence.</p>':'<p>Analyst override logged. In a real SOC, request supervisory review when applicable.</p>'}</div>`:''}`;
  }
  function render() { const c=current(); if(!c)return;renderQueue();renderMetrics();renderSummary(c);renderWorkspace(c);renderDecision(c); }
  function sourceDialog(id) {
    const c=current(), ev=c.events.find(e=>e.id===id);if(!ev)return;
    const sc=sCase(c), modal=document.getElementById('source-modal');modal.classList.remove('hidden');
    document.getElementById('modal-body').innerHTML=`<div class="modal-info"><strong>${esc(ev.source)} · ${esc(ev.type)}</strong><br/>${esc(ev.at)} · Event ID: ${esc(ev.id)}<br/>${esc(ev.summary)}</div><div class="micro-label">ORIGINAL SYNTHETIC EVENT FIELDS</div><pre class="raw-code"></pre><label class="check-line"><input id="verified-event" type="checkbox" ${sc.verified.includes(id)?'checked':''}/><span>I inspected this source record. Checking it does not prove the event is benign or malicious.</span></label>`;
    document.querySelector('#modal-body pre').textContent=JSON.stringify(ev.raw,null,2);
    const checkbox=document.getElementById('verified-event');checkbox.onchange=()=>{sc.verified=checkbox.checked ? Array.from(new Set([...sc.verified,id])) : sc.verified.filter(x=>x!==id);store();render();notify(checkbox.checked?`Source ${id} marked reviewed.`:`Source ${id} unchecked.`);};
    document.getElementById('close-modal').focus();
  }
  function closeDialog() {document.getElementById('source-modal').classList.add('hidden');}
  function download(name,content,type) {const blob=new Blob([content],{type});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
  async function copy(text) {try{await navigator.clipboard.writeText(text);notify('Copied to clipboard.');}catch(_){notify('Clipboard permission unavailable. Use the Handoff tab to copy.');}}
  async function generateAI() {
    const c=current(); if(!nav.apiAvailable||!nav.modelEnabled)return;
    notify('Requesting a server-side model summary…');
    try{
      const r=await fetch('/api/ai-analysis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({case_id:c.id})});
      const data=await r.json();if(!r.ok)throw new Error(data.detail||'Model request failed');
      nav.ai[c.id]=data;renderDecision(c);notify('Model draft received. Verify each cited source.');
    }catch(e){notify(`AI not available: ${String(e.message).slice(0,170)}`);}
  }
  function decide() {
    const c=current(),sc=sCase(c),action=sc.proposed || sc.decision || '';
    const check=C.canDecide(c,action,sc.note,sc.gapAcknowledged,sc.verified);
    if(!check.allowed){notify(check.reason);return;}
    sc.decision=action;sc.lastAt=new Date().toISOString();sc.proposed=action;
    saved.audit.push({case_id:c.id,action,at:sc.lastAt,note:sc.note.slice(0,500)});
    saved.audit=saved.audit.slice(-150);store();render();notify(`${c.id} disposition saved locally: ${action}.`);
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.case){nav.selected=b.dataset.case;nav.tab='overview';render();return;}
    if(b.dataset.filter){nav.filter=b.dataset.filter;renderQueue();return;}
    if(b.dataset.tab){nav.tab=b.dataset.tab;renderWorkspace(current());return;}
    if(b.dataset.source){sourceDialog(b.dataset.source);return;}
    if(b.hasAttribute('data-save-decision')){decide();return;}
    if(b.hasAttribute('data-ai')){generateAI();return;}
    if(b.hasAttribute('data-copy-report')){const c=current(),s=sCase(c);copy(C.buildHandoff(c,s.decision,s.note,s.verified));return;}
    if(b.hasAttribute('data-download-report')){const c=current(),s=sCase(c);download(c.id+'-handoff.md',C.buildHandoff(c,s.decision,s.note,s.verified),'text/markdown');return;}
  });
  document.getElementById('search').addEventListener('input',e=>{nav.query=e.target.value.toLowerCase();renderQueue();});
  document.getElementById('analyst-note');
  document.addEventListener('input',e=>{if(e.target.id==='analyst-note'){sCase(current()).note=e.target.value.slice(0,4000);store();}});
  document.addEventListener('change',e=>{if(e.target.name==='action'){sCase(current()).proposed=e.target.value;store();}if(e.target.id==='gap-ack'){sCase(current()).gapAcknowledged=e.target.checked;store();}});
  document.getElementById('export-button').onclick=()=>{const c=current(),s=sCase(c);download(c.id+'-case.json',JSON.stringify({case:c,rule_score:C.scoreCase(c),evidence_coverage:C.coverageCase(c),analyst:{decision:s.decision,note:s.note,verified_sources:s.verified},provenance:'SYNTHETIC TRAINING CASE'},null,2),'application/json');notify('Synthetic case JSON exported.');};
  document.getElementById('copy-handoff').onclick=()=>{const c=current(),s=sCase(c);copy(C.buildHandoff(c,s.decision,s.note,s.verified));};
  document.getElementById('theme-toggle').onclick=()=>{const isLight=document.documentElement.classList.toggle('light');localStorage.setItem('evidencegraph-theme',isLight?'light':'dark');};
  document.getElementById('close-modal').onclick=closeDialog;
  document.getElementById('source-modal').addEventListener('click',e=>{if(e.target.id==='source-modal')closeDialog();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDialog();});
  async function checkBackend(){try{const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),1800);const r=await fetch('/api/health',{signal:ctrl.signal});clearTimeout(t);if(!r.ok)return;const body=await r.json();nav.apiAvailable=true;nav.modelEnabled=!!body.ai_enabled;renderDecision(current());}catch(_){/* static hosting expected */}}
  render();checkBackend();
})();
