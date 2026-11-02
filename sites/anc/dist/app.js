(() => {
  'use strict';
  const zh = {
    'skip':'跳至正文','nav.system':'系统设计','nav.work':'如何工作','nav.people':'人的价值','nav.contact':'联系我们 <span aria-hidden="true">↗</span>',
    'system.eyebrow':'01 / 企业共同的 AI 工作基础','system.title':'把事情做好，<br>需要的不止一个好回答。','system.intro':'企业需要持续执行、共同的业务理解，以及明确的结果责任。ANC 把这三件事连接起来。','system.1.title':'工作能够接着推进。','system.1.body':'补充要求回到原任务，中断保留已有进展。送达情况不确定时，ANC 留住成果，先核对，再继续。','system.1.label':'持续执行','system.2.title':'知道什么值得信任。','system.2.body':'经过确认的事实、可复用方法和当前进度，各有归属。来源和版本让重要修订有据可查。','system.2.label':'企业上下文','system.3.title':'结果能够被检查。','system.3.body':'明确目标、负责人、边界和验收标准。保留产物、送达与核验的证据，让结果责任落到实处。','system.3.label':'明确责任',
    'work.eyebrow':'02 / HUMAN ON THE LOOP','work.title':'人把握方向，<br>ANC 持续推进。','work.intro':'定义好结果，给工作推进的空间。在需要判断、调整方向和验收时，由人作出决定。','demo.title':'准备一份客户简报','demo.label':'交互示意 · 非实时任务','step.0':'定义结果','step.0.sub':'人明确责任与边界','step.1':'推进工作','step.1.sub':'ANC 规划与执行','step.2':'核验证据','step.2.sub':'人保留业务判断','step.3':'改进方法','step.3.sub':'让经验可以复用','demo.footer':'同一件事，持续推进。有据可查，有人负责。','demo.next':'下一步 <span aria-hidden="true">→</span>','work.note':'示例用于说明设计。实际可用能力与审批路径取决于部署配置。',
    'platform.eyebrow':'03 / 一个内核，多种接入方式','platform.title':'让 ANC 进入<br>企业日常工作的各个环节。','platform.intro':'ANC 是核心。硬件带入口头上下文，训练让员工参与，配置工具帮助系统进入企业。','platform.core.label':'核心系统','platform.core.body':'持续的任务，经过维护的企业知识，可复用的方法，以及能够被检查的结果。','platform.layer1':'人与工作入口','platform.layer2':'项目、任务与证据','platform.layer3':'执行与故障恢复','platform.layer4':'知识与工作方法','platform.core.note':'共同的框架，每家企业自己的配置。','platform.bean.status':'可运行原型','platform.bean.title':'把键盘之外的上下文带进来。','platform.bean.body':'将选定且经过授权的对话带入 ANC。保留信息来源，让谈话结束后的工作有据可依。','platform.bean.note':'概念示意图。硬件可靠性仍在继续验收。','platform.dojo.status':'真实工作已接入','platform.dojo.title':'让做事的人一起成长。','platform.dojo.body':'学习委托、判断与改进 AI 工作的工作和训练界面。真实工作区连接 ANC 原有任务。','platform.dojo.link':'了解 Dojo ↗','platform.stack.status':'预览阶段','platform.stack.title':'每家公司自己的 ANC 实例。','platform.stack.body':'安装与账号配置工具。复用共同的工作基础，分别维护各家公司的知识与账号。',
    'people.eyebrow':'04 / 人的经验，组织的积累','people.title':'让一个人的判断，<br>帮助下一次工作。','people.body':'员工掌握着流程文件难以写全的例外、质量标准与客户背景。ANC 为经过确认的知识和工作方法提供持续维护的归属。','people.future':'我们正在开发基于真实工作证据的贡献记录与训练案例，让改进方法、处理异常、帮助新人掌握经验的人，其贡献能够被看见。','people.card.label':'从一个人的经验，到下一次工作','people.quote':'“沿用上次报价前，先检查图纸版本。”','people.example':'以报价工作中的经验为例，并非真实客户记录。','people.route1':'保留原始来源','people.route2':'核实这次纠正','people.route3':'修订工作方法','people.route4':'形成训练案例','people.planned':'开发中',
    'evidence.eyebrow':'05 / 在真实工作中构建','evidence.title':'让真实的工作，<br>塑造系统的能力。','evidence.intro':'企业现场的部署与我们自己的日常工作，持续影响哪些能力被提取进 ANC 的共同框架。','evidence.case1.label':'专业服务','evidence.case1.title':'找到答案，<br>也找到原始依据。','evidence.case1.body':'在正在推进的会计师事务所部署中，助手利用项目记录和事务所工作方法回答问题，并定位原始工作底稿。','evidence.case2.label':'HA7CH 内部实践','evidence.case2.title':'从公司的上下文，<br>到能够使用的成果。','evidence.case2.body':'我们用 ANC 制作网站、演示文稿与设计材料。补充要求与交付结果持续关联到原来的工作。','evidence.status.title':'目前的进展','evidence.status.body':'核心执行能力已经在使用，共同部署工具仍在完善。硬件可靠性、多人接入，以及真实工作到培训的完整闭环，仍是正在推进的开发方向。',
    'deploy.eyebrow':'06 / 从明确的结果开始','deploy.title':'选定一件真实工作，<br>找到务实的起点。','deploy.1.title':'选定工作','deploy.1.body':'约定目标、负责人、资料来源与验收标准。','deploy.2.title':'连接上下文','deploy.2.body':'配置公司的实例、所需工具和日常工作入口。','deploy.3.title':'执行与核验','deploy.3.body':'检查成果、送达、异常，以及需要投入的人工。','deploy.4.title':'依据结果扩展','deploy.4.body':'复用共同能力，维护企业方法，逐步接入更多经常发生的工作。',
    'faq.eyebrow':'07 / 常见问题','faq.title':'进一步<br>了解 ANC。','faq.intro':'关于产品、员工，以及现阶段如何部署。','faq.contact':'还有问题，直接聊聊 ↗','faq.all':'全部问题','faq.product':'产品与理念','faq.people':'员工与知识','faq.deployment':'部署与接入','faq.empty':'没有找到匹配的问题。试试其他关键词，或切换分类。',
    'contact.eyebrow':'一起构建 AI 原生企业','contact.title':'从一件真实工作开始，<br>一起把它做好。','contact.body':'明确要达成的结果、参与的人，以及现有系统如何接入。','contact.cta':'讨论企业部署 <span aria-hidden="true">↗</span>','footer.tagline':'人与 AI 共同工作的基础。','footer.contact':'联系 HA7CH ↗','footer.note':'以企业上下文为基础，由人把握方向。'
  };
  Object.assign(zh, {
    'nav.system':'关于',
    'hero.description':'一家 AI 原生企业，<br class="desktop-break">从每个人愿意参与开始。',
    'hero.cta':'我们的理念 <span aria-hidden="true">↓</span>',
    'hero.note':'由 HA7CH 构建。',
    'system.eyebrow':'01 / 三种视角，同一家公司',
    'system.title':'有参与的理由，<br>也有自己的位置。',
    'system.intro':'老板承担投入与经营风险，中层承担协调与交付责任，员工关心自己的价值和成长。ANC 从这三种真实处境出发，把大家连接到同一套工作方式里。',
    'roles.owner.link':'老板视角 <span aria-hidden="true">↘</span>',
    'roles.manager.link':'中层视角 <span aria-hidden="true">↘</span>',
    'roles.employee.link':'员工视角 <span aria-hidden="true">↘</span>',
    'roles.owner.label':'老板',
    'roles.owner.question':'“我怎么知道，它能在公司里真正起作用？”',
    'roles.owner.concern':'你关心业务结果，也承担部署风险。投入是否值得，最终要在日常经营中得到回答。',
    'roles.owner.response':'从一件边界清晰的工作开始：约定目标、负责人、授权范围和验收标准，保留产物与交付证据。检查结果、人工投入和异常，再决定是否扩大使用。',
    'roles.owner.agency':'你决定投入与边界，并对结果作出判断。',
    'roles.manager.label':'中层',
    'roles.manager.question':'“工作交给 AI，我怎么掌握进展、协调团队，并对交付负责？”',
    'roles.manager.concern':'你需要知道事情推进到哪里、卡在哪里，以及哪些决定需要自己的业务判断。',
    'roles.manager.response':'ANC 把补充要求、执行进展、产物和交付记录关联到原任务。依据同一份工作记录，你可以协调人与 AI、处理异常、检查质量。',
    'roles.manager.agency':'你的判断集中在优先级、协作与例外上。',
    'roles.employee.label':'员工',
    'roles.employee.question':'“经验交给 AI，我的价值还在哪里？”',
    'roles.employee.concern':'担心被替代，会影响一个人是否愿意分享经验。识别例外、判断质量、改进方法，都是重要贡献。',
    'roles.employee.response':'ANC 为有用的知识保留来源，让经验可以持续维护；Dojo 把员工连接到真实工作，并提供练习指挥 AI 的入口。我们正在开发贡献归因与训练案例，让一次改进帮助后续工作与新人学习。',
    'roles.employee.agency':'你的经验参与塑造工作方法，贡献应当被看见。',
    'roles.employee.note':'贡献归因与真实工作到培训的完整闭环仍在开发。如何认可贡献、建立激励，也需要与企业一起设计。',
    'roles.shared':'每个人都保留与其工作相应的方向、判断和责任，让 AI 在明确边界内推进执行。',
    'roles.foundation.title':'共同的工作基础。',
    'roles.foundation.body':'持续的任务、经过维护的知识与可核验的结果，把三种视角连接到日常工作里。',
    'platform.bean.note':'硬件可靠性仍在继续验收。',
    'footer.tagline':'AI Native Company，由 HA7CH 构建。'
  });
  const en = Object.fromEntries([...document.querySelectorAll('[data-i18n]')].map(e => [e.dataset.i18n,e.innerHTML]));
  const panels = {
    en:[
      {eyebrow:'THE WORK AGREEMENT',status:'Defined by a person',title:'Make the expected outcome explicit.',rows:[['Outcome','A client brief backed by the current project record.'],['Owner','The team lead remains responsible for acceptance.'],['Sources','Approved project notes and the company’s briefing method.'],['Boundary','Prepare a draft. External sending requires approval.']],note:'Goals, scope, and acceptance criteria travel with the work. A project is more than the chat it started in.'},
      {eyebrow:'CONTINUOUS EXECUTION',status:'Work in progress',title:'Keep the work and context together.',rows:[['Plan','Read the selected sources, resolve gaps, and prepare the draft.'],['Follow-up','“Use the updated scope” joins this same task.'],['Recovery','Check existing progress before continuing after an interruption.'],['Delivery','Keep the prepared result; reconcile an uncertain send.']],note:'Execution uses a recorded version of its context and methods. New instructions do not need a new task.'},
      {eyebrow:'EVIDENCE & ACCEPTANCE',status:'Human judgment',title:'Inspect the result. Confirm the outcome.',rows:[['Artifact','A draft brief with references to its source material.'],['Delivery','A transport receipt is separate from business acceptance.'],['Review','The owner checks accuracy, scope, and the stated criteria.'],['Decision','Accept the outcome or send a correction into the original task.']],note:'The formal project kernel checks verified evidence before closure. Runtime completion alone does not certify a business result.'},
      {eyebrow:'REVIEWED EXPERIENCE',status:'Maintain & improve',title:'Carry a useful correction forward.',rows:[['Correction','“Include unresolved assumptions in every client brief.”'],['Source','Keep the reviewed result and the reason for the change.'],['Method','Revise the appropriate company method within its scope.'],['Next step','Develop a training case that helps a new colleague practice.']],note:'Knowledge and method updates have implementation support. Contribution attribution and the complete work-to-training loop are in development.'}
    ],
    zh:[
      {eyebrow:'工作约定',status:'由人定义',title:'先把期待的结果说清楚。',rows:[['目标','一份以当前项目记录为依据的客户简报。'],['负责人','由团队负责人保留最终验收责任。'],['资料来源','已授权的项目记录，以及公司的简报方法。'],['执行边界','先准备草稿。对外发送需要明确授权。']],note:'目标、边界和验收条件跟随工作保存。一件事的责任不会因为对话结束而消失。'},
      {eyebrow:'持续执行',status:'工作推进中',title:'让工作和上下文始终连在一起。',rows:[['规划','读取选定资料，发现缺口，准备草稿。'],['补充要求','“使用更新后的范围”进入同一个任务。'],['中断恢复','先检查已有进展，再继续未完成的工作。'],['成果交付','保留已生成的成果，核对不确定的发送结果。']],note:'执行记录包含所用上下文和方法的版本。补充要求可以沿原任务继续推进。'},
      {eyebrow:'证据与验收',status:'由人判断',title:'检查交付物，确认业务结果。',rows:[['交付物','一份引用原始资料的客户简报草稿。'],['送达','发送回执与业务验收分别记录。'],['核验','负责人检查准确性、范围与约定标准。'],['决定','接受结果，或把纠正要求补充到原任务。']],note:'正式项目内核在关闭前检查已核实的证据。运行结束本身不能证明业务目标已经达成。'},
      {eyebrow:'经过核实的经验',status:'维护与改进',title:'让一次有用的纠正，帮助下一次工作。',rows:[['纠正','“每份客户简报都要列出尚未确认的假设。”'],['来源','保留经过审阅的结果和修改原因。'],['方法','在适用范围内修订公司的相应工作方法。'],['下一步','开发训练案例，帮助新人练习同类判断。']],note:'知识与方法更新已有实现基础。贡献归因，以及真实工作到培训的完整闭环仍在开发。'}
    ]
  };
  let lang='en';
  try { const requested=new URLSearchParams(location.search).get('lang');lang=['en','zh'].includes(requested)?requested:localStorage.getItem('anc-site-language')==='zh'?'zh':'en'; } catch {}
  let activeStep=0;
  let activeFilter='all';
  const escapeHtml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderPanel(){
    const p=panels[lang][activeStep];
    document.querySelectorAll('[data-step]').forEach(b=>{const selected=Number(b.dataset.step)===activeStep;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
    const el=document.getElementById('step-panel');el.setAttribute('aria-labelledby','step-'+activeStep);
    el.innerHTML=`<div class="panel-eyebrow"><span>${escapeHtml(p.eyebrow)}</span><span class="panel-status">${escapeHtml(p.status)}</span></div><h3>${escapeHtml(p.title)}</h3><div class="panel-rows">${p.rows.map(([a,b])=>`<div class="panel-row"><span>${escapeHtml(a)}</span><strong>${escapeHtml(b)}</strong></div>`).join('')}</div><p class="panel-note">${escapeHtml(p.note)}</p>`;
  }
  function renderFAQ(){
    const query=document.getElementById('faq-search').value.trim().toLocaleLowerCase();
    const items=(window.ANC_FAQ||[]).filter(item=>(activeFilter==='all'||item.category===activeFilter)&&(!query||[item.en.q,item.en.a,item.zh.q,item.zh.a].join(' ').toLocaleLowerCase().includes(query)));
    const openIds=new Set([...document.querySelectorAll('.faq-item[open]')].map(e=>e.id));
    const list=document.getElementById('faq-list');list.replaceChildren();
    items.forEach(item=>{const details=document.createElement('details');details.className='faq-item';details.id='faq-'+item.id;details.open=openIds.has(details.id);const summary=document.createElement('summary');summary.textContent=item[lang].q;const p=document.createElement('p');p.textContent=item[lang].a;details.append(summary,p);list.append(details);});
    document.getElementById('faq-empty').hidden=items.length>0;
    document.getElementById('faq-count').textContent=lang==='zh'?`找到 ${items.length} 个问题`:`${items.length} questions found`;
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===activeFilter)));
  }
  function setLanguage(next){
    lang=next;document.documentElement.lang=lang==='zh'?'zh-CN':'en';
    document.querySelectorAll('[data-i18n]').forEach(e=>{e.innerHTML=(lang==='zh'?zh:en)[e.dataset.i18n]??en[e.dataset.i18n];});
    const switcher=document.getElementById('language');switcher.innerHTML=lang==='zh'?'Language: <strong>中文</strong> <span>⌄</span>':'Language: <strong>English</strong> <span>⌄</span>';switcher.setAttribute('aria-label',lang==='zh'?'Switch to English':'切换为中文');
    const input=document.getElementById('faq-search');input.placeholder=lang==='zh'?'搜索你想了解的问题':'Search questions';input.setAttribute('aria-label',lang==='zh'?'搜索常见问题':'Search frequently asked questions');
    document.title='ANC — AI Native Company';
    document.querySelector('meta[name="description"]').content=lang==='zh'?'ANC = AI Native Company，AI 原生企业。由人把握方向，让 AI 持续推进工作。了解 ANC、Bean、Dojo 与 Human on the Loop。':'ANC means AI Native Company. A shared operating foundation for people, agents, company knowledge, and real work.';
    renderPanel();renderFAQ();try{localStorage.setItem('anc-site-language',lang);}catch{}
  }
  document.getElementById('language').addEventListener('click',()=>setLanguage(lang==='en'?'zh':'en'));
  const mobileTabs=window.matchMedia('(max-width:600px)');
  const updateTabOrientation=()=>document.querySelector('.step-tabs').setAttribute('aria-orientation',mobileTabs.matches?'horizontal':'vertical');
  mobileTabs.addEventListener('change',updateTabOrientation);updateTabOrientation();
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{activeStep=Number(b.dataset.step);renderPanel();}));
  document.querySelector('.step-tabs').addEventListener('keydown',e=>{let step=activeStep;if(['ArrowDown','ArrowRight'].includes(e.key))step=(step+1)%4;else if(['ArrowUp','ArrowLeft'].includes(e.key))step=(step+3)%4;else if(e.key==='Home')step=0;else if(e.key==='End')step=3;else return;e.preventDefault();activeStep=step;renderPanel();document.getElementById('step-'+step).focus();});
  document.getElementById('next-step').addEventListener('click',()=>{activeStep=(activeStep+1)%4;renderPanel();});
  document.getElementById('faq-search').addEventListener('input',renderFAQ);
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;renderFAQ();}));
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();document.getElementById('faq-search').focus();}if(e.key==='Escape'&&document.activeElement?.id==='faq-search'){document.activeElement.value='';renderFAQ();document.activeElement.blur();}});
  setLanguage(lang);
})();
