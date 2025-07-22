import { createApp } from "./app.js";
import { BookModel } from "./models/mysql/book.js";

createApp({bookModel: new BookModel({
    config: process.env.DATABASE_URL
})})