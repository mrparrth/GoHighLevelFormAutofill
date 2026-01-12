<template>
    <transition name="toast-slide">
        <div v-if="show" class="toast-notification" :class="type">
            <span class="mdi" :class="icon"></span>
            <span class="message">{{ message }}</span>
            <button class="close-btn" @click="$emit('close')">
                <span class="mdi mdi-close"></span>
            </button>
        </div>
    </transition>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
    show: Boolean,
    message: String,
    type: {
        type: String,
        default: 'success', // success, error, info
        validator: (value) => ['success', 'error', 'info'].includes(value)
    },
    duration: {
        type: Number,
        default: 5000
    }
})

const emit = defineEmits(['close'])

const icon = computed(() => {
    switch (props.type) {
        case 'success': return 'mdi-check-circle'
        case 'error': return 'mdi-alert-circle'
        case 'info': return 'mdi-information'
        default: return 'mdi-information'
    }
})

// Auto-close handling handled by parent usually, but we can do it here too if we want self-managed
// For now, let's assume parent controls 'show'
</script>

<style scoped>
.toast-notification {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    min-width: 300px;
    color: #333;
    font-weight: 500;
    border-left: 4px solid transparent;
}

.toast-notification.success {
    border-left-color: #4CAF50;
}

.toast-notification.success .mdi:first-child {
    color: #4CAF50;
    font-size: 20px;
}

.toast-notification.error {
    border-left-color: #FF5252;
}

.toast-notification.error .mdi:first-child {
    color: #FF5252;
    font-size: 20px;
}

.message {
    flex: 1;
    font-size: 0.95rem;
}

.close-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    transition: background 0.2s;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
}

/* Transitions */
.toast-slide-enter-active,
.toast-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
    transform: translateY(20px);
    opacity: 0;
}
</style>
