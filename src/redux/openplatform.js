let openplatformUser;
function sleep(t) {
  return new Promise(resolve => setTimeout(resolve, t * 1000));
}
export async function getUser() {
  if (!openplatformUser) {
    openplatformUser = (async () => {
      await ensureDbcOpenPlatform();
      let o;
      for (let i = 1; i < 10; ++i) {
        const o = await Promise.race([
          await window.dbcOpenPlatform.status({fields: ['storage']}),
          sleep(i)
        ]);
        if (o && o.storage && o.storage.user) {
          return o.storage.user;
        }
      }
      throw new Error(o ? o : 'Error getting storage user');
    })();
  }
  return await openplatformUser;
}

const storageFn = async o => {
  await ensureDbcOpenPlatform();
  return await window.dbcOpenPlatform.storage(o);
};

let typeType;
export const storage = {
  get: o => storageFn({get: o}),
  delete: o => storageFn({delete: o}),
  put: o => storageFn({put: o}),
  count: o => storageFn({count: o}),
  find: o => storageFn({find: o}),
  scan: o => storageFn({scan: o}),
  typeType: () => {
    if (!typeType) {
      typeType = Promise.resolve(
        (async () =>
          (await storage.find({_owner: 'openplatform', name: 'type'}))[0])()
      );
    }
    return typeType;
  }
};
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const elem = document.createElement('script');
    elem.src = url;
    elem.onload = resolve;
    elem.onerror = reject;
    document.head.appendChild(elem);
  });
}
async function ensureDbcOpenPlatform() {
  if (!window.dbcOpenPlatform) {
    await loadScript('https://openplatform.dbc.dk/v3/dbc_openplatform.min.js');
  }
}
export async function connect(token) {
  await ensureDbcOpenPlatform();
  const result = await window.dbcOpenPlatform.connect(token);
  return result;
}

export default {connect, storage, getUser};
