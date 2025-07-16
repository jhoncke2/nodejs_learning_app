import { BookModel } from "../models/book.js"
import { validateBook, validatePartialBook } from '../schemas/books.js'

export class BookController {
    static async getAll(req, res) {
        const {genre, year} = req.query
        const books = await BookModel.getAll({genre, year})
        res.json(books)
    }

    static async getById(req, res) {
        const {id} = req.params
        const book = await BookModel.getById({id})
        if(book) return res.json(book)
        res.status(404).json({message: 'No existe esa película'})
    }

    static async create(req, res) {
        const result = validateBook(req.body)
        if(result.error){
            return res.status(400).json({
                error: JSON.parse(result.error.message)
            })
        }
        const newBook = await BookModel.create(result)
        res.status(201).json(newBook)
    }

    static async update(req, res) {
        const result = validatePartialBook(req.body)
        if(!result.success){
            return res.status(400).json({
                error: JSON.parse(result.error.message)
            })
        }
        const { id } = req.params
        const updatedBook = await BookModel.update({id, result})
        if(!updatedBook){
            return res.status(404).json({
                message: 'No existe el libro'
            })
        }
        return res.json(updatedBook)
    }

    static async delete(req, res) {
        const {id} = req.params
        const wasDeleted = await BookModel.delete({id})
        if(!wasDeleted){
            return res.status(404).json({
                message: 'No se pudo borrar el archivo'
            })
        }
        return res.json({
            message: 'El libro se borró'
        })
    }
}