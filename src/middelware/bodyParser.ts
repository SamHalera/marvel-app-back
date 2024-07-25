import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";

const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
