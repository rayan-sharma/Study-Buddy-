"use client";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen, MessageCircle, CheckSquare, ListChecks, PenSquare, Settings,
  Paperclip, ArrowRight, Play, BarChart3, CalendarCheck, Video, ChevronDown, Bot,
} from "lucide-react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.sb{--ink:#0b1220;--muted:#6b7280;--accent:#6c7cf5;--accent2:#8b6fe0;--line:#e8eaf0;--bg:#fafafb;
  font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;
  -webkit-font-smoothing:antialiased;overflow-x:hidden}
.sb *{box-sizing:border-box}
.sb a{color:inherit;text-decoration:none}
.sb button{font-family:inherit;cursor:pointer}
.sb .wrap{max-width:1440px;margin:0 auto;padding:0 72px}
.sb nav{display:flex;align-items:center;justify-content:space-between;height:86px}
.sb .logo{display:flex;align-items:center;gap:10px;font-size:22px;font-weight:500;letter-spacing:-.01em}
.sb .logo svg{color:var(--accent)}
.sb .links{display:flex;gap:48px;font-size:15px;font-weight:500}
.sb .right{display:flex;align-items:center;gap:32px;font-size:15px}
.sb .signin{color:var(--muted)}
.sb .btn{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:#fff;border:0;
  border-radius:10px;padding:13px 18px;font-size:15px;font-weight:500}
.sb .btn.lg{padding:20px 28px;font-size:17px;border-radius:12px}
.sb .btn:focus-visible,.sb .ghost:focus-visible,.sb a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.sb .hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);gap:56px;align-items:center;padding:40px 0 64px}
.sb .eyebrow{display:flex;align-items:center;gap:20px;font-size:12.5px;letter-spacing:.2em;color:var(--muted);font-weight:500;margin-bottom:28px}
.sb .eyebrow i{width:40px;height:2px;background:var(--accent);display:block}
.sb h1{font-size:clamp(48px,6.4vw,88px);line-height:1;letter-spacing:-.035em;font-weight:700;margin:0 0 36px}
.sb h1 span{display:block;background:linear-gradient(90deg,#5b8def,#8f6fdc 70%,#a58bd0);-webkit-background-clip:text;background-clip:text;color:transparent}
.sb .lead{font-size:20px;line-height:1.6;color:#6b7280;max-width:600px;margin:0 0 44px}
.sb .cta{display:flex;align-items:center;gap:30px;flex-wrap:wrap}
.sb .ghost{display:flex;align-items:center;gap:18px;background:none;border:0;font-size:16px;font-weight:500;color:var(--ink);padding:0}
.sb .ghost b{width:52px;height:52px;border-radius:50%;border:1px solid #d5d8e0;background:#fff;display:grid;place-items:center}
.sb .app{background:#fff;border:1px solid var(--line);border-radius:36px;padding:16px;
  box-shadow:0 30px 80px -30px rgba(40,50,100,.18)}
.sb .shell{display:grid;grid-template-columns:156px minmax(0,1fr);border:1px solid #eef0f4;border-radius:24px;overflow:hidden;background:#fff;min-height:540px}
.sb .side{background:#f6f7f9;padding:18px 12px;display:flex;flex-direction:column}
.sb .brand{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;padding:2px 10px 22px}
.sb .brand svg{color:var(--accent)}
.sb .item{display:flex;align-items:center;gap:12px;font-size:11.5px;color:#4b5563;padding:11px 10px;border-radius:8px;margin-bottom:6px}
.sb .item.on{background:#e8ecfd;color:var(--ink)}
.sb .item.on svg{color:var(--accent)}
.sb .item svg{color:#6b7280}
.sb .me{margin-top:auto;display:flex;align-items:center;gap:8px;padding:8px 6px;font-size:10px;font-weight:600}
.sb .me small{display:block;color:#9ca3af;font-weight:400;font-size:9px}
.sb .av{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#f0b27a,#8a5a3c);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:600;flex:none}
.sb .main{padding:30px 20px 18px 22px;display:flex;flex-direction:column;gap:14px}
.sb .row{display:flex;gap:12px;align-items:flex-start}
.sb .row.user{justify-content:flex-end}
.sb .bubble{border-radius:14px;padding:12px 16px;font-size:12px;line-height:1.6;max-width:290px}
.sb .bubble.u{background:#e9edfd}
.sb .bubble.a{background:#f3f4f6;color:#374151;max-width:360px}
.sb .bubble.a b{color:var(--ink);font-weight:500}
.sb .bubble.a em{font-style:normal;color:var(--accent)}
.sb .bot{width:34px;height:34px;border-radius:50%;background:#e9edfd;color:var(--accent);display:grid;place-items:center;flex:none}
.sb .card{border:1px solid #eef0f4;border-radius:16px;padding:16px 18px;margin-top:6px}
.sb .card h4{margin:0 0 12px;font-size:12px;font-weight:600}
.sb .plot{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px}
.sb .plot svg{width:100%;height:auto;display:block}
.sb .ctrls{border-left:1px solid #eef0f4;padding-left:18px;display:flex;flex-direction:column;gap:22px;justify-content:flex-start;padding-top:10px}
.sb .ctrl label{display:flex;justify-content:space-between;font-size:11px;color:#4b5563;margin-bottom:10px}
.sb .ctrl label span{color:var(--ink);font-weight:500}
.sb input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:5px;background:#e5e7eb;outline:none;margin:0}
.sb input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 1px 4px rgba(60,70,150,.4);cursor:pointer}
.sb input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--accent);border:2px solid #fff;cursor:pointer}
.sb input[type=range]:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.sb .ask{margin-top:auto;display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:30px;padding:8px 8px 8px 16px;font-size:12px;color:#9ca3af}
.sb .ask input{flex:1;border:0;outline:0;font:inherit;background:none;min-width:0;color:var(--ink)}
.sb .send{width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;border:0;display:grid;place-items:center}
.sb .feats{display:grid;grid-template-columns:repeat(4,1fr);padding:30px 0 70px}
.sb .feat{display:flex;gap:20px;align-items:center;padding:0 28px;border-left:1px solid var(--line)}
.sb .feat:first-child{border-left:0;padding-left:0}
.sb .ico{width:54px;height:54px;border-radius:14px;background:#eef0f8;color:#1f2937;display:grid;place-items:center;flex:none}
.sb .feat h3{margin:0 0 4px;font-size:16px;font-weight:600}
.sb .feat p{margin:0;font-size:14.5px;line-height:1.5;color:var(--muted)}
@media(max-width:1100px){
  .sb .wrap{padding:0 28px}
  .sb .hero{grid-template-columns:1fr}
  .sb .links{display:none}
  .sb .feats{grid-template-columns:1fr 1fr;gap:28px 0}
  .sb .feat:nth-child(3){border-left:0;padding-left:0}
}
@media(max-width:640px){
  .sb .right .signin{display:none}
  .sb .shell{grid-template-columns:1fr}
  .sb .side{display:none}
  .sb .plot{grid-template-columns:1fr}
  .sb .ctrls{border-left:0;padding-left:0}
  .sb .feats{grid-template-columns:1fr}
  .sb .feat,.sb .feat:nth-child(3){border-left:0;padding-left:0}
  .sb .lead{font-size:17px}
}
`;

const S = 250, PAD = 0, R = 10;
const px = (v) => ((v + R) / (2 * R)) * S;
const py = (v) => S - ((v + R) / (2 * R)) * S;

function Graph({ m, b }) {
  const y1 = m * -R + b, y2 = m * R + b;
  const ticks = [-10, -5, 0, 5, 10];
  return (
    <svg viewBox="-24 -14 298 288" role="img" aria-label={`Graph of y = ${m}x + ${b}`}>
      <defs><clipPath id="clip"><rect x="0" y="0" width={S} height={S} /></clipPath></defs>
      <rect x="0" y="0" width={S} height={S} fill="#fff" stroke="#e5e7eb" />
      {Array.from({ length: 21 }, (_, i) => i - 10).map((v) => (
        <g key={v} stroke="#eceef2" strokeWidth="1">
          <line x1={px(v)} y1="0" x2={px(v)} y2={S} />
          <line x1="0" y1={py(v)} x2={S} y2={py(v)} />
        </g>
      ))}
      <line x1="0" y1={py(0)} x2={S} y2={py(0)} stroke="#6b7280" />
      <line x1={px(0)} y1="0" x2={px(0)} y2={S} stroke="#6b7280" />
      {ticks.map((t) => (
        <g key={t} fontSize="9" fill="#4b5563">
          <text x={px(t)} y={S + 14} textAnchor="middle">{t}</text>
          {t !== 0 && <text x="-5" y={py(t) + 3} textAnchor="end">{t}</text>}
        </g>
      ))}
      <line clipPath="url(#clip)" x1={px(-R)} y1={py(y1)} x2={px(R)} y2={py(y2)} stroke="#5b6cf2" strokeWidth="1.6" />
      <circle cx={px(0)} cy={py(b)} r="4.5" fill="#5b6cf2" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

const features = [
  { Icon: MessageCircle, t: "Real-time answers", d: "Get clear, step-by-step explanations" },
  { Icon: BarChart3, t: "Interactive visuals", d: "Explore concepts with graphs and demos" },
  { Icon: CalendarCheck, t: "Tasks & reminders", d: "Stay organized and on top of your goals" },
  { Icon: Video, t: "FaceTime support", d: "Study together with a real-time AI companion" },
];

const nav = [
  [MessageCircle, "Chat", true], [CheckSquare, "Tasks"], [ListChecks, "Subjects"],
  [PenSquare, "Canvas"], [Settings, "Settings"],
];

export default function StudyBuddyLanding() {
  const [m, setM] = useState(1.8);
  const [b, setB] = useState(0);

  return (
    <div className="sb">
      <style>{css}</style>
      <div className="wrap">
        <nav>
          <a href="#" className="logo"><BookOpen size={30} strokeWidth={2.2} />StudyBuddy</a>
          <div className="links">
            {["Features", "Subjects", "How it works", "About"].map((l) => <a key={l} href="#">{l}</a>)}
          </div>
          <div className="right">
            <a href="#" className="signin">Sign in</a>
            <button className="btn">Get Started <ArrowRight size={16} /></button>
          </div>
        </nav>

        <section className="hero">
          <div>
            <div className="eyebrow"><i />YOUR AI STUDY COMPANION</div>
            <h1>Study Smarter,<span>Not Harder.</span></h1>
            <p className="lead">
              Get real-time explanations, interactive visuals, and personalized study support.
              Ask anything, explore concepts with interactive demos, and stay on track with your tasks.
            </p>
            <div className="cta">
              <Link href="/Dashboard"
                className="inline-flex items-center gap-2 rounded-xl 
                bg-slate-950 px-6 py-4 font-medium text-white 
                transition hover:bg-slate-800">
                Start Studying 
                <span aria-hidden="true">→</span>
                </Link>
              <button className="ghost"><b><Play size={18} fill="currentColor" /></b>Watch Demo</button>
            </div>
          </div>

          <div className="app" aria-label="StudyBuddy app preview">
            <div className="shell">
              <aside className="side">
                <div className="brand"><BookOpen size={18} />StudyBuddy</div>
                {nav.map(([Icon, label, on]) => (
                  <div key={label} className={"item" + (on ? " on" : "")}><Icon size={15} />{label}</div>
                ))}
                <div className="me">
                  <div className="av">S</div>
                  <div style={{ flex: 1 }}>Shivam<small>Student</small></div>
                  <ChevronDown size={12} color="#6b7280" />
                </div>
              </aside>

              <div className="main">
                <div className="row user">
                  <div className="bubble u">Can you explain how changing the slope affects a linear function?</div>
                  <div className="av" style={{ width: 34, height: 34, fontSize: 12 }}>S</div>
                </div>
                <div className="row">
                  <div className="bot"><Bot size={18} /></div>
                  <div className="bubble a">
                    Sure! The <b>slope</b> <em>(m)</em> determines how steep the line is and the direction it goes.
                    Try adjusting the sliders below to see how it changes the graph!
                  </div>
                </div>
                <div className="card">
                  <h4>y = mx + b</h4>
                  <div className="plot">
                    <Graph m={m} b={b} />
                    <div className="ctrls">
                      <div className="ctrl">
                        <label htmlFor="m">Slope (m)<span>{m.toFixed(1)}</span></label>
                        <input id="m" type="range" min="-5" max="5" step="0.1" value={m} onChange={(e) => setM(+e.target.value)} />
                      </div>
                      <div className="ctrl">
                        <label htmlFor="b">Intercept (b)<span>{b.toFixed(1)}</span></label>
                        <input id="b" type="range" min="-8" max="8" step="0.1" value={b} onChange={(e) => setB(+e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ask">
                  <Paperclip size={16} color="#6b7280" />
                  <input placeholder="Ask anything about your studies..." aria-label="Ask anything about your studies" />
                  <button className="send" aria-label="Send"><ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feats">
          {features.map(({ Icon, t, d }) => (
            <div className="feat" key={t}>
              <div className="ico"><Icon size={24} strokeWidth={1.8} /></div>
              <div><h3>{t}</h3><p>{d}</p></div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}