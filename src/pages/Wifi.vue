<template>
  <div>
    <h1 class="page-title">Configuration réseau</h1>
    <p class="page-subtitle">Paramètres du Wi-Fi client et du point d'accès</p>

    <div class="container">
      <h2>Wi-Fi client</h2>
      <table>
        <AutoTypeField v-for="field in fields_client" :key="field.key" :configuration="field" @input="updateValue_wifi(field, $event)" />
      </table>
      <div class="form-actions">
        <button class="btn-green" @click="save_config">▣ &nbsp; Enregistrer</button>
      </div>
    </div>

    <div class="container">
      <h2>Point d'accès</h2>
      <table>
        <AutoTypeField v-for="field in fields_ap" :key="field.key" :configuration="field" @input="updateValue_wifi(field, $event)" />
      </table>
      <div class="form-actions">
        <button class="btn-green" @click="save_config">▣ &nbsp; Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script>
import { api_mixin } from "../api_mixin";
import AutoTypeField from "../components/AutoTypeField";
import { generateKeysMapper, sortFunction } from "../definitons";

export default {
  name: "Wifi",
  mixins: [api_mixin],
  components: { AutoTypeField },
  computed: {
    fields_client() {
      if (this.config.wifi == null) return [];
      return Object.keys(this.config.wifi).map(generateKeysMapper(this.config, "wifi", "client")).filter(x => !!x).sort(sortFunction);
    },
    fields_ap() {
      if (this.config.wifi == null) return [];
      return Object.keys(this.config.wifi).map(generateKeysMapper(this.config, "wifi", "ap")).filter(x => !!x).sort(sortFunction);
    }
  },
  methods: {
    updateValue_wifi(field, value) {
      this.config.wifi[field.key] = value;
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

.form-actions button {
  min-width: 150px;
}

@media (max-width: 560px) {
  .form-actions button {
    width: 100%;
  }
}
</style>
