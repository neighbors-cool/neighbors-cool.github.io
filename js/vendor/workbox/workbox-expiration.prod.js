(this.workbox = this.workbox || {}),
  (this.workbox.expiration = (function (t, e, s, i, a, n, h) {
    'use strict';
    try {
      self['workbox:expiration:5.1.2'] && _();
    } catch (t) {}
    const r = (t) => {
      const e = new URL(t, location.href);
      return (e.hash = ''), e.href;
    };
    class c {
      constructor(t) {
        (this.t = t),
          (this.s = new i.DBWrapper('workbox-expiration', 1, {
            onupgradeneeded: (t) => this.i(t),
          }));
      }
      i(t) {
        const e = t.target.result.createObjectStore('cache-entries', { keyPath: 'id' });
        e.createIndex('cacheName', 'cacheName', { unique: !1 }), e.createIndex('timestamp', 'timestamp', { unique: !1 }), a.deleteDatabase(this.t);
      }
      async setTimestamp(t, e) {
        const s = { url: (t = r(t)), timestamp: e, cacheName: this.t, id: this.h(t) };
        await this.s.put('cache-entries', s);
      }
      async getTimestamp(t) {
        return (await this.s.get('cache-entries', this.h(t))).timestamp;
      }
      async expireEntries(t, e) {
        const s = await this.s.transaction('cache-entries', 'readwrite', (s, i) => {
            const a = s.objectStore('cache-entries').index('timestamp').openCursor(null, 'prev'),
              n = [];
            let h = 0;
            a.onsuccess = () => {
              const s = a.result;
              if (s) {
                const i = s.value;
                i.cacheName === this.t && ((t && i.timestamp < t) || (e && h >= e) ? n.push(s.value) : h++), s.continue();
              } else i(n);
            };
          }),
          i = [];
        for (const t of s) await this.s.delete('cache-entries', t.id), i.push(t.url);
        return i;
      }
      h(t) {
        return this.t + '|' + r(t);
      }
    }
    class o {
      constructor(t, e = {}) {
        (this.o = !1), (this.u = !1), (this.l = e.maxEntries), (this.m = e.maxAgeSeconds), (this.t = t), (this.p = new c(t));
      }
      async expireEntries() {
        if (this.o) return void (this.u = !0);
        this.o = !0;
        const t = this.m ? Date.now() - 1e3 * this.m : 0,
          s = await this.p.expireEntries(t, this.l),
          i = await self.caches.open(this.t);
        for (const t of s) await i.delete(t);
        (this.o = !1), this.u && ((this.u = !1), e.dontWaitFor(this.expireEntries()));
      }
      async updateTimestamp(t) {
        await this.p.setTimestamp(t, Date.now());
      }
      async isURLExpired(t) {
        if (this.m) {
          return (await this.p.getTimestamp(t)) < Date.now() - 1e3 * this.m;
        }
        return !1;
      }
      async delete() {
        (this.u = !1), await this.p.expireEntries(1 / 0);
      }
    }
    return (
      (t.CacheExpiration = o),
      (t.ExpirationPlugin = class {
        constructor(t = {}) {
          (this.cachedResponseWillBeUsed = async ({ event: t, request: s, cacheName: i, cachedResponse: a }) => {
            if (!a) return null;
            const n = this.k(a),
              h = this.D(i);
            e.dontWaitFor(h.expireEntries());
            const r = h.updateTimestamp(s.url);
            if (t)
              try {
                t.waitUntil(r);
              } catch (t) {}
            return n ? a : null;
          }),
            (this.cacheDidUpdate = async ({ cacheName: t, request: e }) => {
              const s = this.D(t);
              await s.updateTimestamp(e.url), await s.expireEntries();
            }),
            (this.N = t),
            (this.m = t.maxAgeSeconds),
            (this.g = new Map()),
            t.purgeOnQuotaError && h.registerQuotaErrorCallback(() => this.deleteCacheAndMetadata());
        }
        D(t) {
          if (t === n.cacheNames.getRuntimeName()) throw new s.WorkboxError('expire-custom-caches-only');
          let e = this.g.get(t);
          return e || ((e = new o(t, this.N)), this.g.set(t, e)), e;
        }
        k(t) {
          if (!this.m) return !0;
          const e = this._(t);
          return null === e || e >= Date.now() - 1e3 * this.m;
        }
        _(t) {
          if (!t.headers.has('date')) return null;
          const e = t.headers.get('date'),
            s = new Date(e).getTime();
          return isNaN(s) ? null : s;
        }
        async deleteCacheAndMetadata() {
          for (const [t, e] of this.g) await self.caches.delete(t), await e.delete();
          this.g = new Map();
        }
      }),
      t
    );
  })({}, workbox.core._private, workbox.core._private, workbox.core._private, workbox.core._private, workbox.core._private, workbox.core));
//# sourceMappingURL=workbox-expiration.prod.js.map
