// After you deploy the Apps Script Web App,
// paste the Web App URL here:
window.ACA_API_URL = "https://script.google.com/macros/s/PASTE_YOUR_WEB_APP_URL/exec";

(function(){
  const form = document.getElementById('leadForm');
  const btn = document.getElementById('submitBtn');
  const toast = document.getElementById('toast');

  const formView = document.getElementById('formView');
  const thankYouView = document.getElementById('thankYouView');
  const tyName = document.getElementById('tyName');
  const newRequestBtn = document.getElementById('newRequestBtn');

  const typeEl = document.getElementById('type');
  const carCountWrap = document.getElementById('carCountWrap');

  function cleanPhone(v){
    return (v || '').replace(/[^\d]/g,'').slice(0, 15);
  }

  function showToast(msg, ok){
    if(!msg){
      toast.classList.add('hidden');
      toast.textContent = '';
      return;
    }
    toast.classList.remove('hidden');
    toast.style.background = ok ? '#111827' : '#7f1d1d';
    toast.textContent = msg;
  }

  function showThankYou(firstName){
    tyName.textContent = firstName ? `, ${firstName}` : '';
    formView.classList.add('hidden');
    thankYouView.classList.remove('hidden');
  }

  function resetForm(){
    form.reset();
    showToast('', true);
    formView.classList.remove('hidden');
    thankYouView.classList.add('hidden');
    updateCarCountVisibility();
  }

  function updateCarCountVisibility(){
    const v = (typeEl.value || '').toLowerCase();
    const show = (v === 'auto' || v === 'bundle');
    carCountWrap.classList.toggle('hidden', !show);
  }

  typeEl.addEventListener('change', updateCarCountVisibility);
  updateCarCountVisibility();

  newRequestBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', async function(e){
    e.preventDefault();

    if(!window.ACA_API_URL || window.ACA_API_URL.includes("PASTE_YOUR")){
      showToast("⚠️ Backend not connected. Paste your Apps Script Web App URL in main.js.", false);
      return;
    }

    btn.disabled = true;
    showToast('Submitting...', true);

    const payload = {
      agency: "Alonso Contreras Agency",
      firstName: (document.getElementById('firstName').value || '').trim(),
      lastName:  (document.getElementById('lastName').value || '').trim(),
      email:     (document.getElementById('email').value || '').trim(),
      phone:     cleanPhone(document.getElementById('phone').value),
      street:    (document.getElementById('street').value || '').trim(),
      city:      (document.getElementById('city').value || '').trim(),
      state:     (document.getElementById('state').value || '').trim(),
      zip:       (document.getElementById('zip').value || '').trim(),
      type:      (document.getElementById('type').value || '').trim(),
      carCount:  (document.getElementById('carCount').value || '').trim()
    };

    try{
      const resp = await fetch(window.ACA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      btn.disabled = false;

      if(res && res.ok){
        showToast("", true);
        showThankYou(payload.firstName);
      } else {
        showToast("⚠️ " + (res && res.error ? res.error : "Something went wrong."), false);
      }
    } catch (err){
      btn.disabled = false;
      showToast("⚠️ Error submitting. Try again.", false);
    }
  });
})();
