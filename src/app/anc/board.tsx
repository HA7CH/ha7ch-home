'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, LayoutGroup, useReducedMotion } from 'motion/react';
import { Button } from '@cloudflare/kumo/components/button';
import { LayerCard } from '@cloudflare/kumo/components/layer-card';
import { CornersIn, VideoCamera, CameraSlash } from '@phosphor-icons/react';
import '@cloudflare/kumo/styles/standalone';
import s from './board.module.css';
import { presenter } from './presenter';

const MotionCard = motion.create(LayerCard);

type Kind = 'text' | 'image' | 'video' | 'web' | 'excalidraw';
type Attachment = { kind: Kind; value: string; caption: string };
type Card = { id: string; label: string; title: string; summary: string; paragraphs: string[]; media?: Attachment[]; type: string };
const cards: Card[] = [
  { id: 'definition', label: '01 / THE IDEA', title: '什么是 ANC？', summary: 'AI Native Company\n由 Lawted 提出并持续研究的框架。', type: 'definition', paragraphs: ['ANC，是我，Lawted，给 AI Native Company 想的一个缩写。后来，我把自己在企业里的实践，逐渐整理成了 ANC 框架。', '在我的定义里，一家 AI Native Company，应该能用一个很小的核心团队完成更完整的业务；公司的工作围绕 Agent 来组织。', '我们要重新考虑：信息怎么流动，任务怎么分配，什么事情由 Agent 完成，什么事情需要人来判断。'] },
  { id: 'origin', label: '02 / IN THE FIELD', title: '从一个赛车队开始', summary: '工程师、公关、后勤。\n信息为什么都要经过老板？', type: 'origin', paragraphs: ['这个方案的起源，是我之前给一个保时捷赛车队做的项目。', '工程师掌握轮胎的信息，公关需要赞助商的资料，后勤安排出行。很多信息最后都汇集到老板那里，再由老板整理、转给其他人。', '我们开始把资料和工作经验接起来，让团队通过 Agent 找到需要的信息。工作中反复纠正的方法，再逐渐沉淀成 Skill。', '这个经历让我开始思考：怎样用 Agent 重新组织整个团队的协作？'] },
  { id: 'shift', label: '03 / THE SHIFT', title: '网页越来越容易做。\n价值留在哪里？', summary: '从交付一个系统，到改变公司的工作方式。', type: 'shift', paragraphs: ['在赛车队项目之前，我跟很多 FDE 一样，主要做 vibe SaaS，也给物流公司做过网页系统。', '随着模型变强，做网页和功能的门槛持续下降。老板可能会问：“我用 WorkBuddy 也能做一个网页，你这个为什么值钱？”', '网页系统依然可以解决真实问题。但如果价值停留在页面和功能本身，就很容易被复制，也会不断陷入维护和改需求。', '我开始把注意力放到更深一层：AI 怎样改变公司的信息流、工作分工与成本结构？'] },
  { id: 'harness', label: '04 / HOW IT WORKS', title: '围绕 Agent，重新组织工作。', summary: 'Agent 会的，直接执行。需要人的，交给合适的人。', type: 'harness', paragraphs: ['从 Agent 的角度看，工作需要的 Skill 可以分成两类：它已经会的，以及它还不会、需要人来完成的。', '我们也可以把每个人擅长的能力，看成公司可以调用的 Skill。这里调用的是人的能力与协作，具体责任仍然需要明确。', 'Agent 能做的部分自己完成；需要人的判断、关系或者现场行动，就交给合适的人。人完成以后，结果再回到工作流程里。', 'Harness 是把这些能力组织起来的机制：给出上下文、连接能力、控制权限、接住结果，让任务真正完成。'] },
  { id: 'evidence', label: '05 / THE EVIDENCE', title: '个人变快，\n公司也变快了吗？', summary: '麦肯锡 · The State of AI 2026', type: 'evidence', paragraphs: ['大家都用 Codex，每个人完成自己那部分工作的时间缩短了。但项目仍然可能卡在交接、等待和反复沟通上。', '麦肯锡 2026 年调查中，AI 高绩效企业受访者有接近四分之三表示，因使用 AI 而根本性地重新设计了工作流；去年为 55%。其他受访者中，只有约四分之一报告这种改变。', '这是调查中的关联，不能据此断言重新设计流程一定带来高绩效。但它提示我们：企业层面的变化，值得从工作流重新设计开始研究。'] },
  { id: 'camera', label: '06 / CAMERA', title: '摄像头', summary: '', type: 'camera', paragraphs: [] },
];
const compactNotes: Record<string, { title: string; detail: string }> = {
 definition: { title: '什么是 ANC？', detail: 'AI Native Company' },
 origin: { title: '赛车队实践', detail: '工程师 · 公关 · 后勤' },
 shift: { title: '交付的变化', detail: 'vibe SaaS → ANC 架构' },
 harness: { title: 'Agent 组织工作', detail: '会的直接做，需要人就协作' },
 evidence: { title: '≈ ¾ 高绩效企业', detail: '因 AI 重新设计工作流' },
};
const source = 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai';
function validURL(value: string) { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol); } catch { return false; } }
function Artwork({kind}: {kind: 'origin' | 'harness' | 'shift'}) {
 if (kind === 'shift') return <img className={s.artwork} src="/anc-notes-assets/shift-simple-v1.png" alt="从 vibe SaaS 网页交付，到围绕 Agent 组织工作方式。"/>;
 const label = kind === 'origin' ? '赛车队的信息瓶颈：工程师、公关、后勤的信息都汇到老板。' : '业务目标交给 Agent，分别由 Agent 执行或人来协作，汇集结果并反馈给 Agent。';
 if (kind === 'origin') return <img className={s.artwork} src="/anc-notes-assets/race-simple-v2.png" alt={label}/>;
 const x = 782;
 return <svg className={s.artwork} viewBox={`${x} 16 736 988`} role="img" aria-label={label}><defs><clipPath id={`art-${kind}`}><rect x={x} y="16" width="736" height="988"/></clipPath></defs><image clipPath={`url(#art-${kind})`} href="/anc-notes-assets/anc-illustrations-v1.png" width="1536" height="1024"/></svg>;
}
function Media({ item }: { item: Attachment }) {
 const [status, setStatus] = useState('loading');
 if (item.kind === 'text') return <div className={s.textBlock}>{item.value}</div>;
 if (!validURL(item.value)) return <p>素材地址不可用，请编辑并填写完整的 HTTP 或 HTTPS 链接。</p>;
 const directVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(item.value);
 return <figure className={s.media}>
 {status === 'loading' && <div className={s.loading}>正在载入素材…</div>}
 {status === 'error' ? <p role="alert">素材暂时无法加载，请检查链接或打开原页面。</p> : item.kind === 'image' ?
 // eslint-disable-next-line @next/next/no-img-element
 <img src={item.value} alt={item.caption || '讲解图片'} onLoad={()=>setStatus('ready')} onError={()=>setStatus('error')} /> : item.kind === 'video' && directVideo ? <video src={item.value} controls preload="metadata" onLoadedMetadata={()=>setStatus('ready')} onError={()=>setStatus('error')} /> : <iframe src={item.value} title={item.caption || '嵌入素材'} loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" allow="fullscreen; picture-in-picture" allowFullScreen onLoad={()=>setStatus('ready')} onError={()=>setStatus('error')} />}
 <figcaption>{item.caption}<a href={item.value} target="_blank" rel="noreferrer">打开原页面 ↗</a></figcaption>
 {(item.kind === 'web' || item.kind === 'excalidraw' || (item.kind === 'video' && !directVideo)) && <small>若页面限制嵌入，请通过「打开原页面」查看。</small>}
 </figure>;
}
export default function Board() {
 const reduceMotion = useReducedMotion();
 const layoutTransition = reduceMotion ? { duration: 0 } : { type: "spring" as const, duration: 0.36, bounce: 0 };
 const [stream, setStream] = useState<MediaStream | null>(null);
 const streamRef = useRef<MediaStream | null>(null);
 const [cameraPending,setCameraPending] = useState(false);
 const [cameraError,setCameraError] = useState('');
 const [mirrored,setMirrored] = useState(true);
 const cameraRequest = useRef(0);
 useEffect(()=>()=>{ cameraRequest.current++; streamRef.current?.getTracks().forEach(t=>t.stop()); },[]);
 function stopCamera() { cameraRequest.current++; streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; setStream(null); setCameraPending(false); }
 async function startCamera() {
  const request = ++cameraRequest.current;
  setCameraPending(true); setCameraError('');
  try {
   if(!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
   const media = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
   if(request !== cameraRequest.current) { media.getTracks().forEach(t=>t.stop()); return; }
   streamRef.current=media; setStream(media);
   media.getVideoTracks()[0]?.addEventListener('ended',()=>{if(streamRef.current===media){setStream(null);streamRef.current=null;setCameraError('摄像头连接已断开，请重新开启。');}});
  } catch(e) { if(request === cameraRequest.current) { const name=e instanceof Error?e.name:''; setCameraError(name==='NotAllowedError'?'未获得摄像头权限，请在浏览器中允许后重试。':name==='NotFoundError'?'没有找到摄像头，请连接后重试。':'摄像头暂时无法开启，请检查是否被其他应用占用。'); } }
  finally { if(request === cameraRequest.current) setCameraPending(false); }
 }
 const cameraView = <div className={s.cameraView}>
  <div className={s.cameraBio}><div className={s.cameraIdentity}><strong>{presenter.name}</strong>{presenter.role.split(' · ').map(role=><span key={role}>{role}</span>)}</div><p>{presenter.credentials.map(line=><span key={line}>{line}</span>)}</p></div>
  <div className={s.cameraScreen}>{stream ? <video ref={el=>{if(el && el.srcObject!==stream)el.srcObject=stream;}} autoPlay muted playsInline className={mirrored?s.mirrored:''} aria-label="实时摄像头画面"/> : <div className={s.cameraEmpty}><VideoCamera size={28}/><Button variant="secondary" size="sm" disabled={cameraPending} onClick={startCamera}>{cameraPending?'正在开启…':'开启摄像头'}</Button></div>}</div>
  {cameraError && <p role="alert" className={s.cameraError}>{cameraError}</p>}
  {stream && <div className={s.cameraControls}><Button variant="secondary" size="sm" aria-pressed={mirrored} onClick={()=>setMirrored(!mirrored)}>镜像</Button><Button variant="secondary" size="sm" onClick={stopCamera}><CameraSlash size={14}/>关闭</Button></div>}
 </div>;
 const [mode, setMode] = useState<'light' | 'dark'>('light');
 useEffect(()=>{ const media=window.matchMedia('(prefers-color-scheme: dark)'); const sync=()=>setMode(media.matches?'dark':'light'); sync(); media.addEventListener('change',sync); return ()=>media.removeEventListener('change',sync); },[]);
 const [active, setActive] = useState<number | null>(null);
 const [portrait, setPortrait] = useState(true);
 useEffect(()=>{ const handle=(e:KeyboardEvent)=>{if(e.key==='Escape')setActive(null); const target=e.target; if(e.repeat || e.isComposing || (target instanceof HTMLElement && (target.isContentEditable || target.closest('input,textarea,select')))) return; if(e.code==='KeyV' && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey){e.preventDefault();setPortrait(value=>!value);}};window.addEventListener('keydown',handle);return ()=>window.removeEventListener('keydown',handle);},[]);
 return <main className={`${s.board} ${portrait?s.portrait:''}`} data-aspect={portrait?'2:3':'auto'} aria-keyshortcuts="Shift+V" data-theme="kumo" data-mode={mode} lang="zh-CN">
 <LayoutGroup><div className={`${s.grid} ${active !== null ? s.hasExpanded : ''}`}>
 {cards.map((c,i)=><MotionCard layout layoutDependency={`${active}-${portrait}`} transition={{layout:layoutTransition}} style={{borderRadius:8,boxShadow:"var(--color-kumo-line) 0px 0px 0px 1px"}} key={c.id} className={`${s.card} ${s[c.type]} ${active===i?s.expanded:''}`}>
 {active===i ? <motion.section key="expanded" layout="position" className={s.expandedContent} aria-label={c.title} initial={{opacity:0}} animate={{opacity:1}} transition={{layout:layoutTransition,opacity:{duration:reduceMotion?0:.14}}}>
 <button type="button" className={s.collapse} aria-label="收起卡片" onClick={()=>setActive(null)}><CornersIn size={18}/></button>
 <motion.div layoutScroll className={s.reading}>
 <img src="/ha7ch.svg" alt="HA7CH" className={c.type==='camera'?s.expandedCameraLogo:s.logo}/>
 {c.type!=='camera' && <h2>{c.title}</h2>}
 {c.type==='camera'?cameraView:<><p className={s.summary}>{c.summary}</p>{(c.type==='origin'||c.type==='harness'||c.type==='shift')&&<Artwork kind={c.type}/>}<div className={s.prose}>{c.paragraphs.map(p=><p key={p}>{p}</p>)}</div></>}
 {c.type==='definition' && <div className={s.acronym} aria-label="ANC：AI Native Company">{[['A','AI'],['N','Native'],['C','Company']].map(([letter,word])=><div key={letter}><strong>{letter}</strong><span>{word}</span></div>)}</div>}
 {c.type==='evidence' && <div className={s.research}>{[{label:'AI 高绩效企业',value:'≈ ¾',filled:3},{label:'其他受访者',value:'≈ ¼',filled:1}].map(row=><div className={s.comparisonRow} key={row.label}><div className={s.comparisonLabel}><span>{row.label}</span><strong>{row.value}</strong></div><div className={s.comparisonTrack} aria-hidden="true">{[0,1,2,3].map(segment=><i key={segment} className={segment<row.filled?s.segmentFilled:undefined}/>)}</div></div>)}<a href={source} target="_blank" rel="noreferrer">The State of AI in 2026: On the Road to ROI ↗</a></div>}
 {c.media?.map((a,j)=><Media key={j} item={a}/>)}
 </motion.div></motion.section> : <>
 <button type="button" className={`${s.tileTrigger} ${c.type==='camera'?s.cameraTrigger:''}`} aria-label={`展开：${c.title}`} aria-expanded="false" onClick={()=>setActive(i)}/>
 <motion.div key="preview" layout="position" className={s.preview} initial={{opacity:0}} animate={{opacity:1}} transition={{layout:layoutTransition,opacity:{duration:reduceMotion?0:.12}}}>
 {active!==null && c.type!=='camera'?<div className={s.compact}><strong>{compactNotes[c.id].title}</strong><span>{compactNotes[c.id].detail}</span></div>:c.type==='definition'?<><img src="/ha7ch.svg" alt="HA7CH" className={s.logo}/><div className={s.anc}>ANC</div><h2>{c.title}</h2><p>{c.summary}</p></>:c.type==='camera'?cameraView:c.type==='harness'?<><h2>{c.title}</h2><p>{c.summary}</p></>:c.type==='evidence'?<><h2>{c.title}</h2><div className={s.stat}>≈ ¾<small>AI 高绩效企业受访者<br/>根本性重设计工作流</small></div><p>{c.summary}</p></>:<><h2>{c.title}</h2>{c.type==='shift'&&<div className={s.shiftVisual}><span>vibe SaaS</span><b>→</b><strong>ANC 架构</strong></div>}<p>{c.summary}</p></>}
 </motion.div></>}
 </MotionCard>)}
 </div></LayoutGroup></main>;
}
