#!/usr/bin/env node
// A small Chrome DevTools Protocol driver with no dependencies (Node 22 or later).
// It drives any Chromium page that has a debugging port: a website in Chrome or
// Edge, or an Electron app started with --remote-debugging-port. Copy it into a
// project's verify kit and wrap it with that project's own start and stop.

import { writeFileSync } from 'node:fs'
import { createServer } from 'node:net'

const USAGE = `Usage: node cdp.mjs <command> [arguments] [--port <n>] [--target <text>]

  targets                     List the open pages as JSON (id, title, url).
  goto <url>                  Navigate and wait for the page to load.
  eval <expression>           Evaluate in the page and print the result as JSON (promises are awaited).
  wait <selector>             Wait until the selector matches a visible element (--timeout ms, default 10000).
  click <selector>            Click the element's centre with real mouse events.
  type <text>                 Type text into the focused element.
  key <key>                   Press a key or chord: Enter, Escape, Tab, ArrowDown, Ctrl+K, Shift+Tab, Ctrl+, or F12.
  scroll <selector> <pixels>  Turn the mouse wheel over the element (positive scrolls down).
  shot <file.png>             Screenshot the page; --selector <css> for one element, --width/--height to size the viewport.
  console                     Print console messages and errors for a while (--for ms, default 2000); exits 1 on any error.
  close                       Close the browser or app.
  free-port                   Print a free local port to start a browser or app on.

--port is the DevTools port (or set CDP_PORT); there is no default, so you never drive the wrong app.
--target picks the page whose URL or title contains the text; without it, the first page.`

const FLAGS = new Set(['port', 'target', 'timeout', 'selector', 'width', 'height', 'for'])

function parse(argv) {
  const options = { positional: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') return null
    if (arg.startsWith('--')) {
      const name = arg.slice(2)
      if (!FLAGS.has(name)) throw new Error(`Unknown option ${arg}.`)
      if (argv[i + 1] === undefined) throw new Error(`${arg} needs a value.`)
      options[name] = argv[++i]
    } else {
      options.positional.push(arg)
    }
  }
  return options
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function withTimeout(promise, ms, what) {
  let timer
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Timed out after ${ms} ms: ${what}.`)), ms) })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

class Session {
  static async open(url) {
    const ws = new WebSocket(url)
    await new Promise((resolve, reject) => {
      ws.onopen = resolve
      ws.onerror = () => reject(new Error(`Could not connect to ${url}.`))
    })
    return new Session(ws)
  }

  constructor(ws) {
    this.ws = ws
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Map()
    ws.onmessage = ({ data }) => {
      const message = JSON.parse(String(data))
      if (message.id) {
        const call = this.pending.get(message.id)
        if (!call) return
        this.pending.delete(message.id)
        if (message.error) call.reject(new Error(`${call.method}: ${message.error.message}`))
        else call.resolve(message.result)
      } else {
        for (const listener of this.listeners.get(message.method) ?? []) listener(message.params)
      }
    }
    ws.onclose = () => {
      for (const call of this.pending.values()) call.reject(new Error('The DevTools connection closed.'))
      this.pending.clear()
    }
  }

  send(method, params = {}) {
    const id = this.nextId++
    const reply = new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
    return withTimeout(reply, 30000, method)
  }

  on(method, listener) {
    if (!this.listeners.has(method)) this.listeners.set(method, [])
    this.listeners.get(method).push(listener)
  }

  close() {
    this.ws.close()
  }
}

async function devtools(port, path) {
  let response
  try {
    response = await fetch(`http://127.0.0.1:${port}${path}`)
  } catch {
    throw new Error(`Nothing answers on DevTools port ${port}. Start the browser or app with --remote-debugging-port=${port}.`)
  }
  if (!response.ok) throw new Error(`DevTools port ${port} answered ${response.status} for ${path}.`)
  return response.json()
}

async function pages(port) {
  return (await devtools(port, '/json/list')).filter((target) => target.type === 'page')
}

async function openPage(port, match) {
  const all = await pages(port)
  const page = match ? all.find((target) => target.url.includes(match) || target.title.includes(match)) : all[0]
  if (!page) throw new Error(match ? `No page's URL or title contains "${match}".` : 'No page is open.')
  return Session.open(page.webSocketDebuggerUrl)
}

async function evaluate(session, expression) {
  const { result, exceptionDetails } = await session.send('Runtime.evaluate', {
    expression, awaitPromise: true, returnByValue: true, userGesture: true,
  })
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  return result.value
}

// The element's box in viewport and document coordinates. `reveal` scrolls it
// to the middle first, as a user would before clicking or looking at it.
async function box(session, selector, reveal) {
  const found = await evaluate(session, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)})
    if (!element) return null
    if (${reveal}) element.scrollIntoView({ block: 'center', inline: 'center' })
    const r = element.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, left: r.x + scrollX, top: r.y + scrollY, width: r.width, height: r.height }
  })()`)
  if (!found) throw new Error(`No element matches ${selector}.`)
  if (!found.width || !found.height) throw new Error(`${selector} has no size: it is hidden or empty.`)
  return found
}

const NAMED_KEYS = {
  Enter: [13, 'Enter', '\r'], Escape: [27, 'Escape'], Tab: [9, 'Tab'], Backspace: [8, 'Backspace'],
  Delete: [46, 'Delete'], Space: [32, 'Space', ' '], ArrowUp: [38, 'ArrowUp'], ArrowDown: [40, 'ArrowDown'],
  ArrowLeft: [37, 'ArrowLeft'], ArrowRight: [39, 'ArrowRight'], Home: [36, 'Home'], End: [35, 'End'],
  PageUp: [33, 'PageUp'], PageDown: [34, 'PageDown'],
}
// Punctuation as a US keyboard has it: the character, its shifted character, the key's code and its virtual key.
const PUNCTUATION = [
  ['`', '~', 'Backquote', 192], ['-', '_', 'Minus', 189], ['=', '+', 'Equal', 187], ['[', '{', 'BracketLeft', 219],
  [']', '}', 'BracketRight', 221], ['\\', '|', 'Backslash', 220], [';', ':', 'Semicolon', 186], ["'", '"', 'Quote', 222],
  [',', '<', 'Comma', 188], ['.', '>', 'Period', 190], ['/', '?', 'Slash', 191],
]
const MODIFIERS = { Alt: 1, Ctrl: 2, Control: 2, Meta: 4, Cmd: 4, Shift: 8 }

function parseKey(chord) {
  // A chord ending in "++" presses the + key itself, as does "+" alone.
  const plus = chord === '+' || chord.endsWith('++')
  const parts = (plus ? chord.slice(0, -1) : chord).split('+')
  const name = plus ? (parts.pop(), '+') : parts.pop()
  if (!name) throw new Error(`${chord} has no key after its modifiers.`)
  let modifiers = 0
  for (const part of parts) {
    if (!MODIFIERS[part]) throw new Error(`Unknown modifier ${part}.`)
    modifiers |= MODIFIERS[part]
  }
  const typesText = (modifiers & ~MODIFIERS.Shift) === 0
  if (NAMED_KEYS[name]) {
    const [vk, code, text] = NAMED_KEYS[name]
    return { key: name === 'Space' ? ' ' : name, code, vk, text: typesText ? text : undefined, modifiers }
  }
  if (/^[a-z0-9]$/i.test(name)) {
    const upper = name.toUpperCase()
    const key = modifiers & MODIFIERS.Shift ? upper : name.toLowerCase()
    return { key, code: /\d/.test(name) ? `Digit${name}` : `Key${upper}`, vk: upper.charCodeAt(0), text: typesText ? key : undefined, modifiers }
  }
  const mark = PUNCTUATION.find(([plain, shifted]) => name === plain || name === shifted)
  if (mark) {
    const [plain, shifted, code, vk] = mark
    if (name === shifted) modifiers |= MODIFIERS.Shift
    const key = modifiers & MODIFIERS.Shift ? shifted : plain
    return { key, code, vk, text: typesText ? key : undefined, modifiers }
  }
  const fn = /^F([1-9]|1[0-2])$/.exec(name)
  if (fn) return { key: name, code: name, vk: 111 + Number(fn[1]), modifiers }
  throw new Error(`Unknown key ${name}. Use a letter, a digit, punctuation (${PUNCTUATION.map(([plain]) => plain).join(' ')}), F1 to F12 or one of: ${Object.keys(NAMED_KEYS).join(', ')}.`)
}

const COMMANDS = {
  async targets(options) {
    const all = await pages(options.port)
    console.log(JSON.stringify(all.map(({ id, title, url }) => ({ id, title, url })), null, 2))
  },

  async goto(options, session, [url]) {
    if (!url) throw new Error('goto needs a URL.')
    await session.send('Page.enable')
    const loaded = new Promise((resolve) => session.on('Page.loadEventFired', resolve))
    const { errorText } = await session.send('Page.navigate', { url })
    if (errorText) throw new Error(`Could not open ${url}: ${errorText}.`)
    await withTimeout(loaded, Number(options.timeout ?? 30000), `loading ${url}`)
    console.log(url)
  },

  async eval(options, session, [expression]) {
    if (!expression) throw new Error('eval needs an expression.')
    const value = await evaluate(session, expression)
    console.log(value === undefined ? 'undefined' : JSON.stringify(value))
  },

  async wait(options, session, [selector]) {
    if (!selector) throw new Error('wait needs a selector.')
    const timeout = Number(options.timeout ?? 10000)
    const visible = `(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })()`
    for (const end = Date.now() + timeout; Date.now() < end; await sleep(100)) {
      if (await evaluate(session, visible)) return console.log(selector)
    }
    throw new Error(`${selector} did not appear within ${timeout} ms.`)
  },

  async click(options, session, [selector]) {
    if (!selector) throw new Error('click needs a selector.')
    const { x, y } = await box(session, selector, true)
    await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
    await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
    await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
    console.log(selector)
  },

  async type(options, session, [text]) {
    if (text === undefined) throw new Error('type needs some text.')
    await session.send('Input.insertText', { text })
    console.log(JSON.stringify(text))
  },

  async key(options, session, [chord]) {
    if (!chord) throw new Error('key needs a key, such as Enter or Ctrl+K.')
    const { key, code, vk, text, modifiers } = parseKey(chord)
    const base = { key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers }
    await session.send('Input.dispatchKeyEvent', { ...base, type: text ? 'keyDown' : 'rawKeyDown', text, unmodifiedText: text })
    await session.send('Input.dispatchKeyEvent', { ...base, type: 'keyUp' })
    console.log(chord)
  },

  async scroll(options, session, [selector, pixels]) {
    if (!selector || pixels === undefined || Number.isNaN(Number(pixels))) throw new Error('scroll needs a selector and a number of pixels.')
    const { x, y } = await box(session, selector, false)
    await session.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: Number(pixels) })
    await sleep(150)
    console.log(`${selector} ${pixels}`)
  },

  async shot(options, session, [file]) {
    if (!file) throw new Error('shot needs a file name.')
    if (options.width || options.height) {
      const size = await evaluate(session, '({ width: innerWidth, height: innerHeight })')
      await session.send('Emulation.setDeviceMetricsOverride', {
        width: Number(options.width ?? size.width), height: Number(options.height ?? size.height), deviceScaleFactor: 0, mobile: false,
      })
      await sleep(150)
    }
    const params = { format: 'png' }
    if (options.selector) {
      const { left, top, width, height } = await box(session, options.selector, true)
      params.clip = { x: left, y: top, width, height, scale: 1 }
    }
    const { data } = await session.send('Page.captureScreenshot', params)
    writeFileSync(file, Buffer.from(data, 'base64'))
    console.log(file)
  },

  async console(options, session) {
    let failed = false
    session.on('Runtime.consoleAPICalled', ({ type, args }) => {
      if (type === 'error' || type === 'assert') failed = true
      console.log(`[${type}] ${args.map((arg) => arg.value ?? arg.description ?? arg.type).join(' ')}`)
    })
    session.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
      failed = true
      console.log(`[exception] ${exceptionDetails.exception?.description ?? exceptionDetails.text}`)
    })
    session.on('Log.entryAdded', ({ entry }) => {
      if (entry.level === 'error') failed = true
      console.log(`[${entry.source} ${entry.level}] ${entry.text}`)
    })
    await session.send('Runtime.enable')
    await session.send('Log.enable')
    await sleep(Number(options.for ?? 2000))
    if (failed) process.exitCode = 1
  },

  async close(options) {
    const { webSocketDebuggerUrl } = await devtools(options.port, '/json/version')
    const browser = await Session.open(webSocketDebuggerUrl)
    await browser.send('Browser.close').catch(() => {})
    browser.close()
    console.log('closed')
  },

  async 'free-port'() {
    const server = createServer()
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    await new Promise((resolve) => server.close(resolve))
    console.log(port)
  },
}

const NEEDS_NO_PAGE = new Set(['targets', 'close', 'free-port'])

async function main() {
  const options = parse(process.argv.slice(2))
  const [command, ...rest] = options?.positional ?? []
  if (!options || !command) return console.log(USAGE)
  const run = COMMANDS[command]
  if (!run) throw new Error(`Unknown command ${command}.\n\n${USAGE}`)
  if (command !== 'free-port') {
    options.port ??= process.env.CDP_PORT
    if (!options.port) throw new Error('Give the DevTools port with --port, or set CDP_PORT.')
  }
  if (NEEDS_NO_PAGE.has(command)) return run(options)
  const session = await openPage(options.port, options.target)
  try {
    await run(options, session, rest)
  } finally {
    session.close()
  }
}

main().then(
  () => process.exit(process.exitCode ?? 0),
  (error) => {
    console.error(error.message)
    process.exit(1)
  },
)
