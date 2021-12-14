import addresses from './../../../addresses/addresses/binance-smartchain-testnet'
import { abi as ERC1155_ABI } from './../../../build/contracts/ArtOnlineListingERC1155.json'
import { abi as ERC721_ABI } from './../../../build/contracts/ArtOnlineListing.json'
import { abi as ABI } from './../../../build/contracts/ArtOnlineExchangeFactory.json'
// import cache from './../cache'
import jobber from './../jobber'
import mime from 'mime-types'
import ethers from 'ethers'
import Router from '@koa/router'
const router = new Router()

const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545', {
  chainId: 97
})

const contract = new ethers.Contract(addresses.exchangeFactory, ABI, provider)

router.get('/', ctx => {
  ctx.body = 'v0.0.1-alpha'
})

const updateCache = (key, value) => {
  cache[key] = value
}

const sendJSON = (ctx, value) => {
  ctx.type = mime.lookup('json')
  ctx.body = JSON.stringify(value)
}

const listingListed = async (address) => {
  const listingContract = new ethers.Contract(address, ERC721_ABI, provider)
  const listed = await listingContract.callStatic.listed()
  return listed.toNumber() === 1
}

router.get('/listings/ERC721', async ctx => {
  if (!jobber.listingsERC721) {
    jobber.listingsERC721 = {
      job: async () => {
        const listings = []
        const listingsLength = await contract.listingLength()
        for (let i = 0; i < listingsLength; i++) {
          const address = await contract.callStatic.listingsERC721(i)
          if (!jobber[`listed_${address}`]) {
            jobber[`listed_${address}`] = {
              job: async () => jobber[`listed_${address}`].value = await listingListed(address)
            }
          }
          listings.push({address, listed: jobber[`listed_${address}`].value})
        }
        jobber.listingsERC721.value = listings
      }
    }
  }
  sendJSON(ctx, jobber.listingsERC721.value)
})

router.get('/listings/ERC1155', async ctx => {
  if (!jobber.listingsERC1155) {
    jobber.listingsERC1155 = {
      job: async () => {
        const listings = []
        const listingsLength = await contract.listingERC1155Length()
        for (let i = 0; i < listingsLength; i++) {
          const address = await contract.callStatic.listingsERC1155(i)
          if (!jobber[`listed_${address}`]) {
            jobber[`listed_${address}`] = {
              job: async () => jobber[`listed_${address}`].value = await listingListed(address)
            }
          }
          listings.push({address, listed: await listingListed(address)})
        }
        jobber.listingsERC1155.value = listings
      }
    }

    await jobber.listingsERC1155.job()
  }
  sendJSON(ctx, jobber.listingsERC1155.value)
})

router.get('/listings', async ctx => {
  const listings = {}
  if (!cache.listingsERC721) {
    const listingsLength = await api.contract.listingLength()
    listings['ERC721'] = []
    for (let i = 0; i < listingsLength; i++) {
      const address = await contract.callStatic.listingsERC721(i)

      listings['ERC721'].push({address, listed: await listingListed(address)})
    }
    updateCache('listingsERC721', listings['ERC721'])
  }

  if (!cache.listingsERC1155) {
    const listingsLength = await api.contract.listingERC1155Length()
    listings['ERC1155'] = []
    for (let i = 0; i < listingsLength; i++) {
      const address = await contract.callStatic.listingsERC1155(i)
      listings['ERC1155'].push({address, listed: await listingListed(address)})
    }
    updateCache('listingsERC1155', listings['ERC1155'])
  }

  sendJSON(ctx, listings)
  return
})

router.get('/listing/info', async ctx => {
  console.log(ctx.request.query);
  const { address } = ctx.request.query
  if (!jobber[`listingInfo_${address}`]) {
    jobber[`listingInfo_${address}`] = {
      job: async () => jobber[`listingInfo_${address}`].value = await contract.callStatic.listingInfo(address)
    }
  }
  await jobber[`listingInfo_${address}`].job()
  ctx.body = jobber[`listingInfo_${address}`].value
})

router.get('/listing/listed', async ctx => {
  console.log(ctx.request.query);
  const { address } = ctx.request.query
  if (!jobber[`listed_${address}`]) {
    jobber[`listed_${address}`] = {
      job: async () => jobber[`listed_${address}`].value = await listingListed(address)
    }
  }
  await jobber[`listed_${address}`].job()
  ctx.body = jobber[`listed_${address}`].value
})

router.get('/listing/ERC721', async ctx => {
  const { address, tokenId } = ctx.params
  const listing = cache[`${address}_${tokenId}`] || await contract.callStatic.getListingERC721(address, tokenId)
  sendJSON(ctx, listing)
})

router.get('/listing/ERC1155', async ctx => {
  const { address, id, tokenId } = ctx.params
  const listing = cache[`${address}_${id}_${tokenId}`] || await contract.callStatic.getListingERC1155(address, id, tokenId)
  sendJSON(ctx, listing)
})

export default router