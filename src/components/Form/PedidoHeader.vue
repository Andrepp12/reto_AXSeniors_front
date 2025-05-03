<script setup>
import { computed } from 'vue';

// Define las props que recibirá del componente padre (PedidoForm)
const props = defineProps({
  pedidoHeaderState: { // Objeto con el estado de la cabecera (cliente, fecha_pedido, etc.)
    type: Object,
    required: true
  },
  clientes: { // Lista de clientes para el select
    type: Array,
    required: true
  },
  errors: { // Objeto de errores
    type: Object,
    default: null
  },
  // Evento que el padre debe manejar cuando un campo de cabecera cambia
  onHeaderChange: {
    type: Function,
    required: true
  }
});

// Propiedad computada para obtener el estado local de la cabecera
// Usamos computed para asegurar que se actualice si pedidoHeaderState cambia
const headerState = computed(() => props.pedidoHeaderState);

// Función para emitir el evento de cambio hacia el padre
const emitChange = (event) => {
  // Llama a la función onHeaderChange pasada como prop, enviando el nombre y valor del campo
  props.onHeaderChange(event.target.name, event.target.value);
};
</script>

<template>
  <fieldset class="border border-gray-300 p-4 rounded-md mb-6">
    <legend class="text-lg font-semibold px-2">Detalles del Pedido</legend>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="col-span-1 md:col-span-1 lg:col-span-1">
        <label for="cliente" class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
        <select
          id="cliente"
          name="cliente"
          :value="headerState.cliente" 
          @change="emitChange"
          class="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option :value="null">Selecciona un cliente</option>
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
            {{ cliente.nombre }} ({{ cliente.rut_dni }})
          </option>
        </select>
        <div v-if="errors && errors.cliente" class="text-red-600 text-sm mt-1">{{ errors.cliente[0] }}</div>
      </div>

      <div class="col-span-1 md:col-span-1 lg:col-span-1">
        <label for="fecha_pedido" class="block text-sm font-medium text-gray-700 mb-1">Fecha del Pedido</label>
        <input
          type="datetime-local"
          id="fecha_pedido"
          name="fecha_pedido"
          :value="headerState.fecha_pedido"
          @change="emitChange"
          class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
        <div v-if="errors && errors.fecha_pedido" class="text-red-600 text-sm mt-1">{{ errors.fecha_pedido[0] }}</div>
      </div>

      <div class="col-span-1 md:col-span-1 lg:col-span-1">
        <label for="fecha_entrega" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega Estimada</label>
        <input
          type="date"
          id="fecha_entrega"
          name="fecha_entrega"
          :value="headerState.fecha_entrega"
          @change="emitChange"
          class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <div v-if="errors && errors.fecha_entrega" class="text-red-600 text-sm mt-1">{{ errors.fecha_entrega[0] }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div class="col-span-1">
        <label for="estado" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select
          id="estado"
          name="estado"
          :value="headerState.estado"
          @change="emitChange"
          class="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="PEN">Pendiente</option>
          <option value="PRO">En Proceso</option>
          <option value="COM">Completado</option>
          <option value="CAN">Cancelado</option>
        </select>
        <div v-if="errors && errors.estado" class="text-red-600 text-sm mt-1">{{ errors.estado[0] }}</div>
      </div>
      <div class="col-span-1">
        <label for="notas" class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          id="notas"
          name="notas"
          :value="headerState.notas"
          @change="emitChange"
          rows="3"
          class="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <div v-if="errors && errors.notas" class="text-red-600 text-sm mt-1">{{ errors.notas[0] }}</div>
      </div>
    </div>
  </fieldset>
</template>