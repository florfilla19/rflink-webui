<template>
  <div>
    <h1 class="page-title">Système</h1>
    <p class="page-subtitle">Informations sur RFLink32 et le projet</p>

    <div class="container info-card">
      <div class="brand-block">
        <div class="brand-mark">◉</div>
        <div>
          <h2>RFLink-ESP</h2>
          <p>Interface web RFLink32</p>
        </div>
      </div>

      <div class="info-list">
        <div class="info-row"><span>Version firmware</span><strong>X.X.X</strong></div>
        <div class="info-row"><span>Version WebUI</span><strong>0.1.0</strong></div>
        <div class="info-row">
          <span>Firmware</span>
          <a href="https://github.com/cpainchaud/RFLink32" target="_blank" rel="noopener">GitHub RFLink32 ↗</a>
        </div>
        <div class="info-row">
          <span>WebUI historique</span>
          <a href="https://github.com/cpainchaud/rflink-webui" target="_blank" rel="noopener">GitHub WebUI ↗</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Infos"
};
</script>

<style scoped>
.info-card {
  max-width: 820px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-bottom: 18px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--rf-border);
}

.brand-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  color: #fff;
  background: var(--rf-primary);
  border-radius: 12px;
}

.brand-block h2 {
  margin: 0;
}

.brand-block p {
  margin: 3px 0 0;
  color: var(--rf-muted);
  font-size: .76rem;
}

.info-row a {
  color: var(--rf-primary);
  text-decoration: none;
  font-weight: 600;
}
</style>
