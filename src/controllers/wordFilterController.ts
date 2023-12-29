import { Request, Response } from "express";
import { filterWords } from "../helper/wordsHelper";

interface QueryParameters {
  letters?: string;
  absentLetters?: string;
  startsWith?: string;
  endsWith?: string;
  pattern?: string;
  size?: number;
  lastWord?: string;
  language?: string;
}

const getWords = async (req: Request, res: Response) => {
  const query: QueryParameters = req.query as QueryParameters;

  const {
    letters,
    absentLetters,
    startsWith,
    endsWith,
    pattern,
    size,
    lastWord,
    language,
  } = query;

  const filter = {
    letters,
    absentLetters,
    startsWith,
    endsWith,
    pattern,
    size,
  };

  try {
    const filteredWords = await filterWords(language, filter, lastWord);
    res.status(200).json(filteredWords);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getWords };
