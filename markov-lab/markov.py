"""A classic Markov chain text generator.

The idea: to choose what comes next, look only at the last few tokens, then
pick randomly from the tokens that came next in the training text. Common
followers get picked more often. That's the whole model.

A "token" is a word, a punctuation mark, or a line break. Treating punctuation
and line breaks as tokens lets the chain learn where lines and sentences end.

"order" is how many tokens of context we look at.
"""
import random
import re
from collections import Counter

NEWLINE = "⏎"  # stands for a line break, so it can be a token like any word
PUNCTUATION = ".,!?;:"


def get_tokens(lyrics, punctuation=True):
    """Turn raw lyrics into a list of lowercase tokens.

    punctuation=True:   ["i", "know", ",", "i", "know", "⏎", "you", ...]
    punctuation=False:  ["i", "know", "i", "know", "you", ...]   (words only)
    """
    lyrics = re.sub(r"\[.*?\]", " ", lyrics)  # drop labels like [Chorus]
    lyrics = lyrics.lower().replace("’", "'")
    if not punctuation:
        return re.findall(r"[\w']+", lyrics)

    tokens = []
    for token in re.findall(r"[\w']+|[.,!?;:]|\n", lyrics):
        if token == "\n":
            token = NEWLINE
        if not tokens and token == NEWLINE:
            continue  # no line breaks at the very start
        if token in PUNCTUATION and tokens and tokens[-1] == token:
            continue  # "..." counts as one "."
        if token == NEWLINE and tokens[-1] == NEWLINE:
            continue  # blank lines count as one line break
        tokens.append(token)
    return tokens


def build_chain(songs, order=1, punctuation=True):
    """Build the chain: {tokens: Counter of the tokens that came next}.

    Example with order=1:  {"love": Counter({"me": 12, "you": 9, ",": 4, "⏎": 3})}
    Each song is read separately, so no song's ending leads into the next song.
    """
    chain = {}
    for lyrics in songs:
        tokens = get_tokens(lyrics, punctuation)
        for i in range(len(tokens) - order):
            key = " ".join(tokens[i : i + order])
            following = tokens[i + order]
            if key not in chain:
                chain[key] = Counter()
            chain[key][following] += 1
    return chain


def next_word(chain, text, order, temperature=1.0):
    """Pick the next token for text, or None if this is a dead end.

    temperature changes the odds before the pick:
      1    use the counts as they are
      < 1  favor common tokens even more (safer, more sensible, more repetitive)
      > 1  even things out (more surprising, more nonsense)
    """
    key = " ".join(text[-order:])
    followers = chain.get(key)
    if followers is None:
        return None  # these tokens only ever appeared at the end of a song
    words = list(followers)
    counts = list(followers.values())
    weights = [count ** (1 / temperature) for count in counts]
    return random.choices(words, weights=weights)[0]


def build_piles(songs, order=1, punctuation=True):
    """The same chain before any counting: {tokens: list of every token that came next}.

    Example with order=1:  {"love": ["me", "you", ",", "me", "⏎", "me", "you", ...]}
    Repeats stay in, in the order they appear in the lyrics.
    """
    piles = {}
    for lyrics in songs:
        tokens = get_tokens(lyrics, punctuation)
        for i in range(len(tokens) - order):
            key = " ".join(tokens[i : i + order])
            following = tokens[i + order]
            if key not in piles:
                piles[key] = []
            piles[key].append(following)
    return piles


def next_word_from_pile(piles, text, order):
    """Same job as next_word, with no probabilities: grab any one token from the pile.

    A token that's in the pile 12 times is 12 times as likely to get grabbed,
    which is exactly what the weights in next_word do at temperature 1.
    A pile has no temperature dial: every tile is always equally likely.
    """
    key = " ".join(text[-order:])
    pile = piles.get(key)
    if pile is None:
        return None
    return random.choice(pile)


def random_start(chain):
    """Pick a random entry from the chain that starts with a word."""
    starts = [key for key in chain if key[0] not in PUNCTUATION + NEWLINE]
    return random.choice(starts or list(chain)).split()


def generate(chain, n, order, start=None, temperature=1.0):
    """Generate a list of n tokens, optionally beginning with the start tokens."""
    text = list(start) if start else random_start(chain)
    while len(text) < n:
        word = next_word(chain, text, order, temperature)
        if word is None:
            text += random_start(chain)  # dead end: jump somewhere new
        else:
            text.append(word)
    return text[:n]
