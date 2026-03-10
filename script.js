// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const promptBtn = document.querySelector('.prompt-btn');
const promptInput = document.querySelector('.prompt-input');
const promptForm = document.querySelector('.prompt-form');
const modelSelect = document.querySelector('#model-select');
const countSelect = document.querySelector('#count-select');
const ratioSelect = document.querySelector('#ratio-select');
const galleryGrid = document.querySelector('.gallery-grid');
const backToTop = document.getElementById('backToTop');
const loadingOverlay = document.getElementById('loadingOverlay');
const findCarBtn = document.getElementById('findCarBtn');
const resultsSection = document.getElementById('resultsSection');
const dynamicHero = document.getElementById('dynamicHero');
const heroTitle = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
const mainCarImage = document.getElementById('mainCarImage');
const carMakeModel = document.getElementById('carMakeModel');
const carYear = document.getElementById('carYear');
const carDescription = document.getElementById('carDescription');
const carPrice = document.getElementById('carPrice');
const matchPercentage = document.getElementById('matchPercentage');
const matchBadge = document.getElementById('matchBadge');
const specsGrid = document.getElementById('specsGrid');
const featuresList = document.getElementById('featuresList');
const alternativeCars = document.getElementById('alternativeCars');

// Input Elements
const budgetSelect = document.getElementById('budget');
const bodystyleSelect = document.getElementById('bodystyle');
const fueltypeSelect = document.getElementById('fueltype');
const drivetrainSelect = document.getElementById('drivetrain');
const performanceSelect = document.getElementById('performance');
const customDescription = document.getElementById('customDescription');

// API Keys
const HORDE_API_KEY = "VJy9ra3n-fOQn1XlVct5kQ";
const OPENROUTER_API_KEY = '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';

// State
let currentCarData = null;

// Back to top functionality
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTop.classList.add('active');
  } else {
    backToTop.classList.remove('active');
  }
});

backToTop.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Get car recommendations from OpenRouter
async function getCarRecommendationsFromAI(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'QPTech Car Generator'
    },
    body: JSON.stringify({
      model: 'arcee-ai/trinity-large-preview:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  const responseData = await response.json();
  return responseData.choices[0].message.content;
}

// Handle form submission
const handleFormSubmit = async (e) => {
  e.preventDefault();
  
  // Show loading overlay
  loadingOverlay.classList.add('active');
  findCarBtn.disabled = true;
  
  try {
    // Collect user preferences
    const budget = budgetSelect.value;
    const bodystyle = bodystyleSelect.value;
    const fueltype = fueltypeSelect.value;
    const drivetrain = drivetrainSelect.value;
    const performance = performanceSelect.value;
    const customDesc = customDescription.value;
    
    const features = [];
    document.querySelectorAll('.feature-item input:checked').forEach(cb => {
      features.push(cb.value);
    });
    
    // Build AI prompt for car recommendations
    const prompt = `You are a car expert AI. Based on the following user preferences, recommend ONE perfect car match and 3 alternatives.
    
User Preferences:
${budget ? `- Budget: ${budget}` : ''}
${bodystyle ? `- Body Style: ${bodystyle}` : ''}
${fueltype ? `- Fuel Type: ${fueltype}` : ''}
${drivetrain ? `- Drivetrain: ${drivetrain}` : ''}
${performance ? `- Performance: ${performance}` : ''}
${features.length ? `- Required Features: ${features.join(', ')}` : ''}
${customDesc ? `- Custom Description: ${customDesc}` : ''}

Return a JSON object with this EXACT structure. NO OTHER TEXT, JUST THE JSON:
{
  "mainCar": {
    "make": "string",
    "model": "string",
    "year": 2024,
    "price": "string (formatted with $)",
    "engine": "string",
    "horsepower": "string",
    "acceleration": "string (0-60 time)",
    "topSpeed": "string",
    "mpg": "string",
    "transmission": "string",
    "drivetrain": "string",
    "description": "string (2-3 sentences about why this car matches)",
    "features": ["string", "string", "string", "string"],
    "matchPercentage": number,
    "color": "string (hex color code)"
  },
  "alternatives": [
    {
      "make": "string",
      "model": "string",
      "year": 2024,
      "price": "string",
      "engine": "string",
      "horsepower": "string",
      "matchPercentage": number
    }
  ]
}`;

    // Get AI response
    const aiResponse = await getCarRecommendationsFromAI(prompt);
    
    // Parse JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    
    currentCarData = JSON.parse(jsonMatch[0]);
    
    // Clear previous alternative cars
    alternativeCars.innerHTML = '';
    
    // Display main car and alternatives
    displayCarRecommendations(currentCarData);
    
    // Show results section
    resultsSection.classList.add('active');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error generating your dream car. Please try again.');
  } finally {
    // Hide loading overlay
    loadingOverlay.classList.remove('active');
    findCarBtn.disabled = false;
  }
};

// Display car recommendations
function displayCarRecommendations(data) {
  // Update hero section
  heroTitle.textContent = `${data.mainCar.make} ${data.mainCar.model}`;
  heroSubtitle.textContent = `Your ${data.mainCar.matchPercentage}% match based on your preferences`;
  dynamicHero.style.background = `linear-gradient(135deg, ${data.mainCar.color || '#1a0000'}, #4d0000)`;
  
  // Update main car details (without image - will be generated in new tab)
  mainCarImage.src = ''; // Clear image, will be generated in new tab
  mainCarImage.alt = `${data.mainCar.make} ${data.mainCar.model}`;
  carMakeModel.textContent = `${data.mainCar.make} ${data.mainCar.model}`;
  carYear.textContent = data.mainCar.year;
  carDescription.textContent = data.mainCar.description;
  carPrice.textContent = data.mainCar.price;
  matchPercentage.textContent = `${data.mainCar.matchPercentage}% Match`;
  matchBadge.textContent = `${data.mainCar.matchPercentage}% Match`;
  
  // Update specs grid
  specsGrid.innerHTML = `
    <div class="spec-card"><div class="spec-label">Engine</div><div class="spec-value">${data.mainCar.engine}</div></div>
    <div class="spec-card"><div class="spec-label">Horsepower</div><div class="spec-value">${data.mainCar.horsepower}</div></div>
    <div class="spec-card"><div class="spec-label">0-60 mph</div><div class="spec-value">${data.mainCar.acceleration}</div></div>
    <div class="spec-card"><div class="spec-label">Top Speed</div><div class="spec-value">${data.mainCar.topSpeed}</div></div>
    <div class="spec-card"><div class="spec-label">MPG</div><div class="spec-value">${data.mainCar.mpg}</div></div>
    <div class="spec-card"><div class="spec-label">Transmission</div><div class="spec-value">${data.mainCar.transmission}</div></div>
  `;
  
  // Update features list
  featuresList.innerHTML = data.mainCar.features.map(f => 
    `<span class="feature-tag highlight">${f}</span>`
  ).join('');
  
  // Add generate image button for main car
  const mainCarGallery = document.getElementById('mainCarGallery');
  const existingBtn = document.getElementById('generateMainImageBtn');
  if (existingBtn) existingBtn.remove();
  
  const generateBtn = document.createElement('button');
  generateBtn.id = 'generateMainImageBtn';
  generateBtn.className = 'btn-ai';
  generateBtn.style.marginTop = '20px';
  generateBtn.style.maxWidth = '100%';
  generateBtn.innerHTML = '🎨 Generate Image in New Tab';
  generateBtn.onclick = () => generateImageInNewTab(`${data.mainCar.make} ${data.mainCar.model}`, 0, true);
  mainCarGallery.appendChild(generateBtn);
  
  // Display alternatives
  let altHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">';
  
  data.alternatives.forEach((car, index) => {
    altHtml += `
      <div class="alt-card" style="background: #1a1a1a; border-radius: 15px; overflow: hidden; border: 1px solid #333; padding: 20px;">
        <div class="alt-name" style="font-size: 1.3rem; font-weight: 600; margin-bottom: 10px;">${car.make} ${car.model} (${car.year})</div>
        <div class="alt-specs" style="color: #888; margin-bottom: 10px;">
          <div>💰 Price: ${car.price}</div>
          <div>⚡ Engine: ${car.engine}</div>
          <div>💪 HP: ${car.horsepower}</div>
          <div>🎯 Match: ${car.matchPercentage}%</div>
        </div>
        <button class="test-button" style="background: #d50000; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; width: 100%;" 
                onclick="generateImageInNewTab('${car.make} ${car.model}', ${index + 1})">
          🎨 Generate Image
        </button>
      </div>
    `;
  });
  
  altHtml += '</div>';
  alternativeCars.innerHTML = altHtml;
}

// Create AI Horde generation page in new tab
function generateImageInNewTab(carName, index, isMain = false) {
  const hordeKey = HORDE_API_KEY;
  
  // Create HTML content for the new tab
  const htmlContent = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '    <title>AI Horde - ' + carName + '</title>',
    '    <style>',
    '        body {',
    '            font-family: Arial, sans-serif;',
    '            max-width: 800px;',
    '            margin: 40px auto;',
    '            padding: 20px;',
    '            background: #1a1a1a;',
    '            color: #fff;',
    '        }',
    '        h1 { color: #d50000; }',
    '        .container {',
    '            background: #2a2a2a;',
    '            padding: 30px;',
    '            border-radius: 15px;',
    '            border-left: 4px solid #d50000;',
    '        }',
    '        .status {',
    '            padding: 20px;',
    '            background: #333;',
    '            border-radius: 10px;',
    '            margin: 20px 0;',
    '        }',
    '        .image-preview {',
    '            max-width: 100%;',
    '            margin-top: 20px;',
    '            border-radius: 10px;',
    '        }',
    '        button {',
    '            background: #d50000;',
    '            color: white;',
    '            border: none;',
    '            padding: 10px 20px;',
    '            border-radius: 5px;',
    '            cursor: pointer;',
    '            font-size: 1rem;',
    '            margin-top: 10px;',
    '        }',
    '        button:hover {',
    '            background: #b30000;',
    '        }',
    '        .loading {',
    '            display: inline-block;',
    '            width: 20px;',
    '            height: 20px;',
    '            border: 3px solid #333;',
    '            border-top: 3px solid #d50000;',
    '            border-radius: 50%;',
    '            animation: spin 1s linear infinite;',
    '        }',
    '        @keyframes spin {',
    '            0% { transform: rotate(0deg); }',
    '            100% { transform: rotate(360deg); }',
    '        }',
    '        .download-btn {',
    '            display: inline-block;',
    '            background: #4caf50;',
    '            color: white;',
    '            text-decoration: none;',
    '            padding: 10px 20px;',
    '            border-radius: 5px;',
    '            margin-top: 10px;',
    '        }',
    '        .download-btn:hover {',
    '            background: #45a049;',
    '        }',
    '    </style>',
    '</head>',
    '<body>',
    '    <h1>🎨 AI Horde Image Generator</h1>',
    '    <div class="container">',
    '        <h2>Generating: ' + carName + '</h2>',
    '        ',
    '        <div class="status" id="status">',
    '            <span class="loading"></span> Starting generation...',
    '        </div>',
    '        ',
    '        <div id="imageContainer"></div>',
    '        ',
    '        <button onclick="startGeneration()">Start Generation</button>',
    '        <button onclick="retryGeneration()" style="background: #ff9800; margin-left: 10px;">Retry</button>',
    '    </div>',
    '',
    '    <script>',
    '        const HORDE_API_KEY = "' + hordeKey + '";',
    '        const CAR_NAME = "' + carName + '";',
    '        ',
    '        async function startGeneration() {',
    '            const statusDiv = document.getElementById("status");',
    '            const imageContainer = document.getElementById("imageContainer");',
    '            ',
    '            statusDiv.innerHTML = \'<span class="loading"></span> Sending request to AI Horde...\';',
    '            ',
    '            const payload = {',
    '                prompt: CAR_NAME + ", realistic car photography, 4k, detailed, showroom quality, white background, studio lighting, high resolution",',
    '                params: {',
    '                    n: 1,',
    '                    width: 1024,',
    '                    height: 768,',
    '                    steps: 30,',
    '                    cfg_scale: 7.5,',
    '                    sampler_name: "k_euler_a"',
    '                },',
    '                nsfw: false,',
    '                models: ["stable_diffusion"],',
    '                apikey: HORDE_API_KEY',
    '            };',
    '            ',
    '            try {',
    '                const response = await fetch("https://aihorde.net/api/v2/generate/async", {',
    '                    method: "POST",',
    '                    headers: {',
    '                        "Content-Type": "application/json",',
    '                        "apikey": HORDE_API_KEY',
    '                    },',
    '                    body: JSON.stringify(payload)',
    '                });',
    '                ',
    '                if (!response.ok) {',
    '                    const errorText = await response.text();',
    '                    throw new Error("Failed to start generation: " + errorText);',
    '                }',
    '                ',
    '                const data = await response.json();',
    '                const jobId = data.id;',
    '                ',
    '                statusDiv.innerHTML = \'<span class="loading"></span> Job started! ID: \' + jobId + \'. Waiting in queue...\';',
    '                ',
    '                let attempts = 0;',
    '                const maxAttempts = 60;',
    '                ',
    '                while (attempts < maxAttempts) {',
    '                    await new Promise(r => setTimeout(r, 5000));',
    '                    ',
    '                    const statusResponse = await fetch("https://aihorde.net/api/v2/generate/status/" + jobId);',
    '                    const status = await statusResponse.json();',
    '                    ',
    '                    if (status.done) {',
    '                        if (status.generations && status.generations.length > 0) {',
    '                            const imgUrl = status.generations[0].img;',
    '                            statusDiv.innerHTML = "✅ Image generated successfully!";',
    '                            imageContainer.innerHTML = \'<img src="\' + imgUrl + \'" class="image-preview" alt="\' + CAR_NAME + \'"><br>\' +',
    '                                \'<a href="\' + imgUrl + \'" class="download-btn" download="\' + CAR_NAME.replace(/ /g, "_") + \'.png">📥 Download Image</a>\';',
    '                        }',
    '                        return;',
    '                    }',
    '                    ',
    '                    const queuePos = status.queue_position || 0;',
    '                    const waitingTime = status.wait_time || 0;',
    '                    statusDiv.innerHTML = "⏳ Generating... Queue: " + queuePos + " | Wait time: " + waitingTime + "s";',
    '                    attempts++;',
    '                }',
    '                ',
    '                statusDiv.innerHTML = "⚠️ Timeout - generation taking too long. Try again later.";',
    '                ',
    '            } catch (error) {',
    '                statusDiv.innerHTML = "❌ Error: " + error.message;',
    '                console.error(error);',
    '            }',
    '        }',
    '        ',
    '        function retryGeneration() {',
    '            document.getElementById("imageContainer").innerHTML = "";',
    '            startGeneration();',
    '        }',
    '        ',
    '        window.onload = startGeneration;',
    '    </' + 'script>',
    '</body>',
    '</html>'
  ].join('\n');
  
  // Open new tab with the HTML content
  const newTab = window.open();
  newTab.document.write(htmlContent);
  newTab.document.close();
  
  // Show notification
  alert(`🎨 Image generation tab opened for ${carName}!`);
}

// Load alternative car details
window.generateImageInNewTab = generateImageInNewTab;

// Event Listeners
if (findCarBtn) findCarBtn.addEventListener('click', handleFormSubmit);

// Initialize on load
window.addEventListener('load', () => {
  console.log('QPTech Car Generator loaded');
});