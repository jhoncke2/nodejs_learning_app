import { createApp } from "./app.js";
import { BookModel } from "./models/local/book.js";

createApp({bookModel: new BookModel()})