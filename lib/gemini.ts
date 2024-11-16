import { initializeApp } from "firebase/app";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

// Initialize Firebase and Vertex AI
const firebaseConfig = {
  // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
const vertexAI = getVertexAI(app);
const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

export { model };