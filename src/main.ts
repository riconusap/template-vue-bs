import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';

import App from './App.vue';
import router from './router';

// Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as fas from '@fortawesome/free-solid-svg-icons';

// Add all solid icons to library
library.add(...Object.values(fas).filter(item => item.icon) as any[]);

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'element-plus/dist/index.css';
import './assets/styles/main.scss';

const app = createApp(App);

// Register FontAwesome component
app.component('FaIcon', FontAwesomeIcon);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

app.mount('#app');
