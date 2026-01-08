// After you deploy the Apps Script Web App,
// paste the Web App URL here:
window.ACA_API_URL = "https://script.google.com/macros/s/AKfycbz6Kvf7KBkQck0gUir4hh9HL4tBWvEuWeJkheQY9hB6QzbMBY8Jr2x88L-Vj42MbzJbCg/exec";

(function () {
  const wrap = document.querySelector('.wrap');

  const form = document.getElementById('leadForm');
  const btn = document.getElementById('submitBtn');
  const toast = document.getElementById('toast');

  const formView = document.getElementById('formView');
  const thankYouView = document.getElementById('thankYouView');
  const tyName = document.getElementById('tyName');
  const newRequestBtn = document.getElementById('newRequestBtn');

  const typeEl = document.getElementById('type');
  const carCountWrap = document.getElementById('carCountWrap');
  const carCountEl = document.getElementById('carCount');

  const hearEl = document.getElementById('hearAbout');

  const referralWrap = document.getElementById('referralWrap');
  const referralNameEl = document.getElementById('referralName');
  const referralPhoneEl = document.getElementById('referralPhone');
  const referralHasEmailEl = document.getElementById('referralHasEmail');
  const referralEmailWrap = document.getElementById('referralEmailWrap');
  const referralEmailEl = document.getElementById('referralEmail');

  // If these are missing, JS will error and can make the page feel "broken"
  if (!form || !btn || !toast || !formView || !thankYouView || !typeEl) {
    console.error("Missing required elements. Check IDs in index.html.");
    return;
  }

  function cleanPhone(v) {
    return (v || '').replace(/[^\d]/g, '').slice(0, 15);
  }

  function showToast(msg, ok) {
    if (!msg) {
      toast.classList.add('hidden');
      toast.textContent = '';
      return;
    }
    toast.classList.remove('hidden');
    toast.style.background = ok ? '#111827' : '#7f1d1d';
    toast.textContent = msg;
  }

  function showThankYou(firstName) {
    tyName.textContent = firstName ? `, ${firstName}` : '';
    formView.classList.add('hidden');
    thankYouView.classList.remove('hidden');

    // matches your CSS selector: .wrap.thankyou-active .left { transform: ... }
    if (wrap) wrap.classList.add('thankyou-active');
  }

  function resetForm() {
    form.reset();
    showToast('', true);
    formView.classList.remove('hidden');
    thankYouView.classList.add('hidden');

    if (wrap) wrap.classList.remove('thankyou-active');

    updateCarCountVisibility();
    updateReferralVisibility();
  }

  function updateCarCountVisibility() {
    const v = (typeEl.value || '').toLowerCase();
    const show = (v === 'auto' || v === 'bundle');

    if (carCountWrap) carCountWrap.classList.toggle('hidden', !show);

    // require car count only when visible
    if (carCountEl) {
      carCountEl.required = show;
      if (!show) carCountEl.value = '';
    }
  }

  function updateReferralVisibility() {
    const hear = (hearEl && hearEl.value) ? hearEl.value.toLowerCase() : '';
    const isReferral = hear === 'referral';

    if (referralWrap) referralWrap.classList.toggle('hidden', !isReferral);

    if (referralNameEl) referralNameEl.required = isReferral;
    if (referralPhoneEl) referralPhoneEl.required = isReferral;

    if (!isReferral) {
      if (referralNameEl) referralNameEl.value = '';
      if (referralPhoneEl) referralPhoneEl.value = '';
      if (referralHasEmailEl) referralHasEmailEl.value = '';
      if (referralEmailEl) referralEmailEl.value = '';
      if (referralEmailWrap) referralEmailWrap.classList.add('hidden');
      if (referralEmailEl) referralEmailEl.required = false;
      return;
    }

    const hasEmail = (referralHasEmailEl && referralHasEmailEl.value)
      ? referralHasEmailEl.value.toLowerCase()
      : '';

    const showEmail = hasEmail === 'yes';
    if (referralEmailWrap) referralEmailWrap.classList.toggle('hidden', !showEmail);
    if (referralEmailEl) {
      referralEmailEl.required = showEmail;
      if (!showEmail) referralEmailEl.value = '';
    }
  }

  typeEl.addEventListener('change', updateCarCountVisibility);
  if (hearEl) hearEl.addEventListener('change', updateReferralVisibility);
  if (referralHasEmailEl) referralHasEmailEl.addEventListener('change', updateReferralVisibility);

  updateCarCountVisibility();
  updateReferralVisibility();

  if (newRequestBtn) newRequestBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!window.ACA_API_URL || window.ACA_API_URL.includes("PASTE_YOUR")) {
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
      type:      (typeEl.value || '').trim(),
      carCount:  (carCountEl ? (carCountEl.value || '').trim() : ''),

      heardAbout: (hearEl ? (hearEl.value || '').trim() : ''),
      referralName: (referralNameEl ? (referralNameEl.value || '').trim() : ''),
      referralPhone: (referralPhoneEl ? cleanPhone(referralPhoneEl.value) : ''),
      referralHasEmail: (referralHasEmailEl ? (referralHasEmailEl.value || '').trim() : ''),
      referralEmail: (referralEmailEl ? (referralEmailEl.value || '').trim() : ''),

      source: "ac-landing",
      userAgent: navigator.userAgent
    };

    try {
      const resp = await fetch(window.ACA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const text = await resp.text();
      let res;
      try {
        res = JSON.parse(text);
      } catch {
        res = { ok: false, error: "Bad response from backend (not JSON)." };
      }

      btn.disabled = false;

      if (res && res.ok) {
        showToast("", true);
        showThankYou(payload.firstName);
      } else {
        showToast("⚠️ " + (res.error || "Something went wrong."), false);
      }
    } catch (err) {
      btn.disabled = false;
      showToast("⚠️ Error submitting. Try again.", false);
    }
  });
})();
