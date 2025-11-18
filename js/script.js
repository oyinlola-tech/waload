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
    var serviceTransferBtn = qs('serviceTransfer');
    var serviceRechargeBtn = qs('serviceRecharge');
    var serviceDataBtn = qs('serviceData');
    var serviceElectricityBtn = qs('serviceElectricity');
    var serviceTVBtn = qs('serviceTV');
    var serviceReferBtn = qs('serviceRefer');
    var headerAvatar = qs('headerAvatar');
    var headerGreeting = qs('headerGreeting');
    var txModal = qs('transactionModalBackdrop');
    var txTitle = qs('txTitle');
    var txAmount = qs('txAmount');
    var txRecipient = qs('txRecipient');
    var txRecipientRow = qs('txRecipientRow');
    var txBundle = qs('txBundle');
    var txBundleRow = qs('txBundleRow');
    var txNetwork = qs('txNetwork');
    var txNetworkRow = qs('txNetworkRow');
    var txErrorRow = qs('txErrorRow');
    var txError = qs('txError');
    var confirmModal = qs('confirmModalBackdrop');
    var confirmDetails = qs('confirmDetails');
    var confirmCancel = qs('confirmCancel');
    var confirmOk = qs('confirmOk');
    var referModal = qs('referModalBackdrop');
    var referCode = qs('referCode');
    var copyRefer = qs('copyRefer');
    var referClose = qs('referClose');
    var toastContainer = qs('toastContainer');
    var pendingConfirmData = null;
    var txCancel = qs('txCancel');
    var txSubmit = qs('txSubmit');
    if(!btn||!amtEl)return;
    try{
      var p=JSON.parse(localStorage.getItem('vtu_profile')||'null');
      if(p&&p.name){if(headerGreeting)headerGreeting.textContent='Hi, '+(p.name.split(' ')[0]||p.name);if(headerAvatar){var initials=p.name.split(' ').map(function(s){return s[0]||'';}).slice(0,2).join('').toUpperCase();headerAvatar.textContent=initials;}}
    }catch(e){}
    var balance=parseCurrency(amtEl.dataset.amount||amtEl.textContent||'0');
    function updateBalanceDisplay(hidden){if(!amtEl)return;amtEl.textContent=hidden?'₦•••••••••':formatCurrency(balance);amtEl.dataset.amount=formatCurrency(balance);}
    var _audioCtx = null;
    function _playSuccessTone(){ try{ if(!_audioCtx) _audioCtx = new (window.AudioContext||window.webkitAudioContext)(); var o = _audioCtx.createOscillator(); var g = _audioCtx.createGain(); o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.0001; o.connect(g); g.connect(_audioCtx.destination); o.start(); // ramp up
          g.gain.exponentialRampToValueAtTime(0.05, _audioCtx.currentTime + 0.01);
          setTimeout(function(){ g.gain.exponentialRampToValueAtTime(0.0001, _audioCtx.currentTime + 0.18); setTimeout(function(){ try{o.stop(); o.disconnect(); g.disconnect();}catch(e){} },220); },120);
        }catch(e){}
    }
    function showToast(msg,type){ if(!toastContainer) return; var t=document.createElement('div'); t.className='toast '+(type||''); var txt=document.createElement('span'); txt.textContent=msg; t.appendChild(txt); var close=document.createElement('button'); close.className='toast-close'; close.textContent='×'; close.addEventListener('click',function(){ t.remove(); }); t.appendChild(close); toastContainer.appendChild(t); if(type==='success') _playSuccessTone(); setTimeout(function(){ if(t.parentNode) t.remove(); },4000); }
    function saveTransaction(tx){try{var key='vtu_transactions';var list=JSON.parse(localStorage.getItem(key)||'[]');list.unshift(tx);localStorage.setItem(key,JSON.stringify(list));}catch(e){}}
    function renderHistoryPreview(){ try{ var list = JSON.parse(localStorage.getItem('vtu_transactions')||'[]'); var container = document.querySelector('.history-preview-list'); if(!container) return; container.innerHTML=''; var items = list.slice(0,3); if(!items.length){ container.innerHTML = '<div class="transaction-history"><div class="transaction-details"><div class="transaction-name small">No recent transactions</div></div></div>'; return; } items.forEach(function(tx){ var div = document.createElement('div'); div.className='transaction-history'; var sign = (tx.type==='withdraw' || tx.type==='transfer' || tx.type==='recharge' || tx.type==='data' || tx.type==='electricity' || tx.type==='tv')?'- ':'+ '; var amt = (tx.type==='deposit' || tx.type==='reward')?('+ '+formatCurrency(tx.amount)):(sign+formatCurrency(tx.amount)); div.innerHTML = '<div class="transaction-details"><div class="transaction-name">'+esc(tx.name)+'</div><div class="transaction-amount">'+amt+'</div><div class="transaction-date">'+new Date(tx.date).toLocaleString()+'</div></div>'; container.appendChild(div); }); }catch(e){} }
    function addFunds(amount){balance+=amount;saveTransaction({id:Date.now(),type:'deposit',name:'Deposit',amount:amount,date:new Date().toISOString()});updateBalanceDisplay(btn.getAttribute('aria-pressed')==='true');}
    function withdrawFunds(amount){if(amount>balance){alert('Insufficient balance');return;}balance-=amount;saveTransaction({id:Date.now(),type:'withdraw',name:'Withdraw',amount:amount,date:new Date().toISOString()});updateBalanceDisplay(btn.getAttribute('aria-pressed')==='true');}
    function renderToggle(hidden){if(!btn)return;var icon=btn.querySelector('i');if(hidden){btn.setAttribute('aria-label','Show balance');btn.title='Show balance';if(icon)icon.className='fa-solid fa-eye-slash';}else{btn.setAttribute('aria-label','Hide balance');btn.title='Hide balance';if(icon)icon.className='fa-solid fa-eye';}updateBalanceDisplay(hidden);}
    btn.addEventListener('click',function(){var pressed=btn.getAttribute('aria-pressed')==='true';btn.setAttribute('aria-pressed',(!pressed).toString());renderToggle(!pressed);});
    function showModal(mode){
      if(!txModal)return;
      txModal.classList.add('show');
      txModal.setAttribute('aria-hidden','false');
      // determine title and whether recipient input is needed
      var needsRecipient = false;
      var title = 'Transaction';
      if(mode==='deposit'){ title='Deposit'; }
      else if(mode==='withdraw'){ title='Withdraw'; }
      else if(mode==='transfer'){ title='Transfer'; needsRecipient=true; }
      else if(mode==='recharge'){ title='Recharge'; needsRecipient=true; }
      else if(mode==='data'){ title='Buy Data'; needsRecipient=true; }
      else if(mode==='electricity'){ title='Electricity'; needsRecipient=true; }
      else if(mode==='tv'){ title='TV Payment'; needsRecipient=true; }
      if(txTitle)txTitle.textContent = title;
      if(txSubmit)txSubmit.dataset.mode = mode;
      // tailor fields per mode
      var recipientLabel = document.querySelector('label[for="txRecipient"]');
      if(mode==='recharge'){
        // Airtime: show network selector and phone number
        if(txNetworkRow) txNetworkRow.classList.remove('hidden');
        if(txNetwork) txNetwork.focus();
        if(txRecipientRow) txRecipientRow.classList.remove('hidden');
        if(recipientLabel) recipientLabel.textContent = 'Phone Number';
        if(txRecipient) txRecipient.placeholder = 'e.g. +2348010000000';
      } else {
        if(txNetworkRow) txNetworkRow.classList.add('hidden');
      }
      if(mode==='data'){
        // Data: show network + bundle
        if(txNetworkRow) txNetworkRow.classList.remove('hidden');
        if(recipientLabel) recipientLabel.textContent = 'Phone Number';
        if(txRecipientRow) txRecipientRow.classList.remove('hidden');
        // populate bundle with data options
        populateBundleOptions('data');
      } else if(mode==='tv'){
        // TV: show bouquet only, recipient is smartcard/account
        if(txNetworkRow) txNetworkRow.classList.add('hidden');
        if(recipientLabel) recipientLabel.textContent = 'Smartcard / Account Number';
        if(txRecipientRow) txRecipientRow.classList.remove('hidden');
        populateBundleOptions('tv');
      } else if(mode==='electricity'){
        if(recipientLabel) recipientLabel.textContent = 'Meter / Account Number';
        if(txRecipientRow) txRecipientRow.classList.remove('hidden');
      } else if(mode==='transfer'){
        if(recipientLabel) recipientLabel.textContent = 'Phone or Account';
        if(txRecipientRow) txRecipientRow.classList.remove('hidden');
      }
      if(needsRecipient && mode!=='data' && mode!=='recharge' && mode!=='tv'){ if(txRecipient) txRecipient.focus(); }
      // show bundle selector for data/tv modes
      if(mode==='data' || mode==='tv'){
        if(txBundleRow)txBundleRow.classList.remove('hidden');
      } else { if(txBundleRow)txBundleRow.classList.add('hidden'); }
      if(!needsRecipient && !(mode==='data' || mode==='tv')){ if(txAmount)txAmount.focus(); }
    }
    function closeModal(){if(!txModal)return;txModal.classList.remove('show');txModal.setAttribute('aria-hidden','true');if(txAmount){txAmount.value='';txAmount.disabled=false;txAmount.classList.remove('input-disabled');}if(txRecipient)txRecipient.value='';if(txRecipientRow)txRecipientRow.classList.add('hidden');if(txBundle)txBundle.value='';if(txBundleRow)txBundleRow.classList.add('hidden');if(txErrorRow)txErrorRow.style.display='none';if(txError)txError.textContent='';}
    if(depositBtn)depositBtn.addEventListener('click',function(){if(!txTitle||!txSubmit)return;txTitle.textContent='Deposit';txSubmit.dataset.mode='deposit';showModal();});
    if(withdrawBtn)withdrawBtn.addEventListener('click',function(){if(!txTitle||!txSubmit)return;txTitle.textContent='Withdraw';txSubmit.dataset.mode='withdraw';showModal();});
    if(serviceTransferBtn)serviceTransferBtn.addEventListener('click',function(){ if(!txTitle||!txSubmit) return; showModal('transfer'); });
    if(serviceRechargeBtn)serviceRechargeBtn.addEventListener('click',function(){ if(!txTitle||!txSubmit) return; showModal('recharge'); });
    if(serviceDataBtn)serviceDataBtn.addEventListener('click',function(){ if(!txTitle||!txSubmit) return; showModal('data'); });
    if(serviceElectricityBtn)serviceElectricityBtn.addEventListener('click',function(){ if(!txTitle||!txSubmit) return; showModal('electricity'); });
    if(serviceTVBtn)serviceTVBtn.addEventListener('click',function(){ if(!txTitle||!txSubmit) return; showModal('tv'); });
    if(serviceReferBtn)serviceReferBtn.addEventListener('click',function(){
      // Open referral modal and generate (or reuse) referral code
      var code = 'WALOAD-' + (Math.random().toString(36).slice(2,8)).toUpperCase();
      if(referCode) referCode.textContent = code;
      if(referModal) { referModal.classList.add('show'); referModal.setAttribute('aria-hidden','false'); }
    });
    if(copyRefer) copyRefer.addEventListener('click', function(){ var code = (referCode && referCode.textContent) || ''; if(!code) return; try{ navigator.clipboard.writeText(code); showToast('Referral code copied', 'success'); }catch(e){ showToast('Copied (fallback): '+code,'success'); } // save to profile
      try{ var pf = JSON.parse(localStorage.getItem('vtu_profile')||'null') || {}; pf.referral = code; localStorage.setItem('vtu_profile', JSON.stringify(pf)); }catch(e){}
    });
    if(referClose) referClose.addEventListener('click', function(){ if(referModal) { referModal.classList.remove('show'); referModal.setAttribute('aria-hidden','true'); } });
    if(txCancel)txCancel.addEventListener('click',closeModal);
    if(txModal)txModal.addEventListener('click',function(e){if(e.target===txModal)closeModal();});
    // Bundle definitions and helpers
    var bundleDefinitions = {
      data: [
        { val: 'data-small', label: '500MB — ₦200', price: 200 },
        { val: 'data-medium', label: '1GB — ₦400', price: 400 },
        { val: 'data-large', label: '5GB — ₦1500', price: 1500 }
      ],
      tv: [
        { val: 'tv-basic', label: 'Basic Bouquet — ₦1200', price: 1200 },
        { val: 'tv-premium', label: 'Premium Bouquet — ₦3500', price: 3500 }
      ]
    };
    function populateBundleOptions(mode){ if(!txBundle) return; txBundle.innerHTML = '<option value="">-- Select --</option>'; var defs = bundleDefinitions[mode]||[]; defs.forEach(function(d){ var opt = document.createElement('option'); opt.value = d.val; opt.textContent = d.label; txBundle.appendChild(opt); }); }
    // When a bundle is selected, autofill amount and lock input
    if(txBundle) txBundle.addEventListener('change', function(){ var val = txBundle.value; if(!val){ if(txAmount){ txAmount.disabled = false; txAmount.classList.remove('input-disabled'); txAmount.value = ''; } return; } var list = (bundleDefinitions.data.concat(bundleDefinitions.tv)); var found = list.find(function(x){return x.val===val;}); if(found){ if(txAmount){ txAmount.value = found.price; txAmount.disabled = true; txAmount.classList.add('input-disabled'); } } else { if(txAmount){ txAmount.disabled = false; txAmount.classList.remove('input-disabled'); } } });

    // Ensure network selection existence
    if(txNetwork){ txNetwork.addEventListener('change', function(){ /* placeholder if later needed */ }); }
    function openConfirm(details){ if(!confirmModal) return; pendingConfirmData = details; if(confirmDetails) confirmDetails.innerHTML = '<div class="small">'+esc(details.title)+'</div><div style="margin-top:8px;"><strong>'+esc(details.summary)+'</strong></div>'; confirmModal.classList.add('show'); confirmModal.setAttribute('aria-hidden','false'); }
    function closeConfirm(){ if(!confirmModal) return; confirmModal.classList.remove('show'); confirmModal.setAttribute('aria-hidden','true'); pendingConfirmData = null; }
    function performTransaction(details){ var mode = details.mode; var v = details.amount; var recip = details.recipient || ''; var bundle = details.bundle || ''; if(mode==='deposit'){ addFunds(v); showToast('Deposit successful','success'); } else { if(v>balance){ showToast('Insufficient balance','error'); return false; } balance -= v; var typeName = mode; var prettyName = details.title || mode; // map bundle value to human label
      var bundleLabel = '';
      if(bundle){ var all = (bundleDefinitions.data||[]).concat(bundleDefinitions.tv||[]); var b = all.find(function(x){return x.val===bundle;}); if(b) bundleLabel = b.label; else bundleLabel = bundle; }
      var name = prettyName + (recip?(' for '+recip):'') + (bundleLabel?(' ('+bundleLabel+')'):''); saveTransaction({id:Date.now(),type:typeName,name:name,amount:v,date:new Date().toISOString()}); updateBalanceDisplay(btn.getAttribute('aria-pressed')==='true'); showToast(prettyName+' successful','success'); } return true; }
    // update preview after successful transaction
    var _oldPerform = performTransaction;
    performTransaction = function(details){ var ok = _oldPerform(details); if(ok){ try{ renderHistoryPreview(); }catch(e){} } return ok; };
    if(txSubmit) txSubmit.addEventListener('click', function(){
      if(!txSubmit) return;
      if(txErrorRow) txErrorRow.style.display = 'none';
      if(txError) txError.textContent = '';
      var v = parseFloat(String(txAmount.value).replace(/[^0-9.]+/g,''));
      if(!v || v <= 0){ if(txErrorRow) txErrorRow.style.display = 'block'; if(txError) txError.textContent = 'Enter a valid amount'; return; }
      var mode = txSubmit.dataset.mode || 'withdraw';
      var recip = (txRecipient && String(txRecipient.value||'').trim()) || '';
      var bundleVal = (txBundle && txBundle.value) || '';
      // Basic recipient validation for modes that need it
      if(mode==='transfer' || mode==='recharge' || mode==='data' || mode==='electricity' || mode==='tv'){
        if(!recip){ if(txErrorRow) txErrorRow.style.display = 'block'; if(txError) txError.textContent = 'Enter recipient/number/account'; return; }
      }
      // Network required for recharge and data
      if((mode==='recharge' || mode==='data') && txNetwork){ if(!txNetwork.value){ if(txErrorRow) txErrorRow.style.display='block'; if(txError) txError.textContent='Select network'; return; } }
      if(mode==='data' || mode==='tv'){ if(!bundleVal){ if(txErrorRow) txErrorRow.style.display='block'; if(txError) txError.textContent='Select a bundle or bouquet'; return; } }
      var title = txTitle ? txTitle.textContent : (mode.charAt(0).toUpperCase()+mode.slice(1));
      // Use human bundle label if available
      var bundleLabel = '';
      if(bundleVal){ var all = (bundleDefinitions.data||[]).concat(bundleDefinitions.tv||[]); var b = all.find(function(x){ return x.val === bundleVal; }); if(b) bundleLabel = b.label; else bundleLabel = bundleVal; }
      var summary = title + ' — ' + formatCurrency(v) + (recip?(' to '+recip):'') + (bundleLabel?(' ('+bundleLabel+')'):'');
      openConfirm({ mode: mode, amount: v, recipient: recip, bundle: bundleVal, title: title, summary: summary });
    });
    if(confirmCancel) confirmCancel.addEventListener('click', function(){ closeConfirm(); });
    if(confirmOk) confirmOk.addEventListener('click', function(){ if(!pendingConfirmData) return; var ok = performTransaction(pendingConfirmData); if(ok){ closeConfirm(); closeModal(); } else { closeConfirm(); } });
    // 'More' button and hidden options were removed — services are now visible inline.
    renderToggle(btn.getAttribute('aria-pressed')==='true');
    try{ renderHistoryPreview(); }catch(e){}
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
