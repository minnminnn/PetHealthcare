import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentLocation, getLocationErrorMessage, LocationError } from "./geolocation";

test("browser location success and failure handling", async (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  t.after(() => {
    for (const [key, descriptor] of [
      ["window", previousWindow], ["navigator", previousNavigator],
    ] as const) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  function browser(secure: boolean, geolocation?: Pick<Geolocation, "getCurrentPosition">) {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { isSecureContext: secure } });
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: { geolocation } });
  }

  await t.test("rejects insecure pages before requesting location", async () => {
    browser(false, { getCurrentPosition() { assert.fail("must not request location"); } });
    await assert.rejects(getCurrentLocation(), { code: "insecure" });
  });
  await t.test("missing browser API produces a supported error", async () => {
    browser(true);
    await assert.rejects(getCurrentLocation(), { code: "unsupported" });
  });
  await t.test("returns real coordinates including zero without requiring GPS", async () => {
    browser(true, {
      getCurrentPosition(success, _failure, options) {
        assert.equal(options?.enableHighAccuracy, false);
        assert.ok(options?.timeout && options.timeout > 0);
        success({ coords: { latitude: 0, longitude: 106.7 } } as GeolocationPosition);
      },
    });
    assert.deepEqual(await getCurrentLocation(), { lat: 0, lng: 106.7 });
  });
  for (const [code, expected] of [[1, "denied"], [2, "unavailable"], [3, "timeout"]] as const) {
    await t.test(`browser error ${code} maps to ${expected} without retrying`, async () => {
      let calls = 0;
      browser(true, {
        getCurrentPosition(_success, failure) {
          calls++;
          failure?.({ code } as GeolocationPositionError);
        },
      });
      await assert.rejects(getCurrentLocation(), { code: expected });
      assert.equal(calls, 1);
    });
  }
  await t.test("synchronous browser failure rejects instead of leaving the caller waiting", async () => {
    browser(true, { getCurrentPosition() { throw new Error("unavailable"); } });
    await assert.rejects(getCurrentLocation(), /unavailable/);
  });
  await t.test("localized guidance explains the appropriate recovery action", () => {
    assert.match(getLocationErrorMessage(new LocationError("denied"), "vi"), /Quyền vị trí/);
    assert.match(getLocationErrorMessage(new LocationError("timeout"), "en"), /timed out/);
    assert.match(getLocationErrorMessage(new LocationError("insecure"), "vi"), /HTTPS/);
  });
});
