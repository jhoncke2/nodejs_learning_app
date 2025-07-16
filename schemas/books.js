import z from 'zod'

const bookSchema = z.object({
    name: z.string({
        invalid_type_error: 'El nombre debe ser un String',
        required_error: 'El nombre es requerido'
    }),
    author: z.string().min(10),
    genres: z.array(
        z.enum([
            'Cristianismo',
            'ciencia',
            'política',
            'historia',
            'filosofía',
            'novela',
            'cuento',
            'cómic',
            'recetas'
        ])
    ), 
    description: z.string().default('Sin descripción'),
    year: z.number().int().min(1850).max(2026)
})

export function validateBook(object) {
    return bookSchema.safeParse(object)
}

export function validatePartialBook(object) {
    //Toma todos los campos como opcionales. Valida solamente los que están
    return bookSchema.partial().safeParse(object)
}