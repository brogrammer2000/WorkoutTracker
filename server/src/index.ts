import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes'
import { seedAdmin } from './seed'

const app = express()
const PORT = process.env.PORT ?? 8080

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:3000' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api', routes)

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await seedAdmin()
})
