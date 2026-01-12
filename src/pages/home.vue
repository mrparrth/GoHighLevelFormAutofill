<template>
  <div class="app-container">
    <div class="glass-card">
      <h1>GHL AutoFill Tool</h1>
      <p class="subtitle">Select a marketer to begin searching</p>

      <!-- Step 1: Marketer Selection -->
      <div class="marketer-grid">
        <div v-for="marketer in marketers" :key="marketer" class="marketer-card"
          :class="{ active: selectedMarketer === marketer }" @click="selectMarketer(marketer)">
          <div class="marketer-avatar">
            {{ getMarketerName(marketer).charAt(0).toUpperCase() }}
          </div>
          <div class="marketer-name">{{ getMarketerName(marketer) }}</div>
        </div>
      </div>

      <!-- Step 2: Search Section -->
      <div v-if="selectedMarketer" class="search-section">
        <div class="search-wrapper">
          <input type="text" v-model="searchQuery" placeholder="Search by doctor, practice, or email..."
            class="search-input" autofocus />
          <span class="mdi mdi-magnify search-icon"></span>
        </div>

        <div class="add-doctor-link-container">
          <p v-if="!searchQuery" class="add-doctor-text">
            Want to add a new doctor to this search system?
            <a href="#" @click.prevent="showAddDoctorModal = true">Click here</a>
          </p>
          <p v-else class="add-doctor-text">
            Can't find a doctor here?
            <a href="#" @click.prevent="showAddDoctorModal = true">Click here</a> to add a new doctor to this system
          </p>
        </div>

        <div class="results-list">
          <div v-if="filteredResults.length > 0">
            <div v-for="(item, index) in filteredResults" :key="index" class="result-card">
              <div class="result-icon">
                <span class="mdi mdi-doctor"></span>
              </div>
              <div class="result-info">
                <div class="doctor-name">{{ item.chiropractorName }}</div>
                <div class="practice-name">
                  <span class="mdi mdi-hospital-building"></span>
                  {{ item.practiceName || 'No Practice Name' }}
                </div>
                <div class="email-text" v-if="item.email">
                  <span class="mdi mdi-email-outline"></span>
                  {{ item.email }}
                </div>
              </div>
              <a :href="generateUrl(item)" target="_blank" class="action-btn">
                <span class="mdi mdi-open-in-new"></span>
              </a>
            </div>
          </div>

          <div v-else-if="searchQuery && selectedMarketer" class="subtitle" style="margin-top: 2rem;">
            No results found for "{{ searchQuery }}"
          </div>

          <div v-else class="empty-state">
            <!-- Optional: Placeholder content or just empty space -->
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="subtitle" style="margin-top: 2rem;">
        <span class="mdi mdi-loading mdi-spin"></span> Loading data...
      </div>
    </div>

    <!-- Add Doctor Modal -->
    <AddDoctorModal v-if="showAddDoctorModal" :marketer="selectedMarketer"
      :marketer-name="getMarketerName(selectedMarketer)" @close="showAddDoctorModal = false"
      @submit="handleAddDoctor" />

    <ToastNotification v-model:show="toast.show" :message="toast.message" :type="toast.type"
      @close="toast.show = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { API } from '../services/apiService'
import AddDoctorModal from '../components/AddDoctorModal.vue'
import ToastNotification from '../components/ToastNotification.vue'

const allData = ref({})
const marketers = ref([])
const selectedMarketer = ref(null)
const searchQuery = ref('')
const isLoading = ref(false)
const showAddDoctorModal = ref(false)
const isAddingDoctor = ref(false)

// Toast State
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  }
  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.value.show = false
  }, 5000)
}

const marketerMapping = {
  'megan': 'Megan Bell',
  'caroline': 'Carolina Connor',
  'krystle': 'Krystle Vega',
  'house': 'House'
}

const getMarketerName = (key) => {
  return marketerMapping[key] || key
}

onMounted(async () => {
  // Check Metadata for pre-selection
  const { marketer } = await API.getMetaData()
  if (Object.keys(marketerMapping).includes(marketer)) {
    selectMarketer(marketer)
  } else if (Object.values(marketerMapping).includes(marketer)) {
    selectMarketer(Object.keys(marketerMapping)[Object.values(marketerMapping).indexOf(marketer)])
  }

  // Fetch Data
  isLoading.value = true
  try {
    const data = await API.execute('getData')
    allData.value = data
    marketers.value = Object.keys(data)
  } catch (error) {
    console.error("Error fetching data:", error)
    showToast('Error loading data', 'error')
  } finally {
    isLoading.value = false
  }
})

const selectMarketer = (marketer) => {
  selectedMarketer.value = marketer
  searchQuery.value = '' // Reset search when switching marketer
}

const filteredResults = computed(() => {
  if (!selectedMarketer.value || !searchQuery.value) return []

  const marketerData = allData.value[selectedMarketer.value] || []
  const query = searchQuery.value.toLowerCase()

  return marketerData.filter(item => {
    const doctor = (item.chiropractorName || '').toLowerCase()
    const practice = (item.practiceName || '').toLowerCase()
    const email = (item.email || '').toLowerCase()

    return doctor.includes(query) || practice.includes(query) || email.includes(query)
  })
})

const generateUrl = (item) => {
  const baseUrl = 'https://links.socialyocal.com/widget/form/Twif2mD2ZmGkdjAIA0n3'
  const params = new URLSearchParams({
    marketer: marketerMapping[selectedMarketer.value] || selectedMarketer.value || '',
    referring_doctor: item.chiropractorName || '',
    referring_doctor_email: item.email || '',
    practice_name: item.practiceName || ''
  })
  return `${baseUrl}?${params.toString()}`
}

const handleAddDoctor = async (formData) => {
  isAddingDoctor.value = true
  try {
    await API.execute('newDoctorSuggestion', {
      marketer: selectedMarketer.value,
      doctorData: formData
    })

    // Add to local state
    if (!allData.value[selectedMarketer.value]) {
      allData.value[selectedMarketer.value] = []
    }
    allData.value[selectedMarketer.value].push(formData)

    showAddDoctorModal.value = false
    showToast('Doctor suggestion sent successfully!', 'success')
  } catch (error) {
    console.error("Error adding doctor:", error)
    showToast('Failed to send suggestion. Please try again.', 'error')
  } finally {
    isAddingDoctor.value = false
  }
}
</script>

<style scoped>
.add-doctor-link-container {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.add-doctor-text {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.add-doctor-text a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
}

.add-doctor-text a:hover {
  text-decoration: underline;
}
</style>
