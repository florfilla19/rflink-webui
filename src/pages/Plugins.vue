<template>
  <div>
    <h1 class="page-title">Plugins</h1>
    <p class="page-subtitle">Activez ou désactivez les extensions disponibles</p>

    <div class="container">
      <div class="plugin-list">
        <div v-for="plugin in plugins" :key="plugin.key" class="plugin-row">
          <div>
            <strong>{{ plugin.name }}</strong>
            <span>{{ plugin.key }}</span>
          </div>
          <label class="switch">
            <input v-model="plugin.enabled" type="checkbox">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-green">▣ &nbsp; Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script>
import { api_mixin } from "../api_mixin";

export default {
  name: "Plugins",
  mixins: [api_mixin],
  data() {
    return {
      plugins: [
        { name: "Plugin A", key: "azerty", enabled: true },
        { name: "Plugin B", key: "qwerty", enabled: false },
        { name: "Plugin C", key: "abcdef", enabled: true },
        { name: "Plugin D", key: "aqwzsx", enabled: false },
        { name: "Plugin F", key: "qsdfgh", enabled: false }
      ]
    };
  }
};
</script>

<style scoped>
.plugin-list {
  display: flex;
  flex-direction: column;
}

.plugin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 14px 4px;
  border-bottom: 1px solid #edf2f7;
}

.plugin-row:last-child {
  border-bottom: 0;
}

.plugin-row strong,
.plugin-row span {
  display: block;
}

.plugin-row strong {
  color: var(--rf-text);
  font-size: .84rem;
}

.plugin-row span {
  margin-top: 3px;
  color: var(--rf-muted);
  font-size: .7rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
