// script.js - All required JavaScript for VTU frontend
(function(){
  // --- Utilities ---
  function qs(id){return document.getElementById(id);}
  function q(sel){return document.querySelector(sel);}
  function parseCurrency(s){if(typeof s==='number')return s;return Number(String(s).replace(/[^0-9.-]+/g,''))||0;}
  function formatCurrency(n){return '₦'+Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
  function esc(s){return String(s).replace(/[&<>"]|'/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  // --- Index Page Logic ---
  (function(){
    var btn = qs('balanceToggle');
    var amtEl = qs('balanceAmount');
    var depositBtn = qs('depositBtn');
    var withdrawBtn = qs('withdrawBtn');
    var headerAvatar = qs('headerAvatar');
    var headerGreeting = qs('headerGreeting');
    var txModal = qs('transactionModalBackdrop');
    var txTitle = qs('txTitle');
    var txAmount = qs('txAmount');
    var txCancel = qs('txCancel');
    var txSubmit = qs('txSubmit');
    if(!btn||!amtEl)return;
    try{
      var p=JSON.parse(localStorage.getItem('vtu_profile')||'null');
      if(p&&p.name){if(headerGreeting)headerGreeting.textContent='Hi, '+(p.name.split(' ')[0]||p.name);if(headerAvatar){var initials=p.name.split(' ').map(function(s){return s[0]||'';}).slice(0,2).join('').toUpperCase();headerAvatar.textContent=initials;}}
    }catch(e){}
    var balance=parseCurrency(amtEl.dataset.amount||amtEl.textContent||'0');
    function updateBalanceDisplay(hidden){if(!amtEl)return;amtEl.textContent=hidden?'₦•••••••••':formatCurrency(balance);amtEl.dataset.amount=formatCurrency(balance);}
    function saveTransaction(tx){try{var key='vtu_transactions';var list=JSON.parse(localStorage.getItem(key)||'[]');list.unshift(tx);localStorage.setItem(key,JSON.stringify(list));}catch(e){}}
    function addFunds(amount){balance+=amount;saveTransaction({id:Date.now(),type:'deposit',name:'Deposit',amount:amount,date:new Date().toISOString()});updateBalanceDisplay(btn.getAttribute('aria-pressed')==='true');}
    function withdrawFunds(amount){if(amount>balance){alert('Insufficient balance');return;}balance-=amount;saveTransaction({id:Date.now(),type:'withdraw',name:'Withdraw',amount:amount,date:new Date().toISOString()});updateBalanceDisplay(btn.getAttribute('aria-pressed')==='true');}
    function renderToggle(hidden){if(!btn)return;var icon=btn.querySelector('i');if(hidden){btn.setAttribute('aria-label','Show balance');btn.title='Show balance';if(icon)icon.className='fa-solid fa-eye-slash';}else{btn.setAttribute('aria-label','Hide balance');btn.title='Hide balance';if(icon)icon.className='fa-solid fa-eye';}updateBalanceDisplay(hidden);}
    btn.addEventListener('click',function(){var pressed=btn.getAttribute('aria-pressed')==='true';btn.setAttribute('aria-pressed',(!pressed).toString());renderToggle(!pressed);});
    function showModal(){if(!txModal)return;txModal.classList.add('show');txModal.setAttribute('aria-hidden','false');if(txAmount)txAmount.focus();}
    function closeModal(){if(!txModal)return;txModal.classList.remove('show');txModal.setAttribute('aria-hidden','true');if(txAmount)txAmount.value='';}
    if(depositBtn)depositBtn.addEventListener('click',function(){if(!txTitle||!txSubmit)return;txTitle.textContent='Deposit';txSubmit.dataset.mode='deposit';showModal();});
    if(withdrawBtn)withdrawBtn.addEventListener('click',function(){if(!txTitle||!txSubmit)return;txTitle.textContent='Withdraw';txSubmit.dataset.mode='withdraw';showModal();});
    if(txCancel)txCancel.addEventListener('click',closeModal);
    if(txModal)txModal.addEventListener('click',function(e){if(e.target===txModal)closeModal();});
    if(txSubmit)txSubmit.addEventListener('click',function(){var v=parseFloat(String(txAmount.value).replace(/[^0-9.]+/g,''));if(!v||v<=0){alert('Enter a valid amount');return;}if(txSubmit.dataset.mode==='deposit'){addFunds(v);}else{withdrawFunds(v);}closeModal();});
    var moreBtn=qs('moreBtn'),moreOptions=qs('moreOptions');
    if(moreBtn&&moreOptions){
      moreBtn.addEventListener('click',function(){
        var expanded=moreBtn.getAttribute('aria-expanded')==='true';
        moreBtn.setAttribute('aria-expanded',(!expanded).toString());
        if(!expanded){
          moreOptions.classList.add('show');
          moreOptions.setAttribute('aria-hidden','false');
          moreBtn.style.display='none'; // Hide the More button when expanded
        }else{
          moreOptions.classList.remove('show');
          moreOptions.setAttribute('aria-hidden','true');
        }
      });
    }
    renderToggle(btn.getAttribute('aria-pressed')==='true');
  })();

  // --- Profile Page Logic ---
  (function(){
    if(!q('.profile-container'))return;
    var key='vtu_profile',defaultProfile={name:'Nkennor',phone:'+234 801 000 0000',email:'nkennor@example.com'};
    function load(){try{return JSON.parse(localStorage.getItem(key))||defaultProfile;}catch(e){return defaultProfile;}}
    function save(p){localStorage.setItem(key,JSON.stringify(p));}
    var profile=load();
    var profileName=qs('profileName'),profilePhone=qs('profilePhone'),profileEmail=qs('profileEmail'),avatar=qs('avatar'),editBtn=qs('editBtn'),editForm=qs('editForm'),inputName=qs('inputName'),inputPhone=qs('inputPhone'),inputEmail=qs('inputEmail'),saveBtn=qs('saveProfile'),cancelBtn=qs('cancelProfile'),addCardBtn=qs('addCardBtn'),cardList=qs('cardList'),customerCareBtn=qs('customerCare'),logoutBtn=qs('logoutBtn'),editLimitsBtn=qs('editLimits'),limitsView=qs('limitsView'),limitsEdit=qs('limitsEdit'),limitPer=qs('limitPer'),limitDaily=qs('limitDaily'),inputPer=qs('inputPer'),inputDaily=qs('inputDaily'),saveLimitsBtn=qs('saveLimits'),cancelLimitsBtn=qs('cancelLimits');
    var cardsKey='vtu_cards',limitsKey='vtu_limits';
    function loadCards(){try{return JSON.parse(localStorage.getItem(cardsKey)||'[]');}catch(e){return[];}}
    function saveCards(c){localStorage.setItem(cardsKey,JSON.stringify(c));}
    function loadLimits(){try{return JSON.parse(localStorage.getItem(limitsKey))||{per:10000,daily:100000};}catch(e){return{per:10000,daily:100000};}}
    function saveLimitsObj(l){localStorage.setItem(limitsKey,JSON.stringify(l));}
    function renderCards(){if(!cardList)return;var list=loadCards();cardList.innerHTML='';if(!list.length){cardList.innerHTML='<div class="small">No cards added</div>';return;}list.forEach(function(c,idx){var div=document.createElement('div');div.className='card-item';div.innerHTML='<div><div class="strong">'+esc(c.brand||'Card')+' •••• '+esc(c.last4||'0000')+'</div><div class="small">Exp: '+esc(c.exp||'--')+'</div></div><div><button data-idx="'+idx+'" class="btn secondary remove-card">Remove</button></div>';cardList.appendChild(div);});Array.from(cardList.querySelectorAll('.remove-card')).forEach(function(b){b.addEventListener('click',function(){var idx=Number(b.dataset.idx);var arr=loadCards();arr.splice(idx,1);saveCards(arr);renderCards();});});}
    var cardModal=qs('cardModalBackdrop'),cardNumber=qs('cardNumber'),cardBrand=qs('cardBrand'),cardExp=qs('cardExp'),cardCancel=qs('cardCancel'),cardSave=qs('cardSave');
    function showCardModal(){if(!cardModal)return;cardModal.classList.add('show');cardModal.setAttribute('aria-hidden','false');if(cardNumber)cardNumber.focus();}
    function closeCardModal(){if(!cardModal)return;cardModal.classList.remove('show');cardModal.setAttribute('aria-hidden','true');if(cardNumber)cardNumber.value='';if(cardBrand)cardBrand.value='';if(cardExp)cardExp.value='';}
    if(addCardBtn)addCardBtn.addEventListener('click',showCardModal);if(cardCancel)cardCancel.addEventListener('click',closeCardModal);if(cardModal)cardModal.addEventListener('click',function(e){if(e.target===cardModal)closeCardModal();});if(cardSave)cardSave.addEventListener('click',function(){var num=String(cardNumber.value||'').replace(/\s+/g,'');if(num.length<4){alert('Enter a valid card number');return;}var last4=num.slice(-4);var brand=(cardBrand.value||'Card').trim();var exp=(cardExp.value||'--').trim();var cards=loadCards();cards.push({last4:last4,brand:brand,exp:exp});saveCards(cards);renderCards();closeCardModal();});
    var careModal=qs('careModalBackdrop'),careClose=qs('careClose');function showCareModal(){if(!careModal)return;careModal.classList.add('show');careModal.setAttribute('aria-hidden','false');}function closeCareModal(){if(!careModal)return;careModal.classList.remove('show');careModal.setAttribute('aria-hidden','true');}
    if(customerCareBtn)customerCareBtn.addEventListener('click',showCareModal);if(careClose)careClose.addEventListener('click',closeCareModal);if(careModal)careModal.addEventListener('click',function(e){if(e.target===careModal)closeCareModal();});
    if(logoutBtn)logoutBtn.addEventListener('click',function(){if(!confirm('Log out and clear local data? This will clear profile, transactions and cards.'))return;localStorage.removeItem('vtu_profile');localStorage.removeItem('vtu_transactions');localStorage.removeItem('vtu_cards');localStorage.removeItem('vtu_limits');window.location.href='../index.html';});
    function renderLimits(){if(!limitPer||!limitDaily)return;var L=loadLimits();limitPer.textContent=formatCurrency(L.per);limitDaily.textContent=formatCurrency(L.daily);}
    if(editLimitsBtn)editLimitsBtn.addEventListener('click',function(){var L=loadLimits();if(inputPer)inputPer.value=L.per;if(inputDaily)inputDaily.value=L.daily;if(limitsView)limitsView.style.display='none';if(limitsEdit)limitsEdit.style.display='block';});
    if(cancelLimitsBtn)cancelLimitsBtn.addEventListener('click',function(){if(limitsEdit)limitsEdit.style.display='none';if(limitsView)limitsView.style.display='block';});
    if(saveLimitsBtn)saveLimitsBtn.addEventListener('click',function(){var p=parseFloat(String(inputPer.value).replace(/[^0-9.]+/g,''))||0;var d=parseFloat(String(inputDaily.value).replace(/[^0-9.]+/g,''))||0;if(p<=0||d<=0){alert('Enter valid positive limits');return;}saveLimitsObj({per:p,daily:d});renderLimits();if(limitsEdit)limitsEdit.style.display='none';if(limitsView)limitsView.style.display='block';});
    function render(){if(profileName)profileName.textContent=profile.name;if(profilePhone)profilePhone.textContent=profile.phone;if(profileEmail)profileEmail.textContent=profile.email;var initials=profile.name.split(' ').map(function(s){return s[0]||''}).slice(0,2).join('').toUpperCase();if(avatar)avatar.textContent=initials||'NN';renderCards();renderLimits();}
    if(editBtn)editBtn.addEventListener('click',function(){if(inputName)inputName.value=profile.name;if(inputPhone)inputPhone.value=profile.phone;if(inputEmail)inputEmail.value=profile.email;if(editForm)editForm.style.display='block';if(editBtn)editBtn.style.display='none';});
    if(cancelBtn)cancelBtn.addEventListener('click',function(){if(editForm)editForm.style.display='none';if(editBtn)editBtn.style.display='inline-block';});
    if(saveBtn)saveBtn.addEventListener('click',function(){var name=(inputName.value||'').trim();var phone=(inputPhone.value||'').trim();var email=(inputEmail.value||'').trim();if(!name){alert('Name required');return;}profile.name=name;profile.phone=phone||profile.phone;profile.email=email||profile.email;save(profile);render();if(editForm)editForm.style.display='none';if(editBtn)editBtn.style.display='inline-block';});
    render();
  })();

  // --- History Page Logic ---
  (function(){
    var list=document.querySelector('.history-list');if(!list)return;try{var txs=JSON.parse(localStorage.getItem('vtu_transactions')||'[]');txs.forEach(function(tx){var div=document.createElement('div');div.className='transaction-history';var sign=(tx.type==='withdraw'||tx.type==='payment')?'- ':'+ ';div.innerHTML='<div class="transaction-details"><div class="transaction-name">'+esc(tx.name)+'</div><div class="transaction-amount">'+sign+formatCurrency(tx.amount)+'</div><div class="transaction-date">'+new Date(tx.date).toLocaleString()+'</div></div>';list.insertBefore(div,list.firstChild);});}catch(e){}
  })();
})();
