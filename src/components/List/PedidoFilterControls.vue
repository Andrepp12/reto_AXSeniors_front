<script setup>
import { ref, watch } from 'vue'; // Importamos watch si queremos emitir al cambiar v-model

// Define las props que recibirá del componente padre (PedidoListView)
const props = defineProps({
    filterStatus: {
        type: String,
        default: ''
    },
    filterCliente: {
        type: String,
        default: ''
    },
    estadoOptions: {
        type: Array,
        required: true
    },
    // Función del padre para aplicar filtros (refetch)
    onApplyFilters: {
        type: Function,
        required: true
    }
});

// Definir eventos que este componente puede emitir al padre
const emit = defineEmits(['update:filterStatus', 'update:filterCliente']);

// Internamente usamos refs para los v-model, y emitimos el cambio al padre
const internalFilterStatus = ref(props.filterStatus);
const internalFilterCliente = ref(props.filterCliente);

// Usamos watch para emitir el evento update:filterStatus cuando cambia el v-model
watch(internalFilterStatus, (newValue) => {
    emit('update:filterStatus', newValue);
    // Opcional: aplicar filtros inmediatamente al cambiar el estado
    props.onApplyFilters();
});

watch(internalFilterCliente, (newValue) => {
    emit('update:filterCliente', newValue);
     props.onApplyFilters();
});

</script>

<template>
    <div class="mb-4 flex flex-wrap items-center gap-4">
        <div>
            <label for="filterEstado" class="block text-sm font-medium text-gray-200 mb-1">Filtrar por Estado:</label>
            <select
                id="filterEstado"
                v-model="internalFilterStatus"
                 class="form-select block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
                 <option v-for="option in estadoOptions" :value="option.value">{{ option.text }}</option>
            </select>
        </div>

         <div class="flex-grow">
             <label for="filterCliente" class="block text-sm font-medium text-gray-200 mb-1">Buscar Cliente:</label>
             <input type="text" id="filterCliente" v-model="internalFilterCliente"
                    class="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Nombre del cliente"/>
         </div>

         <!-- {/* Si no aplicas filtros en cada @change/@input, podrías tener un botón "Aplicar Filtros" aquí */}
         {/* <button @click="onApplyFilters" class="...">Aplicar</button> */} -->

    </div>
</template>

<style scoped>
/* Estilos para los controles de filtro */
</style>