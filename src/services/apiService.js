import { Mock } from "./mock";
const isGoogleEnvironment = typeof google !== "undefined";

export class API {
  static async execute(functionName, data = {}) {
    try {
      console.info(`API: executing ${functionName}`, data);

      const result = await (isGoogleEnvironment
        ? this.executeGoogleFunction(functionName, data)
        : Mock.executeMockFunction(functionName, data));

      console.info("result", result);
      return result;
    } catch (error) {
      console.info("error", error);
      throw error;
    }
  }

  static executeGoogleFunction(functionName, data) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler((result) => {
          resolve(result);
        })
        .withFailureHandler((error) => {
          reject(error);
        })
        [functionName](data);
    });
  }

  static getMetaData() {
    let dataElem = document.getElementById("meta-data");
    let data;
    if (isGoogleEnvironment) {
      if (dataElem) {
        data = JSON.parse(dataElem.getAttribute("meta-data"));
      } else {
        console.error("Metadata not found");
      }
    } else {
      data = Mock.getMetaData();
    }

    return data;
  }
}
