import { createApp } from "./app";
import { BookModel } from "./models/mysql/book";

createApp({bookModel: new BookModel({
    config: {
        host: 'mysql.railway.internal',
        user: 'root',
        database: 'booksdb',
        password: 'tEIfCdFygDjVoYRxlYLdiduaqqYJwQHD',
        port: 3306
    }
})})