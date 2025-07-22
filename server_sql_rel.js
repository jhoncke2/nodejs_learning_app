import { createApp } from "./app.js";
import { BookModel } from "./models/mysql/book.js";

createApp({bookModel: new BookModel({
    config: {
        host: 'mysql.railway.internal',
        user: 'root',
        database: 'booksdb',
        password: 'tEIfCdFygDjVoYRxlYLdiduaqqYJwQHD',
        port: 3306
    }
})})