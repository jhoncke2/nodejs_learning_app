import mysql from 'mysql2/promise'
import { randomUUID } from 'crypto'

export class BookModel {
    constructor({config}){
        this.config = config
        this.init()
    }

    async init(){
        this.connection = await mysql.createConnection(this.config)
        await connection.query('SET autocommit = 1');
    }

    getAll = async ({genre, year}) => {
        genre = (genre != undefined)? genre.toLowerCase(): genre
        const [books] = await connection.query(
            `SELECT
                BIN_TO_UUID(b.id) id,
                b.name,
                b.author,
                b.description,
                b.year,
                GROUP_CONCAT(g.name ORDER BY g.name SEPARATOR ', ' ) AS genres
            FROM books b
            JOIN books_genres bg ON b.id = bg.book_id
            JOIN genres g ON bg.genre_id = g.id
            ${this.getWhereStatement({genre, year})}
            GROUP BY b.id`,
            [genre, year].filter(x => x != undefined)
        )
        return books.map(
            m => ({
                ...m,
                genres: m.genres.split(', ')
            })
        )
    }

    getWhereStatement({genre, year}){
        return `${
            (genre != undefined || year != undefined)?
                `WHERE
                    ${
                        genre != undefined?
                        `LOWER(g.name) = ? ${year != undefined? "AND ":""}`:
                        ""
                    }
                    ${year != undefined? `b.year = ?`:""}
                `:
                ""
        }`
    }

    getById = async ({ id }) => {
        const [books] = await connection.query(
            `SELECT
                BIN_TO_UUID(b.id) id,
                b.name,
                b.author,
                b.description,
                b.year,
                GROUP_CONCAT(g.name ORDER BY g.name SEPARATOR ', ' ) AS genres
            FROM books b
            JOIN books_genres bg ON b.id = bg.book_id
            JOIN genres g ON bg.genre_id = g.id
            WHERE BIN_TO_UUID(b.id) = ?
            GROUP BY b.id`,
            [id]
        )
        
        if(books.length === 0) return null
        const book = books[0]
        book.genres = book.genres.split(', ')
        return book
    }

    create = async ({ input }) => {
        try{
            const {
                name,
                author,
                genres,
                description,
                year
            } = input
            const uuid = randomUUID()
            await connection.beginTransaction()
            const result = await connection.query(
                `INSERT INTO books(id, name, author, description, year)
                    VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?)
                `,
                [name, author, description, year]
            )
            for(const g in genres){
                const genreName = genres[g]
                const [gs] = await connection.query(
                    `SELECT * FROM genres
                        WHERE name = ?
                    `,
                    [genreName]
                )
                const genreId = gs[0].id
                await connection.query(
                    `INSERT INTO books_genres(book_id, genre_id)
                        VALUES (UUID_TO_BIN('${uuid}'), ${genreId})
                    `
                )
            }
            await connection.commit()
            const book = await this.getById({id: uuid})
            return book
        }catch(e){
            console.log(e)
            await connection.rollback()
            throw new Error('Error creating book')
        }
    }

    update = async ({id, input}) => {
        console.log('**************** updating on sql class')
        console.log(id)
        console.log(input)
        const {
            name,
            author,
            description,
            year
        } = input
        const theSetLine = this.getTheSetLine({name, author, description, year})
        const params = [name, author, description, year, id].filter(x => x != undefined)
        const query = `UPDATE books
            SET ${this.getTheSetLine({name, author, description, year})}
            WHERE id = UUID_TO_BIN(?)
            `
        const [result] = await connection.query(
            query,
            params
        )
        return this.getById({id})
    }

    getTheSetLine({name, author, description, year}){
        const items = []
        if(name != undefined){
            items.push(`name = ?`)
        }
        if(author != undefined){
            items.push(`author = ?`)
        }
        if(description != undefined){
            items.push(`description = ?`)
        }
        if(year != undefined){
            items.push(`year = ?`)
        }
        return items.join(', ')
    }

    delete = async ({id}) => {
        await connection.query(
            `DELETE FROM books
            WHERE id = ?
            `,
            [id]
        )
    }
}