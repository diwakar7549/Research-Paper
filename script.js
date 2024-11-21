window.onload = function() {
    let result = document.getElementById('result');
    let image = './image2.jpeg';

    
    fetchpapers();
};

async function fetchpapers() {
    let branch = document.getElementById('branch').value;
    let year = document.getElementById('year').value;

    try {
        let response;

        
        if (branch === 'computerscience') {
            response = await fetch(`https://export.arxiv.org/api/query?search_query=ti:%22computer%20science%22&sortBy=lastUpdatedDate&sortOrder=ascending`);
        } else {
            response = await fetch(`https://export.arxiv.org/api/query?search_query=ti:%22${branch}%20engineering%22&sortBy=lastUpdatedDate&sortOrder=ascending`);
        }

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Converting the response (XML) to a string
        let xmlText = await response.text();

        // Parsing XML to DOM object
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // Converting XML to JSON
        let jsonResult = xmlToJson(xmlDoc);

        // Debug: Check the full JSON result
        console.log(jsonResult);

        let result = document.getElementById('result');
        result.innerHTML = '';  // Clear previous content
        let image = './image2.jpeg';
        
        // Check if jsonResult has feed and entry arrays
        if (jsonResult.feed && jsonResult.feed.entry && jsonResult.feed.entry.length > 0) {
            // Loop through entries
            for (let i = 0; i < jsonResult.feed.entry.length; i++) {
                let entry = jsonResult.feed.entry[i];

                // Access title, summary, and author, checking if they exist
                let title = entry.title && entry.title['#text'] ? entry.title['#text'] : 'No title available';
                let summary = entry.summary && entry.summary['#text'] ? entry.summary['#text'] : 'No summary available';

                let authors = entry.author;
                let authorsList = '';

                let publishDate = entry.published && entry.published['#text'] ? entry.published['#text'] : 'no dates';
                let date = new Date(publishDate);
                let year1 = date.getFullYear();
                let yearInput = parseInt(year, 10);

                // Handle multiple authors
                if (Array.isArray(authors)) {
                    authorsList = authors.map(author => author.name['#text']).join(', ');
                } else if (authors && authors.name) {
                    authorsList = authors.name['#text'];
                } else {
                    authorsList = 'No authors available';
                }

                if (year1 <= yearInput) {
                    // Create the card for each paper
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <div class="image-container">
                            <img src="${image}" alt="Book Image">
                        </div>
                        <div class="info-container">
                            <div class="naam">
                                <h2>${title}</h2>
                            </div>
                            <div class="pub">
                                <p>Published: ${year1}</p>
                            </div>
                        </div>
                    `;

                    // Handle click event to go to details page
                    card.addEventListener('click', function() {
                        const queryString = `?title=${encodeURIComponent(title)}&authors=${encodeURIComponent(authorsList)}&published=${year1}&summary=${encodeURIComponent(summary)}`;
                        window.location.href = `details.html${queryString}`;
                    });

                    result.appendChild(card);
                }
            }
        } else {
            console.log('No entries found in feed.');
        }

    } catch (error) {
        console.error("Error fetching papers:", error);
        let result = document.getElementById('result');
        result.innerHTML = `<p>Error fetching papers: ${error.message}</p>`;
    }
}

// Function to convert XML DOM to JSON
function xmlToJson(xml) {
    let obj = {};

    if (xml.nodeType === 1) {
        // Process attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                const attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) {
        obj = xml.nodeValue;
    }

    // Process children
    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;
            if (typeof (obj[nodeName]) === "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) === "undefined") {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

// Add event listener to the button
let button = document.querySelector('.glow-on-hover');
button.addEventListener('click', fetchpapers);