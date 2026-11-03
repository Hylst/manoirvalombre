import { useCallback, useEffect, useRef, useState } from "react";
import Scene, { type Flags, type Hover } from "./components/Scene";
import Lantern from "./components/Lantern";
import { cn } from "./utils/cn";

type ItemId = "note" | "matches" | "candle" | "key";
type Phase = "intro" | "play" | "won" | "lost";

const WAX_MAX = 270; // secondes de bougie
const CANDLE_BONUS = 110;
const HINT_COST = 15;
const SECRET_CODE = [4, 2, 3]; // ce qui vole · ce qui sourit · ce qui rampe

const ITEMS: Record<ItemId, { name: string; icon: string; desc: string }> = {
  note: { name: "Note froissée", icon: "📜", desc: "Un message laissé par le maître des lieux." },
  matches: { name: "Allumettes", icon: "🔥", desc: "Une petite boîte d'allumettes. Sélectionnez-la puis cliquez sur un objet." },
  candle: { name: "Bougie de rechange", icon: "🕯️", desc: "Cliquez pour l'ajouter à votre lanterne." },
  key: { name: "Clé de la sortie", icon: "🗝️", desc: "Lourde, froide, et couverte de cire. Sélectionnez-la puis cliquez sur la porte." },
};

const INITIAL_FLAGS: Flags = {
  portrait: false,
  chest: false,
  drawer: false,
  fire: false,
  key: false,
  door: false,
};

const FLAVOR: Record<string, string[]> = {
  window: [
    "Dehors, une lune blafarde éclaire des branches tordues. Les barreaux sont soudés : aucune issue par là.",
    "Une silhouette semble se dessiner entre les arbres… ce n'est sûrement que le vent.",
    "La vitre est gelée, côté intérieur. Étrange.",
  ],
  clock: [
    "L'horloge est arrêtée à minuit moins une. Le balancier, lui, continue de se balancer. Personne ne le pousse.",
    "Tic… tac… Vous jureriez qu'elle a murmuré votre prénom.",
    "Rien dans le caisson, que de la poussière et un vieux ressort.",
  ],
  web: [
    "Une toile immense, épaisse comme de la dentelle. Elle est là depuis des décennies.",
    "Vos doigts se collent aux fils. Vous les essuyez en frissonnant.",
  ],
  rug: [
    "Sous le tapis : de la poussière, et un cafard qui vous toise avant de s'enfuir.",
    "Aucune trappe, aucun passage secret. Juste des planches qui craquent.",
  ],
  bats: [
    "Elles s'agitent dans leur sommeil léger. Mieux vaut ne pas les réveiller.",
    "Un battement d'ailes, un petit cri aigu… elles vous observent de leurs yeux rouges.",
    "Elles bougent sans cesse. Impossible de les toucher.",
  ],
  spider: [
    "Une araignée noire, grosse comme une pièce. Elle recule lentement. Vous aussi.",
    "Elle porte un sablier rouge sur le ventre. Vous gardez vos distances.",
    "Elle vous fixe de ses huit yeux. Elle sait quelque chose.",
  ],
  pumpkins: [
    "Deux citrouilles sculptées au sourire cruel. Leurs bougies sont éteintes depuis longtemps.",
    "Leurs sourires dentelés semblent s'élargir quand vous détournez le regard.",
    "Creuses, froides, vides. Rien à l'intérieur… mais elles ne cessent de sourire.",
  ],
  commodeEmpty: [
    "Les autres tiroirs sont vides, sauf un peu de dentelle moisie et des dents de lait.",
    "Un chandelier éteint et une bougie rongée : inutilisables sans flamme.",
  ],
  chestEmpty: ["Le coffre est ouvert et vide à présent. Seule une odeur de soufre s'en échappe."],
  portraitDone: [
    "Les yeux du portrait vous suivent. Vous avez pris ce qu'il cachait, il n'a pas l'air content.",
    "Le portrait est de travers. Son regard rouge n'a pas quitté votre nuque.",
  ],
  fireDone: ["Les flammes dansent joyeusement. Au moins, il ne fait plus tout à fait noir."],
  keyDone: ["La boîte est vide. Il ne reste que la cire fondue, comme du sang séché."],
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [wax, setWax] = useState(WAX_MAX);
  const [tick, setTick] = useState(0);
  const [flags, setFlags] = useState<Flags>(INITIAL_FLAGS);
  const [inv, setInv] = useState<ItemId[]>([]);
  const [selected, setSelected] = useState<ItemId | null>(null);
  const [msg, setMsg] = useState({ text: "", k: 0 });
  const [mouse, setMouse] = useState({ x: 400, y: 260 });
  const [hover, setHover] = useState<Hover | null>(null);
  const [modal, setModal] = useState<null | "code" | "note">(null);
  const [digits, setDigits] = useState([0, 0, 0]);
  const [shake, setShake] = useState(0);
  const [hints, setHints] = useState(0);
  const [scare, setScare] = useState(0);
  const counters = useRef<Record<string, number>>({});
  const thresholds = useRef({ half: false, quarter: false, tenth: false });

  const say = useCallback((text: string) => setMsg((m) => ({ text, k: m.k + 1 })), []);

  const flavor = useCallback(
    (key: string) => {
      const list = FLAVOR[key] ?? ["Rien d'intéressant."];
      const i = counters.current[key] ?? 0;
      counters.current[key] = i + 1;
      say(list[i % list.length]);
    },
    [say]
  );

  const start = () => {
    setPhase("play");
    say("Vous vous réveillez dans un manoir glacé. La porte s'est refermée dans votre dos. Seule votre lanterne de courge éclaire l'obscurité… et sa bougie fond déjà. Déplacez la lumière, fouillez la pièce.");
  };

  const restart = () => {
    setWax(WAX_MAX);
    setFlags(INITIAL_FLAGS);
    setInv([]);
    setSelected(null);
    setModal(null);
    setDigits([0, 0, 0]);
    setHints(0);
    counters.current = {};
    thresholds.current = { half: false, quarter: false, tenth: false };
    setPhase("play");
    setMsg({ text: "Vous rouvrez les yeux. Le manoir vous a ramené au même endroit. La bougie est neuve… cette fois, soyez plus rapide.", k: Date.now() });
  };

  // Horloge du jeu : la bougie fond, la flamme vacille
  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setWax((w) => Math.max(0, w - (flags.fire ? 0 : 0.1)));
    }, 100);
    return () => clearInterval(id);
  }, [phase, flags.fire]);

  // Événements liés à la bougie
  useEffect(() => {
    if (phase !== "play") return;
    const f = wax / WAX_MAX;
    const th = thresholds.current;
    if (wax <= 0) {
      setPhase("lost");
      setModal(null);
      return;
    }
    if (flags.fire) return;
    if (f < 0.5 && !th.half) {
      th.half = true;
      say("La cire a déjà fondu de moitié. Un souffle glacé effleure votre nuque : « …dépêche-toi… »");
    } else if (f < 0.25 && !th.quarter) {
      th.quarter = true;
      say("La flamme faiblit. Les ombres s'approchent. Quelque chose rampe derrière vous.");
    } else if (f < 0.1 && !th.tenth) {
      th.tenth = true;
      say("Il ne reste qu'un lumignon ! La flamme crachote…");
    }
  }, [wax, phase, flags.fire, say]);

  // Petites frayeurs aléatoires
  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => {
      if (Math.random() < 0.45) {
        setScare(8);
      }
    }, 14000);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (scare <= 0) return;
    const id = setTimeout(() => setScare((s) => s - 1), 70);
    return () => clearTimeout(id);
  }, [scare]);

  const fraction = wax / WAX_MAX;
  const jitter = fraction < 0.2 ? Math.sin(tick * 7.3) * 0.07 + Math.sin(tick * 13.1) * 0.05 : 0;
  const flick =
    1 + Math.sin(tick * 0.9) * 0.035 + Math.sin(tick * 2.3 + 1) * 0.025 + jitter - (scare > 0 ? (scare % 2 ? 0.35 : 0.1) : 0);
  const radius = wax > 0 ? 70 + 175 * Math.sqrt(fraction) : 0;

  const addItem = (id: ItemId) => setInv((i) => (i.includes(id) ? i : [...i, id]));
  const removeItem = (id: ItemId) => {
    setInv((i) => i.filter((x) => x !== id));
    setSelected((s) => (s === id ? null : s));
  };

  const pick = (id: string) => {
    if (phase !== "play" || modal) return;

    // Utilisation d'un objet sélectionné
    if (selected) {
      const ok = (selected === "matches" && id === "fireplace") || (selected === "key" && id === "door");
      if (!ok) {
        say(`Utiliser « ${ITEMS[selected].name} » ici ? Cela ne mène à rien.`);
        return;
      }
    }

    switch (id) {
      case "portrait":
        if (!flags.portrait) {
          setFlags((f) => ({ ...f, portrait: true }));
          addItem("note");
          say("Le portrait vous fixe. Un coin de papier dépasse du cadre… Vous glissez les doigts derrière : une note froissée ! (Cliquez dessus dans votre inventaire pour la lire.)");
        } else flavor("portraitDone");
        break;

      case "commode":
        if (!flags.drawer) {
          setFlags((f) => ({ ...f, drawer: true }));
          addItem("candle");
          say("Le tiroir du haut est coincé. Vous tirez de toutes vos forces… il cède ! Au fond : une bougie de rechange, à peine entamée.");
        } else flavor("commodeEmpty");
        break;

      case "chest":
        if (flags.chest) flavor("chestEmpty");
        else {
          setModal("code");
          say("Un coffre bardé de fer, fermé par un cadenas à trois chiffres.");
        }
        break;

      case "fireplace":
        if (!flags.fire) {
          if (selected === "matches") {
            setFlags((f) => ({ ...f, fire: true }));
            removeItem("matches");
            say("Vous craquez une allumette. Les bûches s'embrasent dans un rugissement ! La lumière chasse les ombres… et la cire rouge d'une boîte de fer, au fond du foyer, commence à fondre.");
          } else {
            const n = counters.current.fireCold ?? 0;
            counters.current.fireCold = n + 1;
            say(
              n % 2 === 0
                ? "Un foyer glacé, rempli de bûches sèches. Au fond, vous devinez une boîte de fer scellée à la cire rouge, dure comme la pierre. Il faudrait de la chaleur."
                : "Les bûches n'attendent qu'une étincelle. Il faudrait du feu pour faire fondre cette cire."
            );
          }
        } else if (!flags.key) {
          setFlags((f) => ({ ...f, key: true }));
          addItem("key");
          say("La cire a coulé comme du sang. Vous soulevez le couvercle brûlant de la boîte : une grande clé noire repose au fond ! Cela doit être celle de la sortie.");
        } else flavor("keyDone");
        break;

      case "door":
        if (selected === "key") {
          setFlags((f) => ({ ...f, door: true }));
          removeItem("key");
          say("La clé tourne dans un grincement affreux. La porte s'ouvre sur l'aube…");
          setTimeout(() => setPhase("won"), 900);
        } else if (inv.includes("key")) {
          say("La serrure vous attend. Sélectionnez la clé dans votre inventaire, puis cliquez sur la porte.");
        } else {
          const n = counters.current.door ?? 0;
          counters.current.door = n + 1;
          say(
            n % 2 === 0
              ? "La porte massive est verrouillée par une serrure monstrueuse. Il vous faut la clé."
              : "Vous secouez la poignée. Du fond du couloir, quelque chose ricane doucement."
          );
        }
        break;

      default:
        flavor(id);
    }
  };

  const clickItem = (id: ItemId) => {
    if (phase !== "play") return;
    if (id === "note") {
      setModal("note");
      return;
    }
    if (id === "candle") {
      removeItem("candle");
      setWax((w) => Math.min(WAX_MAX, w + CANDLE_BONUS));
      thresholds.current = { half: false, quarter: false, tenth: false };
      say("Vous fondez la nouvelle bougie sur l'ancienne. La flamme reprend de la vigueur !");
      return;
    }
    setSelected((s) => (s === id ? null : id));
    say(selected === id ? "Vous rangez l'objet." : ITEMS[id].desc);
  };

  const tryCode = () => {
    if (digits.every((d, i) => d === SECRET_CODE[i])) {
      setFlags((f) => ({ ...f, chest: true }));
      addItem("matches");
      setModal(null);
      say("Clac ! Le cadenas s'ouvre. Dans le coffre, une petite boîte d'allumettes, sèches, miraculeusement. Vous les glissez dans votre poche.");
    } else {
      setShake((s) => s + 1);
      setWax((w) => Math.max(0.5, w - 6));
      say("Le cadenas résiste. La flamme de votre lanterne tremble, comme si le manoir se moquait de vous.");
    }
  };

  const hint = () => {
    if (phase !== "play" || wax <= HINT_COST + 5) return;
    setHints((h) => h + 1);
    setWax((w) => w - HINT_COST);
    let t: string;
    if (wax < 100 && !flags.drawer) t = "Votre bougie s'épuise… Les tiroirs de la commode cachent peut-être de quoi rallumer la flamme.";
    else if (!flags.portrait) t = "Le portrait vous dévisage. Quelque chose dépasse de son cadre.";
    else if (!flags.chest) t = "Le coffre réclame trois chiffres. Comptez dans la pièce, dans l'ordre de la note : ce qui vole, ce qui sourit, ce qui rampe.";
    else if (!flags.fire) t = "Ces allumettes… et ce foyer glacé, avec une boîte scellée à la cire dans les cendres.";
    else if (!flags.key) t = "La cire a fondu. Fouillez à nouveau la cheminée.";
    else t = "La porte, à droite. Elle n'attend plus que sa clé.";
    say(`💡 ${t}`);
  };

  const stars = hints === 0 && wax > 100 ? 3 : wax > 40 ? 2 : 1;
  const mm = Math.floor(wax / 60);
  const ss = Math.floor(wax % 60);

  return (
    <div className="flex min-h-full flex-col items-center gap-3 bg-[radial-gradient(ellipse_at_top,#1d0f2b,#07030c_70%)] px-3 py-3 sm:px-6">
      {/* En-tête */}
      <header className="flex w-full max-w-[1000px] items-center gap-3 sm:gap-5">
        <Lantern fraction={fraction} className={cn("h-14 w-12 shrink-0 sm:h-20 sm:w-16", fraction < 0.2 && "animate-pulse")} />
        <div className="min-w-0 flex-1">
          <h1 className="font-title glow-text text-3xl leading-none text-orange-400 sm:text-5xl">La Lanterne de Courge</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full border border-amber-900/70 bg-black/60">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-200",
                  flags.fire
                    ? "bg-gradient-to-r from-orange-500 to-amber-300"
                    : fraction < 0.25
                      ? "bg-gradient-to-r from-red-700 to-red-500"
                      : "bg-gradient-to-r from-amber-600 to-amber-200"
                )}
                style={{ width: `${Math.max(0, fraction * 100)}%` }}
              />
            </div>
            <span className={cn("w-24 text-right text-sm tabular-nums sm:text-base", fraction < 0.25 && !flags.fire ? "text-red-400" : "text-amber-200")}>
              {flags.fire ? "🔥 cire figée" : `🕯️ ${mm}:${pad(ss)}`}
            </span>
          </div>
        </div>
        <button
          onClick={hint}
          disabled={phase !== "play" || wax <= HINT_COST + 5}
          className="shrink-0 rounded-lg border border-amber-700/60 bg-amber-950/50 px-3 py-2 text-sm text-amber-200 transition hover:bg-amber-900/60 disabled:opacity-40 sm:text-base"
          title={`Un indice coûte ${HINT_COST} secondes de bougie`}
        >
          💡 Indice
          <span className="hidden text-xs text-amber-400/80 sm:block">−{HINT_COST}s de cire</span>
        </button>
      </header>

      {/* Scène */}
      <main className="w-full" style={{ maxWidth: "min(1000px, calc((100vh - 290px) * 1.6))", minWidth: "min(100%, 320px)" }}>
        <Scene
          mouse={mouse}
          radius={radius}
          flick={flick}
          flags={flags}
          hover={hover}
          setHover={setHover}
          setMouse={setMouse}
          onPick={pick}
          armed={!!selected}
        />
      </main>

      {/* Narration */}
      <section className="w-full max-w-[1000px] rounded-xl border border-amber-900/50 bg-black/50 px-4 py-3 shadow-inner">
        <p key={msg.k} className="fade-in min-h-[3.2rem] text-base italic leading-snug text-amber-100/90 sm:text-lg">
          {msg.text || "…"}
        </p>
        {selected && (
          <p className="mt-1 text-sm text-orange-300">
            ▸ Objet en main : <b>{ITEMS[selected].name}</b>  :  cliquez sur un élément de la pièce pour l'utiliser.
          </p>
        )}
      </section>

      {/* Inventaire */}
      <section className="flex w-full max-w-[1000px] items-center gap-3">
        <span className="font-title text-xl text-amber-500/80">Poches</span>
        <div className="flex min-h-[3.5rem] flex-1 flex-wrap items-center gap-2 rounded-xl border border-amber-900/50 bg-black/40 p-2">
          {inv.length === 0 && <span className="px-2 text-sm italic text-amber-200/40">Vide… pour l'instant.</span>}
          {inv.map((id) => (
            <button
              key={id}
              onClick={() => clickItem(id)}
              title={ITEMS[id].desc}
              className={cn(
                "fade-in flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition sm:text-base",
                selected === id
                  ? "border-orange-400 bg-orange-700/40 text-orange-100 shadow-[0_0_14px_rgba(255,140,30,0.6)]"
                  : "border-amber-800/60 bg-amber-950/40 text-amber-100 hover:bg-amber-900/50"
              )}
            >
              <span className="text-xl">{ITEMS[id].icon}</span>
              {ITEMS[id].name}
            </button>
          ))}
        </div>
      </section>

      {/* Modale : note */}
      {modal === "note" && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4" onClick={() => setModal(null)}>
          <div className="paper fade-in max-w-md rotate-[-1deg] rounded-sm p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-title mb-3 text-3xl text-[#6a1a10]">Note du maître des lieux</p>
            <p className="text-xl italic leading-relaxed">
              « Ce que je garde s'ouvre en trois chiffres.
              <br />
              Compte, dans cette pièce,
              <br />
              <b>ce qui vole</b>,<br />
              <b>ce qui sourit</b>,<br />
              <b>ce qui rampe</b>.
              <br />
              Dans cet ordre, ou reste avec moi. »
            </p>
            <button onClick={() => setModal(null)} className="mt-5 rounded border border-[#6a4a1a] bg-[#6a4a1a]/20 px-5 py-1.5 text-[#3b2410] hover:bg-[#6a4a1a]/40">
              Ranger la note
            </button>
          </div>
        </div>
      )}

      {/* Modale : cadenas */}
      {modal === "code" && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4" onClick={() => setModal(null)}>
          <div
            key={shake}
            className={cn("fade-in w-full max-w-sm rounded-2xl border-2 border-amber-700/70 bg-gradient-to-b from-[#2a1a10] to-[#120a06] p-6 text-center shadow-[0_0_60px_rgba(255,120,0,0.25)]", shake > 0 && "shake")}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-title text-3xl text-orange-400">Cadenas à code</p>
            <p className="mt-1 text-sm italic text-amber-200/70">Trois chiffres, trois secrets de la pièce.</p>
            <div className="my-5 flex justify-center gap-4">
              {digits.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => setDigits((ds) => ds.map((x, j) => (j === i ? (x + 1) % 10 : x)))}
                    className="h-8 w-14 rounded bg-amber-900/40 text-amber-200 hover:bg-amber-800/60"
                    aria-label="Augmenter"
                  >
                    ▲
                  </button>
                  <div className="flex h-16 w-14 items-center justify-center rounded-lg border-2 border-amber-600 bg-black text-4xl font-bold tabular-nums text-amber-300 shadow-inner">{d}</div>
                  <button
                    onClick={() => setDigits((ds) => ds.map((x, j) => (j === i ? (x + 9) % 10 : x)))}
                    className="h-8 w-14 rounded bg-amber-900/40 text-amber-200 hover:bg-amber-800/60"
                    aria-label="Diminuer"
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={tryCode} className="rounded-lg bg-orange-600 px-5 py-2 font-bold text-black transition hover:bg-orange-500">
                Essayer
              </button>
              <button onClick={() => setModal(null)} className="rounded-lg border border-amber-700/60 px-5 py-2 text-amber-200 hover:bg-amber-900/40">
                Laisser
              </button>
            </div>
            <p className="mt-3 text-xs text-amber-200/50">Un mauvais essai fait vaciller la flamme (−6 s de cire).</p>
          </div>
        </div>
      )}

      {/* Intro */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#2a1238ee,#050208f5)] p-4">
          <div className="fade-in max-w-xl text-center">
            <Lantern fraction={1} className="mx-auto h-36 w-28" />
            <h2 className="font-title glow-text mt-2 text-5xl text-orange-400 sm:text-7xl">La Lanterne de Courge</h2>
            <p className="mt-4 text-lg leading-relaxed text-amber-100/90 sm:text-xl">
              La porte du manoir s'est refermée derrière vous. Dans le noir, une seule lumière : votre lanterne de courge,
              dont la bougie <b className="text-orange-300">fond à chaque seconde</b>.
            </p>
            <ul className="mx-auto mt-4 max-w-md space-y-1 text-left text-base text-amber-200/80">
              <li>🖱️ La lumière suit votre curseur : éclairez la pièce.</li>
              <li>👆 Cliquez sur les objets pour les fouiller.</li>
              <li>🎒 Sélectionnez un objet de vos poches, puis cliquez sur sa cible.</li>
              <li>🗝️ Trouvez les allumettes, puis la clé de la sortie.</li>
            </ul>
            <button
              onClick={start}
              className="font-title mt-6 rounded-xl border-2 border-orange-500 bg-orange-600/20 px-8 py-3 text-3xl text-orange-300 shadow-[0_0_30px_rgba(255,120,0,0.35)] transition hover:scale-105 hover:bg-orange-600/40"
            >
              Entrer dans le manoir
            </button>
          </div>
        </div>
      )}

      {/* Défaite */}
      {phase === "lost" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/95 p-4">
          <div className="late-fade max-w-lg text-center">
            <p className="text-7xl">💀</p>
            <h2 className="font-title mt-3 text-5xl text-red-500 sm:text-6xl">La flamme s'éteint…</h2>
            <p className="mt-4 text-lg italic leading-relaxed text-amber-100/80">
              La cire n'est plus qu'une flaque tiède. Dans l'obscurité totale, des rires étouffés montent des murs, et des doigts froids se referment doucement sur votre épaule…
            </p>
            <button onClick={restart} className="font-title mt-6 rounded-xl border-2 border-orange-500 px-8 py-3 text-3xl text-orange-300 transition hover:bg-orange-600/30">
              Rallumer la lanterne
            </button>
          </div>
        </div>
      )}

      {/* Victoire */}
      {phase === "won" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#ffd98a,#7a3b10_60%,#1a0a05)] p-4">
          <div className="fade-in max-w-lg text-center text-[#2a1306]">
            <Lantern fraction={fraction} className="mx-auto h-32 w-24" />
            <h2 className="font-title mt-2 text-5xl text-[#5a1a05] sm:text-6xl">Liberté !</h2>
            <p className="mt-3 text-xl font-semibold leading-relaxed">
              Vous franchissez le seuil au premier chant du coq. Derrière vous, le manoir pousse un long soupir déçu, et la porte se referme à jamais.
            </p>
            <p className="mt-4 text-4xl">{"🎃".repeat(stars)}{"🖤".repeat(3 - stars)}</p>
            <p className="mt-2 text-lg">
              {flags.fire ? "Cire figée par le feu" : `Il restait ${mm}:${pad(ss)} de bougie`} · {hints} indice{hints > 1 ? "s" : ""} utilisé{hints > 1 ? "s" : ""}
            </p>
            <button onClick={restart} className="font-title mt-6 rounded-xl border-2 border-[#5a1a05] bg-[#5a1a05] px-8 py-3 text-3xl text-amber-200 transition hover:scale-105">
              Rejouer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
