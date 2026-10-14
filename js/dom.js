// dom.js — sahifa elementlarini yaratish uchun kichik umumiy yordamchi.

// Element yaratish: el('button', { text: 'OK', class: 'btn', onclick: f }, [bolalar])
// Matn faqat textContent orqali qoʻyiladi — HTML qoʻyish imkoniyati ataylab yoʻq (XSS himoyasi).
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}
