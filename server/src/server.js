import Koa from 'koa'
import exchange from './api/exchange'
import platform from './api/platform'
import nft from './api/nft'
import cors from '@koa/cors'
const server = new Koa()

server.use(cors({origin: '*'}))

server.use(nft.routes())
server.use(exchange.routes())
server.use(platform.routes())

server.listen(9044)
