<template>
  <div>
    <h1 class="page-title">MQTT & Services</h1>
    <p class="page-subtitle">Services réseau et accès à l'interface</p>

    <div class="container">
      <h2>Portail Web</h2>
      <table>
        <AutoTypeField v-for="field in fields_portal" :key="field.key" :configuration="field" @input="updateValue_portal(field, $event)" />
      </table>
      <div class="form-actions">
        <button class="btn-green" @click="save_config">▣ &nbsp; Enregistrer</button>
      </div>
    </div>

    <div class="container">
      <h2>MQTT</h2>
      <table>
        <AutoTypeField v-for="field in fields_mqtt" :key="field.key" :configuration="field" @input="updateValue_mqtt(field, $event)" />
      </table>
      <div class="form-actions">
        <button class="btn-green" @click="save_config">▣ &nbsp; Enregistrer</button>
      </div>
    </div>

    <div class="container">
      <h2>Serial2Net</h2>
      <table>
        <AutoTypeField v-for="field in fields_ser2net" :key="field.key" :configuration="field" @input="updateValue_ser2net(field, $event)" />
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
  name: "Services",
  mixins: [api_mixin],
  components: { AutoTypeField },
  computed: {
    fields_portal() {
      if (this.config.portal == null) return [];
      return Object.keys(this.config.portal).map(generateKeysMapper(this.config, "portal", "")).filter(x => !!x).sort(sortFunction);
    },
    fields_mqtt() {
      if (this.config.mqtt == null) return [];
      return Object.keys(this.config.mqtt).map(generateKeysMapper(this.config, "mqtt", "")).filter(x => !!x).sort(sortFunction);
    },
    fields_ser2net() {
      if (this.config.serial2net == null) return [];
      return Object.keys(this.config.serial2net).map(generateKeysMapper(this.config, "serial2net", "")).filter(x => !!x).sort(sortFunction);
    }
  },
  methods: {
    updateValue_portal(field, value) {
      this.config.portal[field.key] = value;
    },
    updateValue_mqtt(field, value) {
      this.config.mqtt[field.key] = value;
    },
    updateValue_ser2net(field, value) {
      this.config.serial2net[field.key] = value;
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
