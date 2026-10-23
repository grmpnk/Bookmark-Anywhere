// ==UserScript==
// @name         Bookmark Anywhere
// @namespace    https://github.com/grmpnk
// @version      1.1
// @description  Useful for sites that do not provide a bookmark feature.
// @author       grmpneko
// @match        http*://*/*
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij4KICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyOCIgZmlsbD0iIzRBNzBGRiIvPgogIDxwYXRoIGQ9Ik0zMiAxNGMxMCAwIDE4IDggMTggMThzLTggMTgtMTggMThTMTQgNDIgMTQgMzJzOC0xOCAxOC0xOHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxwYXRoIGQ9Ik0zMiAxNGMwIDEwIDAgMjYgMCAzNiBNMTQgMzJoMzYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIvPgogIDxwYXRoIGQ9Ik0zMiAyMGwzLjcgNy41IDguMyAxLjItNiA1LjggMS40IDguMi03LjQtMy45LTcuNCAzLjkgMS40LTguMi02LTUuOCA4LjMtMS4yeiIgZmlsbD0iI0ZGQzEwNyIvPgo8L3N2Zz4=
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_openInTab
// @run-at       document-start
// @license      MIT
// ==/UserScript==
// ==========================================
// Utils
// ==========================================
let w=typeof unsafeWindow!=='undefined'?unsafeWindow:window,d=document,l=console.log,$S=s=>document.querySelector(s),$SA=s=>document.querySelectorAll(s),$C=(tag,{attrs={},props={},styles={},on={}}={})=>{const el=document.createElement(tag);for(const [name,value] of Object.entries(attrs)){if(value===false||value==null)continue;if(value===true)el.setAttribute(name,"");else el.setAttribute(name,String(value));}Object.assign(el,props);Object.assign(el.style,styles);for(const [ev,handler] of Object.entries(on)){if(typeof handler==="function")el.addEventListener(ev,handler);}return el;};
// ==========================================
// Main
// ==========================================
(async()=>{
    if(top!==self)return;
    const KEY='bookmarks',NAME='__bookmarks_view__';
    const load=async()=>await GM.getValue(KEY,{tabs:[],sites:{}});
    const save=async data=>await GM.setValue(KEY,data);

    const apply=(data,op)=>{
        if(op.t==='mktab')return {...data,tabs:data.tabs.includes(op.n)?data.tabs:[...data.tabs,op.n]};
        if(op.t==='import'){
            const tabs=[...new Set([...data.tabs,...op.data.tabs])];
            const sites={...data.sites};
            for(const [o,s] of Object.entries(op.data.sites)){
                const cur=sites[o]||{folders:[],items:[],tab:''};
                sites[o]={tab:cur.tab||s.tab||'',folders:[...new Set([...cur.folders,...s.folders])],items:[...cur.items,...s.items.filter(i=>!cur.items.some(x=>x.url===i.url))]};
            }
            return {tabs,sites};
        }
        if(op.t==='rmtab')return {tabs:data.tabs.filter(t=>t!==op.n),sites:Object.fromEntries(Object.entries(data.sites).map(([o,s])=>[o,s.tab===op.n?{...s,tab:''}:s]))};
        const cur=data.sites[op.o]||{folders:[],items:[],tab:''};
        const next={
            add:()=>cur.items.some(i=>i.url===op.url)?cur:{...cur,items:[{name:op.name,url:op.url,folder:''},...cur.items]},
            del:()=>({...cur,items:cur.items.filter(i=>!op.urls.includes(i.url))}),
            move:()=>({...cur,items:cur.items.map(i=>op.urls.includes(i.url)?{...i,folder:op.f}:i)}),
            settab:()=>({...cur,tab:op.n}),
            mkdir:()=>({...cur,folders:cur.folders.includes(op.f)?cur.folders:[op.f,...cur.folders]}),
            rmdir:()=>({...cur,folders:cur.folders.filter(f=>f!==op.f),items:cur.items.map(i=>i.folder===op.f?{...i,folder:''}:i)})
        }[op.t]();
        const rest=Object.fromEntries(Object.entries(data.sites).filter(([o])=>o!==op.o));
        if(!next.items.length&&!next.folders.length)return {...data,sites:rest};
        return {...data,sites:op.t==='add'?{[op.o]:next,...rest}:{...data.sites,[op.o]:next}};
    };

    const arrow="url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' fill='none' stroke='%2300d4ff' stroke-width='2' stroke-linecap='round'/></svg>\")";
    const css=`
:root{color-scheme:dark;--bg:#0b0d17;--card:rgba(255,255,255,.05);--line:rgba(255,255,255,.1);--fg:#e8eaf6;--mute:#8b90a8;--a:#7c5cff;--b:#00d4ff;--red:#ff4d6d}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;font:14px/1.5 system-ui,'Segoe UI','Hiragino Sans',sans-serif;color:var(--fg);background:radial-gradient(900px 500px at 10% -10%,rgba(124,92,255,.35),transparent),radial-gradient(800px 500px at 100% 0,rgba(0,212,255,.22),transparent),var(--bg);background-attachment:fixed}
main{max-width:900px;margin:0 auto;padding:48px 20px 80px}
header{margin-bottom:24px}
h1{margin:0;font-size:34px;letter-spacing:-.02em;background:linear-gradient(90deg,var(--a),var(--b));-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{color:var(--mute);margin-top:4px}
.tabs{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px}
.tabs input[type=text]{flex:0 1 200px;min-width:140px}
.actions{position:sticky;top:0;z-index:5;display:flex;gap:10px;align-items:center;padding:10px 0;margin-bottom:12px;background:rgba(11,13,23,.7);backdrop-filter:blur(12px)}
.hint{color:var(--mute);font-size:12px}
button.tab{border-radius:999px;padding:6px 16px}
button.tab.on,button.primary{background:linear-gradient(135deg,var(--a),var(--b));border:0;color:#fff;font-weight:600}
.over{outline:2px dashed var(--b);outline-offset:-2px;background:rgba(0,212,255,.1)}
.site{background:var(--card);border:1px solid var(--line);border-radius:16px;margin-bottom:14px;backdrop-filter:blur(14px);overflow:hidden;transition:border-color .2s,box-shadow .2s}
.site[open]{border-color:rgba(124,92,255,.55);box-shadow:0 10px 40px rgba(124,92,255,.15)}
summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;user-select:none}
.site>summary{padding:16px 18px;cursor:grab}
summary::-webkit-details-marker{display:none}
summary:hover{background:rgba(255,255,255,.04)}
.chev{width:8px;height:8px;flex:none;border-right:2px solid var(--b);border-bottom:2px solid var(--b);transform:rotate(-45deg);transition:transform .2s}
details[open]>summary .chev{transform:rotate(45deg)}
.origin{font-weight:600;flex:1;word-break:break-all}
.tag{border:1px solid var(--b);color:var(--b);border-radius:999px;padding:0 10px;font-size:12px}
.badge{background:linear-gradient(135deg,var(--a),var(--b));color:#fff;border-radius:999px;padding:1px 10px;font-size:12px;font-weight:600}
.body{padding:4px 18px 18px;border-top:1px solid var(--line)}
.tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 0 4px}
.tools label{display:flex;gap:6px;align-items:center;color:var(--mute)}
input[type=text],select{background-color:rgba(0,0,0,.35);border:1px solid var(--line);color:var(--fg);border-radius:10px;padding:7px 10px;outline:none;font:inherit}
select{appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:32px;background-image:${arrow};background-repeat:no-repeat;background-position:right 11px center;background-size:12px 8px;transition:border-color .2s,background-color .2s}
select:hover{border-color:var(--a);background-color:rgba(124,92,255,.15)}
option{background:#14162a;color:var(--fg);padding:8px}
option:checked{background:#2a2160}
input[type=text]{flex:1;min-width:180px}
input[type=text]:focus,select:focus{border-color:var(--b)}
input[type=checkbox]{accent-color:var(--a);width:16px;height:16px;flex:none}
button{cursor:pointer;border:1px solid var(--line);background:rgba(255,255,255,.07);color:var(--fg);border-radius:10px;padding:7px 12px;font:inherit;transition:transform .1s,background .2s}
button:hover:not(:disabled){background:rgba(255,255,255,.14);transform:translateY(-1px)}
button.primary:hover:not(:disabled){background:linear-gradient(135deg,var(--a),var(--b));filter:brightness(1.15)}
button:disabled{opacity:.4;cursor:not-allowed}
button.danger{color:var(--red);border-color:rgba(255,77,109,.4)}
button.danger:hover:not(:disabled){background:rgba(255,77,109,.15)}
.folder{margin-top:12px;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.folder>summary{padding:8px 12px}
.name{flex:1;font-weight:600;color:var(--b)}
.folder .badge{background:rgba(255,255,255,.12)}
ul{list-style:none;margin:0;padding:4px 6px 8px}
li{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:12px;cursor:grab}
li:hover{background:rgba(255,255,255,.06)}
.ava{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-weight:700;background:linear-gradient(135deg,var(--a),var(--b));flex:none}
.txt{flex:1;min-width:0;display:flex;flex-direction:column}
.txt a{color:var(--fg);text-decoration:none;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.txt a:hover{color:var(--b)}
.txt small{color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.empty{color:var(--mute);text-align:center;padding:60px 0}
`;

    let toggleId=null,queue=Promise.resolve(),win=null,sub=null,tabsBar=null,list=null,openBtn=null,active='All',drag=null;
    const picked=new Set(),opened=new Set();
    const mark=(set,key,on)=>set[on?'add':'delete'](key);
    const btn=(text,fn,cls='')=>$C('button',{attrs:{type:'button',class:cls},props:{textContent:text},on:{click:fn}});
    const updateBar=()=>{
        if(!openBtn)return;
        openBtn.textContent='Open selected ('+picked.size+')';
        openBtn.disabled=!picked.size;
    };
    const choose=(url,on)=>{
        mark(picked,url,on);
        updateBar();
    };
    const zone=(el,accept,fn)=>{
        el.addEventListener('dragover',e=>{
            if(!accept())return;
            e.preventDefault();
            el.classList.add('over');
        });
        el.addEventListener('dragleave',e=>{
            if(!el.contains(e.relatedTarget))el.classList.remove('over');
        });
        el.addEventListener('drop',e=>{
            e.preventDefault();
            el.classList.remove('over');
            if(accept())fn();
        });
        return el;
    };

    const refresh=()=>queue=queue.then(async()=>{
        const site=(await load()).sites[location.origin];
        const saved=Boolean(site&&site.items.some(i=>i.url===location.href));
        if(toggleId!==null)GM_unregisterMenuCommand(toggleId);
        toggleId=saved
            ?GM_registerMenuCommand('Unbookmark',async()=>{
            await save(apply(await load(),{t:'del',o:location.origin,urls:[location.href]}));
            await refresh();
            await render();
        })
            :GM_registerMenuCommand('Add Bookmark',async()=>{
            const name=(prompt('Name',d.title)||'').trim();
            if(!name)return;
            await save(apply(await load(),{t:'add',o:location.origin,name,url:location.href}));
            await refresh();
            await render();
        });
    });

    const stage=async op=>{
        await save(apply(await load(),op));
        picked.clear();
        await refresh();
        await render();
    };

    const row=(o,i,g)=>{
        const own=new Set(g.items.map(x=>x.url));
        const li=$C('li',{attrs:{draggable:'true'},on:{
            dragstart:e=>{
                drag={k:'items',o,urls:picked.has(i.url)?[...picked].filter(u=>own.has(u)):[i.url]};
                e.dataTransfer.setData('text/plain',i.url);
                e.dataTransfer.effectAllowed='move';
            },
            dragend:()=>{drag=null;}
        }});
        const txt=$C('div',{attrs:{class:'txt'}});
        txt.append($C('a',{attrs:{href:i.url,target:'_blank',rel:'noopener'},props:{textContent:i.name}}),$C('small',{props:{textContent:i.url}}));
        li.append(
            $C('input',{attrs:{type:'checkbox'},props:{checked:picked.has(i.url)},on:{change:e=>choose(i.url,e.target.checked)}}),
            $C('span',{attrs:{class:'ava'},props:{textContent:[...i.name][0].toUpperCase()}}),
            txt,
            btn('Delete',()=>stage({t:'del',o,urls:[i.url]}),'danger'));
        return li;
    };

    const folderBlock=(o,label,f,items,g)=>{
        const key=o+'\n'+f;
        const urls=items.map(i=>i.url);
        const det=$C('details',{attrs:{class:'folder'},props:{open:opened.has(key)},on:{toggle:e=>mark(opened,key,e.target.open)}});
        const sum=$C('summary',{});
        sum.append(
            $C('span',{attrs:{class:'chev'}}),
            $C('input',{attrs:{type:'checkbox'},props:{checked:urls.length>0&&urls.every(u=>picked.has(u))},on:{change:e=>{urls.forEach(u=>mark(picked,u,e.target.checked));render();}}}),
            $C('span',{attrs:{class:'name'},props:{textContent:label}}),
            $C('span',{attrs:{class:'badge'},props:{textContent:items.length}}));
        if(f)sum.append(btn('Delete folder',()=>stage({t:'rmdir',o,f}),'danger'));
        const ul=$C('ul',{});
        ul.append(...items.map(i=>row(o,i,g)));
        det.append(sum,ul);
        return zone(det,()=>drag&&drag.k==='items'&&drag.o===o,()=>stage({t:'move',o,urls:drag.urls,f}));
    };

    const section=(data,o)=>{
        const g=data.sites[o];
        if(active!=='All'&&g.tab!==active)return null;
        const urls=g.items.map(i=>i.url);
        const mine=()=>urls.filter(u=>picked.has(u));
        const det=$C('details',{attrs:{class:'site'},props:{open:opened.has(o)},on:{toggle:e=>mark(opened,o,e.target.open)}});
        const sum=$C('summary',{attrs:{draggable:'true'},on:{
            dragstart:e=>{
                drag={k:'site',o};
                e.dataTransfer.setData('text/plain',o);
                e.dataTransfer.effectAllowed='move';
            },
            dragend:()=>{drag=null;}
        }});
        sum.append($C('span',{attrs:{class:'chev'}}),$C('span',{attrs:{class:'origin'},props:{textContent:o}}));
        if(g.tab)sum.append($C('span',{attrs:{class:'tag'},props:{textContent:g.tab}}));
        sum.append($C('span',{attrs:{class:'badge'},props:{textContent:g.items.length}}));
        const all=$C('input',{attrs:{type:'checkbox'},props:{checked:urls.length>0&&urls.every(u=>picked.has(u))},on:{change:e=>{urls.forEach(u=>mark(picked,u,e.target.checked));render();}}});
        const label=$C('label',{});
        label.append(all,'Select all');
        const folderSel=$C('select',{});
        folderSel.append($C('option',{props:{value:'',textContent:'No folder'}}),...g.folders.map(f=>$C('option',{props:{value:f,textContent:f}})));
        const tabSel=$C('select',{});
        tabSel.append($C('option',{props:{value:'',textContent:'No tab'}}),...data.tabs.map(n=>$C('option',{props:{value:n,textContent:n}})));
        tabSel.value=g.tab;
        const tools=$C('div',{attrs:{class:'tools'}});
        tools.append(label,folderSel,
                     btn('Move to folder',()=>{const u=mine();if(u.length)stage({t:'move',o,urls:u,f:folderSel.value});}),
                     tabSel,
                     btn('Move site to tab',()=>stage({t:'settab',o,n:tabSel.value})),
                     btn('Delete selected',()=>{const u=mine();if(u.length)stage({t:'del',o,urls:u});},'danger'),
                     btn('Delete all',()=>stage({t:'del',o,urls},),'danger'));
        const create=btn('Create folder',()=>{const f=input.value.trim();if(f&&!g.folders.includes(f))stage({t:'mkdir',o,f});});
        const input=$C('input',{attrs:{type:'text',placeholder:'Folder name (required)'},on:{input:()=>{create.disabled=!input.value.trim();}}});
        create.disabled=true;
        const folderBar=$C('div',{attrs:{class:'tools'}});
        folderBar.append(input,create);
        const body=$C('div',{attrs:{class:'body'}});
        body.append(tools,folderBar);
        const free=g.items.filter(i=>!i.folder);
        if(free.length)body.append(folderBlock(o,'Unfiled','',free,g));
        for(const f of g.folders)body.append(folderBlock(o,'📁 '+f,f,g.items.filter(i=>i.folder===f),g));
        det.append(sum,body);
        return det;
    };
    const exportData=async()=>{
        await win.navigator.clipboard.writeText(JSON.stringify(await load()));
        win.alert('Copied to clipboard');
    };

    const importData=async()=>{
        const text=win.prompt('Paste exported bookmarks');
        if(!text)return;
        let parsed;
        try{parsed=JSON.parse(text);}catch{
            win.alert('Invalid data');
            return;
        }
        const valid=parsed&&Array.isArray(parsed.tabs)&&parsed.sites&&typeof parsed.sites==='object'&&Object.values(parsed.sites).every(s=>Array.isArray(s.folders)&&Array.isArray(s.items));
        if(!valid){
            win.alert('Invalid data');
            return;
        }
        await stage({t:'import',data:parsed});
    };
    const tabBar=data=>{
        const create=btn('Add tab',()=>{
            const n=input.value.trim();
            if(!n||n==='All'||data.tabs.includes(n))return;
            active=n;
            stage({t:'mktab',n});
        });
        const input=$C('input',{attrs:{type:'text',placeholder:'Tab name (required)'},on:{input:()=>{create.disabled=!input.value.trim();}}});
        create.disabled=true;
        const items=['All',...data.tabs].map(n=>zone(
            btn(n,()=>{active=n;picked.clear();render();},n===active?'tab on':'tab'),
            ()=>drag&&drag.k==='site',
            ()=>stage({t:'settab',o:drag.o,n:n==='All'?'':n})));
        if(active!=='All')items.push(btn('Delete tab',()=>{const n=active;active='All';stage({t:'rmtab',n});},'danger'));
        return [...items,input,create,btn('Export',exportData),btn('Import',importData)];
    };

    const render=async()=>{
        if(!win||win.closed||!list)return;
        const data=await load();
        if(active!=='All'&&!data.tabs.includes(active))active='All';
        const origins=Object.keys(data.sites);
        const secs=origins.map(o=>section(data,o)).filter(Boolean);
        sub.textContent=origins.reduce((n,o)=>n+data.sites[o].items.length,0)+' bookmarks across '+origins.length+' sites';
        tabsBar.replaceChildren(...tabBar(data));
        list.replaceChildren(...(secs.length?secs:[$C('p',{attrs:{class:'empty'},props:{textContent:'No bookmarks here yet.'}})]));
        updateBar();
    };

    const build=()=>{
        win.document.title='Bookmarks';
        sub=$C('div',{attrs:{class:'sub'}});
        tabsBar=$C('div',{attrs:{class:'tabs'}});
        list=$C('div',{});
        openBtn=btn('',()=>{
            for(const url of picked)GM_openInTab(url,{active:false,insert:true});
        },'primary');
        const actions=$C('div',{attrs:{class:'actions'}});
        actions.append(openBtn,$C('span',{attrs:{class:'hint'},props:{textContent:'Drag a site onto a tab, or a bookmark onto a folder, to move it.'}}));
        const head=$C('header',{});
        head.append($C('h1',{props:{textContent:'Bookmarks'}}),sub);
        const main=$C('main',{});
        main.append(head,tabsBar,actions,list);
        win.document.head.replaceChildren($C('meta',{attrs:{charset:'utf-8'}}),$C('style',{props:{textContent:css}}));
        win.document.body.replaceChildren(main);
    };

    // ===== ページ側で実行される関数(data URL内で動く。GM_* は使えない) =====
    const viewMain=data=>{
        const $=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
        let active='All';
        const picked=new Set();
        const main=$('main'),sub=$('div','sub'),tabs=$('div','tabs'),list=$('div'),openBtn=$('button','primary');
        openBtn.type='button';
        const head=$('header');
        head.append($('h1','','Bookmarks'),sub);
        const actions=$('div','actions');
        actions.append(openBtn);
        main.append(head,tabs,actions,list);
        document.title='Bookmarks';
        document.body.append(main);

        const updateBar=()=>{openBtn.textContent='Open selected ('+picked.size+')';openBtn.disabled=!picked.size;};
        openBtn.onclick=()=>{for(const u of picked)window.open(u,'_blank','noopener');};
        const check=(urls,on)=>{urls.forEach(u=>on?picked.add(u):picked.delete(u));render();};

        const folderBlock=(label,items)=>{
            const urls=items.map(i=>i.url);
            const det=$('details','folder'),sum=$('summary');
            const cb=$('input');cb.type='checkbox';cb.checked=urls.length>0&&urls.every(u=>picked.has(u));
            cb.onchange=()=>check(urls,cb.checked);
            sum.append($('span','chev'),cb,$('span','name',label),$('span','badge',items.length));
            const ul=$('ul');
            for(const i of items){
                const li=$('li'),c=$('input');
                c.type='checkbox';c.checked=picked.has(i.url);
                c.onchange=()=>{c.checked?picked.add(i.url):picked.delete(i.url);updateBar();};
                const txt=$('div','txt'),a=$('a','',i.name);
                a.href=i.url;a.target='_blank';a.rel='noopener';
                txt.append(a,$('small','',i.url));
                li.append(c,$('span','ava',[...i.name][0].toUpperCase()),txt);
                ul.append(li);
            }
            det.append(sum,ul);
            return det;
        };

        const section=o=>{
            const g=data.sites[o];
            if(active!=='All'&&g.tab!==active)return null;
            const det=$('details','site'),sum=$('summary');
            sum.append($('span','chev'),$('span','origin',o));
            if(g.tab)sum.append($('span','tag',g.tab));
            sum.append($('span','badge',g.items.length));
            const body=$('div','body');
            const free=g.items.filter(i=>!i.folder);
            if(free.length)body.append(folderBlock('Unfiled',free));
            for(const f of g.folders)body.append(folderBlock('📁 '+f,g.items.filter(i=>i.folder===f)));
            det.append(sum,body);
            return det;
        };

        const render=()=>{
            const origins=Object.keys(data.sites);
            sub.textContent=origins.reduce((n,o)=>n+data.sites[o].items.length,0)+' bookmarks across '+origins.length+' sites';
            tabs.replaceChildren(...['All',...data.tabs].map(n=>{
                const b=$('button',n===active?'tab on':'tab',n);
                b.type='button';
                b.onclick=()=>{active=n;picked.clear();render();};
                return b;
            }));
            const secs=origins.map(section).filter(Boolean);
            list.replaceChildren(...(secs.length?secs:[$('p','empty','No bookmarks here yet.')]));
            updateBar();
        };
        render();
    };

    const buildHtml=data=>{
        const json=JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028|\u2029/g,'');
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bookmarks</title><style>${css}</style></head><body><script>(${viewMain.toString()})(${json});<\/script></body></html>`;
    };

    const openView=async()=>{
        const html=buildHtml(await load());
        const dataUrl='data:text/html;charset=utf-8,'+encodeURIComponent(html);
        GM_openInTab(dataUrl,{active:true,insert:true});
    };

    GM_addValueChangeListener(KEY,async()=>{
        await refresh();
        await render();
    });
    addEventListener('popstate',refresh);
    addEventListener('hashchange',refresh);
    addEventListener('focus',refresh);

    GM_registerMenuCommand('open Bookmarks',()=>openView());
    await refresh();
})();
