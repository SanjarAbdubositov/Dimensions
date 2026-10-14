# font-subset.py — Literata shriftini sayt uchun kichraytiradi (bir martalik, build qadam emas).
# Natija repoda saqlanadi: fonts/literata.woff2 (≈ 28 KB). Kursiv fayl yoʻq: u kam ishlatiladi,
# brauzer kursivni oʻzi yasaydi va sahifa 33 KB yengilroq boʻladi (dars LCP 2.3 s → 2.1 s).
#
# Qayta yaratish:
#   pip install fonttools brotli
#   npm pack @fontsource-variable/literata@5.3.0 && tar -xzf fontsource-variable-literata-5.3.0.tgz
#   python3 tools/font-subset.py package/files/literata-latin-wght-normal.woff2 fonts/literata.woff2
#
# Nima qoladi: ASCII, «» ° ± · kabi belgilar, É é í ü × ÷, ʻ (U+02BB), ʼ (U+02BC), tire va
# qoʻshtirnoqlar, daraja va indeks raqamlari, minus belgisi. Ogʻirlik oʻqi 400–700 bilan cheklanadi.
# Roʻyxatda yoʻq harf (masalan, ä) chiqsa, u tizim shriftida koʻrinadi — RANGES ga qoʻshing.
# Kirill harflari (rus, qozoq) kerak boʻlsa: cyrillic va cyrillic-ext fayllaridan alohida fayl yarating
# va style.css da unicode-range bilan ulang. Faqat oʻsha harflar uchragan sahifada yuklanadi.
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

RANGES = '20-7E,A0-BF,C9,D7,E9,ED,F7,FC,2BB-2BC,2013-2014,2018-201E,2022,2026,2032-2033,2070-2079,207F,2080-2089,2212,FEFF'


# "20-7E,A0" → [0x20, ..., 0x7E, 0xA0]
def parse_ranges(text):
    codes = []
    for part in text.split(','):
        a, _, b = part.partition('-')
        codes += range(int(a, 16), int(b or a, 16) + 1)
    return codes


# Kerakli harflarni ajratib oladi, keyin ogʻirlik oʻqini 400–700 ga qisqartiradi
def main(src, dst):
    font = TTFont(src)
    opts = subset.Options()
    opts.layout_features = ['ccmp', 'locl', 'liga', 'kern', 'mark', 'mkmk', 'rvrn', 'tnum']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=parse_ranges(RANGES))
    sub.subset(font)
    font = instancer.instantiateVariableFont(font, {'wght': (400, 700)})
    font.flavor = 'woff2'
    font.save(dst)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
