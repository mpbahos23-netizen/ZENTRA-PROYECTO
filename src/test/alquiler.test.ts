import { describe, it, expect, vi } from "vitest";

// Solo se prueban las cuentas puras: el cliente de Supabase no hace falta.
vi.mock("@/lib/supabase", () => ({ supabase: {} }));

import {
  distanciaM, recorridoKm, debeEnviar, rumboEntre, tiempoRestante, estaEnVivo, estadoAlquiler, interpolar,
} from "@/lib/alquiler";

const t = (s: number) => new Date(Date.UTC(2026, 9, 26, 12, 0, s)).toISOString();

describe("distancias", () => {
  it("mide unos 111 km por grado de latitud", () => {
    expect(distanciaM({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeGreaterThan(111_000);
    expect(distanciaM({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeLessThan(111_400);
  });

  it("suma el recorrido por tramos", () => {
    const km = recorridoKm([{ lat: 0, lng: 0 }, { lat: 0.01, lng: 0 }, { lat: 0.02, lng: 0 }]);
    expect(km).toBeCloseTo(2.22, 1);
  });
});

describe("debeEnviar", () => {
  const base = { lat: -14.07, lng: -75.72, at: t(0) };

  it("envía el primer punto", () => {
    expect(debeEnviar(null, base)).toBe(true);
  });

  it("no envía si no pasó el mínimo de tiempo", () => {
    expect(debeEnviar(base, { lat: -14.08, lng: -75.72, at: t(2) })).toBe(false);
  });

  it("envía si se movió y pasó el mínimo", () => {
    expect(debeEnviar(base, { lat: -14.0705, lng: -75.72, at: t(6) })).toBe(true);
  });

  it("no envía si está quieto, salvo que pase el máximo", () => {
    expect(debeEnviar(base, { ...base, at: t(10) })).toBe(false);
    expect(debeEnviar(base, { ...base, at: t(31) })).toBe(true);
  });
});

describe("rumboEntre", () => {
  it("da 0 hacia el norte y 90 hacia el este", () => {
    expect(rumboEntre({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(0, 0);
    expect(rumboEntre({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(90, 0);
    expect(rumboEntre({ lat: 0, lng: 0 }, { lat: 0, lng: -1 })).toBeCloseTo(270, 0);
  });
});

describe("tiempo del alquiler", () => {
  const alquiler = { inicio: t(0), fin: new Date(Date.UTC(2026, 9, 27, 12, 0, 0)).toISOString(), cancelado: false };

  it("cuenta las horas que faltan", () => {
    const r = tiempoRestante(alquiler.fin, new Date(Date.UTC(2026, 9, 26, 14, 30, 0)));
    expect(r).toEqual({ horas: 21, minutos: 30, vencido: false });
  });

  it("marca vencido al pasar el fin", () => {
    expect(tiempoRestante(alquiler.fin, new Date(Date.UTC(2026, 9, 28))).vencido).toBe(true);
  });

  it("sabe si el alquiler está activo, por empezar, vencido o cancelado", () => {
    expect(estadoAlquiler(alquiler, new Date(Date.UTC(2026, 9, 26, 13)))).toBe("activo");
    expect(estadoAlquiler(alquiler, new Date(Date.UTC(2026, 9, 26, 11)))).toBe("pendiente");
    expect(estadoAlquiler(alquiler, new Date(Date.UTC(2026, 9, 28)))).toBe("vencido");
    expect(estadoAlquiler({ ...alquiler, cancelado: true }, new Date(Date.UTC(2026, 9, 26, 13)))).toBe("cancelado");
  });
});

describe("estaEnVivo", () => {
  it("es en vivo si la última posición tiene menos de 90 s", () => {
    const ahora = new Date(t(100));
    expect(estaEnVivo(t(20), ahora)).toBe(true);
    expect(estaEnVivo(t(5), ahora)).toBe(false);
  });
});

describe("interpolar", () => {
  it("avanza en línea recta y respeta los extremos", () => {
    const a = { lat: 0, lng: 0 };
    const b = { lat: 2, lng: 4 };
    expect(interpolar(a, b, 0)).toEqual(a);
    expect(interpolar(a, b, 0.5)).toEqual({ lat: 1, lng: 2 });
    expect(interpolar(a, b, 2)).toEqual(b);
  });
});
