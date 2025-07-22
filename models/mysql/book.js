import mysql from 'mysql2/promise'
import { randomUUID } from 'crypto'

export class BookModel {
    constructor({config}){
        this.config = config
        this.init()
    }

    async init(){
        console.log('***************** config')
        console.log(JSON.stringify(this.config))
        this.connection = await mysql.createConnection(this.config)
        await this.connection.query('SET autocommit = 1');
    }

    getAll = async ({genre, year}) => {
        genre = (genre != undefined)? genre.toLowerCase(): genre
        const [books] = await this.connection.query(
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
        const [books] = await this.connection.query(
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
            await this.connection.beginTransaction()
            const result = await this.connection.query(
                `INSERT INTO books(id, name, author, description, year)
                    VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?)
                `,
                [name, author, description, year]
            )
            for(const g in genres){
                const genreName = genres[g]
                const [gs] = await this.connection.query(
                    `SELECT * FROM genres
                        WHERE name = ?
                    `,
                    [genreName]
                )
                const genreId = gs[0].id
                await this.connection.query(
                    `INSERT INTO books_genres(book_id, genre_id)
                        VALUES (UUID_TO_BIN('${uuid}'), ${genreId})
                    `
                )
            }
            await this.connection.commit()
            const book = await this.getById({id: uuid})
            return book
        }catch(e){
            console.log(e)
            await this.connection.rollback()
            throw new Error('Error creating book')
        }
    }

    update = async ({id, input}) => {
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
        const [result] = await this.connection.query(
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
        try{
            const [result, secondVar] = await this.connection.query(
                `DELETE FROM books
                WHERE BIN_TO_UUID(id) = ?
                `,
                [id]
            )
            return result['affectedRows'] == 1
        }catch(err){
            return false
        }
    }
}