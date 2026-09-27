<template>
	<div>
		<h1 class="page-title">Firmware</h1>
		<p class="page-subtitle">Mise à jour et maintenance du firmware</p>
		<div class="container">
			<h2 style="margin: 5px 0;">OTA</h2>
			<table>
				<tr>
					<td>Enable OTA over wifi</td>
					<th><label class="switch" style="margin: 0 5px">
						<input type="checkbox">
						<span class="slider round"></span>
					</label></th>
				</tr>
				<tr>
					<td>OTA Password</td>
					<th><label>
						<input required placeholder="**********" type="password">
					</label></th>
				</tr>
			</table>
			<input type="submit" class="btn-green" value="Save">
		</div>

		<div class="container">
			<h2 style="margin: 5px 0 15px 0;">Update via upload</h2>

			<input ref="file" style="margin-bottom: 5px; margin-right: 10px; display: inline-block" type="file" id="myfile" v-on:change="handleFileUpload" name="myfile">
			<span v-if="file !== null" style="padding: 0; margin: 5px 0 10px 0;">{{ file.name }}</span>
			<p v-if="md5 !== ''" style="padding: 0; margin: 5px 0 10px 0;"><b>MD5:</b> {{ md5 }}</p>

			<Progress v-if="uploadPercentage>0" :percentage="this.uploadPercentage"></Progress>
			<input type="submit" @click="submitFile" class="btn-green" value="Flash">
		</div>

		<div class="container">
			<h2 style="margin: 5px 0 15px 0;">Update via HTTP URL</h2>
			<p v-if="releasesOffline" class="release-warning">
				Le catalogue distant est momentanément indisponible. Les versions mémorisées localement restent disponibles.
			</p>
				<tr>
					<td>
						<select v-model="selected_release">
							<option v-for="option in releases_types" v-bind:value="option.key" v-bind:key="option.key">
								{{ option.value | capitalize }}
							</option>
						</select>
					</td>
					<div style="padding: 0 8px" v-if="selected_release !== null">
						<td style="padding-right: 8px" >@</td>
						<td>
							<select v-model="selected_branch">
								<option v-for="option in release_branch" :selected="true" v-bind:value="option.key" v-bind:key="option.key">
									{{ option.value }}
								</option>
							</select>
						</td>
						<td style="padding: 0px 8px">on</td>
						<td>
							<select v-model="selected_hardware">
								<option v-for="option in release_hardware" :selected="true" v-bind:value="option.key" v-bind:key="option.key">
									{{ option.value }}
								</option>
							</select>
						</td>
					</div>
					<div style="padding: 0 8px" v-else>
						<th><label>
							<input v-model="manual_url" required placeholder="https://my.url/here" type="text">
						</label></th>
					</div>
				</tr>
				<tr v-if="selected_release !== null">
					<td colspan="4">
						<a :href="url">{{url}}</a>
					</td>
				</tr>

			<input style="margin-top: 8px" type="submit" class="btn-green" value="Flash" @click="handleUrlUpload">
		</div>
	</div>
</template>

<script>
	import axios from "axios";
	import {api_mixin} from "../api_mixin";
	import Swal from "sweetalert2";
	import Progress from "../components/Progress";
	import BMF from 'browser-md5-file';

	const bmf = new BMF();
	const RELEASES_CACHE_KEY = "rflink32-firmware-releases";
	const DEFAULT_RELEASES = {
		nightly_releases: [
			{
				name: "master",
				hardware: {
					esp32: "https://github.com/cpainchaud/RFLink32/releases/download/nightly/esp32-firmware-OTA.bin",
					"d1 mini": "https://github.com/cpainchaud/RFLink32/releases/download/nightly/esp8266-firmware.bin"
				}
			},
			{
				name: "RTL-433",
				hardware: {
					esp32: "https://github.com/cpainchaud/RFLink32/releases/download/nightly-RTL_433/esp32-firmware-OTA.bin"
				}
			}
		]
	};

	export default {
		name: "Firmware",
		components: {Progress},
		mixins: [api_mixin],
		computed: {
			releases_types() {
				const r = Object.keys(this.releases).map(key=> {
						return {
							key,
							value: key.replace("_"," ")
						}
					})
				r.push({key:null,value:"Manual"});
				return r
			},
			release_branch() {
				if (this.selected_release === null || this.releases[this.selected_release] === undefined) return []
				else {
					return this.releases[this.selected_release].map(b=>{
						return {
							key: b.name,
							value: b.name
						}
					})
				}
			},
			release_hardware() {
				if (this.selected_release === null || this.releases[this.selected_release] === undefined) return []
				let branch = this.releases[this.selected_release].filter(x=>{
					return x.name === this.selected_branch
				})
				if (branch.length !== 1) return []
				else branch = branch[0];

				return Object.keys(branch.hardware).map(key=> {
					return {
						key,
						value: key
					}
				})
			},
			url() {
				if (this.selected_release === null || this.releases[this.selected_release] === undefined) return this.manual_url
				else {
					let branch = this.releases[this.selected_release].filter(x=>{
						return x.name === this.selected_branch
					})
					if (branch.length !== 1) return ""
					else return branch[0].hardware[this.selected_hardware]
				}
			}
		},
		watch: {
			selected_release: function (newVal){
				if(newVal === undefined || newVal === null) return
				this.selected_branch = this.releases[newVal][0].name
			},
			selected_branch: function (newVal){
				if(this.selected_release === undefined || this.selected_release === null) return

				let branch = this.releases[this.selected_release].filter(x=>{
					return x.name === newVal
				})
				if (branch.length !== 1) return

				this.selected_hardware = Object.keys(branch[0].hardware)[0]
			}
		},
		data() {
			return {
				releases_url: "https://raw.githubusercontent.com/cpainchaud/RFLink32/special-ui-release/releases.json",
				releases: {},

				selected_release: null,
				selected_branch: null,
				selected_hardware: null,


				manual_url: "",
				uploadPercentage: 0,
				md5: "",
				file: null,
				polling: null,
				releasesOffline: false
			}
		},
		methods: {
			applyReleases(releases) {
				const keys = Object.keys(releases || {});
				if (keys.length === 0) return false;
				this.releases = releases;
				if (!this.selected_release || !releases[this.selected_release]) {
					this.selected_release = keys[0];
				}
				return true;
			},
			isValidReleases(data) {
				if (!data || typeof data !== "object" || Array.isArray(data)) return false;
				return Object.keys(data).some(key => {
					return Array.isArray(data[key]) && data[key].some(branch => {
						return branch && branch.name && branch.hardware && typeof branch.hardware === "object";
					});
				});
			},
			getReleases() {
				let hasFallback = false;

				// Load the last known catalogue immediately. This prevents a transient
				// GitHub/DNS/network problem from blocking the Firmware page.
				try {
					const cached = JSON.parse(localStorage.getItem(RELEASES_CACHE_KEY));
					if (this.isValidReleases(cached)) {
						this.applyReleases(cached);
						hasFallback = true;
						this.releasesOffline = true;
					}
				} catch (error) {
					console.warn("Invalid cached firmware releases", error);
				}

				if (!hasFallback) {
					this.applyReleases(DEFAULT_RELEASES);
					this.releasesOffline = true;
				}

				axios.get(this.releases_url, { timeout: 5000 }).then((response) => {
					if (!this.isValidReleases(response.data)) {
						throw new Error("Invalid releases catalogue");
					}
					this.applyReleases(response.data);
					this.releasesOffline = false;
					try {
						localStorage.setItem(RELEASES_CACHE_KEY, JSON.stringify(response.data));
					} catch (error) {
						console.warn("Unable to cache firmware releases", error);
					}
				}).catch((error) => {
					// This request is optional: the Firmware page must remain usable
					// when the browser temporarily cannot reach GitHub.
					console.warn("Firmware releases catalogue unavailable", error);
				});
			},
			handleUrlUpload() {
				axios.post( '/api/firmware/update_from_url', {url: this.url}).then(()=>{
					setTimeout(()=>{
						const interval = setInterval(()=>{
							axios.get( '/api/firmware/http_update_status').then((data)=> {

								if(data.data.status === "error") {
									clearInterval(interval)
									console.error(data.data.message)
									Swal.fire({
										title: 'Error!',
										html: 'A network error occured while saving: '+data.data.message,
										icon: 'error',
										confirmButtonText: 'Continue'
									})
								}

								else if(data.data.status === "in_progress" || data.data.status === "pending_reboot") {
									clearInterval(interval)
									Swal.fire({
										title: 'Downloading',
										html: 'The esp is now downloading the firmware',
										icon: 'info',
										confirmButtonText: 'Ok'
									})

									clearInterval(interval)
									this.startChecker();
								}



							})
						},1000)
					},750)
				}).catch((error)=>{
					console.error(error)
					Swal.fire({
						title: 'Error!',
						html: 'A network error occured while saving: '+error,
						icon: 'error',
						confirmButtonText: 'Continue'
					})
				});
			},

			handleFileUpload(){
				this.file = this.$refs.file.files[0];
				bmf.md5(this.file, (err, md5) => {
					this.md5 = md5
				}, progress => {
					if(progress<1) this.md5 = "Calculating " + Math.round(progress*10000)/100 + "%";
				});
			},
			submitFile(){
				if(this.file == null) {
					return Swal.fire({
						title: 'Error!',
						html: 'You didn\'t select a file',
						icon: 'error',
						confirmButtonText: 'Continue'
					})
				}

				let formData = new FormData();

				formData.append('upload', this.file);
				formData.append('md5', this.md5);

				axios.post( '/api/firmware/update', formData, {
						headers: { 'Content-Type': 'multipart/form-data' },
						onUploadProgress: function( progressEvent ) {
							this.uploadPercentage = Math.round(progressEvent.loaded / progressEvent.total * 10000) / 100;
						}.bind(this)
					}
				).then(()=>{
					Swal.fire({
						title: 'Success!',
						html: 'Operation is a success, the esp will now reboot',
						icon: 'info',
						confirmButtonText: 'Ok'
					})
					this.startChecker();
				}).catch((error)=>{
					console.error(error)
					Swal.fire({
						title: 'Error!',
						html: 'A network error occured while saving: '+error,
						icon: 'error',
						confirmButtonText: 'Continue'
					})
				});
			},

			startChecker() {
				this.polling = setInterval(() => {
					axios.get("/api/status").then((response) => {
						if(response.data.uptime > 30) return
						clearInterval(this.polling);

						Swal.fire({
							title: 'Success!',
							html: 'Reboot successful',
							icon: 'success',
							confirmButtonText: 'Ok'
						})

					}).catch(() => {});
				}, 2000)
			}
		},
		mounted () {
			this.getReleases()
		},
		beforeDestroy() {
			if(this.polling) clearInterval(this.polling);
		}
	}
</script>

<style scoped>
	@import url(../assets/components.css);




.release-warning {
		margin: -6px 0 14px;
		padding: 9px 12px;
		color: var(--rf-muted);
		background: var(--rf-surface-soft);
		border: 1px solid var(--rf-border);
		border-radius: 8px;
		font-size: .78rem;
	}

</style>
