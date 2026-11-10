"""Find songs in an artist's file that are probably repeats/versions of each other.

Usage:
    python3 find_repeats.py "Sabrina Carpenter"

Uses the artist file from artist_report.py (artists/<Name> All Lyrics.csv),
creating it first if needed.

Heads-up about this dataset: parentheses were stripped from titles, so
"Almost Love (Remix)" is stored as "Almost Love Remix". That's why we look
for titles that START WITH another song's title, rather than parsing "(...)".

Three kinds of matches:
  1. Same title     - the exact same title (after cleanup) listed more than once.
  2. Versions       - "Sue Me Marian Hill Remix" starts with "Sue Me".
  3. Similar titles - spelled nearly the same, e.g. "Im So Tired" / "So Tired".
For each match we also show how much the LYRICS overlap, which is the real
tell: a remix shares ~all its words with the original; "Stay" and
"Stay With Me" probably don't.
"""
import argparse
import difflib
import re
import unicodedata
from collections import defaultdict

# Words that signal "this is another version of a song", not a new song.
VERSION_WORDS = {
    "remix", "mix", "acoustic", "live", "version", "cappella", "capella",
    "cutdown", "edit", "demo", "instrumental", "remaster", "remastered",
    "cover", "ft", "feat", "featuring", "unplugged", "stripped", "radio",
    "extended", "interview", "session", "sessions", "piano", "orchestral",
}


LIKELY_OVERLAP = 0.5  # lyrics overlap at/above this counts as a likely repeat


def clean_title(title):
    """Lowercase, strip accents/invisible characters/punctuation, squash spaces."""
    t = unicodedata.normalize("NFKD", title).lower()
    t = "".join(ch for ch in t if not unicodedata.combining(ch))
    t = t.replace("​", "")             # zero-width space shows up in this data
    t = re.sub(r"[^a-z0-9 ]+", " ", t)      # punctuation -> space
    return " ".join(t.split())


def word_set(text):
    """The set of distinct lowercase words in some text."""
    return set(re.findall(r"[a-z']+", text.lower()))


def lyric_overlap(lyrics_a, lyrics_b):
    """Fraction of distinct words two songs share (0.0 to 1.0).

    This is Jaccard similarity: |shared words| / |all words in either song|.
    """
    a, b = word_set(lyrics_a), word_set(lyrics_b)
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def has_version_word(extra_words):
    return any(w in VERSION_WORDS for w in extra_words.split())


def find_same_titles(songs):
    """Group songs whose cleaned titles are identical."""
    groups = defaultdict(list)
    for s in songs:
        groups[clean_title(s["title"])].append(s)
    return {t: g for t, g in groups.items() if len(g) > 1}


def find_versions(songs):
    """Map each 'base' song title to songs whose titles start with it.

    "Sue Me Marian Hill Remix" starts with "Sue Me" followed by a space,
    so it's filed under "Sue Me". The space check stops "Almost Lover"
    from counting as a version of "Almost Love".
    """
    by_title = {clean_title(s["title"]): s for s in songs}
    titles = sorted(by_title, key=len)  # shortest first = most likely the base

    versions = defaultdict(list)
    for t in titles:
        for base in titles:
            if len(base) >= len(t):
                break
            if t.startswith(base + " "):
                versions[base].append(by_title[t])
                break  # attach to the shortest matching base only
    return by_title, versions


def find_similar_titles(songs, already_matched, cutoff=0.8):
    """Pairs of titles that are spelled nearly the same (typos, small changes)."""
    titles = sorted({clean_title(s["title"]) for s in songs})
    by_title = {clean_title(s["title"]): s for s in songs}
    pairs = []
    for i, a in enumerate(titles):
        for b in titles[i + 1:]:
            if {a, b} <= already_matched:
                continue
            if difflib.SequenceMatcher(None, a, b).ratio() >= cutoff:
                pairs.append((by_title[a], by_title[b]))
    return pairs


def without_repeats(songs):
    """Return songs minus likely repeats, keeping each original.

    A song is dropped if its title matches or extends another song's title
    AND their lyrics overlap by at least LIKELY_OVERLAP.
    """
    dropped = set()
    for group in find_same_titles(songs).values():
        for s in group[1:]:
            if lyric_overlap(group[0]["lyrics"], s["lyrics"]) >= LIKELY_OVERLAP:
                dropped.add(s["id"])

    by_title, versions = find_versions(songs)
    for base, group in versions.items():
        for s in group:
            if lyric_overlap(by_title[base]["lyrics"], s["lyrics"]) >= LIKELY_OVERLAP:
                dropped.add(s["id"])

    return [s for s in songs if s["id"] not in dropped]


def label(song):
    return f"{song['title']} ({song['year']})"


def main():
    parser = argparse.ArgumentParser(description="Find repeated / alternate-version songs.")
    parser.add_argument("artist")
    args = parser.parse_args()

    from artist_report import load_artist_songs  # only needed here, not on the web

    songs = load_artist_songs(args.artist)
    print(f"{args.artist}: {len(songs)} songs in file\n")

    likely = 0  # title match AND lyrics overlap >= LIKELY_OVERLAP

    # 1. Exact same title
    same = find_same_titles(songs)
    print(f"== Same title listed more than once: {len(same)}")
    for group in same.values():
        first = group[0]
        print(f"  {label(first)}")
        for s in group[1:]:
            pct = lyric_overlap(first["lyrics"], s["lyrics"])
            likely += pct >= LIKELY_OVERLAP
            print(f"     = {label(s)}   lyrics overlap {pct:.0%}")
    print()

    # 2. Versions of a base title
    by_title, versions = find_versions(songs)
    extra_count = sum(len(v) for v in versions.values())
    print(f"== Titles that extend another title: {extra_count} songs under {len(versions)} bases")
    print("   (* = has a word like Remix/Acoustic/Live)")
    matched = set()
    for base, group in sorted(versions.items()):
        original = by_title[base]
        matched.add(base)
        print(f"  {label(original)}")
        for s in group:
            t = clean_title(s["title"])
            matched.add(t)
            star = "*" if has_version_word(t[len(base):]) else " "
            pct = lyric_overlap(original["lyrics"], s["lyrics"])
            likely += pct >= LIKELY_OVERLAP
            print(f"   {star} {label(s)}   lyrics overlap {pct:.0%}")
    print()

    # 3. Nearly the same spelling
    pairs = find_similar_titles(songs, matched)
    print(f"== Similar titles: {len(pairs)} pairs")
    for a, b in pairs:
        pct = lyric_overlap(a["lyrics"], b["lyrics"])
        likely += pct >= LIKELY_OVERLAP
        print(f"  {label(a)}  ~  {label(b)}   lyrics overlap {pct:.0%}")

    print(f"\nLikely repeats (title match + lyrics overlap >= {LIKELY_OVERLAP:.0%}): "
          f"{likely} of {len(songs)} songs")


if __name__ == "__main__":
    main()
