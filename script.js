document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const canvas = document.getElementById('word-cloud-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const maxWordsSelect = document.getElementById('max-words');
    const colorThemeSelect = document.getElementById('color-theme');

    // Stop words to ignore in frequency calculation
    const stopWords = new Set(['the', 'and', 'to', 'of', 'a', 'in', 'it', 'you', 'that', 'for', 'on', 'with', 'as', 'are', 'be', 'this', 'was', 'or', 'an', 'by', 'not', 'but', 'at', 'from', 'they', 'we', 'about', 'which', 'their', 'has', 'have', 'would', 'what', 'can', 'if', 'all']);

    // Themes
    const themes = {
        default: ['#1d4ed8', '#059669', '#db2777', '#7c3aed', '#0891b2', '#ea580c'],
        blues: ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'],
        warm: ['#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#f59e0b', '#d97706']
    };

    // Update char count
    textInput.addEventListener('input', () => {
        charCount.textContent = textInput.value.length;
    });

    generateBtn.addEventListener('click', () => {
        const text = textInput.value;
        if (!text.trim()) return;
        
        // Add loading state to button
        const originalHTML = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="ph ph-spinner-gap"></i> Generating...';
        generateBtn.style.opacity = '0.7';

        // Use requestAnimationFrame to allow UI to update before heavy processing
        requestAnimationFrame(() => {
            setTimeout(() => {
                generateWordCloud(text);
                generateBtn.innerHTML = originalHTML;
                generateBtn.style.opacity = '1';
            }, 50);
        });
    });

    function getWordFrequencies(text) {
        const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
        const frequencies = {};

        words.forEach(word => {
            if (word.length > 1 && !stopWords.has(word)) {
                frequencies[word] = (frequencies[word] || 0) + 1;
            }
        });
        
        // For matching the reference image's mixed casing ("Java", "Python", "development"):
        // We will keep original casing of the most frequent form.
        const originalWords = text.match(/\b[a-zA-Z]+\b/g) || [];
        const casingMap = {};
        originalWords.forEach(w => {
            const lower = w.toLowerCase();
            if(!casingMap[lower]) casingMap[lower] = {};
            casingMap[lower][w] = (casingMap[lower][w] || 0) + 1;
        });

        const limit = parseInt(maxWordsSelect.value) || 50;

        // Convert to array, get best casing, sort by frequency
        return Object.entries(frequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word, freq]) => {
                // Find most common casing
                let bestCasing = word;
                let maxCasingFreq = 0;
                if(casingMap[word]) {
                    for(const [cased, count] of Object.entries(casingMap[word])) {
                        if(count > maxCasingFreq) {
                            maxCasingFreq = count;
                            bestCasing = cased;
                        }
                    }
                }
                return [bestCasing, freq];
            });
    }

    function generateWordCloud(text) {
        const wordData = getWordFrequencies(text);
        if (wordData.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const maxFreq = wordData[0][1];
        const minFreq = wordData[wordData.length - 1][1];
        
        // Canvas center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const placedBoxes = [];
        const selectedTheme = colorThemeSelect.value || 'default';
        const colors = themes[selectedTheme];

        // Ensure canvas width/height are correct for clear rendering
        // Match CSS logical size
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 400;

        // Simple Spiral Layout Algorithm
        wordData.forEach(([word, freq], index) => {
            // Normalize size between 16px and 90px
            let fontSize = 24;
            if (maxFreq !== minFreq) {
                fontSize = 18 + ((freq - minFreq) / (maxFreq - minFreq)) * 90;
            }

            ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
            
            // Try to assign consistent colors based on index to look nice
            const color = colors[index % colors.length];
            
            // Measure word bounding box
            const metrics = ctx.measureText(word);
            const wordWidth = metrics.width;
            const wordHeight = fontSize * 1.1; // Approximation
            
            let angle = 0;
            let radius = 0;
            let placed = false;
            let x, y;

            // Archimedean spiral search for an empty spot
            while (!placed && radius < Math.max(canvas.width, canvas.height)) {
                x = canvas.width / 2 + radius * Math.cos(angle) - wordWidth / 2;
                y = canvas.height / 2 + radius * Math.sin(angle) + wordHeight / 4;

                const box = {
                    x: x,
                    y: y - wordHeight, // Top left Y
                    w: wordWidth,
                    h: wordHeight
                };

                // Check collisions
                let collision = false;
                for (const pb of placedBoxes) {
                    // add a small padding
                    const padding = 4;
                    if (box.x < pb.x + pb.w + padding &&
                        box.x + box.w > pb.x - padding &&
                        box.y < pb.y + pb.h + padding &&
                        box.y + box.h > pb.y - padding) {
                        collision = true;
                        break;
                    }
                }

                // Make sure it's within canvas bounds
                if (!collision && 
                    box.x > 0 && 
                    box.x + box.w < canvas.width && 
                    box.y > 0 && 
                    box.y + box.h < canvas.height) {
                    placed = true;
                } else {
                    angle += 0.5;
                    radius += 2; // Increase radius slowly to create spiral
                }
            }

            if (placed) {
                // Draw text
                ctx.fillStyle = color;
                ctx.fillText(word, x, y);
                
                // Save bounding box for future collision checks
                placedBoxes.push({
                    x: x,
                    y: y - wordHeight,
                    w: wordWidth,
                    h: wordHeight
                });
            }
        });
    }

    // Default generation for preview
    const sampleText = "Java is powerful.\nJava is popular.\nJava makes development easier.\nPython is also popular.\nCoding in Python is used in technology projects today. Programming language development is easier today.";
    
    textInput.value = sampleText;
    charCount.textContent = sampleText.length;
    
    // Slight delay to ensure canvas is sized
    setTimeout(() => {
        generateWordCloud(sampleText);
    }, 100);

    // Handle window resize for canvas
    window.addEventListener('resize', () => {
        generateWordCloud(textInput.value);
    });
});
