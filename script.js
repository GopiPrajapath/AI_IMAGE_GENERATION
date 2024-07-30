document.addEventListener('DOMContentLoaded', function() {
  const generateForm = document.querySelector(".generate-form");
  const generateBtn = generateForm.querySelector(".generate-btn");
  const imageGallery = document.querySelector(".image-gallery");

  const GETIMG_API_KEY = "key-4NEHcWfnzWaqSY3a9VBiPawIZUo3JPfQEeMS5m24DVoKCmPp0XS41MWBy4KiS2WGJlP5l9TISlh7rc7uvW77TJKYuyil9Jp6";
  let isImageGenerating = false;

  const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
      const imgCard = imageGallery.querySelectorAll(".img-card")[index];
      const imgElement = imgCard.querySelector("img");
      const downloadBtn = imgCard.querySelector(".download-btn");
  
      // Set the image source to the base64 data
      const imageData = imgObject.image;
      const getimgGeneratedImage = `data:image/jpeg;base64,${imageData}`;
      imgElement.src = getimgGeneratedImage;
  
      // When the image is loaded, remove the loading class and set download attributes
      imgElement.onload = () => {
        imgCard.classList.remove("loading");
        downloadBtn.setAttribute("href", getimgGeneratedImage);
        downloadBtn.setAttribute("download", `generated_image_${new Date().getTime()}.jpg`);
      };
  
      imgElement.onerror = () => {
        console.error("Error loading image:", getimgGeneratedImage);
        imgCard.classList.remove("loading");
        imgCard.classList.add("error");
        imgElement.alt = "Error loading image";
      };
    });
  };

  const generateGetimgImages = async (userPrompt, userImgQuantity) => {
    try {
      const response = await fetch("https://api.getimg.ai/v1/stable-diffusion/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GETIMG_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'stable-diffusion-v1-5',
          prompt: userPrompt,
          num_images: userImgQuantity,
          negative_prompt: 'Disfigured, cartoon, blurry',
          width: 512,
          height: 512,
          steps: 25,
          guidance: 7.5,
          seed: 27,
          output_format: "jpeg",
        }),
      });
  
      if (!response.ok) throw new Error("Failed to generate images. Make sure your API key is valid.");
      
      const data = await response.json();
      console.log("API Response:", data);
      updateImageCard([data]); // Pass the entire data object as an array
    } catch (error) {
      console.error("Error in generateGetimgImages:", error);
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
  const userPrompt = document.querySelector(".prompt-input").value;
  const userImgQuantity = parseInt(document.querySelector(".img-quantity").value);

      // Get user input and image quantity values
      //const userPrompt = e.srcElement[0].value;
     // const userImgQuantity = parseInt(e.srcElement[1].value);

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

  console.log("JavaScript loaded and event listeners set up.");
});