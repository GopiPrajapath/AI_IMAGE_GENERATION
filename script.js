document.addEventListener('DOMContentLoaded', function() {
  const generateForm = document.querySelector(".generate-form");
  const generateBtn = generateForm.querySelector(".generate-btn");
  const imageGallery = document.querySelector(".image-gallery");

  const GETIMG_API_KEY = "Your api key here";
  let isImageGenerating = false;

  const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
      const imgCard = imageGallery.querySelectorAll(".img-card")[index];
      if (!imgCard) return; // Skip if there's no corresponding image card
  
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

  const updatePublicGallery = (imgDataArray, userPrompt) => {
    const publicGallery = document.querySelector(".public-gallery");

    imgDataArray.forEach((imgObject) => {
      const imgCard = document.createElement("div");
      imgCard.classList.add("public-card");

      const imgElement = document.createElement("img");
      const imageData = imgObject.image;
      const getimgGeneratedImage = `data:image/jpeg;base64,${imageData}`;
      imgElement.src = getimgGeneratedImage;

      const promptOverlay = document.createElement("div");
      promptOverlay.classList.add("prompt-overlay");
      promptOverlay.innerText = userPrompt;

      imgCard.appendChild(imgElement);
      imgCard.appendChild(promptOverlay);
      publicGallery.appendChild(imgCard);
    });
  };

  const generateGetimgImages = async (userPrompt, userImgQuantity, userModel) => {
    try {
      const imagePromises = [];
      for (let i = 0; i < userImgQuantity; i++) {
        const promise = fetch("https://api.getimg.ai/v1/stable-diffusion/text-to-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GETIMG_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: userPrompt,
            num_images: 1,
            model: userModel,
            negative_prompt: 'Disfigured, cartoon, blurry',
            width: 512,
            height: 512,
            steps: 25,
            guidance: 7.5,
            seed: Math.floor(Math.random() * 1000000),
            output_format: "jpeg",
          }),
        }).then(response => {
          if (!response.ok) throw new Error("Failed to generate image. Make sure your API key is valid.");
          return response.json();
        });
        imagePromises.push(promise);
      }

      const results = await Promise.all(imagePromises);
      console.log("Full API Responses:", JSON.stringify(results, null, 2));
      updateImageCard(results);
      updatePublicGallery(results, userPrompt); // Add this line to update the public gallery
    } 
    catch (error) {
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
      const userModel = document.querySelector(".img-version").value;

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
      generateGetimgImages(userPrompt, userImgQuantity, userModel);
  };

  generateForm.addEventListener("submit", handleImageGeneration);

  console.log("JavaScript loaded and event listeners set up.");
});
