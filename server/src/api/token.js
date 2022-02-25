import addresses from './../../../addresses/addresses/binance-smartchain'
import { abi as ABI } from './../../../build/contracts/ArtOnline.json'
import {sendJSON} from './shared'
// import cache from './../cache'
import mime from 'mime-types'
import ethers from 'ethers'

import fetch from 'node-fetch'
import Router from '@koa/router'
const router = new Router()

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org', {
  chainId: 56
})

const contract = new ethers.Contract(addresses.artonline, ABI, provider)

const burns = []
const mints = []
const burnAddress = '0x0000000000000000000000000000000000000000'
const contractAddress = '0x535e67270f4FEb15BFFbFE86FEE308b81799a7a5'

const _getBurns = async (fromBlock = 11399032, toBlock = 14086225) => {
  let response = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&startBlock=${fromBlock}&endBlock=${toBlock}&contractaddress=${contractAddress}&apiKey=JK5WD3G5Q2JY4JUNW7PDDM4XGMAQ9QXEMN`)
  response = await response.json()
  for (const tx of response.result) {
    if (tx.to === burnAddress) burns.push(tx)
    else if (tx.from === burnAddress) mints.push(tx)
  }
  if (response.result.length === 10000) return _getBurns(toBlock + 1, toBlock + 1000000)
}


_getBurns().then(() => {
  contract.on('Transfer', (from, to, value, {blockNumber}) => {
    if (from === this.burnAddress) {
      mints.push({from, to, value, blockNumber})
    } else if (to === this.burnAddress) {
      burns.push({from, to, value, blockNumber})
    }
  })
})

const price = async (currency = 'usd') => {
  let response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=artonline&vs_currencies=${currency}`)
  response = await response.json()
  return response.artonline[currency]
}

const priceJob = async currency => {
  if (!jobber[currency]) {
    jobber[currency] = {
      job: async () => {
        jobber[currency].value = await price(currency)
      }
    }
    await jobber[currency].job()
  }
}

router.get('/token/price', async ctx => {
  const query = ctx.request.query
  const currency = query.currency || 'usd'
  await priceJob(currency)
  ctx.body = jobber[currency].value
})

router.get('/token/burns', async ctx => {
  sendJSON(ctx, burns)
})

router.get('/token/mints', async ctx => {
  sendJSON(ctx, mints)
})

router.get('/token/totalBurnAmount', async ctx => {
  if (!jobber.totalBurnAmount) {
    jobber.totalBurnAmount = {
      job: async () => {
        jobber.totalBurnAmount.value = Math.round(burns.reduce((p, c) => {
            p += Number(ethers.utils.formatUnits(c.value))
            return p
          }, 0) * 100) / 100
      }
    }
    await jobber.totalBurnAmount.job()
  }
  ctx.body = jobber.totalBurnAmount.value
})

router.get('/token/totalMintAmount', async ctx => {
  if (!jobber.totalMintAmount) {
    jobber.totalMintAmount = {
      job: async () => {
        jobber.totalMintAmount.value = Math.round(mints.reduce((p, c) => {
            p += Number(ethers.utils.formatUnits(c.value))
            return p
          }, 0) * 100) / 100
      }
    }
    await jobber.totalMintAmount.job()
  }
  ctx.body = jobber.totalMintAmount.value
})

router.get('/token/stats', async ctx => {
  const query = ctx.request.query
  const currency = query.currency || 'usd'
  await priceJob(currency)

  const result = {
    burns,
    mints,
    price: jobber[currency].value
  }
  sendJSON(ctx, result)
})

export default router
