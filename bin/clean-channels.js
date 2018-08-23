#!/usr/bin/env node
'use strict'

const rippleAddress = process.env.XRP_ADDRESS
const rippleSecret = process.env.XRP_SECRET

if(!rippleAddress || !rippleSecret) {
    console.error('This script assumes that your XRP ledger credentials are available as env varaibles: XRP_ADDRESS and XRP_SECRET')
    process.exit(1)
}

const { RippleAPI } = require('ripple-lib');
const api = new RippleAPI({ server: 'wss://s2.ripple.com' });

api.on('error', (errorCode, errorMessage) => {
    console.log(errorCode + ': ' + errorMessage);
})

api.on('connected', () => {
    console.log('API connected');
})

api.on('disconnected', (code) => {
    // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
    // will be 1000 if this was normal closure
    console.log('API disconnected, code:', code);
})

const RIPPLE_EPOCH_OFFSET = Date.parse('01 Jan 2000 00:00:00 GMT') / 1000 // Seconds between unix epoch and ripple epoch 
function channelHasExpired(channel) {
    const now = (Date.now() / 1000) - RIPPLE_EPOCH_OFFSET
    return (channel.expiration && channel.expiration < now)
}

function channelIsClosing(channel) {
    const now = (Date.now() / 1000) - RIPPLE_EPOCH_OFFSET
    return (channel.expiration && channel.expiration > now)
}

function logChannel(prefix, channel) {
    const expiry = channel.expiration ? new Date((channel.expiration + RIPPLE_EPOCH_OFFSET) * 1000).toString() : "not set"
    console.log(`${prefix} ${channel.channel_id}, amount: ${channel.amount}, balance: ${channel.balance}, expires: ${expiry}`)
}

async function get_channels(account, destinationAccount){
    const request = {
        command: 'account_channels',
        account,
        ledger_index: 'validated'
    }
    if(destinationAccount) {
        request['destination_account'] = destinationAccount
    }
    const response = await api.connection.request(request)
    return response.channels
}

async function close_channel(channel_id){
    try {
        const prepared = await api.preparePaymentChannelClaim(rippleAddress, {
            channel: channel_id,
            close: true
        })
        const { signedTransaction, id } = api.sign(prepared.txJSON, rippleSecret)

        const result = await api.submit(signedTransaction)
        if(result.resultCode === 'tesSUCCESS') {
            console.log(`--- tx submitted to close channel ${channel_id}`)
        } else {
            console.error(`--- unable to close channel: ${channel_id}`, result)
        }    
    } catch (e) {
        console.error(`--- error closing channel ${channel_id}`, e)
    }
    
}

console.log("Connecting to rippled API...")

api.connect().then(async () => {
    console.log(`Getting outgoing channels for ${rippleAddress}...`)

    const peers = {}
    const outgoingChannels = await get_channels(rippleAddress);
    outgoingChannels.forEach(channel => {
        if(!peers[channel.destination_account]) {
            peers[channel.destination_account] = {
                outgoingChannels: [],
                incomingChannels: []
            }
        }
        peers[channel.destination_account].outgoingChannels.push(channel)
    })

    console.log(`- Found ${outgoingChannels.length} channels to ${Object.keys(peers).length} unique destination addresses.`)
    console.log(``)
    console.log(`Getting incoming channels from peers...`)
      
    await Object.keys(peers).reduce(async (promise, peer) => {
        await promise
        peers[peer].incomingChannels = await get_channels(peer, rippleAddress)
        console.log(`- Found ${peers[peer].incomingChannels.length} channels from ${peer}`)
    }, Promise.resolve())

    console.log(``)
    console.log(`-- Channels --`)

    let closedChannels = 0
    let expiredChannels = 0

    await Object.keys(peers).reduce(async (promise, peer) => {
        await promise
        console.log(`${peer}`)
        const outgoing = peers[peer].outgoingChannels
        const incoming = peers[peer].incomingChannels

        incoming.forEach(incomingChannel => {
            logChannel("<-", incomingChannel)
        })
        if(incoming.length === 0) {
            console.log(` - no incoming channels, closing outgoing channels`)
        }
        await outgoing.reduce(async (promise, outgoingChannel) => {
            await promise
            logChannel("->", outgoingChannel)
            const expired = channelHasExpired(outgoingChannel)
            if(incoming.length === 0 || expired) {
                if (channelIsClosing(outgoingChannel)) {
                    console.log(`--- channel already closing. skipped.`)
                } else {
                    expired ? closedChannels++ : expiredChannels++
                    await close_channel(outgoingChannel.channel_id)
                }
            }
        }, Promise.resolve())
        console.log(``)
    }, Promise.resolve())

    console.log(``)
    console.log(`Requested close of ${expiredChannels} channels (can be closed after they have expired, run this script again).`)
    console.log(`Closed ${closedChannels} channels which have expired.`)

}).then(() => {
    return api.disconnect()
}).catch(console.error)