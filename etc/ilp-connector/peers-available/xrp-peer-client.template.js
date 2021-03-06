module.exports = {
    relation: 'peer',
    plugin: 'ilp-plugin-xrp-paychan',
    assetCode: 'XRP',
    assetScale: 9,
    balance: {
      maximum: '1000000000',
      settleThreshold: '-1000000',
      settleTo: '0'
    },
    options: {
      server: 'btp+wss://:<SECRET PROVIDED BY PEER>@<PEER ADDRESS AND PORT>',
      rippledServer: 'wss://s2.ripple.com',
      assetScale: 9,
      maxFeePercent: '0.01',
      claimInterval: 300000,
      address: process.env.XRP_ADDRESS,
      secret: process.env.XRP_SECRET
    }
  }
