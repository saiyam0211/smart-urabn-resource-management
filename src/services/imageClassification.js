// src/services/imageClassification.js
import * as tf from '@tensorflow/tfjs';
import { showToast } from '../components/ToastContainer';

class ImageClassificationService {
    constructor() {
        this.model = null;
        this.isLoading = true;
        this.loadModel();
    }

    async loadModel() {
        try {
            // Load a pre-trained MobileNet model
            this.model = await tf.loadLayersModel(
                'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
            );
            this.isLoading = false;
        } catch (error) {
            console.error('Error loading model:', error);
            showToast('Error loading AI model', 'error');
        }
    }

    async classifyImage(imageElement) {
        if (!this.model || this.isLoading) {
            throw new Error('Model not ready');
        }

        try {
            // Preprocess the image
            const tensor = tf.browser
                .fromPixels(imageElement)
                .resizeNearestNeighbor([224, 224])
                .toFloat()
                .expandDims();

            // Get prediction
            const prediction = await this.model.predict(tensor).data();
            
            // Map prediction to problem categories
            return this.mapPredictionToCategory(prediction);
        } catch (error) {
            console.error('Classification error:', error);
            throw error;
        }
    }

    mapPredictionToCategory(prediction) {
        // Map MobileNet classes to our problem categories
        const maxIndex = prediction.indexOf(Math.max(...prediction));
        
        // This is a simple mapping example - you'd want to customize this
        // based on your specific needs
        const categoryMap = {
            // MobileNet indices mapped to our categories
            0: 'waste',
            1: 'air_pollution',
            2: 'water_pollution',
            3: 'noise_pollution',
            default: 'other'
        };

        return categoryMap[maxIndex] || categoryMap.default;
    }
}

export default new ImageClassificationService();