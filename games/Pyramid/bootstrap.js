/* Load replaceable card JSON before touching any saved game. */
(async()=>{'use strict';const preview=document.currentScript?.dataset.view==='cards',version='0.7.0',status=document.getElementById('loadStatus'),message=document.getElementById('loadMessage'),retry=document.getElementById('retryLoad');
retry.onclick=()=>location.reload();
function script(name){return new Promise((resolve,reject)=>{const element=document.createElement('script'),url=new URL(name,location.href);url.searchParams.set('v',version);element.src=url.href;const timeout=setTimeout(()=>done(Error(name+'の読み込みに時間がかかっています')),15000);function error(e){if(e.filename===url.href)done(Error(name+'を読み込めませんでした'));}function done(failure){clearTimeout(timeout);window.removeEventListener('error',error);element.onload=element.onerror=null;failure?reject(failure):resolve();}window.addEventListener('error',error);element.onload=()=>done();element.onerror=()=>done(Error(name+'を読み込めませんでした'));document.body.append(element);});}
try{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{const response=await fetch('cards/catalog.json',{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('カード一覧を読み込めませんでした');globalThis.PyramidLeaderData=await response.json();}finally{clearTimeout(timeout);}
 for(const file of ['model-core.js','model-actions.js','leaders.js'])await script(file);
 if(!globalThis.PyramidModel?.CARD_LIMIT)throw Error('カード一覧の形式を確認してください');
 if(preview){await script('leaders-ui.js');PyramidLeaderCards.renderGallery(document.getElementById('previewCards'));}
 else for(const file of ['metrics.js','art.js','routes.js','inscription.js','scene.js','vignettes.js','renderer.js','game.js','leaders-ui.js','audio.js','sayings.js','lab-rumors.js','site-actors.js','life.js','modes.js','share-image.js','controls.js'])await script(file);
 document.body.classList.remove('booting');status.hidden=true;
}catch(error){document.body.classList.add('booting');message.textContent='現場の準備ができませんでした。カードデータと必要なファイルをアップロードしてから読み直してください。保存済みの記録は変更していません。';retry.hidden=false;console.error(error);}
})();
