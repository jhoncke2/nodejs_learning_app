import { Router } from 'express'
import { BookController } from '../controllers/books.js'

export function createBooksRouter({bookModel}){
    const booksRouter = Router()
    const bookController = new BookController({bookModel: bookModel})
    booksRouter.get('/', bookController.getAll)
    booksRouter.get('/:id', bookController.getById)
    booksRouter.post('/', bookController.create)
    booksRouter.patch('/:id', bookController.update)
    booksRouter.delete('/:id', bookController.delete)
    return booksRouter
}

