<template>
  <div>
    <h1 class="page-title">Paramètres RF</h1>
    <p class="page-subtitle">Réglages de capture et de décodage des signaux</p>

    <div class="container">
      <table>
        <AutoTypeField v-for="field in fields" :key="field.key" :configuration="field" @input="updateValue(field, $event)" />
      </table>
      <div class="form-actions">
        <button class="btn-green" @click="save_config">▣ &nbsp; Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script>
import { generateKeysMapper, sortFunction } from "../definitons";
import AutoTypeField from "../components/AutoTypeField";
import { api_mixin } from "../api_mixin";

export default {
  name: "Signal",
  components: { AutoTypeField },
  mixins: [api_mixin],
  computed: {
    fields() {
      if (this.config.signal == null) return [];
      return Object.keys(this.config.signal).map(generateKeysMapper(this.config, "signal", "")).filter(x => !!x).sort(sortFunction);
    }
  },
  methods: {
    updateValue(signal, value) {
      this.config.signal[signal.key] = value;
    }
  }
};
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

@media (max-width: 560px) {
  .form-actions button {
    width: 100%;
  }
}
</style>
