<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}: {{ hostname }}</p>
      <p class="subtitle is-6">
        <template v-if="address"> IP:{{ address }} </template>
        <template v-if="lastSeen"> , seen:{{ lastSeen }} </template>
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
  name: "Tailscale",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({ statsData: "", error: "" }),
  computed: {
    status: function () {
      if (this.statsData && this.statsData.updateAvailable) {
        return "update";
      } else if (this.statsData && this.statsData.addresses) {
        return "healthy";
      } else if (this.error) {
        return "unhealthy";
      }
      return "";
    },
    hostname: function () {
      if (this.statsData) {
        return this.statsData.hostname;
      }
      return "";
    },
    address: function () {
      if (this.statsData) {
        return this.statsData.addresses[0];
      }
      return "";
    },
    lastSeen: function () {
      if (this.statsData) {
        const now = new Date();
        const date = new Date(this.statsData.lastSeen);
        const diff = this.compareDifferenceInTwoDates(date, now);
        return diff === "Now"
          ? this.translate("tailscale.now")
          : this.translate("tailscale.ago", { value: diff });
      }
      return "";
    },
    expiry: function () {
      if (this.statsData) {
        if (this.statsData.keyExpiryDisabled)
          return this.translate("tailscale.never");
        const now = new Date();
        const date = new Date(this.statsData.expires);
        return this.compareDifferenceInTwoDates(now, date);
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
          Authorization: `Bearer ${this.item.key}`,
          "Content-Type": "application/json",
        },
      };
      this.statsData = await this.proxyFetch(
        `/ts/api/v2/device/${this.item.deviceid}`,
        options,
      ).catch((e) => {
        console.log(e);
        this.error = e.message;
      });
    },
    compareDifferenceInTwoDates: function (priorDate, futureDate) {
      const diff = futureDate.getTime() - priorDate.getTime();
      const diffInYears = Math.ceil(diff / (1000 * 60 * 60 * 24 * 365));
      if (diffInYears > 1)
        return this.translate("tailscale.years", { number: diffInYears });
      const diffInWeeks = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
      if (diffInWeeks > 1)
        return this.translate("tailscale.weeks", { number: diffInWeeks });
      const diffInDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (diffInDays > 1)
        return this.translate("tailscale.days", { number: diffInDays });
      const diffInHours = Math.ceil(diff / (1000 * 60 * 60));
      if (diffInHours > 1)
        return this.translate("tailscale.hours", { number: diffInHours });
      const diffInMinutes = Math.ceil(diff / (1000 * 60));
      if (diffInMinutes > 1)
        return this.translate("tailscale.minutes", { number: diffInMinutes });
      const diffInSeconds = Math.ceil(diff / 1000);
      if (diffInSeconds > 10)
        return this.translate("tailscale.seconds", { number: diffInSeconds });
      return "Now";
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

  &.update:before {
    background-color: #ffc965;
    border-color: #ffc965;
    box-shadow: 0 0 5px 1px #ffc965;
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
