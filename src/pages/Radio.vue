<template>
  <div>
    <h1 class="page-title">Configuration radio</h1>
    <p class="page-subtitle">Paramètres de la liaison RF et des broches</p>

    <div class="radio-layout">
      <section class="container hardware-card">
        <div class="section-title">
          <div class="hardware-icon">◉</div>
          <div>
            <h2>Matériel radio</h2>
            <p>Sélectionnez le module utilisé par votre RFLink32.</p>
          </div>
        </div>

        <table>
          <AutoTypeField v-for="field in hardwareFields" :key="field.key" :configuration="field" @input="updateValue(field, $event)" />
        </table>
      </section>

      <section class="container notice-card">
        <strong>Information</strong>
        <p>Les broches disponibles dépendent du module radio sélectionné. Vérifiez le câblage avant d'enregistrer.</p>
      </section>
    </div>

    <div class="radio-columns">
      <section class="container">
        <div class="section-title">
          <div class="radio-title-icon">⌁</div>
          <h2>Réception (RX)</h2>
        </div>
        <table>
          <AutoTypeField v-for="field in rxFields" :key="field.key" :configuration="field" @input="updateValue(field, $event)" />
        </table>
      </section>

      <section class="container">
        <div class="section-title">
          <div class="radio-title-icon">⌁</div>
          <h2>Transmission (TX)</h2>
        </div>
        <table>
          <AutoTypeField v-for="field in txFields" :key="field.key" :configuration="field" @input="updateValue(field, $event)" />
        </table>
      </section>
    </div>

    <div class="save-bar">
      <button class="btn-green" @click="save_config">▣ &nbsp; Enregistrer les paramètres</button>
    </div>
  </div>
</template>

<script>
import { generateKeysMapper, sortFunction } from "../definitons";
import { api_mixin } from "../api_mixin";
import AutoTypeField from "../components/AutoTypeField";

export default {
  name: "Radio",
  mixins: [api_mixin],
  components: { AutoTypeField },
  computed: {
    allFields() {
      if (this.config.radio == null) return [];
      return Object.keys(this.config.radio)
        .map(generateKeysMapper(this.config, "radio", ""))
        .filter(x => !!x)
        .sort(sortFunction);
    },
    hardwareFields() {
      return this.allFields.filter(field => field.key === "hardware");
    },
    rxFields() {
      return this.allFields.filter(field => field.key.indexOf("rx_") === 0);
    },
    txFields() {
      return this.allFields.filter(field => field.key.indexOf("tx_") === 0);
    }
  },
  methods: {
    updateValue(field, value) {
      this.config.radio[field.key] = value;
    }
  }
};
</script>

<style scoped>
.radio-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, .8fr);
  gap: 16px;
  align-items: start;
}

.hardware-card {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 12px;
}

.section-title h2 {
  margin: 0;
}

.section-title p {
  margin: 3px 0 0;
  color: var(--rf-muted);
  font-size: .75rem;
}

.hardware-icon,
.radio-title-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  color: var(--rf-primary);
  background: #eaf4ff;
  border-radius: 10px;
}

.notice-card {
  margin-bottom: 0;
  color: var(--rf-text);
  background: var(--rf-surface-soft);
}

.notice-card strong {
  font-size: .82rem;
}

.notice-card p {
  margin: 7px 0 0;
  color: var(--rf-muted);
  font-size: .76rem;
  line-height: 1.5;
}

.radio-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.save-bar {
  position: sticky;
  bottom: 12px;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}

.save-bar button {
  width: auto;
  min-width: 260px;
}

@media (max-width: 850px) {
  .radio-layout,
  .radio-columns {
    grid-template-columns: 1fr;
  }

  .hardware-card,
  .notice-card {
    margin-bottom: 0;
  }
}

@media (max-width: 560px) {
  .save-bar button {
    width: 100%;
  }
}
</style>
