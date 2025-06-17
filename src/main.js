import App from './App.vue';
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router/index.js';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'; // 引入element-plus图标
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const app = createApp(App);

// 全局注册图标
app.use(router);
app.use(ElementPlus , {
  locale: zhCn,
});
// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
// 全局注册组件
app.mount('#app');
