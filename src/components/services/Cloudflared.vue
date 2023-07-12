<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-if="connections">
          AC:{{ connections }}
        </template>
        <template v-if="originIp">
          IP:{{ originIp }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";


export default {
  name: "Cloudflared",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({statsData: "", error: ""}),
  computed: {
    status: function () {
      if (this.statsData) {
        return this.statsData.result.status;
      } else if (this.error) {
        return "unhealthy";
      }
      return "";
    },
    connections: function () {
      if (this.statsData) {
        return this.statsData.result.connections.length;
      }
      return 0;
    },
    originIp: function () {
      if (this.statsData) {
        return this.statsData.result.connections[0]?.origin_ip
      }
      return "";
    },
  },
  async created() {
    await this.fetchStatus();
  },
  methods: {
    fetchStatus: async function () {
      const options = {
        headers: {
          "Authorization": `Bearer ${this.item.key}`,
          "Content-Type": "application/json"
        },
      };
      this.statsData = await this.proxyFetch(`/cf/client/v4/accounts/${this.item.accountid}/cfd_tunnel/${this.item.tunnelid}`, options)
          .catch((e) => {
            console.log(e)
            this.error = e.message
          });
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.healthy:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.unhealthy:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0 0 5px 1px #c9404d;
  }

  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
