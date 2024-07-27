import * as functions from 'firebase-functions'
import next from 'next'

console.log(next);  //追加

const nextjsServer = next({
  dev: false,
  conf: {
    distDir: '.next',
    future: {},
    experimental: {},
  },
})
const nextjsHandle = nextjsServer.getRequestHandler()

// @see https://firebase.google.com/docs/hosting/full-config?hl=ja#rewrite-functions
const fn = functions.region('us-central1')

export const nextjsFunc = fn.https.onRequest(async (req, res) => {
  await nextjsServer.prepare()
  return nextjsHandle(req, res)
})