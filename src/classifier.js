
import { pipeline, env, RawImage } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";
export { getProbability, loadModel };

env.allowLocalModels = false;
let classifier = null;

/**
 * load in the image classification model. If this function is not run, other
 * functions in this module will not work
 */
async function loadModel() {
    classifier = await pipeline("image-classification",
    "Xenova/quickdraw-mobilevit-small", {quantized: false});
}

/**
 * Get the probability the model assigns to a certain prompt, given an image
 * @param imageData The image as URL data
 * @param prompt The prompt word to get the probability of
 * @returns The probability the model assigned the given word to the given image
 */
async function getProbability(imageData, prompt) {
    const rawImage = await RawImage.read(imageData);
    const output = await classifier(rawImage.grayscale(), {top_k: 1000000});
    for (const item of output)
        if (item["label"] == prompt)
            return item["score"];
    return 0.0;
}