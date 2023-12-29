import fs from "fs";
import path from "path";
import readline from "readline";

const normalizeString = (inputString: string): string => {
  return inputString
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const normalizeObject = (inputObj: IFilter): IFilter => {
  const normalizedObj: IFilter = {};

  for (const key in inputObj) {
    if (typeof inputObj[key] === 'string') {
      normalizedObj[key] = normalizeString(inputObj[key] as string);
    } else {
      normalizedObj[key] = inputObj[key];
    }
  }

  return normalizedObj;
}

const WORDS_PATH: Record<string, string> = {
  PORTUGUESE: "portuguese_words.txt",
  ENGLISH: "english_words.txt",
};

interface IObjectKeys {
  [key: string]: string | number | undefined;
}

interface IFilter extends IObjectKeys {
  letters?: string;
  absentLetters?: string;
  startsWith?: string;
  endsWith?: string;
  pattern?: string;
  size?: number;
}

const filterWords = async (language: string | undefined, filter: IFilter, lastWord: string | undefined) => {
  const normalizedFilter = normalizeObject(filter);
  const normalizedLastWord = normalizeString(lastWord || "");
  const { letters, absentLetters, startsWith, endsWith, pattern, size } =
    normalizedFilter;
  const filteredWords: string[] = [];
  const absentLettersSet = absentLetters ? new Set(absentLetters) : undefined;
  let lettersSet: Record<string, number> | undefined;
  let skip = lastWord ? true : false;

  // Creating counter for letters
  if (letters) {
    lettersSet = {};
    for (const letter of letters) {
      lettersSet[letter] = (lettersSet[letter] || 0) + 1;
    }
  }

  try {
    // Open and read file
    const wordsFolderPath = path.join(__dirname, "../data/words/");
    const filePath = wordsFolderPath + WORDS_PATH[language ?? "ENGLISH"];
    const readStream = fs.createReadStream(filePath, { encoding: "utf8" });
    const rl = readline.createInterface({
      input: readStream,
    });

    // Filter words
    for await (const l of rl) {
      // Skipping words until after the lastWord passed
      if (l === normalizedLastWord) {
        skip = false;
        continue;
      }

      if (skip) continue;
      const line = normalizeString(l);
      if (filteredWords.length === 100) break;
      if (size && line.length !== +size) continue;
      if (startsWith && !line.startsWith(startsWith)) continue;
      if (endsWith && !line.endsWith(endsWith)) continue;
      if (absentLettersSet && !absentLetterFilter(line, absentLettersSet)) continue;
      if (lettersSet && !lettersFilter(line, lettersSet)) continue;

      if (pattern) {
        const patternRegex = new RegExp(pattern);
        if (!patternRegex.test(line)) continue;
      }

      // We add l (word) instead of line (normalized word) because we want to
      // add the original word, not the normalized one.
      filteredWords.push(l);
    }
    return filteredWords;
  } catch (error) {
    console.log(error);
  }
};

const absentLetterFilter = (
  word: string,
  absentLettersSet: Set<string>
): boolean => {
  let shouldAddWord = true;
  for (const letter of word) {
    if (absentLettersSet.has(letter)) {
      shouldAddWord = false;
      break;
    }
  }
  return shouldAddWord;
};

const lettersFilter = (word: string, lettersSet: Record<string, number>): boolean => {
  const lineSet: Record<string, number> = {};
  for (const letter of word) {
    lineSet[letter] = (lineSet[letter] || 0) + 1;
  }
  const allLettersInLine = Object.keys(lettersSet).every((letter) => {
    const letterCountInLine = lineSet[letter] || 0;
    return letterCountInLine >= lettersSet![letter];
  });
  return allLettersInLine;
};

export { normalizeString, normalizeObject, filterWords };