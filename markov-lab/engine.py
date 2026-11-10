"""Everything the Markov Lab page asks for, in plain Python.

This file runs in two places:
  - on your computer, behind Flask (see app.py)
  - in the browser on the web version, using Pyodide (Python compiled for the browser)

Either way the page calls handle(route, params) and gets back a dict.
The Markov logic itself lives in markov.py.
"""
import csv
import io
import json
import os
import random
import re
import sys
from functools import lru_cache

import markov
from find_repeats import without_repeats

csv.field_size_limit(sys.maxsize)  # a play or a song file can be bigger than the 128 KB default

HERE = os.path.dirname(os.path.abspath(__file__))
MAX_TOKENS = 2000
MAX_ROWS = 500
TOP_FOLLOWERS = 12
PILE_PREVIEW = 80  # tiles per row in the chain table, before "Show all"
MAX_UPLOAD_CHARS = 30_000_000


class BadRequest(Exception):
    """A problem the page should show to the user."""


# ---------- Sources: artists, public domain texts, uploaded files ----------

# name -> {"kind": "artist" | "text" | "upload", "load": function returning the rows}
# Every row is a dict with at least "id", "title", "year" and "lyrics".
SOURCES = {}


def add_source(name, kind, load):
    SOURCES[name] = {"kind": kind, "load": load}
    clear_caches()  # in case a source with this name was replaced


def read_csv_file(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def add_text_folder(folder, names=None):
    """Register every CSV in folder (or just the given names) as a public domain text."""
    if names is None:
        names = [f[:-4] for f in os.listdir(folder) if f.endswith(".csv")] if os.path.isdir(folder) else []
    for name in names:
        path = os.path.join(folder, name + ".csv")
        add_source(name, "text", lambda path=path: read_csv_file(path))


def names_of(kind):
    return sorted((n for n, s in SOURCES.items() if s["kind"] == kind), key=str.lower)


def clear_caches():
    for cached in (get_songs, get_unique_ids, get_chain, get_piles):
        cached.cache_clear()


@lru_cache(maxsize=16)
def get_songs(name):
    return SOURCES[name]["load"]()


@lru_cache(maxsize=16)
def get_unique_ids(name):
    return frozenset(s["id"] for s in without_repeats(get_songs(name)))


def songs_to_use(name, skip_repeats):
    songs = get_songs(name)
    if skip_repeats:
        unique = get_unique_ids(name)
        songs = [s for s in songs if s["id"] in unique]
    return songs


@lru_cache(maxsize=24)
def get_chain(name, order, skip_repeats, punctuation):
    songs = songs_to_use(name, skip_repeats)
    return markov.build_chain([s["lyrics"] for s in songs], order, punctuation), len(songs)


@lru_cache(maxsize=24)
def get_piles(name, order, skip_repeats, punctuation):
    songs = songs_to_use(name, skip_repeats)
    return markov.build_piles([s["lyrics"] for s in songs], order, punctuation)


# ---------- Uploaded files ----------

def parse_upload(filename, content):
    """Turn an uploaded file into rows.

    .csv: needs a "lyrics" column (the artist files from artist_report.py work as is).
    .txt (or anything else): the whole file is one part.
    """
    base = os.path.splitext(os.path.basename(filename))[0]
    name = base.removesuffix(" All Lyrics").strip() or "Uploaded file"

    if filename.lower().endswith(".csv"):
        rows = list(csv.DictReader(io.StringIO(content)))
        if not rows or "lyrics" not in rows[0]:
            raise BadRequest('A CSV file needs a column named "lyrics". '
                             "For any other text, upload a .txt file.")
        parts = [{"id": row.get("id") or str(n), "title": row.get("title") or f"Part {n}",
                  "year": row.get("year") or "", "lyrics": row["lyrics"] or ""}
                 for n, row in enumerate(rows, start=1)]
    else:
        parts = [{"id": "1", "title": name, "year": "", "lyrics": content}]

    if not any(markov.get_tokens(p["lyrics"], False) for p in parts):
        raise BadRequest("That file has no words in it.")
    return name, parts


def route_upload(params):
    content = params.get("content") or ""
    if len(content) > MAX_UPLOAD_CHARS:
        raise BadRequest("That file is too big (the limit is about 30 MB).")
    name, parts = parse_upload(params.get("filename") or "upload.txt", content)
    if name in SOURCES and SOURCES[name]["kind"] != "upload":
        name += " (uploaded)"
    add_source(name, "upload", lambda parts=parts: parts)
    return {"name": name, "parts": len(parts)}


# ---------- Reading what the page sent ----------

def read_int(value, label, low, high):
    try:
        number = int(value)
    except (TypeError, ValueError):
        raise BadRequest(f"{label} must be a whole number.")
    if not low <= number <= high:
        raise BadRequest(f"{label} must be between {low} and {high}.")
    return number


def read_temperature(params):
    try:
        temperature = float(params.get("temperature", 1))
    except (TypeError, ValueError):
        raise BadRequest("Temperature must be a number.")
    if not 0.1 <= temperature <= 3:
        raise BadRequest("Temperature must be between 0.1 and 3.")
    return temperature


def read_settings(params):
    """The chain settings: source name, order, skip_repeats, punctuation."""
    name = params.get("artist", "")
    if name not in SOURCES:
        raise BadRequest(f"No source named: {name}")
    order = read_int(params.get("order", 1), "Order", 1, 3)
    skip = str(params.get("skip", "")).lower() in ("1", "true")
    punctuation = str(params.get("punct", "1")).lower() in ("1", "true")
    return name, order, skip, punctuation


def parse_find(text):
    """Split the Find box into tokens, keeping ⏎ so line-break entries can be found."""
    return re.findall(r"[\w']+|[.,!?;:⏎]", text.lower().replace("’", "'"))


def resolve_start(chain, start, order, punctuation):
    """Turn the 'start with' box into a list of starting tokens (or None)."""
    words = markov.get_tokens(start or "", punctuation)
    if not words:
        return None
    if len(words) >= order and " ".join(words[-order:]) in chain:
        return words
    if len(words) < order:
        prefix = " ".join(words) + " "
        matches = [key for key in chain if key.startswith(prefix)]
        if matches:
            return random.choice(matches).split()
    raise BadRequest(f'"{" ".join(words)}" has no entry in this chain. Try another start.')


def followers_json(followers, picked=None, temperature=1.0):
    """Most common followers, plus the picked word if it's further down the list.

    "chance" is each word's real probability of being picked at this temperature,
    using the same count ** (1 / temperature) weights as markov.next_word.
    """
    top = followers.most_common(TOP_FOLLOWERS)
    shown = {word for word, _ in top}
    if picked is not None and picked not in shown:
        top.append((picked, followers[picked]))
        shown.add(picked)
    weights = {word: count ** (1 / temperature) for word, count in followers.items()}
    total_weight = sum(weights.values())
    return {
        "total": sum(followers.values()),
        "top": [{"word": word, "count": count, "chance": weights[word] / total_weight}
                for word, count in top],
        "other_words": len(followers) - len(shown),
        "other_count": sum(c for w, c in followers.items() if w not in shown),
        "other_chance": sum(w for word, w in weights.items() if word not in shown) / total_weight,
    }


# ---------- Routes: one function per thing the page asks for ----------

def route_artists(params):
    return {"artists": names_of("artist"), "uploads": names_of("upload"), "texts": names_of("text")}


def route_code(params):
    with open(os.path.join(HERE, "markov.py"), encoding="utf-8") as f:
        return {"code": f.read()}


def route_filter(params):
    with open(os.path.join(HERE, "filter_words.txt"), encoding="utf-8") as f:
        words = [line.strip().lower() for line in f if line.strip() and not line.startswith("#")]
    return {"words": words}


def route_lyrics(params):
    name = read_settings(params)[0]
    unique = get_unique_ids(name)
    songs = [
        {"id": s["id"], "title": s["title"], "year": s["year"], "lyrics": s["lyrics"],
         "repeat": s["id"] not in unique}
        for s in get_songs(name)
    ]
    songs.sort(key=lambda s: s["title"].replace("​", "").lower())
    return {"songs": songs}


def route_chain(params):
    name, order, skip, punct = read_settings(params)
    limit = read_int(params.get("limit", 50), "Rows", 1, MAX_ROWS)
    chain, song_count = get_chain(name, order, skip, punct)

    keys = list(chain)  # dicts keep insertion order, so this is "first seen"
    sort = params.get("sort")
    if sort == "least":
        keys.sort(key=lambda key: sum(chain[key].values()))
    elif sort != "first":
        keys.sort(key=lambda key: sum(chain[key].values()), reverse=True)

    find = " ".join(parse_find(params.get("find", "")))
    if find:
        matches = [key for key in keys if key.startswith(find)]
        matches.sort(key=lambda key: key != find)  # an exact match goes first
        keys = matches

    rows = [{"key": key, **followers_json(chain[key])} for key in keys[:limit]]
    if params.get("view") == "pile":
        piles = get_piles(name, order, skip, punct)
        for row in rows:
            row["pile"] = piles[row["key"]][:PILE_PREVIEW]

    return {
        "songs": song_count,
        "entries": len(chain),
        "transitions": sum(sum(c.values()) for c in chain.values()),
        "matches": len(keys),
        "rows": rows,
    }


def route_pile(params):
    """Every token that followed one key, repeats included, in lyric order."""
    name, order, skip, punct = read_settings(params)
    pile = get_piles(name, order, skip, punct).get(params.get("key", ""))
    if pile is None:
        raise BadRequest("That entry isn't in this chain.")
    return {"pile": pile}


def route_generate(params):
    name, order, skip, punct = read_settings(params)
    n = read_int(params.get("n"), "Token count", 1, MAX_TOKENS)
    chain, _ = get_chain(name, order, skip, punct)
    if not chain:
        raise BadRequest("This source has no text to build a chain from.")
    start = resolve_start(chain, params.get("start"), order, punct)
    return {"text": markov.generate(chain, n, order, start, read_temperature(params))}


def route_step(params):
    """One generation step, returned with everything the page needs to show it."""
    name, order, skip, punct = read_settings(params)
    chain, _ = get_chain(name, order, skip, punct)
    if not chain:
        raise BadRequest("This source has no text to build a chain from.")

    tail = params.get("tail") or []
    if not tail:
        start = resolve_start(chain, params.get("start"), order, punct) or markov.random_start(chain)
        return {"kind": "start", "words": start}

    # Each view really runs its own version of the pick, as shown in the code panel.
    # A pile has no temperature, so pile picks always behave like temperature 1.
    use_pile = params.get("view") == "pile"
    temperature = 1.0 if use_pile else read_temperature(params)
    piles = get_piles(name, order, skip, punct) if use_pile else None
    if use_pile:
        word = markov.next_word_from_pile(piles, tail, order)
    else:
        word = markov.next_word(chain, tail, order, temperature)

    key = " ".join(tail[-order:])
    if word is None:
        return {"kind": "dead_end", "key": key, "words": markov.random_start(chain)}
    result = {"kind": "word", "key": key, "word": word, "temperature": temperature,
              "followers": followers_json(chain[key], word, temperature)}
    if use_pile:
        result["pile"] = piles[key]
    return result


ROUTES = {
    "artists": route_artists,
    "code": route_code,
    "filter": route_filter,
    "lyrics": route_lyrics,
    "chain": route_chain,
    "pile": route_pile,
    "generate": route_generate,
    "step": route_step,
    "upload": route_upload,
}


def handle(route, params):
    """Answer one request from the page. Raises BadRequest for problems to show the user."""
    if route not in ROUTES:
        raise BadRequest(f"Unknown request: {route}")
    return ROUTES[route](params)


def handle_json(route, params_json):
    """The browser version calls this: JSON in, JSON out, errors as {"error": ...}."""
    try:
        return json.dumps(handle(route, json.loads(params_json)))
    except BadRequest as error:
        return json.dumps({"error": str(error)})
