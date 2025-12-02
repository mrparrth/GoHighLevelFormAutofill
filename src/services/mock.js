import LOCAL_DATA from '../data/demo.json'
const DEFAULT_MOCK_API_DELAY = 1000
export class Mock {
    static async executeMockFunction(functionName, { data, token }) {
        await this.simulateNetworkDelay()
        const handlers = {
            getData: () => {
                return LOCAL_DATA
            }
        }
        return handlers[functionName](data, token)
    }

    static simulateNetworkDelay(ms = DEFAULT_MOCK_API_DELAY) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}