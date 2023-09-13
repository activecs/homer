<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else>
          <div v-if="loading">
            <strong>Loading...</strong>
          </div>
          <div v-else-if="error">
            <strong class="danger">Error loading info</strong>
          </div>
          <div v-else class="metrics" :class="{ 'is-size-7-mobile': item.small_font_on_small_screens, 'is-small': item.small_font_on_desktop}">
            <span v-if="isValueShown('backups')" class="margined">
              Backups:<span class="has-text-weight-bold is-number healthy">{{ backupTasks }}</span>
            </span>
            <span v-if="isValueShown('disk')" class="margined">
              Disk:<span class="has-text-weight-bold is-number" :class="statusClass(datastoreUsage)">{{ datastoreUsage }}%</span>
            </span>
            <span v-if="isValueShown('disk')" class="margined">
              Full in:<span class="has-text-weight-bold is-number" :class="daysStatusClass(estimatedFullDate)">{{ estimatedFullDate }}</span> days
            </span>
            <span v-if="isValueShown('mem')" class="margined">
              Mem:<span class="has-text-weight-bold is-number" :class="statusClass(memoryUsage)">{{ memoryUsage }}%</span>
            </span>
            <span v-if="isValueShown('cpu')" class="margined">
              CPU:<span class="has-text-weight-bold is-number" :class="statusClass(cpuUsage)">{{ cpuUsage }}%</span></span>
          </div>
        </template>
      </p>
    </template>
    <template #indicator>
      <i v-if="loading" class="fa fa-circle-notch fa-spin fa-2xl"></i>
      <i v-if="error" class="fa fa-exclamation-circle fa-2xl danger"></i>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Proxmox",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    datastoreUsage: 0,
    backupTasks: 0,
    estimatedFullDate: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    failedTasks: [],
    error: false,
    loading: true,
  }),
  created() {
    if (this.item.hide) this.hide = this.item.hide;
    setInterval(() => this.fetchStatus(), 4000);
    this.fetchStatus();
  },
  methods: {
    statusClass(value) {
      if (value > this.item.danger_value) return "danger";
      if (value > this.item.warning_value) return "warning";
      return "healthy";
    },
    daysStatusClass(value) {
      if (value < 10) return "danger";
      if (value < 20) return "warning";
      return "healthy";
    },
    fetchStatus: async function () {
      try {
        const options = {
          headers: {
            Authorization: this.item.api_token,
          },
        };
        const status = await this.proxyFetch(`/pxbck/api2/json/nodes/${this.item.node}/status`,options);
        const datastoreUsage = await this.proxyFetch(`/pxbck/api2/json/status/datastore-usage`, options);
        const tasks = await this.proxyFetch(`/pxbck/api2/json/nodes/localhost/tasks`, options);
        const decimalsToShow = this.item.hide_decimals ? 0 : 1;

        this.cpuUsage = (status.data.cpu * 100).toFixed(decimalsToShow);
        this.memoryUsage = ((status.data.memory.used * 100) / status.data.memory.total).toFixed(decimalsToShow);
        const datastoreData = datastoreUsage.data.find((d) => d.store === this.item.datastore);
        this.datastoreUsage = ((datastoreData.used * 100) / datastoreData.total).toFixed(decimalsToShow);
        this.estimatedFullDate = this.diffBetweenDates(datastoreData["estimated-full-date"], Date.now());
        this.backupTasks = tasks.data.filter((t) => t.worker_type === "backup").length;

        this.error = false;
      } catch (err) {
        console.log(err);
        this.error = true;
      }
      this.loading = false;
    },
    diffBetweenDates(date1, date2) {
      const seconds = date1 - date2 / 1000;
      return Math.floor(seconds / 86400);
    },
    isValueShown(value) {
      return this.hide.indexOf(value) === -1;
    },
  },
};
</script>

<style scoped lang="scss">
.is-number {
  font-family: "Lato", serif;
}
.healthy {
  color: green;
}
.warning {
  color: orange;
}
.danger {
  color: red;
}
.metrics .margined:not(:first-child) {
  margin-left: 0.3rem;
}
.is-small {
  font-size: small;
}
</style>
