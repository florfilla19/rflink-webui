<template>
  <div class="dashboard">
    <div class="page-heading">
      <div>
        <h1 class="page-title">Bienvenue sur RFLink32</h1>
        <p class="page-subtitle">Votre passerelle RF pour la maison connectée</p>
      </div>
    </div>

    <div v-if="loaded" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">◷</div>
        <div>
          <span class="stat-label">Uptime</span>
          <strong>{{ status.uptime | sec_to_human }}</strong>
          <small class="state-ok">● En ligne</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">◉</div>
        <div>
          <span class="stat-label">Réception RF</span>
          <strong>{{ status.signal.received_signal_count || 0 }}</strong>
          <small>{{ status.signal.successfully_decoded_count || 0 }} décodés</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⌁</div>
        <div>
          <span class="stat-label">Wi-Fi</span>
          <strong>{{ wifiStatusLabel }}</strong>
          <small>{{ wifiIp }}</small>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">◇</div>
        <div>
          <span class="stat-label">MQTT</span>
          <strong :class="statusClass(status.mqtt && status.mqtt.status)">{{ mqttStatusLabel }}</strong>
          <small>{{ status.mqtt && status.mqtt.status ? status.mqtt.status : "—" }}</small>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <section class="container system-card">
        <div class="section-heading">
          <div>
            <h2>Informations système</h2>
            <p>État actuel de la passerelle</p>
          </div>
        </div>

        <div class="info-list">
          <div class="info-row">
            <span>Version firmware</span>
            <strong>{{ status.sw_version || "—" }}</strong>
          </div>
          <div class="info-row">
            <span>Adresse IP</span>
            <strong>{{ wifiIp }}</strong>
          </div>
          <div class="info-row">
            <span>Wi-Fi</span>
            <strong :class="statusClass(wifiStatus)">{{ wifiStatusLabel }}</strong>
          </div>
          <div class="info-row">
            <span>Serial2Net</span>
            <strong>{{ serialStatusLabel }}</strong>
          </div>
        </div>
      </section>

      <section class="container controls-card">
        <div class="section-heading">
          <div>
            <h2>Contrôles</h2>
            <p>Actions sur la passerelle</p>
          </div>
        </div>
        <button class="btn-green control-button" @click="esp_reboot">↻ &nbsp; Redémarrer</button>
      </section>
    </div>

    <section class="container">
      <div class="section-heading">
        <div>
          <h2>Activité RF</h2>
          <p>Compteurs fournis par le firmware</p>
        </div>
        <span class="activity-badge">RF actif</span>
      </div>

      <div class="activity-grid">
        <div class="activity-item">
          <span>Paquets reçus</span>
          <strong>{{ status.signal.received_signal_count || 0 }}</strong>
        </div>
        <div class="activity-item">
          <span>Décodés</span>
          <strong>{{ status.signal.successfully_decoded_count || 0 }}</strong>
        </div>
        <div class="activity-item">
          <span>Serial2Net</span>
          <strong>{{ status.serial2net && status.serial2net.clients_count || 0 }} client(s)</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { api_mixin } from "../api_mixin";

export default {
  name: "Home",
  mixins: [api_mixin],
  data() {
    return {
      polling: null
    };
  },
  computed: {
    loaded() {
      return this.status.network !== undefined && this.status.uptime !== 0;
    },
    wifiStatus() {
      return this.status.network &&
        this.status.network.wifi_client &&
        this.status.network.wifi_client.status
        ? this.status.network.wifi_client.status
        : "disabled";
    },
    wifiStatusLabel() {
      return this.wifiStatus === "connected" ? "Connecté" : this.wifiStatus;
    },
    wifiIp() {
      return this.status.network &&
        this.status.network.wifi_client &&
        this.status.network.wifi_client.ip
        ? this.status.network.wifi_client.ip
        : "—";
    },
    mqttStatusLabel() {
      const value = this.status.mqtt && this.status.mqtt.status;
      if (value === "connected") return "Connecté";
      if (value === "disabled") return "Désactivé";
      return value || "—";
    },
    serialStatusLabel() {
      return this.status.serial2net && this.status.serial2net.status
        ? this.status.serial2net.status
        : "—";
    }
  },
  methods: {
    statusClass(value) {
      return value ? "status-" + value : "";
    }
  },
  mounted() {
    this.reload_status();
    this.polling = setInterval(() => this.reload_status(), 10000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 112px;
  padding: 17px;
  background: var(--rf-surface);
  border: 1px solid var(--rf-border);
  border-radius: var(--rf-radius);
  box-shadow: var(--rf-shadow);
}

.stat-icon {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  color: var(--rf-primary);
  background: #eaf4ff;
  border-radius: 11px;
  font-size: 1.35rem;
}

.stat-card > div:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.stat-label {
  color: var(--rf-muted);
  font-size: .76rem;
  font-weight: 600;
}

.stat-card strong {
  margin: 3px 0;
  color: var(--rf-text);
  font-size: 1.02rem;
}

.stat-card small {
  color: var(--rf-muted);
  font-size: .7rem;
}

.state-ok {
  color: var(--rf-success) !important;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(260px, .75fr);
  gap: 16px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 16px;
}

.section-heading h2 {
  margin-bottom: 4px;
}

.section-heading p {
  margin: 0;
  color: var(--rf-muted);
  font-size: .76rem;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 0;
  border-bottom: 1px solid #edf2f7;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row span {
  color: var(--rf-muted);
  font-size: .82rem;
}

.info-row strong {
  max-width: 65%;
  color: var(--rf-text);
  font-size: .82rem;
  text-align: right;
  overflow-wrap: anywhere;
}

.control-button {
  width: 100%;
  margin-top: 6px;
}

.activity-badge {
  padding: 5px 9px;
  color: var(--rf-success);
  background: rgba(16, 166, 106, .09);
  border-radius: 999px;
  font-size: .7rem;
  font-weight: 700;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.activity-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 15px;
  background: var(--rf-surface-soft);
  border: 1px solid var(--rf-border);
  border-radius: 9px;
}

.activity-item span {
  color: var(--rf-muted);
  font-size: .75rem;
}

.activity-item strong {
  color: var(--rf-text);
  font-size: 1.05rem;
}

@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: 88px;
  }
}
</style>
