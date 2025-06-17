import { createRouter, createWebHistory } from 'vue-router'

// 示例页面组件（请根据实际路径调整）
import clazzview from '@/views/clazz/index.vue'
import studentview from '@/views/stu/index.vue'
import deptview from '@/views/dept/index.vue'
import empview from '@/views/emp/index.vue'
import indexview from '@/views/index/index.vue'
import logview from '@/views/log/index.vue'
import loginviwe from '@/views/login/index.vue'
import empreportview from '@/views/report/emp/index.vue';
import stureportview from '@/views/report/stu/index.vue';
import LayoutView from '@/views/layout/index.vue';



const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: LayoutView,
      redirect: '/index',
      children: [
        {
          path: 'index',
          name: 'index',
          component: indexview,
        },
        {
          path: 'clazz',
          name: 'clazz',
          component: clazzview,
        },
        {
          path: 'stu',
          name: 'student',
          component: studentview,
        },
        {
          path: 'dept',
          name: 'dept',
          component: deptview,
        },
        {
          path: 'emp',
          name: 'emp',
          component: empview,
        },
        {
          path: 'log',
          name: 'log',
          component: logview,
        },
        {
          path: 'empReport',
          name: 'empreport',
          component: empreportview,
        },
        {
          path: 'stuReport',
          name: 'stureport',
          component: stureportview,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: loginviwe,
    },
  ],
})



export default router