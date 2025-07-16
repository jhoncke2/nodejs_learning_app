const express = require('express')
const crypto = require('node:crypto')
const books = require('./books.json')
const { validateBook, validatePartialBook } = require('./books')

const app = express()
app.disable('x-powered-by')
/*
Un middleware que automáticamente escucha los chunks del body
hasta haberlo recibido por completo, para que podamos acceder
al body sin necesidad de esperar a que se complete.
*/
app.use(express.json())

/*
 ********* CORS
 * Métodos normales: GET / HEAD / POST
 * * CORS PRE-Flight
 * Métodos complejos: PUT / PATCH / DELETE
 * * OPTIONS
*/

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'http://books.com'
]

app.get('/', (req, res) => {
    res.json({message: 'Hello, world!'})
})

app.get('/books', (req, res) => {
    /*
        Cuando la petición es del mismo ORIGIN que del servidor,
        el navegador no envía el header 'origin'.
        Hay otras cabeceras que me muestran si es el mismo irigin.
    */
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin)){
        res.header('Access-Control-Allow-Origin', '*')
    }
    const {genre, year} = req.query
    filteredBooks = books
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
    res.json(filteredBooks)
})

app.post('/books', (req, res) => {
    const result = validateBook(req.body)
    if(result.error){
        return res.status(400).json({
            error: JSON.parse(result.error.message)
        })
    }
    const newBook = {
        id: crypto.randomUUID(),
        ...result.data
    }
    books.push(newBook)
    res.status(201).json(newBook)
})

app.patch('/books/:id', (req, res) => {
    
    const result = validatePartialBook(req.body)
    if(!result.success){
        return res.status(400).json({
            error: JSON.parse(result.error.message)
        })
    }
    const { id } = req.params
    const bookIndex = books.findIndex(
        book => book.id == id
    )
    if(bookIndex === -1){
        return res.status(404).json({
            message: 'Libro no encontrado'
        })
    }
    const book = books[bookIndex]
    /*
    * Se ponen todos los campos de book y se superponen por encima los que tenga result.data
    * Ejemplo:
    *   * book tiene como "name": "libro 1"
    *   * result.data tiene como "name": "libro 2"
    *   -> Se superpone "libro 2" por encima de "libro 1"
    */
    const updatedBook = {
        ...book,
        ...result.data
    }
    books[bookIndex] = updatedBook
    return res.json(updatedBook) 
})

app.delete('/books/:id', (req, res) => {
    const {id} = req.params
    const bookIndex = books.findIndex(
        b => b.id == id
    )
    if(bookIndex === -1){
        return res.status(404).json({
            message: 'No existe el libro'
        })
    }
    books.splice(bookIndex, 1)
    return res.json({
        message: 'El libro se borró'
    })
})

//Le decimos a express que en esa url, después de /books/ hay una variable a la que quiero acceder
app.get('/books/:id', (req, res) => {
    const {id} = req.params
    const book = books.find(
        b => b.id == id
    )
    if(book) return res.json(book)
    res.status(404).json({message: 'No existe esa película'})
})

app.options('/books/:id', (req, res) => {
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin)){
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Alllow-Methods', 'GET, POST, PATCH, DELETE')
    }
    res.send(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
})