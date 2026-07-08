// FULL COURT · LIVE HEAD-TO-HEAD (handoff #5). Real-time opponent scoring over
// Supabase Realtime *Broadcast* — ephemeral websocket pub/sub, so it needs NO
// table, RLS, or migration. Both reps join channel `fullcourt:<CODE>` and
// broadcast their running line; each sees the other's points/doors/sales tick
// up live. Final box scores still persist through arenaService.fullcourtLogGame.
//
// Degrades to a silent no-op stub when there's no Supabase client (offline) or
// no code — the solo game is never blocked by the challenge layer.
//
// NOTE: requires Realtime to be enabled on the project (it is by default). No
// server code to deploy. See FULL-COURT-EXPANSION-STATUS.md for the live-test
// checklist (needs two devices/tabs on the same code).

import { supabase } from "./supabase.js";

const NOOP = { ok: false, publish() {}, leave() {} };

/**
 * joinLiveMatch — connect to a head-to-head channel.
 * @param {string} code   shared match code (case-insensitive)
 * @param {object} opts   { me:{id,name}, onOpponent(line), onPresence(others[]) }
 * @returns { ok, publish(line), leave() }
 */
export function joinLiveMatch(code, opts = {}) {
  const clean = String(code || "").trim().toUpperCase();
  const me = opts.me || {};
  if (!supabase || !clean) return NOOP;

  let channel;
  try {
    channel = supabase.channel(`fullcourt:${clean}`, {
      config: { broadcast: { self: false } },
    });
  } catch {
    return NOOP;
  }

  let lastLine = null;
  const roster = new Map(); // id -> line (most recent broadcast per opponent)

  channel
    .on("broadcast", { event: "line" }, ({ payload }) => {
      if (!payload || payload.id === me.id) return;
      roster.set(payload.id, payload);
      opts.onOpponent?.(payload);
      opts.onPresence?.(Array.from(roster.values()));
    })
    .on("broadcast", { event: "bye" }, ({ payload }) => {
      if (!payload || payload.id === me.id) return;
      roster.delete(payload.id);
      opts.onPresence?.(Array.from(roster.values()));
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // announce ourselves so an opponent already in the room re-sends state
        try {
          channel.send({ type: "broadcast", event: "line", payload: lastLine || { id: me.id, name: me.name, points: 0, doors: 0, sales: 0 } });
        } catch {
          /* best-effort */
        }
      }
    });

  return {
    ok: true,
    code: clean,
    publish(line) {
      lastLine = { ...line, id: me.id, name: me.name };
      try {
        channel.send({ type: "broadcast", event: "line", payload: lastLine });
      } catch {
        /* dropped frame is fine — the next one carries the latest total */
      }
    },
    leave() {
      try {
        channel.send({ type: "broadcast", event: "bye", payload: { id: me.id } });
      } catch {
        /* ignore */
      }
      try {
        supabase.removeChannel(channel);
      } catch {
        /* ignore */
      }
    },
  };
}

/** A short, unambiguous shareable match code (no O/0/I/1/L). */
export function makeMatchCode() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}
