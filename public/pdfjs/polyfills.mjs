// Dopuna za starije browsere (iOS < 17.4, Chrome < 119): pdf.js "legacy" build
// ne dodaje Promise.withResolvers sam.
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new this((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
