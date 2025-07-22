import express, { json } from 'express'
import { createBooksRouter } from './routes/books.js'
import { corsMiddleware } from './middlewares/cors.js'

export const createApp = ({bookModel}) => {
    const app = express()
    /*
    Un middleware que automáticamente escucha los chunks del body
    hasta haberlo recibido por completo, para que podamos acceder
    al body sin necesidad de esperar a que se complete.
    */
    app.use(json())
    app.use(corsMiddleware())
    app.disable('x-powered-by')

    app.get('/', (req, res) => {
        res.json({message: 'Hello, world!'})
    })

    app.use('/books', createBooksRouter({bookModel: bookModel}))

    const PORT = process.env.PORT ?? 1234

    app.listen(PORT, () => {
        console.log(`Server listening on port http://localhost:${PORT}`)
    })
}