:root {
  --uber-black: #0d0d0d;
  --uber-elevated: #171717;
  --uber-surface: #f4f4f4;
  --uber-border: #e7e7e7;
  --uber-muted: #6d6d6d;
  --uber-green: #06c167;
  --uber-green-dark: #038a4d;
  --uber-red: #ef4444;
  --uber-shadow: 0 20px 50px rgba(17, 17, 17, 0.12);
}

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  font-family: Inter, 'Segoe UI', sans-serif;
  background: #f1f1f1;
  color: #111111;
}

body {
  min-height: 100vh;
}

button, input, select {
  font: inherit;
}

button {
  cursor: pointer;
}

.uber-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px 40px;
}

.uber-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #111111 0%, #1b1b1b 100%);
  color: white;
  border-radius: 26px;
  padding: 20px 24px;
  box-shadow: var(--uber-shadow);
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--uber-green);
  color: #0c0c0c;
  font-weight: 900;
  font-size: 1.5rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.uber-topbar h1 {
  margin: 2px 0 0;
  font-size: 1.5rem;
  letter-spacing: 0.04em;
}

.mode-toggle {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 6px;
  gap: 8px;
}

.mode-toggle button {
  border: 0;
  background: transparent;
  color: white;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 600;
}

.mode-toggle button.active {
  background: white;
  color: #111111;
}

.uber-layout {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
  margin-top: 24px;
}

.panel {
  background: #ffffff;
  border-radius: 26px;
  box-shadow: var(--uber-shadow);
  border: 1px solid var(--uber-border);
}

.main-panel {
  padding: 24px;
}

.map-panel {
  padding: 18px 18px 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-header h2 {
  margin: 4px 0 0;
  font-size: 2rem;
  letter-spacing: -0.04em;
}

.ghost-button {
  border: 1px solid var(--uber-border);
  background: white;
  color: #111111;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
}

.user-login-box,
.driver-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
  font-size: 0.82rem;
  color: #333333;
}

input,
select {
  border: 1px solid var(--uber-border);
  background: #f7f7f7;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.98rem;
  color: #111111;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--uber-green);
  box-shadow: 0 0 0 3px rgba(6, 193, 103, 0.15);
}

.primary-button {
  border: 0;
  background: linear-gradient(180deg, var(--uber-green) 0%, var(--uber-green-dark) 100%);
  color: white;
  border-radius: 14px;
  min-height: 52px;
  padding: 0 18px;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-top: 18px;
  width: 100%;
}

.route-box {
  margin-top: 22px;
  background: #f7f7f7;
  border: 1px solid var(--uber-border);
  border-radius: 18px;
  padding: 10px 12px;
}

.route-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 4px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.green-dot {
  background: var(--uber-green);
}

.red-dot {
  background: var(--uber-red);
}

.route-input input {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 1rem;
}

.route-divider {
  height: 1px;
  background: var(--uber-border);
  margin: 2px 0;
}

.ride-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.ride-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid var(--uber-border);
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
}

.ride-card strong,
.ride-card span {
  display: block;
}

.ride-card small {
  display: block;
  color: var(--uber-muted);
  margin-top: 4px;
}

.ride-card.active {
  border-color: rgba(6, 193, 103, 0.4);
  background: rgba(6, 193, 103, 0.06);
  box-shadow: inset 0 0 0 1px rgba(6, 193, 103, 0.18);
}

.ride-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  color: #111111;
}

.ride-meta span {
  color: var(--uber-muted);
  font-size: 0.78rem;
}

.fare-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--uber-border);
}

.fare-summary small {
  display: block;
  color: var(--uber-muted);
}

.fare-summary strong {
  display: block;
  font-size: 1.5rem;
  letter-spacing: -0.04em;
}

.request-button {
  width: auto;
  min-width: 180px;
  margin-top: 0;
}

.document-box {
  margin-top: 18px;
  background: #f7f7f7;
  border: 1px solid var(--uber-border);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-weight: 600;
}

.map-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.map-head h3 {
  margin: 4px 0 0;
  font-size: 1.18rem;
  letter-spacing: -0.03em;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  background: rgba(6, 193, 103, 0.12);
  color: var(--uber-green-dark);
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.75rem;
}

.map-canvas,
.map-fallback {
  width: 100%;
  height: 360px;
  border-radius: 20px;
  background: #e9e9e9;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--uber-border);
}

.map-fallback {
  background: linear-gradient(180deg, #eef2f0 0%, #dfe9e5 100%);
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 28px 28px;
}

.pin {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 10px 18px rgba(0,0,0,0.18);
}

.pickup-pin {
  background: var(--uber-green);
  left: 30%;
  top: 38%;
}

.destination-pin {
  background: var(--uber-red);
  right: 20%;
  top: 50%;
}

.route-line {
  position: absolute;
  left: 36%;
  top: 45%;
  width: 38%;
  height: 2px;
  background: linear-gradient(90deg, var(--uber-green), var(--uber-red));
  transform: rotate(-14deg);
}

.map-label {
  position: absolute;
  background: rgba(255,255,255,0.9);
  color: #111111;
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 12px 16px rgba(17,17,17,0.08);
}

.pickup-label {
  left: 18%;
  top: 18%;
}

.destination-label {
  right: 12%;
  bottom: 18%;
}

.driver-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  background: #f8f8f8;
  border: 1px solid var(--uber-border);
  border-radius: 18px;
  padding: 14px 16px;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(180deg, #111111 0%, #2a2a2a 100%);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.driver-meta {
  flex: 1;
}

.driver-meta strong {
  display: block;
  margin-bottom: 3px;
}

.driver-meta p {
  margin: 0;
  color: var(--uber-muted);
  font-size: 0.82rem;
}

.rating {
  background: rgba(6, 193, 103, 0.12);
  color: var(--uber-green-dark);
  font-weight: 700;
  padding: 8px 10px;
  border-radius: 999px;
}

.trip-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.trip-stat-grid > div {
  background: #f9f9f9;
  border: 1px solid var(--uber-border);
  border-radius: 14px;
  padding: 12px 10px;
}

.trip-stat-grid small {
  display: block;
  color: var(--uber-muted);
  margin-bottom: 5px;
}

.trip-stat-grid strong {
  font-size: 1rem;
}

.trip-progress {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8f8f8;
  border: 1px solid var(--uber-border);
  border-radius: 18px;
  padding: 16px;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333333;
  font-weight: 600;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d6d6d6;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #d6d6d6;
}

.progress-dot.done {
  background: var(--uber-green);
  box-shadow: 0 0 0 1px rgba(6, 193, 103, 0.25);
}

.progress-dot.active {
  background: #111111;
  box-shadow: 0 0 0 1px rgba(17, 17, 17, 0.2);
}

@media (max-width: 980px) {
  .uber-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .uber-shell {
    padding: 18px 14px 28px;
  }

  .uber-topbar,
  .panel-header,
  .fare-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-login-box,
  .driver-form,
  .ride-options,
  .trip-stat-grid {
    grid-template-columns: 1fr;
  }

  .mode-toggle {
    width: 100%;
    justify-content: space-between;
  }

  .mode-toggle button {
    flex: 1;
  }
}

