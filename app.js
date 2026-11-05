'use strict';
const KEY='careercraft_draft_v1';
const blank=()=>({step:0,type:'',p:{name:'',email:'',phone:'',loc:'',li:'',gh:'',web:''},edu:[{}],exp:[{}],proj:[{}],summary:'',skills:'',soft:'',core:'',certs:'',ach:'',extra:'',jd:{title:'',co:'',text:''},dec:{},tpl:'classic',cName:'#000000',cHead:'#000000',aName:'auto',aHead:'auto',aSub:'split'});
let S;try{S=Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)))}catch(e){S=blank()}
S.p=Object.assign({},blank().p,S.p);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);
const hexOr=c=>/^#[0-9a-f]{6}$/i.test(c)?c:'#000000';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=p=>p.split('.').reduce((o,k)=>o==null?o:o[k],S);
const set=(p,v)=>{const k=p.split('.'),l=k.pop();k.reduce((o,x)=>o[x]||(o[x]={}),S)[l]=v};
const GLYPH=/^[\u2022\u25CF\u25E6\u25AA\u25A0\u25CB\u25BA\u2023\u2043\u00B7\u2013\u2014*\-]+\s*/;
const lines=(t,merge)=>{const raw=(t||'').split('\n').map(x=>x.trim()).filter(Boolean),any=raw.some(x=>GLYPH.test(x)),out=[];
 raw.forEach(x=>{const g=GLYPH.test(x),c=x.replace(GLYPH,'').trim();if(!c)return;if(merge&&out.length&&!g&&(any||/^[a-z]/.test(c)))out[out.length-1]+=' '+c;else out.push(c)});return out};
const bl=t=>lines(t,true);
const isF=()=>S.type==='fresher';

/* ---------- form helpers ---------- */
const F=(label,path,o={})=>`<label class="f ${o.w?'w':''}"><span>${label}${o.req?' *':''}</span>${o.ta?`<textarea rows="${o.ta}" data-p="${path}" placeholder="${esc(o.ph||'')}">${esc(get(path))}</textarea>`:`<input type="${o.t||'text'}" data-p="${path}" value="${esc(get(path))}" placeholder="${esc(o.ph||'')}">`}<small class="err" data-e="${path}"></small></label>`;
const L=(key,title,fields)=>S[key].map((_,i)=>`<div class="card"><div class="row"><b>${title} ${i+1}</b>${S[key].length>1?`<button class="lnk" data-a="del:${key}:${i}">Delete</button>`:''}</div><div class="grid">${fields.map(f=>F(f[0],`${key}.${i}.${f[1]}`,f[2]||{})).join('')}</div></div>`).join('')+`<button class="btn sec" data-a="add:${key}">+ Add ${title.toLowerCase()}</button>`;

/* ---------- JD analysis ---------- */
const SK=['sql','mysql','postgresql','python','excel','power bi','tableau','looker','vba','power query','dax','statistics','machine learning','data visualization','dashboard','etl','reporting','forecasting','a/b testing','bigquery','snowflake','databricks','pandas','numpy','git','java','javascript','html','css','react','aws','azure','api','agile','scrum','jira','crm','sap','automation','data cleaning','data modeling','business intelligence','requirements gathering','kpi','mis','budgeting','sales','fmcg','project management','communication','stakeholder','problem solving','leadership','teamwork','analytical','presentation','collaboration','time management','attention to detail'];
const SOFT=new Set(['communication','stakeholder','problem solving','leadership','teamwork','analytical','presentation','collaboration','time management','attention to detail']);
const GROUPS=[['data visualization','dashboard','power bi','tableau','looker'],['sql','mysql','postgresql','bigquery'],['reporting','mis','dashboard'],['stakeholder','collaboration','teamwork'],['etl','data cleaning','power query'],['business intelligence','power bi','tableau','dashboard'],['forecasting','statistics','machine learning']];
const STOP=new Set('will with that this have from your their team work experience skills ability strong knowledge required preferred role job years including across using must other such also than more able good within candidate position company responsibilities qualifications looking join opportunity should about into help well need needs our you the and for are'.split(' '));
const has=(t,k)=>new RegExp('(^|[^a-z0-9])'+k.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')+'($|[^a-z0-9])').test(t);
function jdKeywords(){const t=S.jd.text.toLowerCase(),out=[];
 SK.forEach(k=>{if(has(t,k))out.push({k,soft:SOFT.has(k)})});
 const c={};(t.match(/[a-z][a-z+#]{3,}/g)||[]).forEach(w=>{if(!STOP.has(w))c[w]=(c[w]||0)+1});
 Object.entries(c).filter(([w,n])=>n>=3&&!out.some(o=>o.k.includes(w))).sort((a,b)=>b[1]-a[1]).slice(0,8).forEach(([w])=>out.push({k:w,term:true}));
 return out}
function jdFacts(){const t=S.jd.text,f=[];
 const y=t.match(/(\d+)\s*\+?\s*(?:-\s*\d+\s*)?years?/i);if(y)f.push('Experience asked: '+y[0]);
 const q=t.match(/(bachelor'?s?|master'?s?|mba|b\.?tech|m\.?tech|graduate|degree)[^.\n]{0,60}/i);if(q)f.push('Qualification: '+q[0].trim());
 const r=t.split('\n').map(x=>x.trim()).filter(x=>/^[-•*]/.test(x)).slice(0,4).map(x=>x.replace(/^[-•*\s]+/,'').slice(0,140));
 return {f,r}}

/* ---------- optimization ---------- */
const WEAK=[[/^worked on\s+/i,'Contributed to '],[/^responsible for\s+/i,'Managed '],[/^helped( to)?\s+/i,'Supported '],[/^involved in\s+/i,'Participated in '],[/^was part of\s+/i,'Contributed to '],[/^did\s+/i,'Performed ']];
function suggest(t){let s=t;for(const [re,r] of WEAK)if(re.test(t)){s=t.replace(re,r);break}
 return {sug:s,weak:s!==t,noNum:!/\d/.test(t)}}
const items=()=>{const o=[];['exp','proj'].forEach(k=>S[k].forEach((e,i)=>bl(e.b).forEach((t,j)=>{const s=suggest(t);if(s.weak||s.noNum)o.push({id:`${k}.${i}.${j}`,t,...s,where:(e.title||e.name||k)+(e.company?' – '+e.company:'')})})));return o};
const fin=(id,t)=>{const d=S.dec[id];return d&&d.s==='accept'?d.t:t};
function R(){const m=k=>S[k].map((e,i)=>({...e,b:bl(e.b).map((t,j)=>fin(`${k}.${i}.${j}`,t))})).filter(e=>e.title||e.company||e.name||e.b.length);
 return {exp:m('exp'),proj:m('proj'),edu:S.edu.filter(e=>e.deg||e.inst)}}
const rText=()=>{const r=R();return [S.summary,S.skills,S.soft,S.core,S.certs,S.ach,S.extra,...r.exp.flatMap(e=>[e.title,e.company,e.tools,...e.b]),...r.proj.flatMap(e=>[e.name,e.tech,...e.b])].join(' \n ').toLowerCase()};
function match(){const tx=rText();return jdKeywords().map(o=>({...o,st:has(tx,o.k)?'m':(GROUPS.some(g=>g.includes(o.k)&&g.some(x=>x!==o.k&&has(tx,x)))?'r':'x')}))}

/* ---------- ATS estimate ---------- */
function ats(){const K=match(),r=R(),n=K.length||1,m=K.filter(k=>k.st==='m').length,rel=K.filter(k=>k.st==='r').length;
 const kw=(m+.5*rel)/n*40;
 const sk=(S.skills+' '+S.soft).toLowerCase(),tk=K.filter(k=>!k.term);const inSk=tk.filter(k=>has(sk,k.k)).length;const skp=tk.length?inSk/tk.length*20:0;
 const bl=[...r.exp,...r.proj].flatMap(e=>e.b),hit=bl.filter(b=>K.some(k=>k.st==='m'&&has(b.toLowerCase(),k.k))).length;const rp=bl.length?hit/bl.length*15:0;
 const p=S.p,chk=[p.name&&p.email&&p.phone&&p.loc,p.li||p.web,S.summary,S.skills,r.edu.length,r.exp.length||r.proj.length,S.certs||S.ach,bl.length>=3];const cp=chk.filter(Boolean).length/chk.length*15;
 const good=bl.filter(b=>{const w=b.split(/\s+/).length;return w>=6&&w<=30}).length;const sw=(S.summary||'').split(/\s+/).filter(Boolean).length;
 const fm=(bl.length?good/bl.length*5:0)+(sw>=15&&sw<=90?2.5:0)+(validEmail(p.email)&&validPhone(p.phone)?2.5:0);
 const miss=[];[['Summary/Objective',S.summary],['Skills',S.skills],['Education',r.edu.length],['Experience or projects',r.exp.length||r.proj.length],['Certifications or achievements',S.certs||S.ach]].forEach(x=>{if(!x[1])miss.push(x[0])});
 const rows=[['JD keyword relevance',kw,40,`${m} exact and ${rel} related of ${K.length} JD keywords. Related terms count half.`],['Relevant skills',skp,20,`${inSk} of ${tk.length} JD skills appear in your skills section.`],['Experience and project relevance',rp,15,`${hit} of ${bl.length} bullets mention a matched JD keyword.`],['Resume completeness',cp,15,`${chk.filter(Boolean).length} of ${chk.length} checks passed (contact, links, summary, skills, education, experience/projects, certifications/achievements, 3+ bullets).`],['Formatting and readability',fm,10,'Bullets of 6–30 words, summary of 15–90 words, valid contact details. All templates are single-column.']];
 return {total:Math.round(rows.reduce((a,x)=>a+x[1],0)),rows,K,miss}}

/* ---------- validation ---------- */
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e||'');
const validPhone=p=>{const d=(p||'').replace(/\D/g,'');return /^[+\d\s()-]+$/.test(p||'')&&d.length>=8&&d.length<=15};
const validUrl=u=>!u||/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(u);
const V={
1:()=>S.type?{}:{type:'Choose Fresher or Experienced to continue.'},
2:()=>{const e={},p=S.p;if(!p.name.trim())e['p.name']='Enter your full name.';if(!validEmail(p.email))e['p.email']='Enter a valid email, like name@example.com.';if(!validPhone(p.phone))e['p.phone']='Enter a valid phone number (8–15 digits).';if(!p.loc.trim())e['p.loc']='Enter your city or location.';if(!validUrl(p.li))e['p.li']='Enter a valid URL.';if(!validUrl(p.gh))e['p.gh']='Enter a valid URL.';if(!validUrl(p.web))e['p.web']='Enter a valid URL.';return e},
3:()=>{const e={};if(!S.edu.some(x=>x.deg&&x.inst))e['edu.0.deg']='Add at least one qualification with degree and institution.';return e},
4:()=>{const e={};if(!S.skills.trim())e.skills='List at least a few skills.';if(!S.summary.trim())e.summary='Write a short '+(isF()?'objective.':'summary.');if(!S.exp.some(x=>x.title||x.b)&&!S.proj.some(x=>x.name||x.b))e['proj.0.name']='Add at least one '+(isF()?'project or internship.':'job or project.');return e},
5:()=>{const e={};if(!S.jd.title.trim())e['jd.title']='Enter the job title.';if(S.jd.text.trim().split(/\s+/).length<30)e['jd.text']='Paste the full job description (at least 30 words).';return e}};

/* ---------- views ---------- */
const COLORS=[['#000000','Black'],['#1F3A5F','Navy'],['#0F6B6B','Teal'],['#2F6B4F','Forest green'],['#5B4B8A','Soft purple'],['#8A2F45','Burgundy'],['#8A5A2B','Copper'],['#475569','Slate']];
const AL4=[['auto','Template default'],['left','Left'],['center','Centered'],['right','Right']],ALS=[['split','Left, with date/institution on the right'],['left','Left'],['center','Centered'],['right','Right']];
const colRow=(label,key)=>`<div class="acts sw"><span class="note" style="min-width:110px">${label}</span>${COLORS.map(c=>`<button class="swatch ${S[key]===c[0]?'on':''}" style="background:${c[0]}" title="${c[1]}" aria-label="${label}: ${c[1]}" data-a="col:${key}:${c[0]}"></button>`).join('')}<label class="note">Custom <input type="color" class="cpick" data-ck="${key}" value="${hexOr(S[key])}"></label></div>`;
const sel=(label,key,opts)=>`<label class="f"><span>${label}</span><select data-s="${key}">${opts.map(o=>`<option value="${o[0]}" ${S[key]===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></label>`;
const NAMES=['','Experience level','Personal details','Education','Background','Job description','Optimize','Template & download'];
const view={
1:()=>`<h2>Which describes you?</h2><div class="cols"><button class="card opt ${isF()?'on':''}" data-a="type:fresher"><b>Fresher</b><p>Students, recent graduates, candidates with internships and academic projects.</p></button><button class="card opt ${S.type==='experienced'?'on':''}" data-a="type:experienced"><b>Experienced</b><p>Working professionals, career changers, people with several previous roles.</p></button></div><small class="err" data-e="type"></small>`,
2:()=>`<h2>Personal details</h2><div class="grid">${F('Full name','p.name',{req:1})}${F('Email','p.email',{req:1,t:'email'})}${F('Phone','p.phone',{req:1,t:'tel',ph:'+91 98765 43210'})}${F('Location','p.loc',{req:1,ph:'City, State'})}${F('LinkedIn URL','p.li',{ph:'linkedin.com/in/yourname'})}${F('GitHub URL','p.gh',{ph:'github.com/yourname'})}${F('Portfolio URL','p.web')}</div>`,
3:()=>`<h2>Education</h2>${L('edu','Qualification',[['Degree','deg'],['Specialization','spec'],['Institution','inst'],['Graduation year','year'],['Percentage / CGPA','gpa']])}`,
4:()=>{const f=isF();return `<h2>Your background</h2><div class="grid">${F(f?'Career objective':'Professional summary','summary',{ta:3,w:1,req:1,ph:f?'Two sentences on your goal and strongest skills.':'Two or three sentences on your role, domain and strengths.'})}${F('Technical skills (comma-separated, or one "Group: item, item" per line)','skills',{ta:3,w:1,req:1})}${F('Core competencies (comma-separated, optional)','core',{ta:2,w:1})}${F('Soft skills (comma-separated)','soft',{ta:2,w:1})}</div><h3>${f?'Internships':'Work experience'}</h3>${L('exp',f?'Internship':'Position',[['Job title','title'],['Company','company'],['Dates','dates',{ph:'Jun 2024 – Oct 2025'}],...(f?[]:[['Tools and technologies','tools']]),['Responsibilities and achievements (one per line; pasted bullet symbols and wrapped lines are cleaned automatically)','b',{ta:5,w:1}]])}<h3>Projects</h3>${L('proj',f?'Academic project':'Project',[['Project name','name'],['Tools used','tech'],['What you did (one per line)','b',{ta:4,w:1}]])}<div class="grid"><h3 class="f w">Other</h3>${F('Certifications (one per line)','certs',{ta:3,w:1})}${F('Achievements (one per line)','ach',{ta:3,w:1})}${f?F('Extracurricular activities (one per line)','extra',{ta:3,w:1}):''}</div>`},
5:()=>`<h2>What position are you applying for?</h2><div class="grid">${F('Target job title','jd.title',{req:1})}${F('Target company (optional)','jd.co')}${F('Full job description','jd.text',{ta:12,w:1,req:1,ph:'Paste the complete job description here'})}</div><p class="note">Processed only in your browser.</p>`,
6:()=>{const K=match(),J=jdFacts(),its=items(),sk=K.filter(k=>k.st!=='m'&&!k.term);
 const chips=s=>K.filter(k=>k.st===s).map(k=>`<span class="chip ${s}">${esc(k.k)}</span>`).join('')||'<span class="note">None</span>';
 return `<h2>Guided optimization</h2><div class="card"><b>What the job asks for</b>${J.f.map(x=>`<p>${esc(x)}</p>`).join('')}${J.r.length?`<p>Responsibilities noted: ${J.r.map(esc).join('; ')}</p>`:''}<p><b>In your resume</b></p><div class="chips">${chips('m')}</div><p><b>Related wording only</b> (similar meaning, not identical – mention only if accurate)</p><div class="chips">${chips('r')}</div><p><b>Not found</b></p><div class="chips">${chips('x')}</div></div>
 ${sk.length?`<div class="card"><b>Add skills you genuinely have</b><p>Tick only skills you can honestly claim. Nothing is added automatically.</p><div class="chips">${sk.map(k=>`<label class="chip"><input type="checkbox" data-sk="${esc(k.k)}" style="width:auto"> ${esc(k.k)}</label>`).join('')}</div><button class="btn sec" data-a="addsk">Add ticked skills</button></div>`:''}
 <h3>Bullet suggestions (${its.length})</h3>${its.length?'':'<p class="note">Your bullets look good. Nothing to improve automatically.</p>'}
 ${its.map(o=>{const d=S.dec[o.id]||{};return `<div class="card"><div class="row"><b>${esc(o.where)}</b><span class="badge ${d.s==='accept'?'a':d.s==='keep'?'k':''}">${d.s==='accept'?'Accepted':d.s==='keep'?'Original kept':'Pending'}</span></div><div class="orig">Original: ${esc(o.t)}</div>${o.noNum?'<p class="note">No measurable result. If you have a real number (%, count, amount), add it. We never invent figures.</p>':''}<textarea rows="2" data-d="${o.id}">${esc(d.t!=null?d.t:o.sug)}</textarea><div class="acts"><button class="btn" data-a="acc:${o.id}">Accept this version</button><button class="btn sec" data-a="keep:${o.id}">Keep original</button></div></div>`}).join('')}
 <p class="note">Summary tip: if true, mention matched keywords such as ${K.filter(k=>k.st==='m'&&!k.soft).slice(0,4).map(k=>esc(k.k)).join(', ')||'your top skills'} in your ${isF()?'objective':'summary'}. Edit it on the Background step.</p>`},
7:()=>{const A=ats(),T=[['classic','Classic ATS'],['modern','Modern Professional'],['exec','Executive']];
 return `<h2>Template, preview and download</h2><div class="acts">${T.map(t=>`<button class="btn ${S.tpl===t[0]?'':'sec'}" data-a="tpl:${t[0]}">${t[1]}</button>`).join('')}</div>
 <div class="card" style="margin-top:14px"><b>Style your resume</b>${colRow('Name colour','cName')}${colRow('Heading colour','cHead')}<div class="grid" style="margin-top:10px">${sel('Name alignment','aName',AL4)}${sel('Section heading alignment','aHead',AL4)}${sel('Sub-heading alignment (job, project and education lines)','aSub',ALS)}</div></div><div class="card" style="margin-top:14px"><div class="score"><div class="big">${A.total}<small style="font-size:18px">/100</small></div><div><b>Estimated ATS compatibility</b><p class="note">An estimate from keyword and structure checks against your pasted job description. It is not a score from any employer's ATS.</p></div></div>
 <table class="tbl">${A.rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1].toFixed(1)} / ${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table>
 <p><b>Matched</b></p><div class="chips">${A.K.filter(k=>k.st==='m').map(k=>`<span class="chip m">${esc(k.k)}</span>`).join('')||'None'}</div><p><b>Missing</b></p><div class="chips">${A.K.filter(k=>k.st!=='m').map(k=>`<span class="chip ${k.st}">${esc(k.k)}</span>`).join('')||'None'}</div>
 ${A.miss.length?`<p><b>Missing sections:</b> ${A.miss.join(', ')}</p>`:''}
 <p><b>Recommendations:</b> ${[A.K.some(k=>k.st==='x'&&!k.term)?'Add missing skills only if you truly have them (Optimize step).':'',A.rows[2][1]<8?'Describe your work with outcomes and tools from the job description, where accurate.':'',A.miss.length?'Complete the missing sections.':''].filter(Boolean).join(' ')||'Your resume covers the main points. Re-check every line for accuracy.'}</p></div>
 <div class="acts"><button class="btn" data-a="pdf">Download PDF</button><button class="btn sec" data-a="print">Print instead</button><button class="btn sec" data-a="goto:4">Edit my details</button><button class="btn sec" data-a="clear">Clear draft</button></div>
 <p class="note">Download PDF creates an A4 file with selectable text. If you use Print instead, switch off "Headers and footers" in the print dialog so no page title or date appears.</p>
 <div class="pv"><div id="resume" class="page t-${S.tpl}" style="--an:${hexOr(S.cName)};--ah:${hexOr(S.cHead)}">${resumeHTML(model())}</div></div>`}};

/* ---------- resume model, preview and PDF ---------- */
function model(){const r=R(),p=S.p,f=isF(),U=u=>/^(https?:|mailto:)/i.test(u)?u:'https://'+u;
 const contact=[];if(p.phone)contact.push({t:p.phone});if(p.email)contact.push({t:p.email,u:'mailto:'+p.email});if(p.loc)contact.push({t:p.loc});
 [['LinkedIn',p.li],['GitHub',p.gh],['Portfolio',p.web]].forEach(([t,u])=>{if(u&&u.trim())contact.push({t,u:U(u.trim())})});
 const P=t=>t&&t.trim()?[{k:'p',t:t.trim()}]:[];
 const sk=[],un=[];lines(S.skills).forEach(l=>{const m=l.match(/^([^:]{1,40}):\s*(.+)$/);m?sk.push({k:'lbl',l:m[1].trim(),t:m[2].trim()}):un.push(l)});
 if(un.length)sk.unshift({k:'lbl',l:'Technical',t:un.join(', ')});if(S.soft.trim())sk.push({k:'lbl',l:'Soft skills',t:S.soft.trim()});
 const core=(S.core||'').split(/,(?![^(]*\))|\n|•/).map(x=>x.trim()).filter(Boolean);
 const ex=r.exp.map(e=>({k:'ent',l:[e.title,e.company].filter(Boolean).join(' | '),l2:'',r:e.dates||'',x:e.tools?'Tools: '+e.tools:'',b:e.b}));
 const pr=r.proj.map(e=>({k:'ent',l:e.name||'',l2:e.tech?' | '+e.tech:'',r:'',x:'',b:e.b}));
 const ed=r.edu.map(e=>({k:'ent',l:[e.deg,e.spec].filter(Boolean).join(' – '),l2:(e.year||e.gpa)?' — '+[e.year,e.gpa?(/%/.test(e.gpa)?'Percentage: ':'CGPA: ')+e.gpa:''].filter(Boolean).join(', '):'',r:e.inst||'',x:'',b:[]}));
 const dots=a=>a.length?[{k:'p',t:a.join(' • ')}]:[],ul=a=>a.length?[{k:'ul',b:a}]:[],Q=(h,items)=>items.length?{h,items}:null;
 const secs=(f?[Q('Career Objective',P(S.summary)),Q('Education',ed),Q('Core Competencies',dots(core)),Q('Technical Skills',sk),Q('Projects',pr),Q('Internships',ex),Q('Certifications',dots(lines(S.certs))),Q('Achievements',ul(lines(S.ach))),Q('Extracurricular Activities',ul(lines(S.extra)))]
 :[Q('Professional Summary',P(S.summary)),Q('Core Competencies',dots(core)),Q('Professional Experience',ex),Q('Projects',pr),Q('Education',ed),Q('Technical Skills',sk),Q('Certifications',dots(lines(S.certs))),Q('Achievements',ul(lines(S.ach)))]).filter(Boolean);
 return {name:p.name||'Your Name',contact,secs}}
function resumeHTML(m){const A=c=>c.u?`<a href="${esc(c.u)}" target="_blank" rel="noopener">${esc(c.t)}</a>`:esc(c.t);
 const nA=S.aName&&S.aName!=='auto'?S.aName:(S.tpl==='modern'?'left':'center'),hA=S.aHead&&S.aHead!=='auto'?S.aHead:'left',sA=S.aSub||'split';
 const ul=b=>b&&b.length?`<ul>${b.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';
 const head=i=>sA==='split'?`<div class="eh"><span><b>${esc(i.l)}</b>${esc(i.l2)}</span><span>${esc(i.r)}</span></div>`:`<div class="eh" style="display:block;text-align:${sA}"><b>${esc(i.l)}</b>${esc(i.l2)}${i.r?((i.l||i.l2)?' | ':'')+esc(i.r):''}</div>`;
 const it=i=>i.k==='p'?`<p>${esc(i.t)}</p>`:i.k==='lbl'?`<p><b>${esc(i.l)}:</b> ${esc(i.t)}</p>`:i.k==='ul'?ul(i.b):`<div class="entry">${head(i)}${i.x?`<p>${esc(i.x)}</p>`:''}${ul(i.b)}</div>`;
 return `<h1 style="text-align:${nA}">${esc(m.name)}</h1><div class="ct" style="text-align:${nA}">${m.contact.map(A).join(' | ')}</div>`+m.secs.map(s=>`<section><h2 style="text-align:${hA}">${esc(s.h)}</h2>${s.items.map(it).join('')}</section>`).join('')}
function buildPDF(){const doc=new window.jspdf.jsPDF({unit:'pt',format:'a4'}),m=model(),T=S.tpl;
 const W=595.28,H=841.89,M=43,CW=W-2*M,fam=T==='exec'?'times':'helvetica',FS=10;let y=M;const rgb=c=>{const h=hexOr(c);return [1,3,5].map(i=>parseInt(h.substr(i,2),16))},RN=rgb(S.cName),RH=rgb(S.cHead),nA=S.aName&&S.aName!=='auto'?S.aName:(T==='modern'?'left':'center'),hA=S.aHead&&S.aHead!=='auto'?S.aHead:'left',sA=S.aSub||'split',AX=(w,a)=>a==='left'?M:a==='right'?W-M-w:(W-w)/2;
 const cl=s=>String(s==null?'':s).replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2022]/g,'');
 const font=(b,z)=>{doc.setFont(fam,b?'bold':'normal');doc.setFontSize(z)};
 const tw=(t,b,z)=>{font(b,z);return doc.getTextWidth(t)};
 const toks=(s,b)=>cl(s).split(/\s+/).filter(Boolean).map(t=>({t,b}));
 const need=h=>{if(y+h>H-M){doc.addPage();y=M}};
 doc.setTextColor(0,0,0);doc.setDrawColor(...RH);
 function layout(tk,w1,w,z){const out=[];let line=[],lw=0,lim=w1;
  tk.forEach(o=>{let parts=[o.t];if(tw(o.t,o.b,z)>w){parts=[];let c='';for(const ch of o.t){if(c&&tw(c+ch,o.b,z)>w){parts.push(c);c=ch}else c+=ch}parts.push(c)}
   parts.forEach(pt=>{const ww=tw(pt,o.b,z),sp=line.length?tw(' ',o.b,z):0;if(line.length&&lw+sp+ww>lim){out.push(line);line=[];lw=0;lim=w}lw+=(line.length?sp:0)+ww;line.push({t:pt,b:o.b})})});
  if(line.length)out.push(line);return out}
 const lineW=(ln,z)=>ln.reduce((a,o,i)=>a+tw(o.t,o.b,z)+(i?tw(' ',o.b,z):0),0);
 function draw(ln,x,z){let cx=x,i=0;while(i<ln.length){let j=i;const t=[];while(j<ln.length&&ln[j].b===ln[i].b){t.push(ln[j].t);j++}const txt=t.join(' '),b=ln[i].b;if(i)cx+=tw(' ',ln[i-1].b,z);font(b,z);doc.text(txt,cx,y+z*.82);cx+=tw(txt,b,z);i=j}}
 function para(tk,x,w1,w,z,after,bullet){const L=layout(tk,w1,w,z),lh=z*1.38;L.forEach((ln,i)=>{need(lh);if(bullet&&i===0){font(false,z);doc.text('•',x-10,y+z*.82)}draw(ln,x,z);y+=lh});y+=after}
 /* name + contact */
 const nz=T==='modern'?24:20;
 doc.setTextColor(...RN);layout(toks(m.name.toUpperCase(),true),CW,CW,nz).forEach(ln=>{draw(ln,AX(lineW(ln,nz),nA),nz);y+=nz*1.2});doc.setTextColor(0,0,0);y+=3;
 font(false,9.5);const sep=' | ',sw=tw(sep,false,9.5),rows=[];let row=[],rw=0;
 m.contact.forEach(c=>{const w=tw(cl(c.t),false,9.5),add=(row.length?sw:0)+w;if(row.length&&rw+add>CW){rows.push(row);row=[];rw=0}rw+=(row.length?sw:0)+w;row.push(c)});if(row.length)rows.push(row);
 rows.forEach(r=>{const tot=r.reduce((a,c,i)=>a+tw(cl(c.t),false,9.5)+(i?sw:0),0);let x=AX(tot,nA);
  r.forEach((c,i)=>{font(false,9.5);if(i){doc.text(sep,x,y+8);x+=sw}const t=cl(c.t);c.u?doc.textWithLink(t,x,y+8,{url:c.u}):doc.text(t,x,y+8);x+=tw(t,false,9.5)});y+=14});
 y+=1;doc.setDrawColor(...RN);if(T==='modern'){doc.setLineWidth(1.6);doc.line(M,y,W-M,y);y+=3}else if(T==='exec'){doc.setLineWidth(.5);doc.line(M,y,W-M,y);doc.line(M,y+2.2,W-M,y+2.2);y+=5}doc.setDrawColor(...RH);
 /* sections */
 const heading=h=>{need(58);y+=10;const z=T==='exec'?10.5:11;font(true,z);const ht=cl(h).toUpperCase();doc.setTextColor(...RH);doc.text(ht,AX(doc.getTextWidth(ht),hA),y+z*.82);doc.setTextColor(0,0,0);y+=z*1.25;
  if(T==='exec'){doc.setLineWidth(.5);doc.line(M,y,W-M,y);doc.line(M,y+2.2,W-M,y+2.2);y+=7}else{doc.setLineWidth(T==='modern'?1.6:.8);doc.line(M,y,W-M,y);y+=5}};
 function ent(i){const z=FS,lh=z*1.38,rt=cl(i.r),rw=rt?tw(rt,false,z)+14:0;need(lh*2+4);
  const split=sA==='split',tk=toks(i.l,true).concat(toks(i.l2,false));if(!split&&rt)tk.push(...toks((i.l||i.l2?'| ':'')+rt,false));const L=layout(tk,split?CW-rw:CW,CW,z);if(!L.length)L.push([]);
  L.forEach((ln,k)=>{need(lh);draw(ln,split?M:AX(lineW(ln,z),sA),z);if(split&&k===0&&rt){font(false,z);doc.text(rt,W-M,y+z*.82,{align:'right'})}y+=lh});
  if(i.x)para(toks(i.x,false),M,CW,CW,9.5,1);(i.b||[]).forEach(b=>para(toks(b,false),M+14,CW-14,CW-14,z,1,true));y+=4}
 m.secs.forEach(s=>{heading(s.h);s.items.forEach(i=>{if(i.k==='p')para(toks(i.t,false),M,CW,CW,FS,2);
  else if(i.k==='lbl')para(toks(i.l+':',true).concat(toks(i.t,false)),M,CW,CW,FS,2);
  else if(i.k==='ul')i.b.forEach(b=>para(toks(b,false),M+14,CW-14,CW-14,FS,1,true));
  else ent(i)})});
 return doc}

/* ---------- render & events ---------- */
let landing=true;
function render(){const L=landing||S.step<1;$('#landing').hidden=!L;$('#wizard').hidden=L;$('#contBtn').hidden=S.step<1;
 if(L)return;$('#bar').style.width=(S.step/7*100)+'%';$('#stepLabel').textContent=`Step ${S.step} of 7 – ${NAMES[S.step]}`;
 $('#view').innerHTML=view[S.step]()+`<div class="nav"><button class="btn sec" data-a="back" ${S.step<2?'hidden':''}>Back</button>${S.step<7?'<button class="btn" data-a="next">Continue</button>':''}</div>`;window.scrollTo(0,0)}
function showErrors(e){document.querySelectorAll('.err').forEach(x=>x.textContent='');let first;for(const k in e){const el=document.querySelector(`[data-e="${k}"]`);if(el){el.textContent=e[k];first=first||el}}if(first)first.scrollIntoView({block:'center',behavior:'smooth'})}
const fname=()=>((S.p.name||'Candidate').replace(/[^\w ]/g,'').trim().replace(/\s+/g,'')||'Candidate')+'_Resume';
function pdf(btn){if(!window.jspdf){alert('The PDF library could not load (are you offline?). Use "Print instead".');return}
 const old=btn.textContent;btn.disabled=true;btn.textContent='Generating…';
 setTimeout(()=>{try{const d=buildPDF();d.setProperties({title:fname()});d.save(fname()+'.pdf')}catch(e){console.error(e);alert('PDF export failed. Use "Print instead".')}btn.disabled=false;btn.textContent=old},30)}
function prt(){const c=$('#resume').cloneNode(true),h=document.createElement('div'),t=document.title;h.id='printroot';h.appendChild(c);document.body.appendChild(h);document.body.classList.add('printing');document.title=fname();
 window.onafterprint=()=>{h.remove();document.body.classList.remove('printing');document.title=t};window.print()}

document.addEventListener('input',e=>{const t=e.target;
 if(t.dataset.p){set(t.dataset.p,t.value);save()}
 else if(t.dataset.d){S.dec[t.dataset.d]=Object.assign({},S.dec[t.dataset.d],{t:t.value});save()}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.preventDefault();const [a,x,y]=b.dataset.a.split(':');
 if(a==='start'){landing=false;S.step=1}
 else if(a==='cont'){landing=false}
 else if(a==='home'){landing=true}
 else if(a==='next'){const er=(V[S.step]||(()=>({})))();if(Object.keys(er).length){showErrors(er);return}S.step++}
 else if(a==='back')S.step--;
 else if(a==='goto')S.step=+x;
 else if(a==='type'){S.type=x}
 else if(a==='add'){S[x].push({})}
 else if(a==='del'){S[x].splice(+y,1);S.dec={}}
 else if(a==='acc'||a==='keep'){const id=b.dataset.a.slice(a.length+1),ta=document.querySelector(`[data-d="${id}"]`);S.dec[id]={s:a==='acc'?'accept':'keep',t:ta?ta.value:''}}
 else if(a==='addsk'){document.querySelectorAll('[data-sk]:checked').forEach(c=>{const k=c.dataset.sk,f=SOFT.has(k)?'soft':'skills';if(!has((S[f]||'').toLowerCase(),k))S[f]=(S[f]?S[f]+', ':'')+k})}
 else if(a==='tpl'){S.tpl=x}
 else if(a==='col'&&(x==='cName'||x==='cHead')&&/^#[0-9a-f]{6}$/i.test(y)){S[x]=y}
 else if(a==='pdf'){pdf(b);return}
 else if(a==='print'){prt();return}
 else if(a==='clear'){if(confirm('Delete your saved draft from this browser? This cannot be undone.')){try{localStorage.removeItem(KEY)}catch(_){}S=blank();landing=true}else return}
 const sy=window.scrollY;save();render();if(/^(tpl|col)$/.test(a))window.scrollTo(0,sy)});
document.addEventListener('change',e=>{const t=e.target,k=t.dataset&&(t.dataset.ck||t.dataset.s);if(!k)return;if(t.dataset.ck&&!/^#[0-9a-f]{6}$/i.test(t.value))return;S[k]=t.value;const sy=window.scrollY;save();render();window.scrollTo(0,sy)});
render();
