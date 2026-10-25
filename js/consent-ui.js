// consent-ui.js — rozilik banneri va "Statistika sozlamalari" oynasi.
// Sahifani bloklamaydi: pastda turadi, sayt undan oldin ham, keyin ham toʻliq ishlaydi.
import { el } from './dom.js';

const TEXT = 'Darslarni yaxshilash uchun anonim statistika yigʻamiz. Ism, telefon yoki email soʻralmaydi.';
// Har bir tugma bosilganda nima boʻlishi — tanlashdan oldin aniq koʻrinsin
const CHOICES = [
  ['Roziman', ' — maʼlumot Seuldagi (Janubiy Koreya) serverga yuboriladi, 1 yil saqlanadi. Boshqa soʻralmaydi.'],
  ['Yoʻq, rahmat', ' — hech narsa yuborilmaydi, keyingi kirishda yana soʻraladi. Darslar, testlar va simulyator ishlayveradi, faqat fikr yuborib boʻlmaydi.'],
];

let current = null; // bir vaqtda faqat bitta banner

// Banner chizadi. settingsMode — foydalanuvchi oʻzi ochgan sozlamalar (joriy holat ham koʻrsatiladi)
export function showConsentBanner({ status, settingsMode, onChoose }) {
  current?.remove();
  const close = () => { current?.remove(); current = null; document.body.style.paddingBottom = ''; };
  const choose = (value) => { onChoose(value); close(); };

  const children = [
    el('p', { class: 'consent-text', text: TEXT }),
    el('ul', { class: 'consent-choices' }, CHOICES.map(([name, what]) => el('li', {}, [el('strong', { text: name }), what]))),
  ];
  if (settingsMode) {
    const state = status.consent === 'granted' ? 'yoqilgan' : 'oʻchirilgan';
    children.push(el('p', { class: 'consent-state', text: `Hozir statistika: ${state}.` }));
    if (status.excluded) children.push(el('p', { class: 'consent-state', text: 'Bu qurilma statistikadan chiqarilgan (admin qurilmasi) — hech narsa yuborilmaydi.' }));
  }
  const buttons = [
    el('button', { type: 'button', class: 'btn', text: 'Roziman', onclick: () => choose('granted') }),
    el('button', { type: 'button', class: 'btn btn-secondary', text: 'Yoʻq, rahmat', onclick: () => choose('denied') }),
  ];
  if (settingsMode) buttons.push(el('button', { type: 'button', class: 'btn btn-secondary', text: 'Yopish', onclick: close }));
  children.push(
    el('div', { class: 'btn-row consent-buttons' }, buttons),
    el('a', { href: 'privacy.html', class: 'consent-more', text: 'Batafsil (tanlovni keyin oʻzgartirsa boʻladi)' }),
  );

  current = el('section', { class: 'consent', role: 'region', 'aria-label': 'Statistika roziligi' }, [
    el('div', { class: 'consent-inner' }, children),
  ]);
  document.body.append(current);
  // Banner sahifa oxirini (footer'ni) yopib qoʻymasligi uchun pastdan joy qoldiramiz
  document.body.style.paddingBottom = `${current.offsetHeight}px`;
  // Foydalanuvchi oʻzi ochgan boʻlsa, fokusni bannerga oʻtkazamiz (klaviatura bilan ishlash uchun)
  if (settingsMode) buttons[0].focus();
}
