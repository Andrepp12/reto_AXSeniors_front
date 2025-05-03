<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Necesitamos el router aquí para la navegación

import usePedidoList from '@/components/List/usePedidoList';
import PedidoFilterControls from '@/components/List/PedidoFilterControls.vue';
import PedidoTable from '@/components/List/PedidoTable.vue';
import PedidoPaginationControls from '@/components/List/PedidoPaginationControls.vue';

const router = useRouter();

const {
    pedidos,
    isLoading,
    error,
    pagination,
    filterStatus,
    sortField,
    sortOrder,
    filterCliente,
    estadoOptions,
    fetchPedidos, 
    sortBy,       // Función para cambiar orden (llamada desde hijo)
    applyFilters, 
    deletePedido, 
    generatePdf,  
    goToNextPage, 
    goToPreviousPage, 
    hasNextPage,  // Computed del composable
    hasPreviousPage, // Computed del composable
} = usePedidoList(); // No pasamos nada al composable en este caso


const goToPedidoDetail = (pedidoId) => {
  router.push({ name: 'ver-pedido', params: { id: pedidoId } });
};

const goToPedidoEdit = (pedidoId) => {
  router.push({ name: 'editar-pedido', params: { id: pedidoId } });
};

onMounted(() => {
    fetchPedidos(); // Carga la primera página con los filtros/orden por defecto
});

</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6 text-gray-100">Lista de Pedidos</h1>

    <PedidoFilterControls
        v-model:filterStatus="filterStatus" 
        v-model:filterCliente="filterCliente" 
        :estadoOptions="estadoOptions"
        :onApplyFilters="applyFilters" 
    />

    <PedidoTable
        :pedidos="pedidos"
        :isLoading="isLoading"
        :error="error"
        :sortField="sortField"
        :sortOrder="sortOrder"
        :onSortBy="sortBy" 
        :onGoToDetail="goToPedidoDetail" 
        :onGoToEdit="goToPedidoEdit"   
        :onGeneratePdf="generatePdf"   
        :onDeletePedido="deletePedido" 
    />

    <PedidoPaginationControls
        :pagination="pagination"
        :isLoading="isLoading"
        :onGoToPreviousPage="goToPreviousPage" 
        :onGoToNextPage="goToNextPage"     
        :hasPreviousPage="hasPreviousPage" 
        :hasNextPage="hasNextPage"      
    />

  </div>
</template>

<style scoped>
</style>