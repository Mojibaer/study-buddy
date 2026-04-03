import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

declare const self: Window & typeof globalThis & {
  __SW_MANIFEST: string[]
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
