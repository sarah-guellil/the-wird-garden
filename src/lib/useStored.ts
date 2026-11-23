"use client";

import { useSyncExternalStore } from "react";

// Lee un valor guardado en el navegador (localStorage) y se actualiza solo cuando cambia.
// En el servidor no hay localStorage, así que allí devuelve null.

const EVENT = "twg-storage";

function subscribe(callback: () => void) {
  // "storage" avisa de cambios hechos en otra pestaña; EVENT, de los hechos en esta
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Devuelve el texto guardado (o null). Para objetos, usa JSON.parse sobre el resultado.
export function useStored(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
}

// Guarda un objeto y avisa a los componentes que lo están leyendo
export function saveStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Si el navegador no deja guardar (modo privado), seguimos igual
  }
  window.dispatchEvent(new Event(EVENT));
}