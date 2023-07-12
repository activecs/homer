import axios from "axios";

export default {
    props: {
        proxy: Object,
    },
    created: function () {
        // custom service often consume info from an API using the item link (url) as a base url,
        // but sometimes the base url is different. An optional alternative URL can be provided with the "endpoint" key.
        this.endpoint = this.item.endpoint || this.item.url;

        if (this.endpoint.endsWith("/")) {
            this.endpoint = this.endpoint.slice(0, -1);
        }
    },
    methods: {
        proxyFetch: function (path, config, json = true) {
            return axios.get(path, config).then((response) => {
                if (response.status !== 200) {
                    throw new Error("Not 2xx response");
                }
                return json ? response.data : response;
            }).catch((error) => {
                console.log(error);
            });
        },

        fetch: function (path, init, json = true) {
            const options = this.prepareOptions(init);
            const url = this.getUrl(path);
            return fetch(url, options).then((response) => {
                if (!response.ok) {
                    throw new Error("Not 2xx response");
                }
                return json ? response.json() : response;
            });
        },

        getUrl: function (path) {
            if (path.startsWith("/")) {
                path = path.slice(1);
            }
            let url = this.endpoint;
            if (path) {
                url = `${this.endpoint}/${path}`;
            }
            return url;
        },

        prepareOptions: function (init) {
            let options = {};
            if (this.proxy?.useCredentials) {
                options.credentials = "include";
            }
            // Each item can override the credential settings
            if (this.item.useCredentials !== undefined) {
                options.credentials =
                    this.item.useCredentials === true ? "include" : "omit";
            }
            return Object.assign(options, init);
        }
    },
}
;
