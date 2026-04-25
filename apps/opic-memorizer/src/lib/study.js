export function getAlignedPairs(question) {
  return question.scriptPairs.filter((pair) => pair.status === 'aligned' && pair.ko && pair.en);
}

export function stableShuffle(items, seed = 7) {
  const result = [...items];
  let state = seed;

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 9301 + 49297) % 233280;
    const swapIndex = Math.floor((state / 233280) * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function blankEnglishSentence(sentence) {
  return sentence
    .split(/\s+/)
    .map((word, index) => {
      if (index < 2) return word;
      return index % 3 === 0 ? '_____' : word;
    })
    .join(' ');
}

