"""
test_ass_output.py - Unit tests for ASS Subtitle Generation and Preset Pipeline
"""

import json
import os
import unittest
from subtitle_gen import hex_to_ass_color, format_ass_time, apply_casing, generate_ass_subtitles

class TestSubtitleGen(unittest.TestCase):
    def setUp(self):
        templates_path = os.path.join(
            os.path.dirname(__file__), "..", "frontend", "src", "data", "templates.json"
        )
        with open(templates_path, "r", encoding="utf-8") as f:
            self.templates = json.load(f)

        self.sample_transcript = [
            {"start": 0.42, "end": 0.85, "word": "Unlock", "keyword": False},
            {"start": 0.86, "end": 1.40, "word": "Millions", "keyword": True},
            {"start": 1.42, "end": 1.80, "word": "of", "keyword": False},
            {"start": 1.82, "end": 2.20, "word": "views", "keyword": False},
        ]

    def test_presets_count(self):
        self.assertGreaterEqual(len(self.templates), 100)
        categories = set(p["category"] for p in self.templates)
        self.assertIn("Viral Shorts", categories)
        self.assertIn("Neon & Gaming", categories)
        self.assertIn("Documentary & Clean", categories)
        self.assertIn("Karaoke Sweep", categories)

    def test_hex_to_ass_color(self):
        # White #FFFFFF -> &H00FFFFFF&
        self.assertEqual(hex_to_ass_color("#FFFFFF"), "&H00FFFFFF&")
        # Black #000000 -> &H00000000&
        self.assertEqual(hex_to_ass_color("#000000"), "&H00000000&")
        # Red #EF4444 (R=EF, G=44, B=44) -> ASS BGR &H004444EF&
        self.assertEqual(hex_to_ass_color("#EF4444"), "&H004444EF&")

    def test_format_ass_time(self):
        self.assertEqual(format_ass_time(0.0), "0:00:00.00")
        self.assertEqual(format_ass_time(1.45), "0:00:01.45")
        self.assertEqual(format_ass_time(65.12), "0:01:05.12")
        self.assertEqual(format_ass_time(3665.0), "1:01:05.00")

    def test_apply_casing(self):
        self.assertEqual(apply_casing("hello world", "UPPERCASE"), "HELLO WORLD")
        self.assertEqual(apply_casing("HELLO WORLD", "lowercase"), "hello world")
        self.assertEqual(apply_casing("hello world", "Title Case"), "Hello World")

    def test_generate_ass_viral_shorts(self):
        preset = next(p for p in self.templates if p["id"] == "mrbeast-yellow-pop")
        ass = generate_ass_subtitles(self.sample_transcript, preset)
        self.assertIn("[Script Info]", ass)
        self.assertIn("[V4+ Styles]", ass)
        self.assertIn("[Events]", ass)
        self.assertIn("Dialogue: 0,", ass)
        self.assertIn("UNLOCK", ass)
        self.assertIn("MILLIONS", ass)

    def test_generate_ass_karaoke(self):
        preset = next(p for p in self.templates if p["category"] == "Karaoke Sweep")
        ass = generate_ass_subtitles(self.sample_transcript, preset)
        self.assertIn("\\k", ass)

if __name__ == "__main__":
    unittest.main()
