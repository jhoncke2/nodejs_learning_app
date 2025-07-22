import { validateBook, validatePartialBook } from '../schemas/books.js'

export class BookController {
    constructor({bookModel}) {
        this.bookModel = bookModel
    }
    getAll = async (req, res) => {
        const {genre, year} = req.query
        const books = await this.bookModel.getAll({genre, year})
        res.json(books)
    }

    getById = async (req, res) => {
        const {id} = req.params
        const book = await this.bookModel.getById({id})
        if(book) return res.json(book)
        res.status(404).json({message: 'No existe esa película'})
    }

    create = async (req, res) => {
        const result = validateBook(req.body)
        if(result.error){
            return res.status(400).json({
                error: JSON.parse(result.error.message)
            })
        }

        const newBook = await this.bookModel.create({input: result.data})
        res.status(201).json(newBook)
    }

    update = async (req, res) => {
        const result = validatePartialBook(req.body)
        if(!result.success){
            return res.status(400).json({
                error: JSON.parse(result.error.message)
            })
        }
        const { id } = req.params
        const updatedBook = await this.bookModel.update({id, input: result.data})
        if(!updatedBook){
            return res.status(404).json({
                message: 'No existe el libro'
            })
        }
        return res.json(updatedBook)
    }

    delete = async (req, res) => {
        const {id} = req.params
        const wasDeleted = await this.bookModel.delete({id})
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