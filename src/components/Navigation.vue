<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ 'sidebar-open': mobileOpen }">
      <div class="brand">
        <div class="brand-mark">◉</div>
        <div class="brand-copy">
          <strong>RFLink32</strong>
          <span>RF gateway</span>
        </div>
      </div>

      <nav class="sidebar-nav" aria-label="Navigation principale">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" @click.native="mobileOpen = false">
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <span class="online-dot"></span>
        <div>
          <strong>{{ hostname || "RFLink-ESP" }}</strong>
          <small>{{ ip || "Connexion..." }}</small>
        </div>
      </div>
    </aside>

    <div v-if="mobileOpen" class="mobile-backdrop" @click="mobileOpen = false"></div>

    <main class="main-shell">
      <header class="topbar">
        <button class="icon-button mobile-toggle" type="button" aria-label="Ouvrir le menu" @click="mobileOpen = true">☰</button>

        <div class="connection">
          <span class="online-dot"></span>
          <span>Connecté</span>
          <span class="separator">•</span>
          <span class="connection-chip">ESP32-C3</span>
          <span class="connection-chip">CC1101</span>
        </div>

        <div class="topbar-actions">
          <button class="icon-button" type="button" :aria-label="darkMode ? 'Activer le mode clair' : 'Activer le mode sombre'" @click="toggleDarkMode">
            {{ darkMode ? "☀" : "☾" }}
          </button>
          <button class="icon-button" type="button" aria-label="Actualiser" @click="$root.$emit('reload_btn')">↻</button>
        </div>
      </header>

      <section class="content">
        <slot></slot>
      </section>
    </main>

    <VueTitle :title="title" />
  </div>
</template>

<script>
import VueTitle from "./VueTitle";
import axios from "axios";

export default {
  name: "Navigation",
  components: { VueTitle },
  data() {
    return {
      mobileOpen: false,
      darkMode: localStorage.getItem("rflink-dark-mode") === "1",
      hostname: "",
      ip: "",
      interval: null,
      navItems: [
        { path: "/home", label: "Accueil", icon: "⌂" },
        { path: "/radio", label: "Radio", icon: "◉" },
        { path: "/wifi", label: "Réseau", icon: "⌁" },
        { path: "/signal", label: "Paramètres RF", icon: "◌" },
        { path: "/services", label: "MQTT & Services", icon: "◇" },
        { path: "/plugins", label: "Plugins", icon: "✣" },
        { path: "/firmware", label: "Firmware", icon: "⇧" },
        { path: "/infos", label: "Système", icon: "ⓘ" }
      ]
    };
  },
  computed: {
    title() {
      let out = "RFLink32";
      if (this.hostname) out += " | " + this.hostname;
      return out;
    }
  },
  mounted() {
    this.applyTheme();
    this.loadIdentity();
    this.interval = setInterval(this.loadIdentity, 5000);
  },
  beforeDestroy() {
    if (this.interval) clearInterval(this.interval);
  },
  methods: {
    loadIdentity() {
      axios.get("/api/status").then(response => {
        const wifi = response.data && response.data.network && response.data.network.wifi_client;
        if (wifi && wifi.ip) this.ip = wifi.ip;
      }).catch(() => {});

      axios.get("/api/config").then(response => {
        if (response.data && response.data.wifi) {
          this.hostname = response.data.wifi.client_hostname || "";
        }
      }).catch(() => {});
    },
    applyTheme() {
      document.documentElement.classList.toggle("dark-theme", this.darkMode);
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("rflink-dark-mode", this.darkMode ? "1" : "0");
      this.applyTheme();
    }
  }
};
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--rf-bg);
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  width: 238px;
  background: linear-gradient(180deg, var(--rf-sidebar), #071e33);
  color: #dceaf7;
  box-shadow: 6px 0 24px rgba(4, 24, 43, .08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 76px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #fff;
  background: var(--rf-primary);
  border-radius: 10px;
  font-size: 18px;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-copy strong {
  color: #fff;
  font-size: 1.03rem;
}

.brand-copy span {
  color: #89a3ba;
  font-size: .7rem;
}

.sidebar-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 18px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 0 12px;
  color: #a9bfd3;
  border-radius: 9px;
  text-decoration: none;
  font-size: .88rem;
  transition: background .15s, color .15s;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255,255,255,.07);
}

.nav-item.router-link-active {
  color: #fff;
  background: var(--rf-primary);
  box-shadow: 0 5px 14px rgba(8, 124, 242, .25);
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 1.05rem;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 12px;
  padding: 12px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 9px;
}

.sidebar-footer strong,
.sidebar-footer small {
  display: block;
}

.sidebar-footer strong {
  color: #fff;
  font-size: .78rem;
}

.sidebar-footer small {
  margin-top: 3px;
  color: #88a4ba;
  font-size: .68rem;
}

.online-dot {
  display: inline-block;
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  background: var(--rf-success);
  border-radius: 50%;
}

.main-shell {
  min-height: 100vh;
  margin-left: 238px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 0 28px;
  background: var(--rf-surface);
  border-bottom: 1px solid var(--rf-border);
}

.connection,
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.connection {
  color: var(--rf-text);
  font-size: .78rem;
  font-weight: 600;
}

.separator {
  color: var(--rf-border);
}

.connection-chip {
  color: var(--rf-muted);
  font-weight: 500;
}

.icon-button {
  display: inline-grid;
  width: 34px;
  height: 34px;
  min-height: 34px;
  padding: 0;
  place-items: center;
  color: var(--rf-text);
  background: transparent;
  border-radius: 8px;
  font-size: 1.1rem;
}

.icon-button:hover {
  background: var(--rf-surface-soft);
}

.mobile-toggle {
  display: none;
}

.content {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 28px;
}

.mobile-backdrop {
  display: none;
}

@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform .2s ease;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .main-shell {
    margin-left: 0;
  }

  .mobile-toggle {
    display: inline-grid;
  }

  .topbar {
    padding: 0 16px;
  }

  .mobile-backdrop {
    position: fixed;
    inset: 0;
    z-index: 25;
    display: block;
    background: rgba(3, 17, 30, .48);
  }

  .content {
    padding: 20px 16px;
  }
}

@media (max-width: 560px) {
  .connection-chip,
  .separator {
    display: none;
  }

  .connection {
    margin-left: 8px;
  }
}
</style>
