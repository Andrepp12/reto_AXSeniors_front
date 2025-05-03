// src/components/PedidoForm.vue (Refactorizado)
<script setup>
import { defineProps } from 'vue';
import usePedidoForm from '@/components/Form/usePedidoForm';
import PedidoHeader from '@/components/Form/PedidoHeader.vue';
import PedidoLineItem from '@/components/Form/PedidoLineItem.vue';

// Define las props del componente (si recibe el ID del pedido para edición)
const props = defineProps({
  pedidoId: {
    type: [Number, String],
    required: false,
    default: null
  }
});

const {
  pedido,
  clientes,
  articulos,
  isLoading,
  errors,
  handleHeaderChange, 
  handleLineChange,   
  addLine,          
  handleLineDeleteToggle, 
  calculateLineTotal,   
  calculateOrderTotal,  
  handleSubmit,     
  router,
} = usePedidoForm(props.pedidoId); 

</script>

<template>
  <div v-if="isLoading && !errors && !pedido.id" class="text-center text-gray-600">Cargando...</div>
  <div v-else-if="errors && errors.detail" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
    Error: {{ errors.detail }}
  </div>
  <form v-else @submit.prevent="handleSubmit" class="max-w-5xl mx-auto p-6 bg-white rounded-md shadow-md">
      
      <PedidoHeader
          :pedidoHeaderState="pedido"
          :clientes="clientes"
          :errors="errors"
          :onHeaderChange="handleHeaderChange"
      />


      
      <h2 class="text-lg font-semibold mb-3">Líneas del Pedido</h2>
      <!-- <p>Número de líneas en el estado: {{ pedido.lineapedido_set.length }}</p> -->

      <div class="space-y-4">

        <template v-for="(linea, index) in pedido.lineapedido_set" :key="linea._tempId">

              <PedidoLineItem
                  :linea="linea"
                  :index="index"
                  :articulos="articulos"
                  :errors="errors"
                  :calculateLineTotal="calculateLineTotal"
                  :onLineChange="handleLineChange" 
                  :onLineDeleteToggle="handleLineDeleteToggle" 
              />
        </template>
      </div>

      <button type="button" @click="addLine" class="mt-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Añadir Artículo
      </button>

      <div class="mt-6 text-lg font-semibold text-right">
        Total del Pedido: {{ calculateOrderTotal.toFixed(2) }}
      </div>

      <!-- {/* --- Botones de Acción --- */} -->
      <div class="mt-6 flex justify-end space-x-4">
        <button type="submit" :disabled="isLoading" class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
          {{ pedido.id ? 'Actualizar Pedido' : 'Guardar Pedido' }}
        </button>
        <button type="button" @click="router.back()" :disabled="isLoading" class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          Cancelar
        </button>
      </div>

  </form>
</template>

<style scoped>
</style>