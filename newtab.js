const defaultQuotes = [
    {
        "quote": "Be the change you wish to see in the world.",
        "source": "Gandhi",
    },
    {
        "quote": "Life is what happens while you're busy making other plans.",
        "source": "John Lennon",
    }
];

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let quotes = defaultQuotes;

async function initQuotes() {
    const loadedQuotes = await browserAPI.storage.local.get('quotes');
    if (loadedQuotes && Object.keys(loadedQuotes).length > 0) {
        quotes = loadedQuotes.quotes;
    }

    quoteCount.textContent = quotes.length + ' quotes';
}

// Load quotes and display a random one
async function loadAndDisplayQuote() {
    try {
        await initQuotes();
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('quote').textContent = randomQuote.quote;
        document.getElementById('source').textContent = '- ' + randomQuote.source;

    } catch (error) {
        console.error('Error loading quote:', error);
        document.getElementById('quote').textContent = 'Error loading quote';
        document.getElementById('source').textContent = '';
    }
}

async function removeQuote(index) {
    quotes.splice(index, 1);
    await browserAPI.storage.local.set({ quotes });
    createQuotesList();
    loadAndDisplayQuote();
}

function createQuotesList() {
    // create quotes list
    quotesListSelect.innerHTML = '';
    quotes.forEach((quoteObj, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${quoteObj.quote} - ${quoteObj.source}`;
        quotesListSelect.appendChild(option);
    });
}

// Settings modal functionality
const modal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const addBtn = document.getElementById('addQuotes');
const quotesInput = document.getElementById('quotesInput');
const importJsonBtn = document.getElementById('importJson');
const jsonFileInput = document.getElementById('jsonFileInput');
const quotesListSelect = document.getElementById('quotesList');
const removeBtn = document.getElementById('removeQuotes');
const refreshBtn = document.getElementById('refreshQuotes');
const quoteCount = document.getElementById('quoteCount');

settingsBtn.addEventListener('click', async () => {
    modal.style.display = 'block';
    const { quotes = defaultQuotes } = await browserAPI.storage.local.get('quotes');
    createQuotesList();
    quotesInput.value = quotes.join('\n');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

addBtn.addEventListener('click', async () => {
    const quotes = quotesInput.value.split('\n').filter(quote => quote.trim());
    await browserAPI.storage.local.set({ quotes });
    modal.style.display = 'none';
    loadAndDisplayQuote();
});

removeBtn.addEventListener('click', async () => {
    const index = quotesListSelect.value;
    if (index === null) return;
    await removeQuote(index);
});

importJsonBtn.addEventListener('click', async () => {
    const file = jsonFileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const importedJsonObject = JSON.parse(event.target.result);
            const importedQuotes = importedJsonObject.quotes

            if (!importedQuotes.every(quote => quote.quote && quote.source)) {
                throw new Error('Each quote must have a "quote" and "source" property');
            }

            if (!Array.isArray(importedQuotes)) {
                throw new Error('JSON must contain an array of quotes');
            }

            quotes = quotes.concat(importedQuotes);

            await browserAPI.storage.local.set({ quotes });
            modal.style.display = 'none';
            loadAndDisplayQuote();
        } catch (error) {
            alert('Invalid JSON file: ' + error.message);
        }
    };
    reader.readAsText(file);
});

refreshBtn.addEventListener('click', async () => {
    loadAndDisplayQuote();
});

// Load quote on page load
document.addEventListener('DOMContentLoaded', loadAndDisplayQuote);
