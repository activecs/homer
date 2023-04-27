<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down monospace">
            <p class="fas fa-download"></p>
            {{ downRate }}
          </span>
          <span class="up monospace">
            <p class="fas fa-upload"></p>
            {{ upRate }}
          </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <span v-if="!error" class="active"
        >active:{{ active }}, inactive:{{ inactive }}
      </span>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";
import {TransmissionClient} from "transmission-rpc-client/src/client/Client";
import {GetTorrentRequest} from "transmission-rpc-client/src/model/torrent/GetTorrent";
const units = ["B", "KB", "MB", "GB"];

// Take the rate in bytes and keep dividing it by 1k until the lowest
// value for which we have a unit is determined. Return the value with
// up to two decimals as a string and unit/s appended.
const displayRate = (rate) => {
  let i = 0;

  while (rate > 1000 && i < units.length) {
    rate /= 1000;
    i++;
  }
  return (
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      rate || 0
    ) + ` ${units[i]}/s`
  );
};

export default {
  name: "Transmission",
  mixins: [service],
  props: { item: Object },
  components: { Generic },
  data: () => ({ dl: null, ul: null, active: null, inactive: null, error: null }),
  computed: {
    downRate: function () {
      return displayRate(this.dl);
    },
    upRate: function () {
      return displayRate(this.ul);
    },
  },
  created() {
    const client = new TransmissionClient({host: this.item.xmlrpc});
    const rateInterval = parseInt(this.item.rateInterval, 10) || 0;
    const torrentInterval = parseInt(this.item.torrentInterval, 10) || 0;
    if (rateInterval > 0) {
      setInterval(() => this.getRate(client), rateInterval);
    }
    if (torrentInterval > 0) {
      setInterval(() => this.fetchCount(client), torrentInterval);
    }

    this.getRate(client);
    this.fetchCount(client);
  },
  methods: {
    fetchCount: async function (client) {
      try {
        let torrentResponse = await client.getTorrents(GetTorrentRequest.of({fields: ["id", "status"]}));
        let activeTorrents = torrentResponse.arguments.torrents.filter(torrent => torrent.status === 6);
        let inActiveTorrents = torrentResponse.arguments.torrents.filter(torrent => torrent.status !== 6);
        this.active = activeTorrents.length;
        this.inactive = inActiveTorrents.length;
        this.error = false;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
    },
    getRate: async function (client) {
      try {
        let torrentResponse = await client.getTorrents(GetTorrentRequest.of({fields: ["name","status", "rateDownload", "rateUpload"]}));
        let activeTorrents = torrentResponse.arguments.torrents.filter(torrent => torrent.status === 6);
        let rateDownload = activeTorrents.reduce((total, torrent) => total + torrent.rateDownload, 0);
        let rateUpload = activeTorrents.reduce((total, torrent) => total + torrent.rateUpload, 0);
        this.dl = rateDownload
        this.ul = rateUpload
        this.error = false;
      } catch (e) {
        this.error = true;
        console.error(e);
      }
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
