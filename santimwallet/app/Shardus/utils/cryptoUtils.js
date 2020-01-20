import crypto from 'shardus-crypto-web'
import moment from 'moment'
import axios from 'axios'
axios.defaults.timeout = 100000
const serverUrlAddress = 'http://40.122.26.94:9001/'
crypto.initialize('69fa4195670576c0160d660c3be36556ff8d504725be8a59b5a96509e0c994bc')

async function init() {
  await crypto.initialize('69fa4195670576c0160d660c3be36556ff8d504725be8a59b5a96509e0c994bc')
}

function getServerUrlAddress() {
  return serverUrlAddress
}
function createTx(tgt, amount, seq, keyPair, type = 'transfer') {
  const tx = {
    from: type === 'create' ? '0'.repeat(32) : keyPair.publicKey,
    to: type === 'create' ? keyPair.publicKey : tgt,
    amount: amount,
    type,
    seq,
    timestamp: Date.now()
  }
  crypto.signObj(tx, keyPair.secretKey, keyPair.publicKey)
  return tx
}

function buildTx({
  type,
  from = {},
  to,
  amount
}) {
  const actualTx = {
    from: from.id ? from.id : '0'.repeat(32),
    timestamp: Date.now(),
    type: type,
    to: to.id,
    amount: Number(amount),
    seq: from.sequence ? from.sequence : 0
  }
  if (from.keys) {
    crypto.signObj(actualTx, from.keys.secretKey, from.keys.publicKey)
    from.sequence = from.sequence + 1
  } else {
    crypto.signObj(actualTx, to.keys.secretKey, to.keys.publicKey)
  }
  return actualTx
}

async function generateKeyPair() {
  const keyPair = await crypto.generateKeypair()
  return keyPair
}

async function send(serverUrl, tx) {
  if (tx.amt <= 0) return false
  try {
    const {
      data
    } = await axios.post(`${serverUrl}inject`, tx)
    return data
  } catch (e) {
    throw e
  }
}

async function checkServer(serverUrl, accountId) {
  try {
    await getRequest(`${serverUrl}recent/${accountId}`)
    return true
  } catch (e) {
    return false
  }
}

async function getHistory(serverUrl, accountId) {
  try {
    let {
      data
    } = await axios.get(`${serverUrl}recent/${accountId}`)
    return data.txs
  } catch (e) {
    throw e
  }
}

async function getAccount(serverUrl, address) {
  try {
    const {
      data
    } = await axios.get(`${serverUrl}account/${address}`, {
      timeout: 100000
    })
    let account = data.account
    if (account === null) {
      account = {
        address,
        balance: 0,
        sequence: 0,
        data:{balance:0}
      }
    }
    return account
  } catch (e) {
    throw e
  }
}

function getRequest(url, options, timeout = 2000) {
  return new Promise((resolve, reject) => {
    fetch(url, options).then((res) => res.json())
      .then((json) => {
        resolve(json)
      }).catch((err) => reject(err))

    if (timeout) {
      setTimeout(() => {
        // reject('Timeout')
      }, timeout)
    }
  })
}

function getTimeString(timestamp) {
  const time = moment(timestamp)
  const now = moment(new Date())
  let timeString
  if (!time.isSame(now, 'year')) {
    timeString = time.format('MM/DD/YYYY')
  } else if (!time.isSame(now, 'day')) {
    timeString = time.format('MMM DD')
  } else {
    timeString = 'Today'
  }
  timeString += `\n${time.format('hh:mm a')}`
  return timeString
}

function normaliseText(text) {
  let normalised
  normalised = text.toLowerCase()
  normalised = normalised.replace(/\s/g, '')
  return normalised
}
export default {
  init,
  createTx,
  send,
  generateKeyPair,
  getHistory,
  getAccount,
  getTimeString,
  checkServer,
  buildTx,
  normaliseText,
  getServerUrlAddress
}
