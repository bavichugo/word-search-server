import { Router } from "express";
import { getWords } from "../controllers/wordFilterController";

const filterRouter = Router();
filterRouter.get("/words", getWords);

export default filterRouter;