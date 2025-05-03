import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue'; 
import PedidoListView from '../views/PedidoListView.vue'
import NuevoPedidoView from '../views/NuevoPedidoView.vue' 
import EditarPedidoView from '../views/EditarPedidoView.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView, 
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'), 
    },
    {
      path: '/pedidos', 
      name: 'lista-pedidos', 
      component: PedidoListView,
    },
    {
      path: '/pedidos/nuevo',
      name: 'nuevo-pedido',
      component: NuevoPedidoView,
    },
    {
      path: '/pedidos/:id/editar',
      name: 'editar-pedido',
      component: EditarPedidoView, 
      props: true // Pasa el ':id' de la URL como una prop al componente de vista
    },
    {
      path: '/pedidos/:id/ver',
      name: 'ver-pedido',
      component: () => import('../views/VerPedidoView.vue'), // <--- Usar Carga perezosa
      props: true // Pasa el ':id' de la URL como una prop al componente de vista
    }
  ],
});

export default router;