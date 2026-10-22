
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const DIRECTIONS = ["North", "East", "South", "West"];
const INITIAL_TRAFFIC = {
  North: "Medium",
  East: "High",
  South: "Medium",
  West: "Low",
};

const GREEN_SECONDS = { Low: 10, Medium: 15, High: 22 };
const YELLOW_SECONDS = 3;
const ALL_RED_SECONDS = 2;

function getGreenDuration(level, adaptive) {
  const base = GREEN_SECONDS[level] ?? 15;
  return adaptive && level === "High" ? Math.min(30, base + 4) : base;
}

function makePhases(traffic, adaptive) {
  return DIRECTIONS.flatMap((direction) => [
    {
      direction,
      color: "green",
      duration: getGreenDuration(traffic[direction], adaptive),
    },
    { direction, color: "yellow", duration: YELLOW_SECONDS },
    { direction, color: "red", duration: ALL_RED_SECONDS },
  ]);
}

function VehicleGraphic({ type }) {
  if (type === "ambulance") {
    return (
      <svg viewBox="0 0 64 104" className="vehicle-art" aria-hidden="true">
        <g fill="#10171d" stroke="#626d75" strokeWidth="1.5">
          <rect x="4" y="20" width="10" height="22" rx="3" />
          <rect x="50" y="20" width="10" height="22" rx="3" />
          <rect x="4" y="65" width="10" height="22" rx="3" />
          <rect x="50" y="65" width="10" height="22" rx="3" />
        </g>
        <path d="M15 5 H49 L54 20 V83 Q54 96 43 99 H21 Q10 96 10 83 V20 Z" fill="#f4f5f4" stroke="#aeb8be" strokeWidth="2" />
        <path d="M17 12 H47 L49 31 H15 Z" fill="#9ed9ec" stroke="#6a929f" strokeWidth="2" />
        <path d="M15 36 H49 V69 H15 Z" fill="#e5e9e9" stroke="#aab5ba" strokeWidth="1.5" />
        <path d="M32 38 V67 M17 52 H47" stroke="#d62832" strokeWidth="8" />
        <path d="M32 42 V63 M21 52 H43" stroke="#fff" strokeWidth="5" />
        <rect x="15" y="4" width="12" height="5" rx="2" fill="#ff3649" />
        <rect x="37" y="4" width="12" height="5" rx="2" fill="#328cff" />
        <path d="M18 74 H46 L43 85 H21 Z" fill="#9ed9ec" stroke="#6a929f" strokeWidth="1.5" />
        <rect x="15" y="91" width="10" height="4" rx="1" fill="#ff3434" />
        <rect x="39" y="91" width="10" height="4" rx="1" fill="#ff3434" />
      </svg>
    );
  }

  if (type === "truck") {
    return (
      <svg viewBox="0 0 64 104" className="vehicle-art" aria-hidden="true">
        <g fill="#111820" stroke="#59656e" strokeWidth="1.5">
          <rect x="4" y="17" width="10" height="23" rx="3" />
          <rect x="50" y="17" width="10" height="23" rx="3" />
          <rect x="4" y="56" width="10" height="23" rx="3" />
          <rect x="50" y="56" width="10" height="23" rx="3" />
          <rect x="4" y="79" width="10" height="17" rx="3" />
          <rect x="50" y="79" width="10" height="17" rx="3" />
        </g>
        <rect x="12" y="4" width="40" height="56" rx="4" fill="#d5dfe4" stroke="#74858e" strokeWidth="2" />
        <rect x="17" y="10" width="30" height="44" rx="2" fill="#aebdc6" stroke="#75858e" strokeWidth="1.5" />
        <path d="M22 11 V53 M32 11 V53 M42 11 V53 M17 22 H47 M17 33 H47 M17 44 H47" stroke="#899aa4" strokeWidth="1.3" />
        <path d="M13 65 Q13 60 19 60 H45 Q51 60 51 66 L53 84 Q53 93 46 95 H18 Q11 93 11 84 Z" fill="#347d9c" stroke="#17475c" strokeWidth="2" />
        <path d="M17 65 H47 L45 78 H19 Z" fill="#a4d8e9" stroke="#527c8a" strokeWidth="2" />
        <path d="M32 65 V78" stroke="#527c8a" strokeWidth="1.5" />
        <rect x="15" y="82" width="9" height="4" rx="1" fill="#fff0c6" />
        <rect x="40" y="82" width="9" height="4" rx="1" fill="#fff0c6" />
        <rect x="15" y="91" width="9" height="3" rx="1" fill="#ff4545" />
        <rect x="40" y="91" width="9" height="3" rx="1" fill="#ff4545" />
      </svg>
    );
  }

  if (type === "bike") {
    return (
      <svg viewBox="0 0 64 104" className="vehicle-art" aria-hidden="true">
        <ellipse cx="32" cy="19" rx="8" ry="16" fill="#10171d" stroke="#65717a" strokeWidth="2" />
        <ellipse cx="32" cy="85" rx="8" ry="15" fill="#10171d" stroke="#65717a" strokeWidth="2" />
        <path d="M25 19 H39 M25 85 H39" stroke="#b6c0c6" strokeWidth="2" />
        <path d="M27 29 L20 42 L25 59 L32 71 L39 59 L44 42 L37 29 Z" fill="#c83e36" stroke="#672b2b" strokeWidth="2" />
        <path d="M26 32 Q32 26 38 32 L40 42 H24 Z" fill="#e7ecee" stroke="#8d989e" strokeWidth="1.5" />
        <path d="M23 44 Q32 39 41 44 L38 57 H26 Z" fill="#303b44" stroke="#10171d" strokeWidth="2" />
        <path d="M26 59 H38 L36 68 H28 Z" fill="#7d8991" />
        <path d="M23 37 L15 33 M41 37 L49 33" stroke="#a0abb1" strokeWidth="3" strokeLinecap="round" />
        <path d="M14 31 L20 35 M50 31 L44 35" stroke="#202830" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="24" r="4" fill="#fff4cc" stroke="#8e8b73" strokeWidth="1" />
        <rect x="27" y="94" width="10" height="3" rx="1" fill="#ff4545" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 104" className="vehicle-art" aria-hidden="true">
      <g fill="#111820" stroke="#59636b" strokeWidth="1.5">
        <rect x="5" y="22" width="10" height="21" rx="3" />
        <rect x="49" y="22" width="10" height="21" rx="3" />
        <rect x="5" y="65" width="10" height="21" rx="3" />
        <rect x="49" y="65" width="10" height="21" rx="3" />
      </g>
      <path d="M17 9 Q32 3 47 9 L53 24 L56 43 V78 Q54 92 43 96 H21 Q10 92 8 78 V43 L11 24 Z" fill="#dce5e9" stroke="#788790" strokeWidth="2" />
      <path d="M17 17 Q32 11 47 17 L49 35 H15 Z" fill="#9bc4d5" stroke="#526d7b" strokeWidth="2" />
      <path d="M15 41 H49 L47 63 H17 Z" fill="#263d4b" stroke="#7c919c" strokeWidth="2" />
      <path d="M18 66 H46 L44 78 H20 Z" fill="#526a77" />
      <path d="M23 38 V62 M41 38 V62" stroke="#91aab6" strokeWidth="1" />
      <rect x="11" y="7" width="10" height="4" rx="2" fill="#fff8d9" />
      <rect x="43" y="7" width="10" height="4" rx="2" fill="#fff8d9" />
      <rect x="13" y="92" width="9" height="3" rx="1" fill="#ff4545" />
      <rect x="42" y="92" width="9" height="3" rx="1" fill="#ff4545" />
    </svg>
  );
}

function Vehicle({ vehicle, direction, index }) {
  return (
    <div
      className={`vehicle vehicle-${vehicle.type} vehicle-${index} face-${direction.toLowerCase()}`}
      style={{ "--vehicle-index": index }}
      aria-label={vehicle.type}
    >
      <VehicleGraphic type={vehicle.type} />
    </div>
  );
}

function TrafficLight({ direction, color, seconds }) {
  return (
    <div className="signal-unit">
      <div className="traffic-light">
        {["red", "yellow", "green"].map((lamp) => (
          <span key={lamp} className={`lamp ${lamp} ${color === lamp ? "on" : ""}`} />
        ))}
      </div>
      <div className={`signal-countdown ${color}`}>
        <span>{direction.toUpperCase()}</span>
        <strong>{String(seconds).padStart(2, "0")}</strong>
        <small>{color === "green" ? "GO" : color === "yellow" ? "SLOW" : "STOP"}</small>
      </div>
    </div>
  );
}

function makeVehicles(density) {
  const count = density === "Low" ? 2 : density === "Medium" ? 4 : 6;
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    type: index === 0 && density === "High"
      ? "truck"
      : index % 4 === 0
      ? "truck"
      : index % 3 === 0
      ? "car"
      : "bike",
  }));
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
}

function playTone(frequency = 740, duration = 0.12, volume = 0.035) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => context.close();
  } catch {
    // Sound is optional.
  }
}

export default function App() {
  const [traffic, setTraffic] = useState(INITIAL_TRAFFIC);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [adaptive, setAdaptive] = useState(true);
  const [nightMode, setNightMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [emergencyDirection, setEmergencyDirection] = useState("North");
  const [emergencyPending, setEmergencyPending] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [servedVehicles, setServedVehicles] = useState(0);
  const [history, setHistory] = useState([]);
  const audioLastPhase = useRef("");

  const phases = useMemo(() => makePhases(traffic, adaptive), [traffic, adaptive]);
  const phase = phases[phaseIndex] ?? phases[0];

  const vehicles = useMemo(
    () => Object.fromEntries(DIRECTIONS.map((direction) => [direction, makeVehicles(traffic[direction])])),
    [traffic]
  );

  const totalVehicles = Object.values(vehicles).reduce((sum, list) => sum + list.length, 0);

  const averageWait = Math.round(
    DIRECTIONS.reduce((sum, direction) => {
      if (phase.direction === direction && phase.color === "green") return sum;
      return sum + GREEN_SECONDS[traffic[direction]] / 2;
    }, 0) / DIRECTIONS.length
  );

  const congestionScore = Math.round(
    DIRECTIONS.reduce((sum, direction) => sum + (
      traffic[direction] === "High" ? 3 : traffic[direction] === "Medium" ? 2 : 1
    ), 0) / (DIRECTIONS.length * 3) * 100
  );

  const colorFor = useCallback((direction) => {
    if (emergencyActive && direction === emergencyDirection) return "green";
    if (phase.direction !== direction) return "red";
    return phase.color;
  }, [phase, emergencyActive, emergencyDirection]);

  const waitFor = useCallback((direction) => {
    if (emergencyActive && direction === emergencyDirection) return 0;
    if (phase.direction === direction && phase.color === "green") return 0;

    let wait = secondsLeft;
    for (let step = 1; step <= phases.length; step += 1) {
      const next = phases[(phaseIndex + step) % phases.length];
      if (next.direction === direction && next.color === "green") return wait;
      wait += next.duration;
    }
    return wait;
  }, [emergencyActive, emergencyDirection, phase, secondsLeft, phases, phaseIndex]);

  useEffect(() => {
    if (!running) return undefined;

    const timer = setTimeout(() => {
      setElapsedSeconds((value) => value + 1);

      if (secondsLeft > 1) {
        setSecondsLeft((value) => value - 1);
        return;
      }

      const current = phases[phaseIndex];
      if (current.color === "green") {
        setServedVehicles((value) => value + vehicles[current.direction].length);
      }

      let nextIndex = (phaseIndex + 1) % phases.length;

      if (emergencyPending && (current.color === "red" || current.color === "yellow")) {
        const emergencyGreen = phases.findIndex(
          (item) => item.direction === emergencyDirection && item.color === "green"
        );
        if (emergencyGreen >= 0) {
          nextIndex = emergencyGreen;
          setEmergencyPending(false);
          setEmergencyActive(true);
        }
      } else if (
        emergencyActive &&
        current.direction === emergencyDirection &&
        current.color === "green"
      ) {
        setEmergencyActive(false);
        setEmergencyPending(false);
        setHistory((items) => [{
          id: Date.now(),
          event: `Emergency priority served: ${emergencyDirection}`,
          time: new Date().toLocaleTimeString(),
        }, ...items].slice(0, 4));
      }

      if (nextIndex === 0) setCycles((value) => value + 1);
      setPhaseIndex(nextIndex);
      setSecondsLeft(phases[nextIndex].duration);
    }, 1000);

    return () => clearTimeout(timer);
  }, [running, secondsLeft, phaseIndex, phases, vehicles, emergencyPending, emergencyDirection, emergencyActive]);

  useEffect(() => {
    if (!running || !soundEnabled) return;
    const key = `${phase.direction}-${phase.color}`;
    if (audioLastPhase.current !== key) {
      audioLastPhase.current = key;
      playTone(phase.color === "green" ? 880 : phase.color === "yellow" ? 620 : 440);
    }
  }, [running, soundEnabled, phase.direction, phase.color]);

  useEffect(() => {
    if (running && soundEnabled && emergencyActive) playTone(960, 0.08, 0.025);
  }, [running, soundEnabled, emergencyActive]);

  function changeTraffic(direction, density) {
    setTraffic((current) => ({ ...current, [direction]: density }));
  }

  function startSimulation() {
    if (!started) {
      setPhaseIndex(0);
      setSecondsLeft(phases[0].duration);
      setStarted(true);
    }
    setRunning(true);
  }

  function resetSimulation() {
    setRunning(false);
    setStarted(false);
    setPhaseIndex(0);
    setSecondsLeft(phases[0].duration);
    setCycles(0);
    setElapsedSeconds(0);
    setServedVehicles(0);
    setEmergencyPending(false);
    setEmergencyActive(false);
    setHistory([]);
    audioLastPhase.current = "";
  }

  function requestEmergency() {
    setEmergencyPending(true);
    setEmergencyActive(false);
    setHistory((items) => [{
      id: Date.now(),
      event: `Emergency requested: ${emergencyDirection}`,
      time: new Date().toLocaleTimeString(),
    }, ...items].slice(0, 4));
    if (soundEnabled) playTone(1000, 0.22, 0.04);
    if (!running) {
      setStarted(true);
      setRunning(true);
    }
  }

  function cancelEmergency() {
    setEmergencyPending(false);
    setEmergencyActive(false);
  }

  return (
    <main className={`app-shell ${nightMode ? "night-mode" : "day-mode"}`}>
      <div className="dashboard">
        <header className="topbar">
          <div className="brand"><span>✦</span> SIGNAL<span className="brand-green">SAFE</span></div>
          <div className="topbar-actions">
            <button className="icon-control" onClick={() => setNightMode((value) => !value)}>
              {nightMode ? "☀ Day mode" : "☾ Night mode"}
            </button>
            <div className={`system-status ${running ? "is-running" : ""}`}>
              <i />{running ? "SIMULATION RUNNING" : started ? "SIMULATION PAUSED" : "SYSTEM STANDBY"}
            </div>
          </div>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">SMART CITY · FOUR-WAY JUNCTION</p>
            <h1>Traffic Signaling <span>System</span></h1>
            <p className="hero-copy">Intelligent signal scheduling, emergency priority and live traffic analytics for a simulated four-way junction.</p>
          </div>
          <div className="current-phase">
            <span>CURRENT SIGNAL</span>
            <strong>{emergencyActive ? "EMERGENCY" : phase.direction}</strong>
            <b className={`status-pill ${emergencyActive ? "emergency" : phase.color}`}>
              {emergencyActive ? "PRIORITY" : phase.color.toUpperCase()}
            </b>
            <small>{running ? `${secondsLeft} seconds remaining` : started ? "Simulation paused" : "Ready to start"}</small>
          </div>
        </section>

        <section className="stats-row">
          <article className="stat-card"><span className="stat-icon">⏱</span><div><small>PHASE COUNTDOWN</small><strong>{secondsLeft}<em> sec</em></strong></div></article>
          <article className="stat-card"><span className="stat-icon green-icon">↗</span><div><small>GREEN DIRECTION</small><strong>{emergencyActive ? emergencyDirection : phase.color === "green" ? phase.direction : "None"}</strong></div></article>
          <article className="stat-card"><span className="stat-icon orange-icon">▣</span><div><small>VEHICLES IN VIEW</small><strong>{totalVehicles}</strong></div></article>
        </section>

        <section className="content-grid">
          <article className="panel intersection-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">LIVE PREVIEW</p><h2>Four-Way Intersection</h2></div>
              <span className="live-tag"><i />{running ? "LIVE TRAFFIC" : "TRAFFIC PREVIEW"}</span>
            </div>

            <div className={`intersection ${running ? "simulation-active" : ""}`}>
              <div className="road road-ns" />
              <div className="road road-ew" />
              <div className="road-center ns-center" />
              <div className="road-center ew-center" />
              <div className="junction-box"><b>4-WAY</b><small>JUNCTION</small></div>

              {DIRECTIONS.map((direction) => (
                <div className={`signal-position signal-${direction.toLowerCase()}`} key={direction}>
                  <TrafficLight direction={direction} color={colorFor(direction)} seconds={direction === phase.direction ? secondsLeft : waitFor(direction)} />
                </div>
              ))}

              {DIRECTIONS.map((direction) => {
                const color = colorFor(direction);
                const moving = color === "green" && running;
                const laneClass = moving ? "lane-moving" : color === "yellow" ? "lane-slowing" : "lane-stopped";
                return (
                  <div className={`vehicle-lane lane-${direction.toLowerCase()} ${laneClass}`} key={direction}>
                    {vehicles[direction].map((vehicle, index) => (
                      <Vehicle key={vehicle.id} vehicle={vehicle} direction={direction} index={index} />
                    ))}
                  </div>
                );
              })}

              <div className={`emergency-badge emergency-${emergencyDirection.toLowerCase()} ${emergencyPending || emergencyActive ? "visible" : ""}`}>
                {emergencyActive ? "PRIORITY GREEN" : "AMBULANCE REQUESTED"}
              </div>
              <div className="stop-line stop-north" />
              <div className="stop-line stop-south" />
              <div className="stop-line stop-east" />
              <div className="stop-line stop-west" />
            </div>

            <div className="legend">
              <span><i className="legend-vehicle bike-dot" />Bike</span>
              <span><i className="legend-vehicle car-dot" />Car</span>
              <span><i className="legend-vehicle truck-dot" />Truck</span>
              <span><i className="legend-green" />Green: moving</span>
              <span><i className="legend-red" />Red: stopped</span>
            </div>
            <p className="simulation-note">Visual simulation only. Do not use this demo to control real traffic signals.</p>
          </article>

          <aside className="panel wait-panel">
            <div className="panel-heading"><div><p className="eyebrow">DRIVER DASHBOARD</p><h2>Waiting Time</h2></div><span className="clock">◷</span></div>
            <p className="muted">Estimated time until each road's next green signal.</p>
            <div className="wait-list">
              {DIRECTIONS.map((direction) => {
                const color = colorFor(direction);
                const wait = waitFor(direction);
                return (
                  <div className={`wait-card ${color}`} key={direction}>
                    <div className="wait-card-top"><strong>{direction}</strong><span className={`mini-pill ${color}`}>{color === "green" ? "GO" : color === "yellow" ? "SLOW" : "STOP"}</span></div>
                    <div className="wait-data"><span>Next green</span><b>{wait === 0 ? "Your turn" : formatTime(wait)}</b></div>
                    <div className="wait-data"><span>Traffic level</span><b>{traffic[direction]}</b></div>
                    <div className="progress-track"><div style={{ width: `${Math.max(5, 100 - Math.min(wait, 100))}%` }} /></div>
                  </div>
                );
              })}
            </div>
            <div className="safety-message"><b>✓ Conflict control</b><p>The demo grants one normal green direction at a time. Emergency priority is a simulated override.</p></div>
          </aside>
        </section>

        <section className="panel settings-panel">
          <div className="panel-heading settings-heading">
            <div><p className="eyebrow">CONFIGURATION</p><h2>Traffic Density Controls</h2></div>
            <p className="muted">Adjust traffic volume for each road.</p>
          </div>
          <div className="density-grid">
            {DIRECTIONS.map((direction) => (
              <label className="density-control" key={direction}>
                <span>{direction} Road</span>
                <select value={traffic[direction]} onChange={(event) => changeTraffic(direction, event.target.value)}>
                  <option value="Low">Low traffic</option><option value="Medium">Medium traffic</option><option value="High">High traffic</option>
                </select>
              </label>
            ))}
          </div>

          <div className="feature-switches">
            <label className="switch-control"><input type="checkbox" checked={adaptive} onChange={(event) => setAdaptive(event.target.checked)} /><span className="switch-track" /><span><b>Adaptive signal timing</b><small>Extend green time for heavy traffic</small></span></label>
            <label className="switch-control"><input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} /><span className="switch-track" /><span><b>Traffic sound effects</b><small>Signal tones and emergency alert</small></span></label>
          </div>

          <p className="duration-help">Standard green: Low 10s · Medium 15s · High 22s. Adaptive mode extends the high-traffic green phase.</p>

          <div className="emergency-control">
            <div><p className="eyebrow">EMERGENCY RESPONSE</p><h3>Ambulance Priority Mode</h3><p className="muted">Request priority for an approaching ambulance.</p></div>
            <div className="emergency-actions">
              <select value={emergencyDirection} onChange={(event) => setEmergencyDirection(event.target.value)} aria-label="Ambulance direction">
                {DIRECTIONS.map((direction) => <option key={direction} value={direction}>{direction} approach</option>)}
              </select>
              <button className="btn-emergency" onClick={requestEmergency} disabled={emergencyPending || emergencyActive}>
                {emergencyPending || emergencyActive ? "Priority Requested" : "🚨 Request Priority"}
              </button>
              {(emergencyPending || emergencyActive) && <button className="btn-cancel" onClick={cancelEmergency}>Cancel</button>}
            </div>
          </div>

          <div className="buttons">
            <button className="btn-start" onClick={startSimulation} disabled={running}>▶ {started ? "Resume Simulation" : "Start Simulation"}</button>
            <button className="btn-pause" onClick={() => setRunning(false)} disabled={!running}>Ⅱ Pause</button>
            <button className="btn-reset" onClick={resetSimulation}>↻ Reset</button>
          </div>
        </section>

        <section className="analytics-grid">
          <article className="panel analytics-panel">
            <div className="panel-heading"><div><p className="eyebrow">SYSTEM METRICS</p><h2>Live Traffic Analytics</h2></div><span className="live-tag"><i />LIVE DATA</span></div>
            <div className="analytics-cards">
              <div className="metric-card"><span>Total vehicles</span><strong>{totalVehicles}</strong><small>Across all four approaches</small></div>
              <div className="metric-card"><span>Vehicles served</span><strong>{servedVehicles}</strong><small>Vehicles released on green phases</small></div>
              <div className="metric-card"><span>Green cycles</span><strong>{cycles}</strong><small>Completed signal rounds</small></div>
              <div className="metric-card"><span>Average wait estimate</span><strong>{averageWait}s</strong><small>Approximate planning metric</small></div>
            </div>
            <div className="congestion-heading"><span>Overall congestion indicator</span><b>{congestionScore}%</b></div>
            <div className="congestion-track"><div style={{ width: `${congestionScore}%` }} /></div>
            <div className="congestion-labels"><span>Light</span><span>Moderate</span><span>Heavy</span></div>
          </article>

          <article className="panel event-panel">
            <div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Event Log</h2></div><span className="clock">≋</span></div>
            {history.length === 0 ? (
              <div className="empty-events"><span>◷</span><p>No events yet</p><small>Emergency requests will appear here.</small></div>
            ) : (
              <div className="event-list">{history.map((item) => <div className="event-row" key={item.id}><span className="event-dot" /><div><b>{item.event}</b><small>{item.time}</small></div></div>)}</div>
            )}
            <div className="uptime-row"><span>Simulation runtime</span><b>{formatTime(elapsedSeconds)}</b></div>
          </article>
        </section>

        <footer><span>SIGNALSAFE · REACT PROJECT</span><span>SMARTER SIGNALS, SAFER JOURNEYS</span></footer>
      </div>
    </main>
  );
}
