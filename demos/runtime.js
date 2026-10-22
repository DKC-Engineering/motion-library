/* Original DKC reference implementations, MIT. Recipe text: CC BY 4.0. */
(() => {
  'use strict';
  const titles = {
    'magnetic-button':'Magnetic button', 'morphing-toggle':'Morphing toggle', 'staggered-menu':'Staggered menu',
    'kinetic-wordmark':'Kinetic wordmark', 'feature-launch':'Three-feature product launch', 'metric-count-up':'Metric count-up',
    'process-flow':'Process flow', 'bar-race':'Ranked bars', 'orbiting-system':'Orbiting system',
    'isometric-cube':'Rotating wire cube', 'aurora-curtain':'Aurora curtain', 'particle-assembly':'Particle assembly',
  };
  const id = new URLSearchParams(location.search).get('id') || 'kinetic-wordmark';
  if (new URLSearchParams(location.search).has('embed')) document.body.classList.add('embedded');
  const canvas = document.getElementById('stage');
  const c = canvas.getContext('2d');
  const ui = document.getElementById('ui');
  const play = document.getElementById('play');
  const time = document.getElementById('time');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ink = '#f2f1ed', accent = '#df8c63', quiet = '#a1b78c';
  let t = 0, playing = false, frame = 0, last = 0;
  if (!Object.hasOwn(titles, id)) { document.getElementById('caption').textContent = 'No reference implementation is available for this recipe.'; return; }
  document.title = `${titles[id]} — DKC reference`;
  canvas.setAttribute('aria-label', `${titles[id]}. Original DKC reference implementation with illustrative content.`);
  const ease = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const label = (text, x, y, size = 24, color = ink, align = 'left') => { c.fillStyle=color;c.font=`${size}px Arial, sans-serif`;c.textAlign=align;c.fillText(text,x,y); };
  const line = (x1,y1,x2,y2,color=quiet,width=2) => { c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke(); };
  const dot = (x,y,r,color=accent) => { c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill(); };
  const box = (x,y,w,h,color='#2c2f27',r=10) => { c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill(); };
  const project = ([x,y,z]) => { const scale=520/(520+z);return [480+x*scale,265+y*scale,scale]; };
  let targets = [];
  if (id === 'particle-assembly') {
    const mask=document.createElement('canvas');mask.width=960;mask.height=540;const m=mask.getContext('2d');
    m.font='bold 150px Arial';m.textAlign='center';m.fillText('BUILD',480,320);const pixels=m.getImageData(0,0,960,540).data;
    for(let y=150;y<340;y+=10)for(let x=160;x<800;x+=10)if(pixels[(y*960+x)*4+3]>100)targets.push([x,y]);
    targets=targets.slice(0,400);
  }
  if (id === 'magnetic-button') {
    ui.hidden=false;
    ui.innerHTML='<h1>Close enough to feel it.</h1><button class="magnet" type="button"><span>Try the pull</span></button><small>The hit area stays still. Keyboard focus stays visible.</small>';
    const button=ui.querySelector('button'),surface=ui.querySelector('span');
    button.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;const r=button.getBoundingClientRect();surface.style.transform=`translate(${Math.max(-8,Math.min(8,(e.clientX-r.left-r.width/2)*.1))}px,${Math.max(-8,Math.min(8,(e.clientY-r.top-r.height/2)*.1))}px)`;});
    button.addEventListener('pointerleave',()=>{surface.style.transform='translate(0,0)';});
  } else if (id === 'morphing-toggle') {
    ui.hidden=false;
    ui.innerHTML='<h1>A small change of state.</h1><label class="toggle"><input type="checkbox" aria-label="Enable notifications"><span class="track" aria-hidden="true"><span class="thumb"></span></span><span>Notifications</span></label><small>Native checkbox. Space to toggle.</small>';
  } else if (id === 'staggered-menu') {
    ui.hidden=false;
    ui.innerHTML='<h1>One opening. Three arrivals.</h1><div class="menu"><button type="button" aria-expanded="false" aria-controls="demo-nav">Explore recipes</button><nav id="demo-nav" hidden aria-label="Example navigation"><a href="#interface">Interface motion</a><a href="#films">Product films</a><a href="#scenes">Procedural scenes</a></nav></div>';
    ui.querySelector('button').addEventListener('click',()=>{const b=ui.querySelector('button'),n=ui.querySelector('nav');const opened=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!opened));n.hidden=opened;});
    ui.addEventListener('keydown',e=>{if(e.key==='Escape'){ui.querySelector('nav').hidden=true;ui.querySelector('button').setAttribute('aria-expanded','false');ui.querySelector('button').focus();}});
  }
  function draw(s) {
    c.globalAlpha=1;c.fillStyle='#191a16';c.fillRect(0,0,960,540);
    c.save();
    if (id === 'kinetic-wordmark') {
      const word='MAKE IT MOVE';const widths=[...word].map(ch=>{c.font='68px Arial';return c.measureText(ch).width;});let x=(960-widths.reduce((a,b)=>a+b,0))/2;
      [...word].forEach((ch,i)=>{const p=ease((s-i*.06)/.6);c.globalAlpha=p;label(ch,x,290+(1-p)*24,68);x+=widths[i];});c.globalAlpha=1;
      label('A title, a beat, a little room to breathe.',480,355,20,quiet,'center');
    } else if (id === 'feature-launch') {
      const scenes=[['Your next release.','A product film study'],['Capture','A place for the initial idea'],['Shape','Turn the idea into a useful draft'],['Share','Put the result in front of your team'],['From idea to draft.','Illustrative product interface'],['Ready when you are.','Your final call to action']];
      const n=Math.min(5,Math.floor(s/2)),local=s-n*2,p=ease(local/.5);box(140+(1-p)*45,125,680,270,'#282c23',20);box(175,157,610,8,quiet,4);label(scenes[n][0],205,270,64);label(scenes[n][1],205,325,24,quiet);dot(740,345,20,accent);
    } else if (id === 'metric-count-up') {
      const value=Math.round(ease(s/1.6)*128);label(`${value}`,480,295,132,ink,'center');label('Illustrative units processed',480,350,25,quiet,'center');label('Demo data • replace with your measured value',480,395,17,quiet,'center');
    } else if (id === 'process-flow') {
      const labels=['Collect','Review','Publish'];for(let i=0;i<3;i++){const p=ease((s-i*1.1)/.7);c.globalAlpha=p;box(125+i*255,210,200,110,'#2c2f27');label(labels[i],225+i*255,255,28,ink,'center');c.globalAlpha=1;if(i<2&&s>i*1.1+.6)line(330+i*255,285,370+i*255,285,quiet,3);}
      if(s>1){const p=Math.min(1,(s-1)/4.5);dot(225+p*510,285,7,accent);}label('A three-step illustrative workflow',480,390,20,quiet,'center');
    } else if (id === 'bar-race') {
      const start=[80,55,35,20],end=[48,86,65,29],p=ease(s/5);const items=start.map((v,i)=>({i,value:v+(end[i]-v)*p})).sort((a,b)=>b.value-a.value);
      items.forEach((item,rank)=>{const y=145+rank*70;label(['Alpha','Beta','Gamma','Delta'][item.i],150,y+27,22,ink,'right');box(175,y,item.value*5,36,[accent,quiet,'#8a9aaa','#d3bf8e'][item.i],4);label(Math.round(item.value).toString(),190+item.value*5,y+27,22);});label('Illustrative units • two example snapshots',480,470,17,quiet,'center');
    } else if (id === 'orbiting-system') {
      const bodies=[];for(let i=0;i<3;i++){const radius=110+i*70,tilt=1.1-i*.1;const at=a=>{const x=Math.cos(a)*radius,y=Math.sin(a)*radius*Math.cos(tilt),z=Math.sin(a)*radius*Math.sin(tilt);return {p:project([x*Math.cos(-.3)-y*Math.sin(-.3),x*Math.sin(-.3)+y*Math.cos(-.3),z]),z};};c.strokeStyle='#515746';c.lineWidth=1;c.beginPath();for(let n=0;n<=100;n++){const {p}=at(n/100*Math.PI*2);if(n)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);}c.stroke();const {p,z}=at(s/12*Math.PI*2*(i+1));bodies.push({x:p[0],y:p[1],r:(9+i*3)*p[2],z});}bodies.sort((a,b)=>b.z-a.z);bodies.filter(b=>b.z>0).forEach(b=>dot(b.x,b.y,b.r,quiet));dot(480,265,40,accent);bodies.filter(b=>b.z<=0).forEach(b=>dot(b.x,b.y,b.r,quiet));label('Three planes. One center.',480,435,22,quiet,'center');
    } else if (id === 'isometric-cube') {
      const a=s/12*Math.PI*2,b=.35+Math.sin(a)*.13;const vertices=[];for(let i=0;i<8;i++){const x=(i&1?1:-1)*105,y=(i&2?1:-1)*105,z=(i&4?1:-1)*105;const xx=x*Math.cos(a)-z*Math.sin(a),zz=x*Math.sin(a)+z*Math.cos(a);vertices.push(project([xx,y*Math.cos(b)-zz*Math.sin(b),y*Math.sin(b)+zz*Math.cos(b)]));}
      for(let i=0;i<8;i++)for(let bit=1;bit<=4;bit*=2){const j=i^bit;if(j>i){c.globalAlpha=Math.min(1,(vertices[i][2]+vertices[j][2])*.4);line(vertices[i][0],vertices[i][1],vertices[j][0],vertices[j][1],accent,3);}}c.globalAlpha=1;label('Perspective wire cube',480,450,22,quiet,'center');
    } else if (id === 'aurora-curtain') {
      const phase=s/12*Math.PI*2;for(let ribbon=0;ribbon<4;ribbon++){for(let layer=18;layer>0;layer--){c.strokeStyle=`rgba(150,200,150,${.013+(18-layer)*.001})`;c.lineWidth=layer*3;c.beginPath();for(let x=0;x<=960;x+=5){const y=180+ribbon*37+Math.sin(x*.005+phase+ribbon)*45+Math.sin(x*.012-phase*2)*18;if(!x)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}}label('Slow light. No textures.',480,435,24,ink,'center');
    } else if (id === 'particle-assembly') {
      const p=s<4?ease(s/4):s<8?1:1-ease((s-8)/4);targets.forEach(([x,y],i)=>{const sx=(i*137.508)%960,sy=(i*73.17)%540;const k=ease(Math.max(0,Math.min(1,(p-(i%13)*.006)/.92)));dot(sx+(x-sx)*k,sy+(y-sy)*k,2.5,i%3?quiet:accent);});label('Stable points. Shared destination.',480,440,22,quiet,'center');
    }
    c.restore();c.globalAlpha=1;label('DARKKNIGHT CAVE / MOTION STUDY',38,45,13,quiet);label(titles[id],38,505,16,ink);label('DKC REFERENCE',922,505,12,quiet,'right');
  }
  function seek(value){t=Math.max(0,Math.min(12,Number(value)||0));draw(t);time.value=String(t);document.getElementById('position').textContent=`${t.toFixed(2)}s`;return t;}
  function tick(now){if(!playing)return;if(last)t=(t+(now-last)/1000)%12;last=now;seek(t);frame=requestAnimationFrame(tick);}
  function pause(){playing=false;cancelAnimationFrame(frame);last=0;play.textContent='Play';play.setAttribute('aria-label','Play reference');}
  function start(){if(playing)return;playing=true;last=0;play.textContent='Pause';play.setAttribute('aria-label','Pause reference');frame=requestAnimationFrame(tick);}
  play.addEventListener('click',()=>playing?pause():start());
  document.getElementById('replay').addEventListener('click',()=>{pause();seek(0);if(!reduced.matches)start();});
  time.addEventListener('input',()=>{pause();seek(time.value);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  reduced.addEventListener('change',()=>{if(reduced.matches){pause();seek(6);}});
  window.seek=seek;window.pause=pause;window.motionDemo={id,title:titles[id],duration:12,implementation:'DKC reference',ready:true};
  seek(reduced.matches?6:0);
  if(reduced.matches||!ui.hidden)pause();else start();
})();
