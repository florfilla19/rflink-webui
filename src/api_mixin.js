import axios from "axios";
import Swal from "sweetalert2";

import { capitalize } from "./utils"
import { generateConstraintErrorsReport } from "./definitons"

export const api_mixin = {
	data: function () {
		return {
			config: {
				portal: {},
				mqtt: {},
				wifi: {},
				signal: {},
				radio: {},
				serial2net: {},
			},
			status: {
				uptime: 0,
				network: {},
				plugins: {}
			},
			api_failures: {
				status: 0,
				config: 0
			}
		}
	},
	mounted() {
		this.reload_config();
		this.$root.$on('reload_btn', this.reloadevent_handler)
	},
	unmounted() {
		this.$root.$off('reload_btn', this.reloadevent_handler)
	},
	methods: {
		reloadevent_handler() {
			this.config = {
				portal: {},
				mqtt: {},
				wifi: {},
				signal: {},
				radio: {}
			}
			this.reload_config();
			this.reload_status();
		},
		async request_get(endpoint, type) {
			const max_attempts = 3;
			const retry_delay = 350;

			for (let attempt = 1; attempt <= max_attempts; attempt++) {
				try {
					return await axios.get(endpoint, { timeout: 2500 });
				} catch (error) {
					if (attempt < max_attempts) {
						await new Promise(resolve => setTimeout(resolve, retry_delay * attempt));
					} else {
						this.api_failures[type] += 1;
						// GET requests are used for polling/status information. A
						// transient Wi-Fi/ESP response loss must not create a toast
						// every few seconds and obscure the page.
						console.warn("RFLink32 API temporarily unavailable:", endpoint, error.message || error);
					}
				}
			}

			return null;
		},
		async reload_status() {
			const response = await this.request_get("/api/status", "status");
			if (!response) return;

			this.api_failures.status = 0;
			this.$set(this,"status",response.data);
		},
		async reload_config() {
			const response = await this.request_get("/api/config", "config");
			if (!response) return;

			this.api_failures.config = 0;
			this.$set(this,"config",response.data);
		},
		save_config() {
			const errors = generateConstraintErrorsReport(this.config)
			if(errors.length>0) {
				let list="<ul>"
				for(const error of errors) {
					list+=`<li><b>${capitalize(error.sub_config_key)} ${capitalize(error.key.replaceAll("_"," "))}</b> failed ${error.failed_constraint} constraint, value is <b>"${error.value}"</b> constraint expected <b>${error.expected}</b></li>`
				}
				list+="</ul>"


				Swal.fire({
					title: 'Error!',
					html: "It seems that there are errors in the configuration, make sure you correct them before updating the configuration.<br><br>"+list+"<br>If you think it's a bug feel free to report it on github",
					icon: 'error',
					confirmButtonText: 'Continue'
				})

				return;
			}
			axios.post("/api/config", this.config).then(response => {
				this.reload_config();
				if(response.data.success) {
					if(response.data.message) {
						Swal.fire({
							title: 'Warning!',
							html: response.data.message,
							icon: 'warning',
							confirmButtonText: 'Continue'
						})
						//this.$toasts.push({ type: 'warning', message: response.data.message, duration:5000 })
					} else {
						Swal.fire({
							title: 'Success!',
							html: 'Operation is a success',
							icon: 'success',
							confirmButtonText: 'Ok'
						})
						//this.$toasts.push({ type: 'success', message: 'Operation is a success' })
					}
				} else {
					Swal.fire({
						title: 'Error!',
						html: response.data.message,
						icon: 'error',
						confirmButtonText: 'Continue'
					})
					//this.$toasts.push({ type: 'error', message: response.data.message, duration:10000 })
				}
				console.info(response)
			}).catch(error => {
				console.error(error)
				Swal.fire({
					title: 'Error!',
					html: 'A network error occured while saving: '+error,
					icon: 'error',
					confirmButtonText: 'Continue'
				})
				//this.$toasts.push({ type: 'error', message: 'A network error occured while saving: '+error, duration:10000 })
			});
		},
		esp_reboot() {
			axios.get("/api/reboot").then(() => {
				Swal.fire({
					title: 'Success!',
					html: 'ESP Will now reboot',
					icon: 'success',
					confirmButtonText: 'Ok'
				})
				//this.$toasts.push({ type: 'success', message: 'ESP Will now reboot' })
			}).catch(error => {
				Swal.fire({
					title: 'Error!',
					html: 'A network error occured while saving: '+error,
					icon: 'error',
					confirmButtonText: 'Continue'
				})
				//this.$toasts.push({ type: 'error', message: 'A network error occured while asking for a reboot: '+error, duration:10000 })
			});
		}
	}
}
