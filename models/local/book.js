import books from '../../books.json' with {type: 'json'}
import { randomUUID } from 'crypto'

export class BookModel {
    getAll = async ({ genre, year }) => {
        var filteredBooks = books
        if(genre){
            filteredBooks = filteredBooks.filter(
                book => book.genres.some(
                    g => g.toLowerCase() === genre.toLowerCase()
                )
            )
        }
        if(year){
            filteredBooks = filteredBooks.filter(
                book => book.year == year
            )
        }
        return filteredBooks
    }

    getById = async ({id}) => {
        const book = books.find(
            b => b.id == id
        )
        return book
    }

    create = async ({input}) => {
        const newBook = {
            id: randomUUID(),
            ...input.data
        }
        books.push(newBook)
        return newBook
    }

    update = async ({ id, input }) => {
        const bookIndex = books.findIndex(
            b => b.id == id
        )
        if(bookIndex === -1) return false
        books[bookIndex] = {
            ...books[bookIndex],
            input
        }
        return books[bookIndex]
    }

    delete = async ({ id }) => {
        const bookIndex = books.findIndex(
            b => b.id == id
        )
        if (bookIndex === -1) return false
        books.splice(bookIndex, 1)
        return true
    }
}