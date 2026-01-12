import LOCAL_DATA from "../data/demo.json";
const DEFAULT_MOCK_API_DELAY = 1000;
export class Mock {
  static async executeMockFunction(functionName, data) {
    console.log("Mock executeMockFunction called:", {
      functionName,
      data,
    });
    await this.simulateNetworkDelay();
    const handlers = {
      getData: () => {
        return LOCAL_DATA;
      },
      newDoctorSuggestion: ({ marketer, doctorData }) => {
        console.log("Mock addDoctor called:", { marketer, doctorData });
        return { success: true };
      },
    };
    return handlers[functionName](data);
  }

  static simulateNetworkDelay(ms = DEFAULT_MOCK_API_DELAY) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static getMetaData() {
    return {
      marketer: "Megan Bell",
    };
  }
}
