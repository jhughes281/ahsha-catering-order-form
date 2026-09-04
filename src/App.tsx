import { useEffect, useMemo, useState } from "react";
import {
  Sandwich,
  User,
  Beef,
  Drumstick,
  Pizza,
  Leaf,
  Cherry,
  Flame,
  CookingPot,
  Milk,
  Droplet,
  Droplets,
  Sparkles,
  Sparkle,
  ClipboardCheck,
  Clock,
  Users,
  ArrowRight,
  ArrowDown,
  Check,
  Plus,
  Minus,
  Trash2,
  Printer,
  Copy,
  Send,
  CircleAlert,
  CircleCheck,
  KeyRound,
  ExternalLink,
  Phone,
  CalendarDays,
  MessageSquareText,
  ReceiptText,
  ChefHat,
  Star,
  Info,
  ChevronDown,
  UtensilsCrossed,
  Layers,
  Salad,
} from "lucide-react";

// ---------- Data ----------
const MEAT_OPTIONS = [
  {
    id: "Ham",
    title: "Ham",
    desc: "Smoked, thin-sliced deli ham",
    icon: Beef,
  },
  {
    id: "Turkey",
    title: "Turkey",
    desc: "Oven-roasted turkey breast",
    icon: Drumstick,
  },
] as const;

const CHEESE_OPTIONS = [
  {
    id: "Sliced",
    title: "Sliced",
    desc: "Classic deli slices, melty & mild",
    icon: Layers,
  },
  {
    id: "Shredded",
    title: "Shredded",
    desc: "Fresh-shredded, extra coverage",
    icon: Salad,
  },
] as const;

const VEGGIE_OPTIONS = [
  { id: "Shredded lettuce", desc: "Crisp & cool", icon: Leaf },
  { id: "Sliced tomatoes", desc: "Ripe, garden-fresh", icon: Cherry },
  { id: "Banana peppers", desc: "Tangy & mild heat", icon: Flame },
  { id: "Grilled onions", desc: "Sweet & caramelized", icon: CookingPot },
];

const CONDIMENT_OPTIONS = [
  { id: "Mayonnaise", desc: "Creamy classic", icon: Droplet },
  { id: "Mustard", desc: "Yellow, sharp bite", icon: Droplets },
  { id: "Honey Mustard", desc: "Sweet & tangy", icon: Sparkles },
  { id: "Ranch", desc: "Cool & herby", icon: Milk },
  { id: "Salt and pepper", desc: "Simple seasoning", icon: Sparkle },
];

type SubmitState = "idle" | "sending" | "success" | "error";

export default function App() {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [meat, setMeat] = useState<string>("");
  const [cheese, setCheese] = useState<string>("");
  const [veggies, setVeggies] = useState<string[]>([]);
  const [condiments, setCondiments] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ahsha_access_key");
    if (saved) setAccessKey(saved);
  }, []);

  useEffect(() => {
    if (accessKey.trim().length > 10) {
      localStorage.setItem("ahsha_access_key", accessKey.trim());
    }
  }, [accessKey]);

  const toggleList = (list: string[], setList: (v: string[]) => void, val: string) => {
    if (list.includes(val)) setList(list.filter((v) => v !== val));
    else setList([...list, val]);
  };

  const progress = useMemo(() => {
    let done = 0;
    const total = 5;
    if (fullName.trim().length >= 2) done += 1;
    if (meat) done += 1;
    if (cheese) done += 1;
    if (veggies.length > 0) done += 1;
    if (condiments.length > 0) done += 1;
    return Math.round((done / total) * 100);
  }, [fullName, meat, cheese, veggies, condiments]);

  const orderText = useMemo(() => {
    return [
      `AHSHA CATERING — SUB SANDWICH ORDER`,
      `Order: ${orderNumber || "(not placed yet)"}`,
      `--------------------------------`,
      `Name: ${fullName || "—"}`,
      `Contact: ${contact || "—"}`,
      `Date needed: ${eventDate || "—"}`,
      `Qty: ${quantity} x Sub on WHITE BREAD`,
      `--------------------------------`,
      `MEAT: ${meat || "—"}`,
      `CHEESE: ${cheese ? cheese.toLowerCase() : "—"}`,
      `VEGGIES: ${veggies.length ? veggies.join(", ") : "None"}`,
      `CONDIMENTS: ${condiments.length ? condiments.join(", ") : "None"}`,
      `NOTES: ${notes || "—"}`,
    ].join("\n");
  }, [fullName, contact, eventDate, quantity, meat, cheese, veggies, condiments, notes, orderNumber]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 2) e.name = "Please sign in with your full name.";
    if (!meat) e.meat = "Choose Ham or Turkey.";
    if (!cheese) e.cheese = "Choose sliced or shredded cheese.";
    if (!accessKey.trim()) e.accessKey = "Paste your Web3Forms Access Key to deliver this order.";
    else if (accessKey.trim().length < 10) e.accessKey = "That key looks too short — check Web3Forms dashboard.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setTouched(true);
    setErrorMsg("");
    if (!validate()) {
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const newOrderNo = `AH-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNumber(newOrderNo);
    setStatus("sending");

    const isEmail = contact.includes("@");
    const payload = {
      access_key: accessKey.trim(),
      subject: `New Sub Order ${newOrderNo} — ${fullName} | Ahsha Catering`,
      from_name: "Ahsha Catering Order Form",
      name: fullName.trim(),
      email: isEmail ? contact.trim() : undefined,
      phone: !isEmail && contact ? contact.trim() : undefined,
      message: orderText.replace("(not placed yet)", newOrderNo),
      Bread: "White bread - Sub Sandwich",
      Meat: meat,
      Cheese: cheese,
      Vegetables_Toppings: veggies.length ? veggies.join(", ") : "None",
      Condiments: condiments.length ? condiments.join(", ") : "None",
      Quantity: String(quantity),
      Date_Needed: eventDate || "ASAP",
      Special_Instructions: notes || "—",
      Order_Number: newOrderNo,
      botcheck: "",
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        throw new Error(data.message || "Web3Forms rejected the submission.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong sending your order. Check your connection and access key, then try again.");
    }
  };

  const resetAll = () => {
    setFullName("");
    setContact("");
    setEventDate("");
    setQuantity(1);
    setMeat("");
    setCheese("");
    setVeggies([]);
    setCondiments([]);
    setNotes("");
    setErrors({});
    setTouched(false);
    setStatus("idle");
    setOrderNumber("");
  };

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-stone-900">
      {/* Announcement */}
      <div className="bg-[#1A2E22] px-4 py-2.5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F3EAD8] sm:text-xs">
          Ahsha Catering • Group sub orders now open • White bread • Circle your choices below
        </p>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-[#E8DDC9] bg-[#FAF5EB]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2E22] font-serif text-xl font-bold text-[#FAF5EB]">
              A
            </div>
            <div className="leading-tight">
              <p className="font-serif text-xl font-bold tracking-tight text-[#1A2E22]">Ahsha</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C65D3A]">Catering</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
            <a href="#order" className="transition hover:text-[#1A2E22]">Order Form</a>
            <a href="#how" className="transition hover:text-[#1A2E22]">How it works</a>
            <a href="#menu" className="transition hover:text-[#1A2E22]">Menu</a>
            <a href="#faq" className="transition hover:text-[#1A2E22]">FAQ</a>
          </nav>
          <a
            href="#order"
            className="inline-flex items-center gap-2 rounded-full bg-[#C65D3A] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(198,93,58,0.6)] transition hover:bg-[#A84A2D]"
          >
            Start Order <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DDC9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1A2E22]">
              <span className="flex h-2 w-2 rounded-full bg-green-600" />
              Accepting orders for this week • Web3Forms connected
            </div>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#1A2E22] sm:text-5xl lg:text-[3.6rem]">
              Sub Sandwich on white bread.
              <span className="mt-2 block font-serif italic font-medium text-[#C65D3A]">Circle your choices.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-stone-600 sm:text-base">
              Sign in with your name, pick Ham or Turkey, choose your cheese, veggies & condiments — and hit submit.
              Your order goes straight to Ahsha Catering via Web3Forms. No account, no fuss.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#order"
                className="inline-flex items-center gap-2 rounded-full bg-[#1A2E22] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24402F]"
              >
                <ClipboardCheck className="h-4 w-4" /> Build my sub
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-[#1A2E22]/20 bg-white px-6 py-3 text-sm font-semibold text-[#1A2E22] transition hover:border-[#1A2E22]"
              >
                How Web3Forms works
              </a>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-[#E8DDC9] pt-6">
              {[
                { icon: Clock, top: "Fresh daily", sub: "Made to order" },
                { icon: Users, top: "Group ready", sub: "One form / person" },
                { icon: Send, top: "Instant send", sub: "Via Web3Forms" },
              ].map((s) => (
                <div key={s.top} className="flex items-start gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1A2E22] text-[#FAF5EB]">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#1A2E22]">{s.top}</p>
                    <p className="text-xs text-stone-500">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image card */}
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-[#E8DDC9] bg-white shadow-[0_24px_60px_-20px_rgba(26,46,34,0.35)]">
              <div className="relative h-64 sm:h-80">
                <img
                  src="https://images.pexels.com/photos/28396784/pexels-photo-28396784.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                  alt="Fresh sub sandwich"
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#1A2E22] px-3.5 py-1.5 text-xs font-bold text-white">
                  <Sandwich className="h-3.5 w-3.5" /> White Bread Sub • $ Price TBD
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 backdrop-blur">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#D9A441] text-[#D9A441]" />
                    ))}
                    <span className="ml-2 text-xs font-semibold text-stone-700">Loved for office lunches</span>
                  </div>
                  <span className="hidden rounded-full bg-[#FDF0E6] px-3 py-1 text-[11px] font-bold text-[#C65D3A] sm:block">
                    {progress}% complete
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="rounded-2xl bg-[#FAF5EB] p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Meats</p>
                  <p className="mt-1 text-sm font-bold text-[#1A2E22]">Ham or Turkey</p>
                </div>
                <div className="rounded-2xl bg-[#FAF5EB] p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Cheese</p>
                  <p className="mt-1 text-sm font-bold text-[#1A2E22]">Sliced or Shredded</p>
                </div>
                <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-dashed border-[#C9B895] bg-white p-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C65D3A]/10 text-[#C65D3A]">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <p className="text-[13px] leading-snug text-stone-600">
                    <span className="font-bold text-[#1A2E22]">From the paper ticket, to digital.</span> Same choices —
                    shredded lettuce, sliced tomatoes, banana peppers, grilled onions + 5 condiments.
                  </p>
                </div>
              </div>
            </div>
            {/* floating mini tickets */}
            <div className="animate-floaty absolute -left-3 top-10 hidden rounded-2xl border border-[#E8DDC9] bg-white px-4 py-3 shadow-xl lg:block">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#C65D3A]">Example ticket</p>
              <p className="mt-1 font-serif text-sm font-bold text-[#1A2E22]">Sarah M. • Turkey • Sliced</p>
              <p className="text-xs text-stone-500">Lettuce, Tomato + Ranch</p>
            </div>
            <div className="animate-floaty absolute -right-2 bottom-20 hidden rounded-2xl border border-[#E8DDC9] bg-[#1A2E22] px-4 py-3 text-white shadow-xl lg:block" style={{ animationDelay: "1.2s" }}>
              <p className="flex items-center gap-1.5 text-xs font-bold"><CircleCheck className="h-3.5 w-3.5 text-green-400" /> Sent via Web3Forms</p>
              <p className="mt-0.5 text-[11px] opacity-70">Delivered to Ahsha instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main order */}
      <main id="order" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C65D3A]">Order Form • 01–06</p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#1A2E22] sm:text-4xl">Sign in & circle your choices</h2>
            <p className="mt-1.5 max-w-xl text-sm text-stone-500">Fill this out exactly like the paper slip. Fields marked * are required.</p>
          </div>
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-[13px] font-semibold text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
          >
            <Trash2 className="h-4 w-4" /> Clear form
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#E8DDC9] bg-white p-4">
          <div className="flex items-center justify-between text-[13px] font-semibold">
            <span className="text-[#1A2E22]">Your sub progress — {progress}%</span>
            <span className="text-stone-500">{fullName ? `Ordering as ${fullName}` : "Not signed in yet"}</span>
          </div>
          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#F3EAD8]">
            <div className="h-full rounded-full bg-[#1A2E22] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_370px] lg:items-start">
          {/* LEFT FORM */}
          <form id="order-form" onSubmit={handleSubmit} className="space-y-5">
            {/* STEP 1 */}
            <section className="rounded-[1.6rem] border border-[#E8DDC9] bg-white p-6 shadow-[0_10px_40px_-18px_rgba(26,46,34,0.25)] sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2E22] text-sm font-bold text-white">01</span>
                <div>
                  <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-[#1A2E22]"><User className="h-5 w-5 text-[#C65D3A]" /> Sign in — Your Name *</h3>
                  <p className="text-[13px] text-stone-500">This is how Ahsha will label your sandwich.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-bold text-stone-700">Full Name *</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className={`w-full rounded-xl border bg-[#FFFEFB] px-4 py-3.5 text-[15px] font-medium outline-none transition placeholder:text-stone-400 focus:ring-4 ${errors.name && touched ? "border-red-400 focus:ring-red-100" : "border-[#E8DDC9] focus:border-[#1A2E22] focus:ring-[#1A2E22]/10"}`}
                  />
                  {errors.name && touched && <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-red-600"><CircleAlert className="h-4 w-4" />{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-stone-700">Email or Phone <span className="font-medium text-stone-400">(for confirmation)</span></label>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="you@work.com or (555) 123-4567"
                    className="w-full rounded-xl border border-[#E8DDC9] bg-[#FFFEFB] px-4 py-3.5 text-[15px] outline-none transition placeholder:text-stone-400 focus:border-[#1A2E22] focus:ring-4 focus:ring-[#1A2E22]/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-stone-700">Date needed</label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full rounded-xl border border-[#E8DDC9] bg-[#FFFEFB] py-3.5 pl-10 pr-3 text-[14px] outline-none transition focus:border-[#1A2E22] focus:ring-4 focus:ring-[#1A2E22]/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-stone-700">Qty</label>
                    <div className="flex items-center justify-between rounded-xl border border-[#E8DDC9] bg-[#FFFEFB] px-2 py-2">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-stone-700 shadow-sm transition hover:bg-stone-100"><Minus className="h-4 w-4" /></button>
                      <span className="text-[15px] font-bold">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(Math.min(20, quantity + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A2E22] text-white transition hover:bg-[#24402F]"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#FAF5EB] p-3.5 text-[13px] leading-relaxed text-stone-600">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C65D3A]" />
                Ordering for a group? Each person should submit their own form with their own name — just like circling one paper slip.
              </div>
            </section>

            {/* STEP 2 MEATS */}
            <section className="rounded-[1.6rem] border border-[#E8DDC9] bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2E22] text-sm font-bold text-white">02</span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1A2E22]">Meats *</h3>
                    <p className="text-[13px] text-stone-500">Circle one — Ham or Turkey</p>
                  </div>
                </div>
                <span className="hidden rounded-full bg-[#FDF0E6] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#C65D3A] sm:block">Pick 1</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {MEAT_OPTIONS.map((m) => {
                  const active = meat === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMeat(m.id)}
                      className={`group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${active ? "animate-pop border-[#1A2E22] bg-[#1A2E22] text-white shadow-lg" : "border-[#E8DDC9] bg-[#FFFEFB] hover:border-[#1A2E22]/40"}`}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/15 text-white" : "bg-[#FDF0E6] text-[#C65D3A]"}`}>
                        <m.icon className="h-6 w-6" />
                      </span>
                      <span>
                        <span className={`block text-[15px] font-bold ${active ? "text-white" : "text-[#1A2E22]"}`}>{m.title}</span>
                        <span className={`block text-[13px] ${active ? "text-white/70" : "text-stone-500"}`}>{m.desc}</span>
                      </span>
                      <span className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${active ? "border-white bg-white text-[#1A2E22]" : "border-[#E8DDC9] text-transparent"}`}>
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.meat && touched && <p className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-red-600"><CircleAlert className="h-4 w-4" />{errors.meat}</p>}
            </section>

            {/* STEP 3 CHEESE */}
            <section className="rounded-[1.6rem] border border-[#E8DDC9] bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2E22] text-sm font-bold text-white">03</span>
                  <div>
                    <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-[#1A2E22]"><Pizza className="h-5 w-5 text-[#C65D3A]" /> Cheese *</h3>
                    <p className="text-[13px] text-stone-500">Sliced or shredded?</p>
                  </div>
                </div>
                <span className="hidden rounded-full bg-[#FDF0E6] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#C65D3A] sm:block">Pick 1</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {CHEESE_OPTIONS.map((c) => {
                  const active = cheese === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCheese(c.id)}
                      className={`relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${active ? "animate-pop border-[#D9A441] bg-[#FFF8E6] shadow-[0_10px_30px_-12px_rgba(217,164,65,0.6)]" : "border-[#E8DDC9] bg-[#FFFEFB] hover:border-[#D9A441]/60"}`}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[#D9A441] text-white" : "bg-[#FFF3D6] text-[#9A7414]"}`}>
                        <c.icon className="h-6 w-6" />
                      </span>
                      <span>
                        <span className="block text-[15px] font-bold text-[#1A2E22]">{c.title}</span>
                        <span className="block text-[13px] text-stone-500">{c.desc}</span>
                      </span>
                      <span className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${active ? "border-[#D9A441] bg-[#D9A441] text-white" : "border-[#E8DDC9] text-transparent"}`}>
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.cheese && touched && <p className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-red-600"><CircleAlert className="h-4 w-4" />{errors.cheese}</p>}
            </section>

            {/* STEP 4 VEGGIES */}
            <section className="rounded-[1.6rem] border border-[#E8DDC9] bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F7D4A] text-sm font-bold text-white">04</span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1A2E22]">Vegetables & Toppings</h3>
                    <p className="text-[13px] text-stone-500">Circle all you want — pick as many as you like</p>
                  </div>
                </div>
                <span className="hidden rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-green-700 sm:block">Pick many</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {VEGGIE_OPTIONS.map((v) => {
                  const active = veggies.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleList(veggies, setVeggies, v.id)}
                      className={`relative flex items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition ${active ? "animate-pop border-[#2F7D4A] bg-[#EFF7F0]" : "border-[#E8DDC9] bg-[#FFFEFB] hover:border-[#2F7D4A]/40"}`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[#2F7D4A] text-white" : "bg-[#EFF7F0] text-[#2F7D4A]"}`}>
                        <v.icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-[14px] font-bold text-[#1A2E22]">{v.id}</span>
                        <span className="block text-xs text-stone-500">{v.desc}</span>
                      </span>
                      <span className={`absolute right-3.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full ${active ? "bg-[#2F7D4A] text-white" : "bg-stone-100 text-stone-300"}`}>
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {veggies.length === 0 && (
                <button
                  type="button"
                  onClick={() => setVeggies(VEGGIE_OPTIONS.map((v) => v.id))}
                  className="mt-3 text-[13px] font-semibold text-[#2F7D4A] underline underline-offset-4 hover:text-[#1A2E22]"
                >
                  Add all veggies
                </button>
              )}
            </section>

            {/* STEP 5 CONDIMENTS */}
            <section className="rounded-[1.6rem] border border-[#E8DDC9] bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C65D3A] text-sm font-bold text-white">05</span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1A2E22]">Condiments</h3>
                    <p className="text-[13px] text-stone-500">Mayo, mustard, ranch & more</p>
                  </div>
                </div>
                <span className="hidden rounded-full bg-[#FDF0E6] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#C65D3A] sm:block">Pick many</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {CONDIMENT_OPTIONS.map((c) => {
                  const active = condiments.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleList(condiments, setCondiments, c.id)}
                      className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition ${active ? "animate-pop border-[#C65D3A] bg-[#C65D3A] text-white shadow-[0_8px_20px_-8px_rgba(198,93,58,0.7)]" : "border-[#E8DDC9] bg-[#FFFEFB] text-stone-700 hover:border-[#C65D3A]/50"}`}
                    >
                      <c.icon className="h-4 w-4" />
                      {c.id}
                      {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[13px] text-stone-500">Includes: Mayonnaise • Mustard • Honey Mustard • Ranch • Salt and pepper</p>
            </section>

            {/* STEP 6 NOTES + WEB3FORMS */}
            <section className="rounded-[1.6rem] border border-[#E8DDC9] bg-white p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2E22] text-sm font-bold text-white">06</span>
                <div>
                  <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-[#1A2E22]"><MessageSquareText className="h-5 w-5 text-[#C65D3A]" /> Notes & Delivery</h3>
                  <p className="text-[13px] text-stone-500">Allergies? Toasted? Extra napkins? Tell us here.</p>
                </div>
              </div>
              <div className="mt-5">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. No salt, toasted please, allergy: no mustard…"
                  className="w-full resize-none rounded-xl border border-[#E8DDC9] bg-[#FFFEFB] px-4 py-3.5 text-[15px] outline-none transition placeholder:text-stone-400 focus:border-[#1A2E22] focus:ring-4 focus:ring-[#1A2E22]/10"
                />
              </div>
              <div className="mt-5 rounded-2xl border border-[#1A2E22]/15 bg-[#1A2E22]/[.03] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A2E22] text-white"><KeyRound className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-bold text-[#1A2E22]">Web3Forms Access Key *</p>
                      <p className="text-xs text-stone-500">Required to send orders to Ahsha's email.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowKeyHelp(!showKeyHelp)} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1A2E22] shadow-sm transition hover:bg-stone-100">
                    {showKeyHelp ? "Hide help" : "Where's my key?"} <ChevronDown className={`h-3.5 w-3.5 transition ${showKeyHelp ? "rotate-180" : ""}`} />
                  </button>
                </div>
                <input
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Paste key like  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className={`mt-3.5 w-full rounded-xl border bg-white px-4 py-3 font-mono text-[13px] outline-none transition placeholder:font-sans placeholder:text-stone-400 focus:ring-4 ${errors.accessKey && touched ? "border-red-400 focus:ring-red-100" : "border-[#E8DDC9] focus:border-[#1A2E22] focus:ring-[#1A2E22]/10"}`}
                />
                {errors.accessKey && touched && <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-red-600"><CircleAlert className="h-4 w-4" />{errors.accessKey}</p>}
                {showKeyHelp && (
                  <ol className="mt-3.5 space-y-2 rounded-xl bg-white p-4 text-[13px] leading-relaxed text-stone-600">
                    <li><span className="font-bold text-[#1A2E22]">1.</span> Go to <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="font-bold text-[#C65D3A] underline underline-offset-2">web3forms.com <ExternalLink className="inline h-3 w-3" /></a> and create a free access key with Ahsha's email.</li>
                    <li><span className="font-bold text-[#1A2E22]">2.</span> Verify the email, then copy the Access Key from your dashboard.</li>
                    <li><span className="font-bold text-[#1A2E22]">3.</span> Paste it above — it's saved in this browser, so guests never see it if you pre-fill it before sharing the link.</li>
                    <li className="flex items-start gap-2 rounded-lg bg-[#FAF5EB] p-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#C65D3A]" /> Tip: As the organizer, paste your key once, then share/bookmark this page. Every guest order will route to your inbox.</li>
                  </ol>
                )}
              </div>

              {/* honeypot for web3forms */}
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

              {status === "error" && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <div><p className="font-bold">Couldn't send order.</p><p className="mt-0.5">{errorMsg}</p></div>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C65D3A] px-6 py-4 text-[15px] font-bold text-white shadow-[0_16px_30px_-12px_rgba(198,93,58,0.7)] transition hover:bg-[#A84A2D] disabled:cursor-wait disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending to Ahsha via Web3Forms…
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" /> Place my catering order — {quantity} sub{quantity > 1 ? "s" : ""}
                  </>
                )}
              </button>
              <p className="mt-2.5 text-center text-xs text-stone-500">By submitting, your name + choices are emailed to Ahsha Catering via Web3Forms.</p>
            </section>
          </form>

          {/* RIGHT TICKET */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.6rem] border border-[#E8DDC9] bg-white shadow-[0_18px_50px_-20px_rgba(26,46,34,0.35)]">
              <div className="bg-[#1A2E22] px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70"><ReceiptText className="h-4 w-4" /> Order Ticket</p>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[11px]">{orderNumber || "DRAFT"}</span>
                </div>
                <p className="mt-2 font-serif text-2xl font-bold leading-tight">{fullName || "Your Name Here"}</p>
                <p className="text-[13px] text-white/60">{quantity} × Sub on white bread • {eventDate || "Date TBD"}</p>
              </div>
              <div className="nice-scroll max-h-[420px] overflow-y-auto px-6 py-5">
                <TicketRow label="Meat" value={meat || "— pick Ham or Turkey —"} highlight={!meat} />
                <div className="receipt-dash my-3.5" />
                <TicketRow label="Cheese" value={cheese ? cheese.toLowerCase() : "— pick sliced or shredded —"} highlight={!cheese} />
                <div className="receipt-dash my-3.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Vegetables & Toppings</p>
                  {veggies.length ? (
                    <ul className="mt-2 space-y-1.5">
                      {veggies.map((v) => (
                        <li key={v} className="flex items-center gap-2 text-sm font-semibold text-[#1A2E22]"><Check className="h-4 w-4 text-[#2F7D4A]" strokeWidth={3} />{v}</li>
                      ))}
                    </ul>
                  ) : <p className="mt-1.5 text-sm italic text-stone-400">None circled yet</p>}
                </div>
                <div className="receipt-dash my-3.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Condiments</p>
                  {condiments.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {condiments.map((c) => (
                        <span key={c} className="rounded-full bg-[#FDF0E6] px-2.5 py-1 text-xs font-bold text-[#A84A2D]">{c}</span>
                      ))}
                    </div>
                  ) : <p className="mt-1.5 text-sm italic text-stone-400">None circled yet</p>}
                </div>
                {notes && (
                  <>
                    <div className="receipt-dash my-3.5" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Notes</p>
                    <p className="mt-1.5 rounded-xl bg-[#FAF5EB] p-3 text-[13px] italic leading-relaxed text-stone-600">“{notes}”</p>
                  </>
                )}
              </div>
              <div className="border-t border-[#E8DDC9] bg-[#FFFEFB] px-6 py-4">
                <ul className="space-y-1.5 text-[13px] font-medium">
                  <CheckLine done={fullName.trim().length >= 2} label="Signed in with name" />
                  <CheckLine done={!!meat} label="Meat circled" />
                  <CheckLine done={!!cheese} label="Cheese circled" />
                  <CheckLine done={veggies.length > 0} label={`${veggies.length} veggie${veggies.length === 1 ? "" : "s"}`} />
                  <CheckLine done={condiments.length > 0} label={`${condiments.length} condiment${condiments.length === 1 ? "" : "s"}`} />
                </ul>
                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  <button onClick={copyOrder} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E8DDC9] bg-white px-3 py-2.5 text-[13px] font-bold text-[#1A2E22] transition hover:border-[#1A2E22]">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E8DDC9] bg-white px-3 py-2.5 text-[13px] font-bold text-[#1A2E22] transition hover:border-[#1A2E22]">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.6rem] border border-[#E8DDC9] bg-[#1A2E22] p-6 text-white">
              <p className="flex items-center gap-2 text-sm font-bold"><UtensilsCrossed className="h-4 w-4 text-[#D9A441]" /> Need help or bulk orders?</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">Talk to Ahsha directly for 10+ subs, dietary swaps, or delivery windows.</p>
              <div className="mt-3.5 flex gap-2">
                <a href="#faq" className="flex-1 rounded-xl bg-white px-4 py-2.5 text-center text-[13px] font-bold text-[#1A2E22] transition hover:bg-[#F3EAD8]">Read FAQ</a>
                <a href="#order" className="flex-1 rounded-xl bg-[#C65D3A] px-4 py-2.5 text-center text-[13px] font-bold text-white transition hover:bg-[#A84A2D]">Order now</a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Menu strip */}
      <section id="menu" className="border-y border-[#E8DDC9] bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C65D3A]">The full menu card</p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-[#1A2E22]">Exactly like the paper slip</h2>
            </div>
            <img
              src="https://images.pexels.com/photos/34593405/pexels-photo-34593405.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
              alt="Sub ingredients"
              className="h-16 w-28 rounded-xl object-cover"
            />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { t: "Bread", d: "Sub Sandwich on white bread", items: ["White sub roll", "Fresh-baked daily"] },
              { t: "Meats", d: "Choose one", items: ["Ham", "Turkey"] },
              { t: "Cheese", d: "Choose one", items: ["Sliced", "Shredded"] },
              { t: "Veggies", d: "Choose many", items: ["Shredded lettuce", "Sliced tomatoes", "Banana peppers", "Grilled onions"] },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-[#E8DDC9] bg-[#FAF5EB] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C65D3A]">{c.t}</p>
                <p className="mt-1 text-sm font-bold text-[#1A2E22]">{c.d}</p>
                <ul className="mt-3 space-y-1.5">
                  {c.items.map((i) => (
                    <li key={i} className="flex items-center gap-2 text-[13px] font-medium text-stone-600"><span className="h-1.5 w-1.5 rounded-full bg-[#C65D3A]" />{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-[#C9B895] bg-[#FFFEFB] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C65D3A]">Condiments — choose many</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {CONDIMENT_OPTIONS.map((c) => (
                <span key={c.id} className="rounded-full border border-[#E8DDC9] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-stone-700">{c.id}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-[#C65D3A]">How it works</p>
        <h2 className="mt-1 text-center font-serif text-3xl font-bold text-[#1A2E22] sm:text-4xl">From text message to tasty in 3 steps</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", t: "Sign in with your name", d: "Type your full name at the top — that's your label, just like writing it on the paper slip.", icon: User },
            { n: "2", t: "Circle your choices", d: "Tap Ham or Turkey, sliced or shredded, then all the veggies & condiments you want.", icon: Sandwich },
            { n: "3", t: "Submit via Web3Forms", d: "Hit Place Order. Your ticket is emailed instantly to Ahsha — no login, no app needed.", icon: Send },
          ].map((s) => (
            <div key={s.n} className="rounded-[1.6rem] border border-[#E8DDC9] bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A2E22] text-white"><s.icon className="h-5 w-5" /></span>
                <span className="font-serif text-4xl font-bold text-[#F3EAD8]">{s.n}</span>
              </div>
              <p className="mt-4 font-serif text-lg font-bold text-[#1A2E22]">{s.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <a href="#order" className="inline-flex items-center gap-2 rounded-full bg-[#1A2E22] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24402F]">
            Start my order <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[#E8DDC9] bg-white scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-[#C65D3A]">Questions</p>
          <h2 className="mt-1 text-center font-serif text-3xl font-bold text-[#1A2E22]">Order FAQ</h2>
          <div className="mt-8 space-y-3">
            {[
              { q: "Do I need a Web3Forms account to order?", a: "No. Only the organizer (Ahsha) needs to create a free key at web3forms.com once. Guests just fill the form and hit submit — the key you pasted in Step 06 handles delivery." },
              { q: "Where do orders go?", a: "Straight to the email linked to your Web3Forms Access Key. Subject lines include the order number and guest name, and the body lists meat, cheese, veggies, condiments, quantity, date and notes." },
              { q: "Can I order more than one sub?", a: "Yes — use the Qty stepper in Step 01. If people want different toppings, they should each submit their own ticket with their own name." },
              { q: "What if I have allergies?", a: "Put them in Special Instructions in Step 06 (e.g. 'allergy: mustard'). For severe allergies, also contact Ahsha directly before the event." },
              { q: "Is my access key safe here?", a: "The key is stored only in your browser's localStorage so you don't have to re-paste it. For public shared links, pre-fill it on the organizer's device first — guests won't need to see or change it." },
            ].map((f, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl border transition ${openFaq === i ? "border-[#1A2E22] bg-[#FFFEFB]" : "border-[#E8DDC9] bg-[#FFFEFB]"}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-[15px] font-bold text-[#1A2E22]">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[#C65D3A] transition ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 text-sm leading-relaxed text-stone-600">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A2E22] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-serif text-xl font-bold text-[#1A2E22]">A</div>
            <div>
              <p className="font-serif text-lg font-bold">Ahsha Catering</p>
              <p className="text-xs text-white/60">Sub sandwiches • Made fresh • Served with care</p>
            </div>
          </div>
          <p className="max-w-sm text-center text-[13px] leading-relaxed text-white/60 md:text-right">
            Orders powered by <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="font-bold text-white underline underline-offset-2">Web3Forms</a>. One ticket per guest. Please submit before the cutoff.
          </p>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">© {new Date().getFullYear()} Ahsha Catering. All rights reserved.</div>
      </footer>

      {/* Success overlay */}
      {status === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2E22]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[1.8rem] bg-white shadow-2xl">
            <div className="bg-[#1A2E22] px-7 py-8 text-center text-white">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500"><Check className="h-8 w-8" strokeWidth={3} /></span>
              <h3 className="mt-4 font-serif text-2xl font-bold">Order sent!</h3>
              <p className="mt-1 text-sm text-white/70">Thanks {fullName.split(" ")[0] || "friend"} — Ahsha got your ticket.</p>
              <p className="mx-auto mt-3 inline-block rounded-full bg-white/15 px-4 py-1.5 font-mono text-sm font-bold tracking-wider">{orderNumber}</p>
            </div>
            <div className="px-7 py-6">
              <div className="rounded-2xl bg-[#FAF5EB] p-4 text-[13px] leading-relaxed">
                <p className="font-bold text-[#1A2E22]">{quantity}× White-bread sub • {meat} • {cheese?.toLowerCase()} cheese</p>
                <p className="mt-1 text-stone-600">{veggies.join(", ") || "No veggies"} • {condiments.join(", ") || "No condiments"}</p>
                {contact && <p className="mt-1 text-stone-500">Confirmation to: {contact}</p>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => { setStatus("idle"); resetAll(); }} className="rounded-xl bg-[#1A2E22] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#24402F]">New order</button>
                <button onClick={() => setStatus("idle")} className="rounded-xl border border-[#E8DDC9] bg-white px-4 py-3 text-sm font-bold text-[#1A2E22] transition hover:border-[#1A2E22]">Review ticket</button>
              </div>
              <p className="mt-3 text-center text-xs text-stone-400">A copy was emailed via Web3Forms • Screenshot this for your records</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className={`mt-1 text-[15px] font-bold ${highlight ? "italic text-stone-400" : "text-[#1A2E22]"}`}>{value}</p>
    </div>
  );
}

function CheckLine({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? "bg-green-600 text-white" : "bg-stone-200 text-stone-400"}`}>
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
      <span className={done ? "text-[#1A2E22]" : "text-stone-400"}>{label}</span>
    </li>
  );
}
