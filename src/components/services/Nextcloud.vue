<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down monospace"> free:{{ freespace }} </span>
          <span class="up monospace"> usage:{{ usage }}% </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <p v-if="!error" class="active">
        dau: {{ activeusers }}<br />
        files: {{ numfiles }}
      </p>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";
import { Buffer } from "buffer";

const units = ["B", "KB", "MB", "GB", "TB"];

const formatFreespace = (free) => {
  let i = 0;
  while (free > 1000 && i < units.length) {
    free /= 1000;
    i++;
  }
  return (
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      free || 0,
    ) + ` ${units[i]}`
  );
};
const formatUsage = (nextcloudInfo) => {
  let sys = nextcloudInfo.system;
  let mt = parseFloat(sys.mem_total);
  let mf = parseFloat(sys.mem_free);
  return Math.round(((mt - mf) / mt) * 1000) / 10;
};

export default {
  name: "Nextcloud",
  mixins: [service],
  props: { item: Object },
  components: { Generic },
  data: () => ({
    freespace: null,
    activeusers: null,
    numfiles: null,
    usage: null,
    error: null,
  }),
  computed: {},
  async created() {
    let nextcloudInfo = await this.fetchStatus();
    this.prepareOutput(nextcloudInfo);
  },
  methods: {
    fetchStatus: async function () {
      const options = {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.item.username}:${this.item.password}`,
          ).toString("base64")}`,
        },
      };
      return await this.fetch(
        "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
        options,
      )
        .then((serverinfo) => serverinfo?.ocs?.data)
        .catch((e) => {
          console.error(e);
          this.error = e.message;
        });
    },
    prepareOutput: function (nextcloudInfo) {
      this.usage = formatUsage(nextcloudInfo.nextcloud);
      this.freespace = formatFreespace(
        nextcloudInfo.nextcloud.system.freespace,
      );
      this.numfiles = nextcloudInfo.nextcloud.storage.num_files;
      this.activeusers = nextcloudInfo.activeUsers.last24hours;
    },
  },
};
</script>

<style scoped lang="scss">
.error {
  color: #e51111 !important;
}

.down {
  margin-right: 1em;
}

.active {
  color: var(--text);
  font-size: 0.8em;
}

.monospace {
  font-weight: 300;
  font-family: monospace;
}
</style>
