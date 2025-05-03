<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <!-- Header fijo -->
    <header class="fixed top-0 left-0 w-full bg-gray-800 text-white z-50 shadow p-4">
      <nav class="flex gap-6 justify-center">
        <!-- <RouterLink to="/" class="hover:text-green-400">Home</RouterLink> -->
        <!-- <RouterLink to="/about" class="hover:text-green-400">About</RouterLink> -->
        <RouterLink to="/pedidos" class="hover:text-green-400">Pedidos</RouterLink>
        <RouterLink to="/pedidos/nuevo" class="hover:text-green-400">Nuevo</RouterLink>
        
      </nav>
    </header>

    <!-- Contenido debajo del header y centrado -->
    <main class="pt-20 flex justify-center bg-gray-900 min-h-screen" >
         <div class="w-full max-w-5xl p-6"> 
             <RouterView /> 
         </div>
     </main>
  </div>
</template>
<style scoped>

</style>
