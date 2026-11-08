import { TurboModuleRegistry } from 'react-native';

/**
 * Early runtime bootstrap to guarantee globalThis.expo and EventEmitter
 * are fully instantiated before any Expo / React Native modules are evaluated.
 */
function bootstrapExpoRuntime() {
  if (typeof globalThis === 'undefined') return;

  // 1. Try TurboModuleRegistry installModules if not yet initialized
  if (!globalThis.expo) {
    try {
      const ExpoModulesCore = TurboModuleRegistry.get('ExpoModulesCore') as { installModules?: () => void } | null;
      ExpoModulesCore?.installModules?.();
    } catch {
      // Ignored: early bundle initialization may precede TurboModule resolution
    }
  }

  // 2. Guarantee EventEmitter and core classes are present
  if (!globalThis.expo || !globalThis.expo.EventEmitter) {
    class FallbackEventEmitter {
      private listeners = new Map<string, Set<Function>>();

      addListener(eventName: string, listener: Function) {
        if (!this.listeners.has(eventName)) {
          this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)!.add(listener);
        return {
          remove: () => {
            this.removeListener(eventName, listener);
          },
        };
      }

      removeListener(eventName: string, listener: Function) {
        this.listeners.get(eventName)?.delete(listener);
      }

      removeAllListeners(eventName?: string) {
        if (eventName) {
          this.listeners.get(eventName)?.clear();
        } else {
          this.listeners.clear();
        }
      }

      emit(eventName: string, ...args: any[]) {
        const set = this.listeners.get(eventName);
        if (set) {
          set.forEach((fn) => {
            try {
              fn(...args);
            } catch (err) {
              console.error(err);
            }
          });
        }
      }

      listenerCount(eventName: string) {
        return this.listeners.get(eventName)?.size ?? 0;
      }

      startObserving() {}
      stopObserving() {}
    }

    class FallbackNativeModule extends FallbackEventEmitter {
      ViewPrototypes?: any;
      __expo_module_name__?: string;
    }

    class FallbackSharedObject extends FallbackEventEmitter {
      release() {}
    }

    class FallbackSharedRef extends FallbackSharedObject {
      nativeRefType = 'unknown';
    }

    globalThis.expo = {
      ...globalThis.expo,
      EventEmitter: globalThis.expo?.EventEmitter ?? FallbackEventEmitter,
      NativeModule: globalThis.expo?.NativeModule ?? FallbackNativeModule,
      SharedObject: globalThis.expo?.SharedObject ?? FallbackSharedObject,
      SharedRef: globalThis.expo?.SharedRef ?? FallbackSharedRef,
      modules: globalThis.expo?.modules ?? {},
      reloadAppAsync: globalThis.expo?.reloadAppAsync ?? (async () => {}),
      getViewConfig: globalThis.expo?.getViewConfig ?? (() => ({})),
      uuidv4: globalThis.expo?.uuidv4 ?? (() => '00000000-0000-4000-8000-000000000000'),
      uuidv5: globalThis.expo?.uuidv5 ?? (() => '00000000-0000-5000-8000-000000000000'),
    } as any;
  }
}

bootstrapExpoRuntime();
