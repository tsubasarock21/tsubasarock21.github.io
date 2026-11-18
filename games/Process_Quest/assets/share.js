// Share the public app URL, including when the button is used in a trial build.
(()=>{
 const button=document.getElementById('shareStudy'),status=document.getElementById('studyShareStatus');
 const text='TR-LAB学習アプリ\n解き方を選んで、図や式で確かめる。中学数学の学習アプリ。\nhttps://tsubasarock21.github.io/games/Process_Quest/\n#TsubasaRockLAB #高校受験 #数学';
 let sharing=false,hideTimer=0;
 function notice(message){clearTimeout(hideTimer);status.textContent=message;hideTimer=setTimeout(()=>status.textContent='',3500)}
 button.addEventListener('click',async()=>{
  if(sharing)return;sharing=true;button.disabled=true;studyMetrics.share();
  try{
   if(navigator.share){try{await navigator.share({title:'TR-LAB学習アプリ',text});return}catch(error){if(error?.name==='AbortError')return}}
   try{await navigator.clipboard.writeText(text);notice('紹介文・URL・ハッシュタグをコピーしました。')}
   catch{const dialog=document.getElementById('studyShareFallback'),field=document.getElementById('studyShareText');field.value=text;dialog.showModal();field.focus();field.select()}
  }finally{sharing=false;button.disabled=false}
 });
 document.getElementById('studyShareClose').onclick=()=>document.getElementById('studyShareFallback').close();
})();

