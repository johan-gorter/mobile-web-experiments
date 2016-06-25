import Horizon = require('@horizon/client');
import localforage = require('localforage');
import {createProjector} from 'maquette';

import {UserInfo} from './interfaces';
import {createApp} from './app/app';
import {createRouter} from './router';
import {createRouteRegistry} from './route-registry'

// Bootstrapping code

let horizon = Horizon();
let store = (localforage as any as LocalForage).createInstance({storeName: 'collaboration'});

let horizonReady = false;
let userInfo: UserInfo;

let startApp = () => {
  let projector = createProjector({});
  let router = createRouter(window, projector, createRouteRegistry(horizon, projector, userInfo));
  let app = createApp(horizon, store, userInfo, router, projector);
  document.body.innerHTML = '';
  projector.merge(document.body, app.renderMaquette);
}

store.getItem('user-info').then((info: UserInfo) => {
  userInfo = info;
  if (horizonReady) {
    startApp();
  }
});

horizon.onReady(() => {
  horizonReady = true;
  if (userInfo !== undefined) {
    startApp();
  }
});

horizon.connect();
