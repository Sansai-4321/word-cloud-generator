document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const textInput = document.getElementById('text-input');
    const canvas = document.getElementById('word-cloud-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Stop words to ignore in frequency calculation
    const stopWords = new Set(['the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'you', 'that', 'for', 'on', 'with', 'as', 'are', 'be', 'this', 'was', 'or', 'an', 'by', 'not', 'but', 'at', 'from', 'they', 'we', 'about', 'which', 'their', 'has', 'have', 'would', 'what', 'can', 'if', 'all']);

    // Vibrant color palette for the words
    const colors = [
        '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', 
        '#ef4444', '#06b6d4', '#d946ef', '#f43f5e', '#84cc16'
    ];

    generateBtn.addEventListener('click', () => {
        const text = textInput.value;
        if (!text.trim()) return;
        
        // Add loading state to button
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<span>Generating...</span>';
        generateBtn.style.opacity = '0.7';

        // Use requestAnimationFrame to allow UI to update before heavy processing
        requestAnimationFrame(() => {
            setTimeout(() => {
                generateWordCloud(text);
                generateBtn.innerHTML = originalText;
                generateBtn.style.opacity = '1';
            }, 50);
        });
    });

    function getWordFrequencies(text) {
        const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
        const frequencies = {};

        words.forEach(word => {
            if (word.length > 2 && !stopWords.has(word)) {
                frequencies[word] = (frequencies[word] || 0) + 1;
            }
        });

        // Convert to array and sort by frequency
        return Object.entries(frequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 100); // Limit to top 100 words
    }

    function generateWordCloud(text) {
        const wordData = getWordFrequencies(text);
        if (wordData.length === 0) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const maxFreq = wordData[0][1];
        const minFreq = wordData[wordData.length - 1][1];
        
        // Canvas center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const placedBoxes = [];

        // Simple Spiral Layout Algorithm
        wordData.forEach(([word, freq]) => {
            // Normalize size between 16px and 80px
            const fontSize = minFreq === maxFreq 
                ? 40 
                : 16 + ((freq - minFreq) / (maxFreq - minFreq)) * 64;

            ctx.font = `bold ${fontSize}px 'Outfit', sans-serif`;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Measure word bounding box
            const metrics = ctx.measureText(word);
            const wordWidth = metrics.width;
            const wordHeight = fontSize * 1.2; // Approximation
            
            let angle = 0;
            let radius = 0;
            let placed = false;
            let x, y;

            // Archimedean spiral search for an empty spot
            while (!placed && radius < canvas.width) {
                x = centerX + radius * Math.cos(angle) - wordWidth / 2;
                y = centerY + radius * Math.sin(angle) + wordHeight / 4;

                const box = {
                    x: x,
                    y: y - wordHeight, // Top left Y
                    w: wordWidth,
                    h: wordHeight
                };

                // Check collisions
                let collision = false;
                for (const pb of placedBoxes) {
                    if (box.x < pb.x + pb.w &&
                        box.x + box.w > pb.x &&
                        box.y < pb.y + pb.h &&
                        box.y + box.h > pb.y) {
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
    const sampleText = "DevOps is the combination of cultural philosophies, practices, and tools that increases an organization's ability to deliver applications and services at high velocity: evolving and improving products at a faster pace than organizations using traditional software development and infrastructure management processes. This speed enables organizations to better serve their customers and compete more effectively in the market. Under a DevOps model, development and operations teams are no longer siloed. Sometimes, these two teams are merged into a single team where the engineers work across the entire application lifecycle, from development and test to deployment to operations, and develop a range of skills not limited to a single function. Quality assurance and security teams may also become more tightly integrated with development and operations and throughout the application lifecycle. When security is the focus of everyone on a DevOps team, this is sometimes referred to as DevSecOps. These teams use practices to automate processes that historically have been manual and slow. They use a technology stack and tooling which help them operate and evolve applications quickly and reliably. These tools also help engineers independently accomplish tasks (for example, deploying code or provisioning infrastructure) that normally would have required help from other teams, and this further increases a team's velocity.";
    textInput.value = sampleText;
    setTimeout(() => {
        generateWordCloud(sampleText);
    }, 100);
});
