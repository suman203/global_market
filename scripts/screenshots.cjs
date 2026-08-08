const { spawn } = require('child_process')
const { execSync } = require('child_process')
const fs = require('fs')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9222

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function login(as) {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: as, password: as }),
  })
  const sc = res.headers.get('set-cookie')
  return sc ? sc.split(';')[0].trim() : null
}

async function cdpPage(wsUrl) {
  let id = 0
  const pending = new Map()
  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id) }
  }
  const send = (method, params = {}) => new Promise((res) => {
    const mid = ++id
    pending.set(mid, res)
    ws.send(JSON.stringify({ id: mid, method, params }))
  })
  await send('Page.enable')
  return { send, ws }
}

async function capture(user, pages) {
  const cookie = await login(user)
  const chrome = spawn(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`,
    '--disable-extensions', '--no-first-run', '--disable-background-networking',
    '--user-data-dir=/tmp/gm-chrome-' + user, 'about:blank',
  ])
  let wsUrl = null
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/json/list`)
      const targets = await res.json()
      const page = targets.find((t) => t.type === 'page')
      if (page) wsUrl = page.webSocketDebuggerUrl
    } catch { /* not up yet */ }
    if (!wsUrl) await sleep(300)
  }
  if (!wsUrl) throw new Error('CDP not reachable')
  const page = await cdpPage(wsUrl)
  await page.send('Network.enable')
  await page.send('Network.setCookie', {
    name: 'JSESSIONID', value: cookie.split('=')[1], domain: 'localhost',
    path: '/', httpOnly: true, secure: false, sameSite: 'Lax',
  })
  for (const [name, path] of pages) {
    await page.send('Page.navigate', { url: `http://localhost:8080${path}` })
    await sleep(2600)
    const shot = await page.send('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(`docs/screenshots/${name}.png`, Buffer.from(shot.data, 'base64'))
    console.log('captured', name)
  }
  page.ws.close()
  chrome.kill()
}

;(async () => {
  await capture('admin', [
    ['profile', '/profile'],
    ['admin', '/admin'],
    ['admin-new-product', '/admin/product/new'],
  ])
  const userCookie = await login('user')
  if (!userCookie) throw new Error('user login failed')
  execSync('curl -s -X POST http://localhost:8080/api/cart/items/13 -b "' + userCookie + '" -o /dev/null')
  await capture('user', [['cart-full', '/cart']])
})().catch((e) => { console.error(e); process.exit(1) })
