import { createApp, h } from "vue";
import App from "./App.vue";
import { createI18n } from 'vue-i18n'

import en from './assets/locales/en.json'
import uk from './assets/locales/uk.json'

import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/app.scss";

const i18n = createI18n({
  legacy: false,
  fallbackLocale: 'en',
  messages : loadLocaleMessages(),
})

const app = createApp(App);
app.use(i18n)

app.component("DynamicStyle", (_props, context) => {
  return h("style", {}, context.slots);
});

app.mount("#app-mount");

function loadLocaleMessages() {
  const locales = [{en: en}, {uk: uk}]
  const messages = {}
  locales.forEach(lang => {
    const key = Object.keys(lang)
    messages[key] = lang[key]
  })
  return messages
}