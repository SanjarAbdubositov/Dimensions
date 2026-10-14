# font-check.py — shriftda kerakli harflar bormi? Foydalanish: python3 tools/font-check.py fayl1.woff2 [fayl2 ...]
# Bir nechta fayl berilsa (masalan, lotin + kirill qismlari), ular birgalikda tekshiriladi.
import sys
from fontTools.ttLib import TTFont

NEED = {
    'ʻ (U+02BB) — oʻ, gʻ': 'ʻ',
    'ʼ (U+02BC) — tutuq belgisi': 'ʼ',
    'oʻzbek lotin': 'abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ',
    'rus kirill': 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
    'qozoq': 'әғқңөұүһіӘҒҚҢӨҰҮҺІ',
    'oʻzbek kirill': 'ўқғҳЎҚҒҲ',
}


# Har guruh uchun yetishmaydigan harflarni chiqaradi
def main(files):
    cmap = set()
    for f in files:
        cmap |= set(TTFont(f).getBestCmap())
    for name, chars in NEED.items():
        missing = [f'{c} (U+{ord(c):04X})' for c in chars if ord(c) not in cmap]
        print(f'{name:28} {"bor" if not missing else "YOʻQ: " + ", ".join(missing)}')


if __name__ == '__main__':
    main(sys.argv[1:])
