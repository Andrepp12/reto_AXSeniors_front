<script setup>
import { computed } from 'vue';

// Define las props que recibirá del componente padre (PedidoListView)
const props = defineProps({
    pagination: { // Objeto reactive con info de paginación (count, next, previous, currentPage, pageSize)
        type: Object,
        required: true
    },
    isLoading: { // Indicador de carga (para deshabilitar botones)
        type: Boolean,
        required: true
    },
    // Funciones del padre para navegar
    onGoToPreviousPage: {
        type: Function,
        required: true
    },
    onGoToNextPage: {
        type: Function,
        required: true
    }
});

// Propiedades computadas para deshabilitar botones (usando la prop pagination)
const hasNextPage = computed(() => props.pagination.next !== null);
const hasPreviousPage = computed(() => props.pagination.previous !== null);

// Calcula el número total de páginas (si count > 0)
const totalPages = computed(() => {
    if (props.pagination.count > 0 && props.pagination.pageSize > 0) {
        return Math.ceil(props.pagination.count / props.pagination.pageSize);
    }
    return 0; // O 1 si no hay items pero hay al menos una página conceptual
});

</script>

<template>
    <div v-if="props.pagination.count > props.pagination.pageSize" class="flex justify-between items-center mt-6">
        <button
            @click="onGoToPreviousPage" 
            :disabled="!hasPreviousPage || isLoading"
            :class="['px-4 py-2 text-sm font-medium rounded-md border',
                     !hasPreviousPage || isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500']"
        >
            Anterior
        </button>

        <span v-if="props.pagination.count > 0" class="text-sm text-gray-300">
            Página {{ props.pagination.currentPage }} de {{ totalPages }}
       </span>

        <button
            @click="onGoToNextPage" 
             :disabled="!hasNextPage || isLoading"
            :class="['px-4 py-2 text-sm font-medium rounded-md border',
                     !hasNextPage || isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500']"
        >
            Siguiente
        </button>
    </div>
</template>

<style scoped>
/* Estilos específicos de paginación */
</style>