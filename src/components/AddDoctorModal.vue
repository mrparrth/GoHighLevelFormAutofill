<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="glass-card modal-content">
            <div class="modal-header">
                <h2>Add New Doctor</h2>
                <p class="subtitle mb-2">Adding to: <strong>{{ marketerName }}</strong></p>
            </div>

            <div class="modal-body">

                <form @submit.prevent="submitForm" class="doctor-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Chiropractor Name *</label>
                            <input v-model="form.chiropractorName" type="text" required>
                        </div>

                        <div class="form-group">
                            <label>Practice Name *</label>
                            <input v-model="form.practiceName" type="text" required>
                        </div>

                        <div class="form-group">
                            <label>Contact Person</label>
                            <input v-model="form.contactPerson" type="text">
                        </div>

                        <div class="form-group">
                            <label>Office Phone</label>
                            <input v-model="form.officePhone" type="tel">
                        </div>

                        <div class="form-group">
                            <label>Cell Phone</label>
                            <input v-model="form.cellPhone" type="tel">
                        </div>

                        <div class="form-group">
                            <label>Fax</label>
                            <input v-model="form.fax" type="tel">
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label>Address</label>
                        <input v-model="form.address" type="text">
                    </div>

                    <div class="form-group full-width">
                        <label>Email *</label>
                        <input v-model="form.email" type="email" required>
                    </div>

                    <div class="form-group full-width">
                        <label>Preferred Method</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" v-model="form.preferredMethod" value="Email"> Email
                            </label>
                            <label class="radio-label">
                                <input type="radio" v-model="form.preferredMethod" value="Phone"> Phone
                            </label>
                            <label class="radio-label">
                                <input type="radio" v-model="form.preferredMethod" value="Text"> Text
                            </label>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
                        <button type="submit" class="submit-btn" :class="{ 'loading': isSubmitting }"
                            :disabled="isSubmitting">
                            <span v-if="isSubmitting" class="mdi mdi-loading mdi-spin"></span>
                            <span v-else>Add Doctor</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    marketer: {
        type: String,
        required: true
    },
    marketerName: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close', 'submit'])

const isSubmitting = ref(false)

const form = ref({
    chiropractorName: '',
    practiceName: '',
    contactPerson: '',
    officePhone: '',
    cellPhone: '',
    address: '',
    fax: '',
    email: '',
    preferredMethod: 'Email'
})

const submitForm = async () => {
    isSubmitting.value = true
    emit('submit', { ...form.value })
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(255 255 255 / 77%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-content {
    width: 90%;
    max-width: 600px;
    max-height: 800px;
    overflow-y: auto;
    padding: 2rem;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-bottom: 0.5rem;
}

.modal-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary, #333);
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.2s;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.05);
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.full-width {
    grid-column: 1 / -1;
    margin-bottom: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #555;
}

input[type="text"],
input[type="email"],
input[type="tel"] {
    padding: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.5);
    font-size: 1rem;
    transition: all 0.3s ease;
}

input:focus {
    outline: none;
    border-color: #4CAF50;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.radio-group {
    display: flex;
    gap: 1.5rem;
    padding: 0.5rem 0;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.cancel-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    background: transparent;
    color: #666;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.2s;
}

.cancel-btn:hover {
    background: rgba(0, 0, 0, 0.05);
}

.submit-btn {
    padding: 0.75rem 2rem;
    border: none;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
    transition: all 0.3s ease;
    min-width: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

@media (max-width: 600px) {
    .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .modal-content {
        width: 95%;
        padding: 1.5rem;
    }
}
</style>
