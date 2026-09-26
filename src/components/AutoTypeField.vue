<template>
  <tr v-if="!hidden" class="config-row">
    <td class="config-label">
      <div>{{ configuration.name }}</div>
      <small v-if="configuration.comment">{{ configuration.comment }}</small>
    </td>
    <td class="config-control">
      <div class="input-container" v-if="html_type_group === 'checkbox'">
        <label class="switch">
          <input :disabled="disabled" :checked="configuration.value" @input="porpagate_value_update($event.target.checked)" :type="html_data_type">
          <span class="slider round"></span>
        </label>
      </div>

      <div class="input-container" v-else-if="html_type_group === 'input'">
        <input
          :disabled="disabled"
          :class="{ invalid: !is_valid }"
          :placeholder="configuration.value"
          :value="local_value"
          @input="porpagate_value_update($event.target.value)"
          :type="html_data_type"
          :min="configuration.constraints.min"
          :max="configuration.constraints.max"
          :minlength="configuration.constraints.length_min"
          :maxlength="configuration.constraints.length_max"
        >
      </div>

      <div class="input-container" v-else-if="html_type_group === 'select'">
        <select v-if="html_data_type !== null" :disabled="disabled" required :value="local_value" @input="porpagate_value_update($event.target.value)">
          <template v-if="Array.isArray(configuration.enum)">
            <option v-for="option in configuration.enum" :key="configuration.key+'_'+option" :value="option">{{ option }}</option>
          </template>
          <template v-else>
            <option v-for="key in Object.keys(configuration.enum)" :key="configuration.key+'_'+key" :value="key">{{ configuration.enum[key] }}</option>
          </template>
        </select>
        <p v-else>Type enum&lt;{{ configuration.type }}&gt; non supporté</p>
      </div>

      <div class="input-container" v-else-if="html_type_group === 'upload'">
        <FileUploader :configuration="configuration" :disabled="disabled"/>
      </div>

      <div v-else>
        <p>Type {{ configuration.type }} non supporté</p>
      </div>
    </td>
    <td class="config-help">
      <Icon v-if="configuration.notice_message" icon="notice">{{ configuration.notice_message }}</Icon>
      <Icon v-if="configuration.warning_message" icon="warning">{{ configuration.warning_message }}</Icon>
    </td>
  </tr>
</template>

<script>
import Icon from "./Icon";
import FileUploader from "@/components/FileUploader.vue";

export default {
  name: "AutoTypeField",
  components: { FileUploader, Icon },
  props: ["configuration"],
  data() {
    return {
      local_value: this.configuration.value
    };
  },
  watch: {
    configuration: function (n) {
      this.local_value = n.value;
    }
  },
  computed: {
    disabled() {
      let should_enable = true;
      for (let i = 0; i < this.configuration.enabled_by.length; i++) {
        if (this.configuration.enabled_by_config[this.configuration.enabled_by[i]] === false) should_enable = false;
      }

      let should_disable = false;
      for (let i = 0; i < this.configuration.disabled_by.length; i++) {
        if (this.configuration.disabled_by_config[this.configuration.disabled_by[i]] === true) should_disable = true;
      }

      return should_disable || !should_enable;
    },
    hidden() {
      return this.configuration.hide_on_disabled && this.disabled;
    },
    is_valid() {
      switch (this.configuration.type) {
        case "bool":
          return true;
        case "int":
          return !isNaN(Number.parseInt(this.local_value));
        case "double":
          return !isNaN(Number.parseFloat(this.local_value));
        case "text":
        case "password":
        case "string":
          return true;
        case "ipaddress":
          return this.local_value && this.local_value.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/) != null;
      }
      return false;
    },
    html_type_group() {
      if (this.configuration.enum !== null && this.configuration.enum !== undefined) return "select";
      switch (this.configuration.type) {
        case "bool":
          return "checkbox";
        case "int":
        case "double":
        case "string":
        case "text":
        case "ipaddress":
        case "password":
          return "input";
        default:
          return this.configuration.type;
      }
    },
    html_data_type() {
      switch (this.configuration.type) {
        case "bool":
          return "checkbox";
        case "int":
        case "double":
          return "number";
        case "string":
        case "text":
        case "ipaddress":
          return "text";
        case "password":
          return "password";
      }
      return null;
    }
  },
  methods: {
    porpagate_value_update(value) {
      let new_val = value;
      this.local_value = value;

      if (this.configuration.type === "int") new_val = Math.round(Number.parseInt(value));
      if (this.configuration.type === "double") new_val = Number.parseFloat(value);

      if (this.is_valid) this.$emit("input", new_val);
    }
  }
};
</script>

<style scoped>
.config-row td {
  padding-top: 12px;
  padding-bottom: 12px;
}

.config-label {
  width: 34%;
  color: var(--rf-text);
  font-size: .84rem;
  font-weight: 600;
}

.config-label small {
  display: block;
  margin-top: 3px;
  color: var(--rf-muted);
  font-size: .7rem;
  font-weight: 400;
}

.config-control {
  width: 52%;
}

.config-help {
  width: 14%;
  color: var(--rf-muted);
  text-align: right !important;
}

.input-container {
  width: 100%;
}

.invalid {
  color: var(--rf-danger);
  border-color: var(--rf-danger) !important;
  background: #fff8f8 !important;
}

@media (max-width: 650px) {
  .config-label {
    width: 42%;
  }

  .config-control {
    width: 58%;
  }

  .config-help {
    display: none;
  }
}
</style>
