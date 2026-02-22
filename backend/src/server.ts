import { buildApp } from './app.js'

const app = await buildApp()

try {
  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
  app.log.info(`Server listening on port ${process.env.PORT ?? 3000}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
