"use client";

import { useEffect, useState } from "react";

// Muestra el texto letra a letra, como si el personaje lo estuviera diciendo.
// - delay: milisegundos de espera antes de empezar
// - speed: milisegundos entre cada letra
// Si la usuaria tiene activado "reducir movimiento", el texto sale entero.
export function Typewriter({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduce ? text.length : 1;
    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(
      () => {
        interval = setInterval(() => {
          setCount((c) => {
            if (c >= text.length) {
              clearInterval(interval);
              return c;
            }
            return c + step;
          });
        }, speed);
      },
      reduce ? 0 : delay,
    );

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay, speed]);

  return (
    <>
      {/* Lo que se ve: las letras escritas y el resto invisible, para que el bocadillo no cambie de tamaño */}
      <span aria-hidden="true">
        {text.slice(0, count)}
        <span className="invisible">{text.slice(count)}</span>
      </span>
      {/* Lo que leen los lectores de pantalla: el texto entero */}
      <span className="sr-only">{text}</span>
    </>
  );
}