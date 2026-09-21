"""
transliterate.py - Phonetic transliteration between Devanagari (Hindi) and Roman Urdu / English letters.
Provides clean, natural Roman script for South Asian podcast shorts.
"""

import re
from typing import List, Dict, Any

COMMON_HINDI_URDU_WORDS = {
    'ये': 'yeh', 'वह': 'woh', 'लोग': 'log', 'करते': 'karte', 'हैं': 'hain',
    'है': 'hai', 'इसकी': 'iski', 'इसका': 'iska', 'उसका': 'uska', 'उनकी': 'unki',
    'इनका': 'inka', 'ने': 'ne', 'बोला': 'bola', 'कि': 'ki', 'हर': 'har', 'हफ्ते': 'hafte',
    'और': 'aur', 'होता': 'hota', 'जाएगा': 'jayega', 'एक': 'ek', 'कहीं': 'kahin',
    'से': 'se', 'भी': 'bhi', 'मिल': 'mil', 'सकता': 'sakta', 'सकती': 'sakti',
    'सकते': 'sakte', 'ज़रूरत': 'zaroorat', 'जरूरत': 'zaroorat', 'नहीं': 'nahi', 'आप': 'aap',
    'किताब': 'kitab', 'किताबें': 'kitabein', 'किताबे': 'kitabein', 'पढ़िए': 'parhiye',
    'पढ़िये': 'parhiye', 'पढ़': 'parh', 'रहे': 'rahe', 'रही': 'rahi', 'रहा': 'raha',
    'देखिए': 'dekhiye', 'देखिये': 'dekhiye', 'सुन': 'sun', 'सिर्फ': 'sirf', 'फायदा': 'fayda',
    'बोलता': 'bolta', 'कितना': 'kitna', 'तो': 'toh', 'अगर': 'agar', 'बहुत': 'bohot',
    'सारे': 'saare', 'कम': 'kam', 'ज्यादा': 'zyada', 'कुछ': 'kuch', 'कर': 'kar',
    'पढ़ा': 'parha', 'सीखता': 'seekhta', 'लिखता': 'likhta', 'रहता': 'rehta',
    'हूँ': 'hoon', 'हूं': 'hoon', 'क्योंकि': 'kyunki', 'टाइम': 'time', 'बात': 'baat',
    'क्या': 'kya', 'कौन': 'kaun', 'कब': 'kab', 'कहाँ': 'kahan', 'कहा': 'kaha',
    'जैसे': 'jaise', 'पैसा': 'paisa', 'पैसे': 'paise', 'काम': 'kaam', 'दिन': 'din',
    'घंटा': 'ghanta', 'घंटे': 'ghante', 'साल': 'saal', 'महीना': 'mahina', 'महीने': 'mahine',
    'अच्छा': 'acha', 'अच्छी': 'achi', 'बड़ा': 'bada', 'बड़ी': 'badi', 'छोटा': 'chota',
    'हो': 'ho', 'था': 'tha', 'थी': 'thi', 'थे': 'the', 'गा': 'ga', 'गी': 'gi', 'गे': 'ge',
    'मेरा': 'mera', 'मेरी': 'meri', 'मेरे': 'mere', 'तेरा': 'tera', 'तेरी': 'teri',
    'हमारा': 'hamara', 'तुम्हारे': 'tumhare', 'आपका': 'aapka', 'आपकी': 'aapki',
    'यहाँ': 'yahan', 'वहाँ': 'wahan', 'अभी': 'abhi', 'कभी': 'kabhi', 'सब': 'sab'
}

VOWELS = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ri'
}

MATRAS = {
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri'
}

CONSONANTS = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f'
}

SPECIAL = {'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': ''}

def is_devanagari(text: str) -> bool:
    """Checks if a string contains any Devanagari Unicode characters."""
    return any('\u0900' <= char <= '\u097F' for char in text)

def transliterate_word(word: str) -> str:
    """Transliterates a single Hindi/Devanagari word into Roman Urdu."""
    if not is_devanagari(word):
        return word

    # Separate surrounding punctuation
    clean_w = word.strip(' ,.!?:;"\'()[]{}')
    if not clean_w:
        return word

    # Look up in curated dictionary first
    if clean_w in COMMON_HINDI_URDU_WORDS:
        repl = COMMON_HINDI_URDU_WORDS[clean_w]
        return word.replace(clean_w, repl)

    # Phonetic character-by-character conversion
    chars = list(clean_w)
    res = []
    i = 0
    n = len(chars)

    while i < n:
        c = chars[i]
        if i + 1 < n and chars[i + 1] == '़':
            c = c + '़'
            i += 1

        if c in CONSONANTS:
            res.append(CONSONANTS[c])
            if i + 1 < n:
                next_c = chars[i + 1]
                if next_c in MATRAS:
                    res.append(MATRAS[next_c])
                    i += 1
                elif next_c == '्':
                    # Halant: mute vowel
                    i += 1
                elif next_c in SPECIAL:
                    res.append('a')
                else:
                    res.append('a')
            else:
                # End of word consonant in Hindi/Urdu drops inherent schwa
                pass
        elif c in VOWELS:
            res.append(VOWELS[c])
        elif c in MATRAS:
            res.append(MATRAS[c])
        elif c in SPECIAL:
            res.append(SPECIAL[c])
        else:
            res.append(c)
        i += 1

    trans = ''.join(res)
    return word.replace(clean_w, trans) if trans else word

def transliterate_transcript(words: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Converts a list of word tokens with Devanagari text into Roman Urdu."""
    out = []
    for item in words:
        w_text = str(item.get("word", ""))
        new_text = transliterate_word(w_text)
        out.append({
            **item,
            "word": new_text
        })
    return out
