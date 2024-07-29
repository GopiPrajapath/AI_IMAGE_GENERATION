const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

const GETIMG_API_KEY = "key-4NEHcWfnzWaqSY3a9VBiPawIZUo3JPfQEeMS5m24DVoKCmPp0XS41MWBy4KiS2WGJlP5l9TISlh7rc7uvW77TJKYuyil9Jp6"; // Replace with your actual getimg.ai API key
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");

    // Set the image source to the getimg.ai-generated image data
    const getimgGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = getimgGeneratedImage;

    // When the image is loaded, remove the loading class and set download attributes
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", getimgGeneratedImage);
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    };
  });
};

const generateGetimgImages = async (userPrompt, userImgQuantity) => {
  try {
    // Send a request to the getimg.ai API to generate images based on user inputs
    const response = await fetch("https://api.getimg.ai/v1/stable-diffusion/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GETIMG_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        num_images: 1,
        aspect_ratio: "1:1",
        output_format: "jpeg",
        response_format: "b64",
      }),
    });

    // Throw an error message if the API response is unsuccessful
    if (!response.ok) throw new Error("Failed to generate images. Make sure your API key is valid.");
    console.log(response);
    const { data } = await response.json(); // Get data from the response
    console.log(data);
    const imgDataArray = data.images; // Get the array of image data
    updateImageCard(imgDataArray); // Update the image cards with the generated images
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};

const handleImageGeneration = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  // Get user input and image quantity values
  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);

  // Disable the generate button, update its text, and set the flag
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;

  // Creating HTML markup for image cards with loading state
  const imgCardMarkup = Array.from({ length: userImgQuantity }, () =>
    `<div class="img-card loading">
      <img src="images/loader.svg" alt="Generated image">
      <a class="download-btn" href="#">
        <img src="images/download.svg" alt="Download icon">
      </a>
    </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateGetimgImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleImageGeneration);
