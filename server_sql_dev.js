import { createApp } from "./app.js";
import { BookModel } from './models/mysql/book.js'

createApp({bookModel: new BookModel({
    config: {
        host: 'localhost',
        user: 'root',
        database: 'booksdb',
        password: '',
        port: 3306
    }
})})