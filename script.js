const f = document.querySelector('#f');
const card = document.querySelector('#card');
const m = document.querySelector('#m');
const y = document.querySelector('#y');
const cvv = document.querySelector('#cvv');
const e1 = document.querySelector('#e1');
const e2 = document.querySelector('#e2');
const e3 = document.querySelector('#e3');
const result = document.querySelector('#result');
const logos = [...document.querySelectorAll('.logos img')];
const now = new Date();
const cy = now.getFullYear();
const cm = now.getMonth() + 1;

for (let i = 1; i <= 12; i++) {
  const value = String(i).padStart(2, '0');
  m.add(new Option(value, value));
}
for (let i = cy; i <= cy + 15; i++) y.add(new Option(i, i));

function cardBrand(number) {
  if (/^4/.test(number)) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  if (/^(30[0-5]|36|38|39)/.test(number)) return 'diners';
  if (/^(6011|65|64[4-9]|622(?:12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5]))/.test(number)) return 'discover';
  return '';
}

function updateLogos() {
  const brand = cardBrand(card.value.replace(/\D/g, ''));
  logos.forEach(logo => {
    const active = logo.dataset.brand === brand;
    logo.src = `assets/${logo.dataset.brand}${active ? '-color' : ''}.svg`;
    logo.classList.toggle('active', active);
  });
}

card.addEventListener('input', () => {
  const digits = card.value.replace(/\D/g, '').slice(0, 19);
  card.value = digits.replace(/(.{4})(?=.)/g, '$1 ');
  updateLogos();
});
cvv.addEventListener('input', () => {
  cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4);
});

function luhn(number) {
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function validCard(number) {
  const brand = cardBrand(number);
  const lengths = { visa: [13, 16, 19], mastercard: [16], amex: [15], diners: [14, 16], discover: [16, 19] };
  return Boolean(brand && lengths[brand].includes(number.length) && luhn(number));
}

f.addEventListener('submit', event => {
  event.preventDefault();
  e1.textContent = e2.textContent = e3.textContent = '';
  result.textContent = '';
  let ok = true;
  const digits = card.value.replace(/\D/g, '');
  if (!validCard(digits)) {
    e1.textContent = 'Enter a valid test card number.';
    ok = false;
  }
  const month = Number(m.value);
  const year = Number(y.value);
  const today = new Date();
  if (!month || !year || year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1)) {
    e2.textContent = 'Choose a valid future expiry date.';
    ok = false;
  }
  const amex = cardBrand(digits) === 'amex';
  if (!(amex ? /^\d{4}$/ : /^\d{3}$/).test(cvv.value)) {
    e3.textContent = amex ? 'Enter a 4-digit CID.' : 'Enter a 3-digit CVC.';
    ok = false;
  }
  if (ok) result.textContent = 'Payment successful (TEST). No data was sent or stored.';
});

document.querySelector('#cancel').onclick = () => {
  f.reset();
  updateLogos();
  e1.textContent = e2.textContent = e3.textContent = '';
  result.textContent = 'Payment cancelled (TEST).';
};
document.querySelector('#help').onclick = () => {
  alert('The CVC/CVV is the 3-digit security code on the back of your card. For American Express, the CID is the 4-digit code on the front of the card.');
};

document.querySelectorAll('[data-test-card]').forEach(button => {
  button.addEventListener('click', () => {
    card.value = button.dataset.testCard;
    card.dispatchEvent(new Event('input'));
    m.value = String(cm).padStart(2, '0');
    y.value = String(cy + 1);
    cvv.value = cardBrand(button.dataset.testCard) === 'amex' ? '1234' : '123';
    e1.textContent = e2.textContent = e3.textContent = result.textContent = '';
    card.focus();
  });
});
updateLogos();
