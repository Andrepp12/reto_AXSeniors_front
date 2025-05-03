<script setup>
import { computed } from 'vue';

// Define las props que recibirá del componente padre (PedidoForm)
const props = defineProps({
  linea: { // El objeto de línea específico para este componente
    type: Object,
    required: true
  },
  index: { // El índice de esta línea en el array (útil para IDs únicos si _tempId no basta)
    type: Number,
    required: true
  },
  articulos: { // Lista global de artículos para el select
    type: Array,
    required: true
  },
  errors: { // Objeto de errores (necesita la estructura errors.lineas[linea._tempId])
    type: Object,
    default: null
  },
  // Funciones que el padre proporciona para manejar eventos de esta línea
  onLineChange: {
    type: Function,
    required: true
  },
  onLineDeleteToggle: {
    type: Function,
    required: true
  },
  calculateLineTotal: { // La función de cálculo del total de línea
    type: Function,
    required: true
  }
});

// Propiedad computada para obtener los errores específicos de esta línea
const lineErrors = computed(() => {
    // Accede a errors.lineas usando el _tempId de esta línea
    return props.errors && props.errors.lineas ? props.errors.lineas[props.linea._tempId] : null;
});

// Función para emitir el evento de cambio de campo hacia el padre
const emitChange = (event) => {
  // Llama a la función onLineChange pasada como prop, enviando el _tempId de esta línea, el nombre del campo y el valor
  props.onLineChange(props.linea._tempId, event.target.name, event.target.value);
};

// Función para emitir el evento de eliminar línea hacia el padre
const emitDeleteToggle = (isChecked) => {
    // Llama a la función onLineDeleteToggle pasada como prop, enviando el _tempId de esta línea y el estado de eliminación
    props.onLineDeleteToggle(props.linea._tempId, isChecked);
};

// Modificación de la función para manejar el clic del botón de eliminar
const handleDeleteClick = () => {
    if (props.linea.id) {
        // Si la línea ya tiene un ID (existe en backend), pedir confirmación
        const isConfirmed = confirm('¿Estás seguro de que quieres marcar esta línea para eliminar? Se eliminará al guardar el pedido.');
        if (isConfirmed) {
            // Llama a la función del padre para marcar como eliminada
            emitDeleteToggle(true);
        }
    } else {
        // Si la línea no tiene ID (_tempId solamente), eliminarla directamente
        // Llama a la función del padre para removerla del array
        emitDeleteToggle(false); // O podrías pasar true, la lógica del composable maneja si tiene ID o no
    }
};
</script>

<template>
  <!-- {/* NO INCLUYE EL v-for NI EL v-if="linea && typeof linea === 'object'" AQUÍ. ESO ESTÁ EN EL PADRE. */}
  {/* Este template asume que 'linea' es un objeto válido y se renderiza una vez por cada línea en el padre. */} -->

  <div :class="['border border-gray-300 p-4 rounded-md', linea._isDeleted ? 'hidden' : '']">
    <!-- {/* Mostrar errores específicos de esta línea */}
    {/* Usamos lineErrors computado para acceder a los errores de esta línea */} -->
    <div v-if="lineErrors && Array.isArray(lineErrors.articulo)" class="text-red-600 text-sm mt-1 mb-2">
      Error Artículo: {{ lineErrors.articulo[0] }}
    </div>
    <div v-if="lineErrors && Array.isArray(lineErrors.cantidad)" class="text-red-600 text-sm mt-1 mb-2">
      Error Cantidad: {{ lineErrors.cantidad[0] }}
    </div>
     <div v-if="lineErrors && Array.isArray(lineErrors.precio_unitario)" class="text-red-600 text-sm mt-1 mb-2">
       Error Precio Unitario: {{ lineErrors.precio_unitario[0] }}
     </div>
    <div v-if="lineErrors && Array.isArray(lineErrors.porcentaje_descuento)" class="text-red-600 text-sm mt-1 mb-2">
      Error % Descuento: {{ lineErrors.porcentaje_descuento[0] }}
    </div>
     <div v-if="lineErrors && typeof lineErrors === 'string'" class="text-red-600 text-sm mt-1 mb-2">
      Error Línea: {{ lineErrors }}
    </div>


    <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
      <div class="col-span-1 md:col-span-2">
        <label :for="'linea-' + index + '-articulo'" class="block text-sm font-medium text-gray-700 mb-1">Artículo</label>
        <select
          :id="'linea-' + index + '-articulo'"
          :value="linea.articulo"
          @change="emitChange"
          name="articulo"
          :class="['form-select mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                   lineErrors && lineErrors.articulo ? 'border-red-500' : 'border-gray-300']" 
          required
        >
          <option :value="null">Selecciona un artículo</option>
          <option v-for="articulo in articulos" :key="articulo.id" :value="articulo.id">
            {{ articulo.codigo }} - {{ articulo.nombre }}
          </option>
        </select>
      </div>

      <div class="col-span-1 md:col-span-1">
        <label :for="'linea-' + index + '-cantidad'" class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
        <input
          type="number"
          :id="'linea-' + index + '-cantidad'"
          :value="linea.cantidad"
          @input="emitChange"
          @change="emitChange"
          name="cantidad"
           :class="['form-input mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                    lineErrors && lineErrors.cantidad ? 'border-red-500' : 'border-gray-300']" 
          min="1"
          required
        />
      </div>

      <div class="col-span-1 md:col-span-1">
        <label :for="'linea-' + index + '-precio_unitario'" class="block text-sm font-medium text-gray-700 mb-1">Precio Unitario</label>
        <input
          type="number"
          :id="'linea-' + index + '-precio_unitario'"
          :value="linea.precio_unitario"
          @input="emitChange"
          @change="emitChange"
          name="precio_unitario"
          :class="['form-input mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                   lineErrors && lineErrors.precio_unitario ? 'border-red-500' : 'border-gray-300']" 
          step="0.01"
          required
        />
      </div>

      <div class="col-span-1 md:col-span-1">
        <label :for="'linea-' + index + '-porcentaje_descuento'" class="block text-sm font-medium text-gray-700 mb-1">% Descuento</label>
        <input
          type="number"
          :id="'linea-' + index + '-porcentaje_descuento'"
          :value="linea.porcentaje_descuento"
          @input="emitChange"
          @change="emitChange"
          name="porcentaje_descuento"
          :class="['form-input mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                   lineErrors && lineErrors.porcentaje_descuento ? 'border-red-500' : 'border-gray-300']" 
          step="0.01"
          min="0"
          max="100"
        />
      </div>

      <div class="col-span-1 md:col-span-1 flex flex-col items-start justify-end">
        <p class="text-sm font-medium text-gray-700 mb-1">Importe:</p>
        <p class="text-base font-semibold text-gray-900">{{ calculateLineTotal(linea).toFixed(2) }}</p> 

        <button
          type="button"
          @click="handleDeleteClick" 
          :class="[
            'mt-2 px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
            linea.id ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
          ]"
        >
          {{ linea.id ? 'Marcar para eliminar' : 'Remover' }}
        </button>
      </div>
    </div> 

  </div>
</template>