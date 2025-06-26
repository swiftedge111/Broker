//Js for counter

document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".count");

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute("data-target");
            const count = +counter.innerText;
            const speed = 500; // Lower number = faster count
            const increment = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 10); // Adjust timing for smooth animation
            } else {
                counter.innerText = target;
            }
        };

        updateCount();
    });
});


window.addEventListener('load', () => {
    const progressBars = document.querySelectorAll('.progress');
    
    progressBars.forEach((bar) => {
        const width = bar.style.width; // Get the width set in inline styles
        bar.style.width = '0%'; // Start from 0%
        
        setTimeout(() => {
            bar.style.width = width; // Animate to the target width
        }, 500); // Delay the animation for smooth effect
    });
});


//sidebar navigation
document.addEventListener("DOMContentLoaded", () => {
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const mobileNav = document.getElementById("mobile-nav");
    const overlay = document.getElementById("overlay");
    const closeBtn = document.getElementById("close-btn");

    const openMobileNav = () => {
        mobileNav.style.left = "0";
        overlay.classList.add("active");
    };

    const closeMobileNav = () => {
        mobileNav.style.left = "-100%";
        overlay.classList.remove("active");
    };

    hamburgerMenu.addEventListener("click", openMobileNav);
    closeBtn.addEventListener("click", closeMobileNav);
    overlay.addEventListener("click", closeMobileNav);
});

// Real-time Market Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const marketContainer = document.getElementById('market-data-container');
    const refreshBtn = document.getElementById('refresh-data');
    const timeframeSelect = document.getElementById('timeframe-select');
    const marketSearch = document.getElementById('market-search');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const viewOptions = document.querySelectorAll('.view-option');
    
    // API Keys (replace with your own)
    const ALPHA_VANTAGE_API_KEY = 'MPU9EBVTRWRZX43K';  
    const FMP_API_KEY = 'JUEkDbNHrZ52HYfwn89WdVysMslSg4nB';  
    
    // State
    let currentTab = 'crypto';
    let currentView = 'grid';
    let currentTimeframe = '7d';
    let marketData = [];
    let filteredData = [];
    
    // Initialize
    initDashboard();
    
    // Event Listeners
    refreshBtn.addEventListener('click', fetchMarketData);
    timeframeSelect.addEventListener('change', (e) => {
        currentTimeframe = e.target.value;
        fetchMarketData();
    });
    
    marketSearch.addEventListener('input', (e) => {
        filterMarketData(e.target.value);
    });
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            fetchMarketData();
        });
    });
    
    viewOptions.forEach(option => {
        option.addEventListener('click', () => {
            viewOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentView = option.dataset.view;
            updateViewMode();
        });
    });
    
    // ========== HELPER FUNCTIONS ==========
    
    function initDashboard() {
        renderSkeletonLoading();
        fetchMarketData();
        setInterval(updateRefreshTime, 60000);
    }
    
    function renderSkeletonLoading() {
        marketContainer.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            marketContainer.innerHTML += `
                <div class="market-card skeleton">
                    <div class="asset-info">
                        <div class="asset-icon skeleton-icon"></div>
                        <div class="asset-names">
                            <div class="asset-symbol skeleton-text" style="width: 60px"></div>
                            <div class="asset-name skeleton-text" style="width: 100px"></div>
                        </div>
                    </div>
                    <div class="price-data">
                        <div class="current-price skeleton-text" style="width: 80px"></div>
                        <div class="price-change skeleton-text" style="width: 60px"></div>
                    </div>
                    <div class="price-chart skeleton-chart"></div>
                    <div class="market-actions">
                        <button class="trade-btn skeleton-btn"></button>
                        <button class="watchlist-btn skeleton-btn"></button>
                    </div>
                </div>
            `;
        }
    }
    
    async function fetchMarketData() {
        try {
            renderSkeletonLoading();
            
            switch(currentTab) {
                case 'crypto':
                    marketData = await fetchCryptoData();
                    break;
                case 'stocks':
                    marketData = await fetchStockData();
                    break;
                case 'forex':
                    marketData = await fetchForexData();
                    break;
                case 'commodities':
                    marketData = await fetchCommoditiesData();
                    break;
                default:
                    marketData = await fetchCryptoData();
            }
            
            filteredData = [...marketData];
            renderMarketData();
            updateRefreshTime();
        } catch (error) {
            console.error('Error fetching market data:', error);
            showErrorState();
        }
    }
    
    async function fetchCryptoData() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h,7d');
            
            if (!response.ok) throw new Error('Failed to fetch crypto data');
            const data = await response.json();
            
            return data.map(crypto => ({
                symbol: crypto.symbol.toUpperCase(),
                name: crypto.name,
                price: crypto.current_price,
                change: crypto.price_change_percentage_24h,
                change7d: crypto.price_change_percentage_7d_in_currency,
                sparkline: crypto.sparkline_in_7d.price,
                image: crypto.image
            }));
        } catch (error) {
            console.error('Error fetching crypto data:', error);
            return generateMockData('crypto');
        }
    }
    
    async function fetchStockData() {
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`);
            
            if (!response.ok) throw new Error('Failed to fetch stock data');
            const data = await response.json();
            
            if (!data.top_gainers) throw new Error('No gainers data available');
            
            return data.top_gainers.slice(0, 10).map(stock => ({
                symbol: stock.ticker,
                name: stock.ticker,
                price: parseFloat(stock.price),
                change: parseFloat(stock.change_percentage),
                change7d: null,
                sparkline: null
            }));
        } catch (error) {
            console.error('Error fetching stock data:', error);
            return generateMockData('stocks');
        }
    }
    
    async function fetchForexData() {
        try {
            const response = await fetch(`https://financialmodelingprep.com/api/v3/fx?apikey=${FMP_API_KEY}`);
            
            if (!response.ok) throw new Error('Failed to fetch forex data');
            const data = await response.json();
            
            return data.slice(0, 10).map(forex => ({
                symbol: forex.ticker.replace('/', ''),
                name: forex.ticker.replace('/', ' to '),
                price: forex.bid,
                change: ((forex.bid - forex.open) / forex.open) * 100,
                change7d: null,
                sparkline: null
            }));
        } catch (error) {
            console.error('Error fetching forex data:', error);
            return generateMockData('forex');
        }
    }
    
    async function fetchCommoditiesData() {
        try {
            const response = await fetch(`https://financialmodelingprep.com/api/v3/quotes/commodity?apikey=${FMP_API_KEY}`);
            
            if (!response.ok) throw new Error('Failed to fetch commodities data');
            const data = await response.json();
            
            return data.slice(0, 10).map(commodity => ({
                symbol: commodity.symbol,
                name: commodity.name,
                price: commodity.price,
                change: commodity.change,
                change7d: null,
                sparkline: null
            }));
        } catch (error) {
            console.error('Error fetching commodities data:', error);
            return generateMockData('commodities');
        }
    }
    
    function generateMockData(type) {
        const baseData = {
            crypto: [
                { symbol: 'BTC', name: 'Bitcoin', price: 42850.12, change: 2.34, change7d: 5.67, volume: 28456789023 },
                { symbol: 'ETH', name: 'Ethereum', price: 2345.67, change: 1.23, change7d: 8.91, volume: 14567890234 },
                { symbol: 'SOL', name: 'Solana', price: 102.45, change: -0.56, change7d: 12.34, volume: 3456789012 },
                { symbol: 'ADA', name: 'Cardano', price: 0.56, change: 3.45, change7d: -2.34, volume: 1234567890 },
                { symbol: 'DOT', name: 'Polkadot', price: 7.89, change: -1.23, change7d: 4.56, volume: 987654321 },
                { symbol: 'AVAX', name: 'Avalanche', price: 34.56, change: 5.67, change7d: 23.45, volume: 2345678901 }
            ],
            stocks: [
                { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: -0.45, change7d: 1.23, volume: 56789012 },
                { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: 2.34, change7d: 5.67, volume: 34567890 },
                { symbol: 'AMZN', name: 'Amazon.com', price: 156.78, change: 1.23, change7d: -0.56, volume: 23456789 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 145.67, change: -0.78, change7d: 2.34, volume: 12345678 },
                { symbol: 'MSFT', name: 'Microsoft', price: 412.34, change: 0.56, change7d: 3.45, volume: 45678901 },
                { symbol: 'META', name: 'Meta Platforms', price: 478.90, change: 3.45, change7d: 8.90, volume: 34567890 }
            ],
            forex: [
                { symbol: 'EUR/USD', name: 'Euro/US Dollar', price: 1.0876, change: 0.12, change7d: 0.34, volume: 0 },
                { symbol: 'GBP/USD', name: 'Pound/US Dollar', price: 1.2678, change: -0.23, change7d: 0.56, volume: 0 },
                { symbol: 'USD/JPY', name: 'Dollar/Yen', price: 150.23, change: 0.34, change7d: -0.78, volume: 0 },
                { symbol: 'AUD/USD', name: 'Aussie Dollar', price: 0.6578, change: -0.45, change7d: 0.12, volume: 0 },
                { symbol: 'USD/CAD', name: 'Dollar/CAD', price: 1.3567, change: 0.56, change7d: 0.90, volume: 0 },
                { symbol: 'USD/CNY', name: 'Dollar/Yuan', price: 7.1987, change: -0.12, change7d: -0.34, volume: 0 }
            ],
            commodities: [
                { symbol: 'GOLD', name: 'Gold', price: 2034.56, change: 12.34, change7d: 23.45, volume: 0 },
                { symbol: 'SILVER', name: 'Silver', price: 22.78, change: -0.56, change7d: 1.23, volume: 0 },
                { symbol: 'OIL', name: 'Crude Oil', price: 78.90, change: 1.23, change7d: -2.34, volume: 0 },
                { symbol: 'PLAT', name: 'Platinum', price: 912.34, change: 5.67, change7d: 8.90, volume: 0 },
                { symbol: 'COPPER', name: 'Copper', price: 3.78, change: -0.12, change7d: 0.34, volume: 0 },
                { symbol: 'NATGAS', name: 'Natural Gas', price: 2.56, change: -1.23, change7d: -3.45, volume: 0 }
            ]
        };
        
        return baseData[type] || baseData.crypto;
    }
    
    function renderMarketData() {
        marketContainer.innerHTML = '';
        
        if (filteredData.length === 0) {
            marketContainer.innerHTML = `
                <div class="no-results">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                    </svg>
                    <h3>No matching assets found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }
        
        filteredData.forEach(asset => {
            const isPositive = asset.change >= 0;
            const changeClass = isPositive ? 'positive' : 'negative';
            const changeSign = isPositive ? '+' : '';
            
            const sparkline = asset.sparkline 
                ? generateSparklineFromData(asset.sparkline, isPositive)
                : generateSparkline(asset.change, asset.change7d);
            
            marketContainer.innerHTML += `
                <div class="market-card">
                    <div class="asset-info">
                        <div class="asset-icon">
                            ${asset.image 
                                ? `<img src="${asset.image}" alt="${asset.symbol}" onerror="this.src='assets/icons/default.svg'">`
                                : `<img src="assets/icons/${asset.symbol.toLowerCase()}.svg" alt="${asset.symbol}" onerror="this.src='assets/icons/default.svg'">`}
                        </div>
                        <div class="asset-names">
                            <div class="asset-symbol">${asset.symbol}</div>
                            <div class="asset-name">${asset.name}</div>
                        </div>
                    </div>
                    <div class="price-data">
                        <div class="current-price">$${formatPrice(asset.price)}</div>
                        <div class="price-change ${changeClass}">
                            ${changeSign}${asset.change ? asset.change.toFixed(2) : 'N/A'}%
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                ${isPositive ? '<path d="M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>' : '<path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>'}
                            </svg>
                        </div>
                    </div>
                    <div class="price-chart">
                        ${sparkline}
                    </div>
                    <div class="market-actions">
                        <button class="trade-btn">Trade</button>
                        <button class="watchlist-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
        
        setTimeout(enhanceUI, 100);
    }
    
    function formatPrice(price) {
        if (price >= 1) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
        }
    }
    
    function generateSparklineFromData(data, isPositive) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const normalized = data.map(val => ((val - min) / (max - min)) * 50 + 50);
        
        let path = `M0,${normalized[0]}`;
        for (let i = 1; i < normalized.length; i++) {
            path += ` L${i * (60 / (normalized.length - 1))},${normalized[i]}`;
        }
        
        const color = isPositive ? '#4cc9f0' : '#f72585';
        
        return `
            <svg width="100%" height="100%" viewBox="0 0 60 60" preserveAspectRatio="none">
                <path d="${path}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
    
    function generateSparkline(dailyChange, weeklyChange) {
        const points = [];
        const base = 30;
        const amplitude = 15;
        const trend = (dailyChange + weeklyChange) / 2;
        const direction = trend > 0 ? 1 : -1;
        
        for (let i = 0; i < 8; i++) {
            const randomFactor = 0.8 + Math.random() * 0.4;
            const value = base + (amplitude * direction * randomFactor * (i / 7));
            points.push(value);
        }
        
        const min = Math.min(...points);
        const max = Math.max(...points);
        const normalized = points.map(p => ((p - min) / (max - min)) * 50 + 50);
        
        let path = `M0,${normalized[0]}`;
        for (let i = 1; i < normalized.length; i++) {
            path += ` L${i * (60 / 7)},${normalized[i]}`;
        }
        
        const color = trend >= 0 ? '#4cc9f0' : '#f72585';
        
        return `
            <svg width="100%" height="100%" viewBox="0 0 60 60" preserveAspectRatio="none">
                <path d="${path}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
    
    function filterMarketData(searchTerm) {
        if (!searchTerm) {
            filteredData = [...marketData];
        } else {
            const term = searchTerm.toLowerCase();
            filteredData = marketData.filter(asset => 
                asset.symbol.toLowerCase().includes(term) || 
                asset.name.toLowerCase().includes(term)
            );
        }
        
        renderMarketData();
    }
    
    function updateViewMode() {
        marketContainer.classList.toggle('list-view', currentView === 'list');
        marketContainer.classList.toggle('grid-view', currentView === 'grid');
    }
    
    function updateRefreshTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.querySelector('.refresh-time').textContent = timeString;
    }
    
    function showErrorState() {
        marketContainer.innerHTML = `
            <div class="error-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                <h3>Failed to load market data</h3>
                <p>Please check your connection and try again</p>
                <button class="retry-btn" id="retry-btn">Retry</button>
            </div>
        `;
        
        document.getElementById('retry-btn').addEventListener('click', fetchMarketData);
    }
    
    function enhanceUI() {
        // Watchlist functionality
        document.querySelectorAll('.watchlist-btn').forEach(btn => {
            const card = btn.closest('.market-card');
            const symbol = card.querySelector('.asset-symbol').textContent;
            
            const watchlist = getWatchlist();
            if (watchlist.includes(symbol)) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.classList.toggle('active');
                updateWatchlist(symbol, btn.classList.contains('active'));
            });
        });
        
        // Trade button functionality
        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.market-card');
                const symbol = card.querySelector('.asset-symbol').textContent;
                alert(`Trade ${symbol} would open here in a real implementation`);
            });
        });
    }
    
    function getWatchlist() {
        const watchlistJSON = localStorage.getItem('marketWatchlist') || '[]';
        return JSON.parse(watchlistJSON);
    }
    
    function updateWatchlist(symbol, isAdding) {
        const watchlist = getWatchlist();
        const updated = isAdding 
            ? [...new Set([...watchlist, symbol])]
            : watchlist.filter(item => item !== symbol);
        
        localStorage.setItem('marketWatchlist', JSON.stringify(updated));
        
        // Show feedback
        const feedback = document.createElement('div');
        feedback.className = 'watchlist-feedback';
        feedback.textContent = `${symbol} ${isAdding ? 'added to' : 'removed from'} watchlist`;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
    }
});

// Educational Resources Section
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const resourceCards = document.querySelectorAll('.resource-card');
    const viewAllBtn = document.querySelector('.view-all-btn');
    
    // Filter resources by type
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterValue = button.dataset.filter;
            
            // Filter resources
            resourceCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'flex';
                } else {
                    if (card.dataset.type === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // View all button functionality
    viewAllBtn.addEventListener('click', () => {
        // In a real implementation, this would load more resources or navigate to a dedicated page
        alert('This would navigate to a full resources page in a real implementation');
    });
    
    // Add click handlers for resource cards
    resourceCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on a button or link
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            
            // Get resource type and id (in a real app)
            const resourceType = card.dataset.type;
            const resourceId = card.dataset.id || 'demo';
            
            // Navigate to resource detail page
            alert(`Navigating to ${resourceType} detail view for ${resourceId}`);
        });
    });
    
    // Add hover effects for video thumbnails
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('mouseenter', () => {
            const playBtn = thumbnail.querySelector('.play-button');
            playBtn.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            const playBtn = thumbnail.querySelector('.play-button');
            playBtn.style.transform = 'translate(-50%, -50%)';
        });
    });
    
    // Learning path quiz button
    const pathBtn = document.querySelector('.path-btn');
    pathBtn.addEventListener('click', () => {
        alert('quiz will be available in the next updated version');
    });
    
    // Initialize tooltips
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(el => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = el.dataset.tooltip;
            el.appendChild(tooltip);
            
            el.addEventListener('mouseenter', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });
            
            el.addEventListener('mouseleave', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });
        });
    }
    
    initTooltips();
});



// Advance trading preview 
document.addEventListener('DOMContentLoaded', function() {
    // Initialize interactive elements
    initRiskCalculator();
    initTooltips();
    initToolCards();

    // Risk Calculator Functionality
    function initRiskCalculator() {
        const riskSlider = document.querySelector('.risk-slider');
        const slSlider = document.querySelector('.sl-slider');
        const riskValue = document.querySelector('.risk-slider + .slider-value');
        const slValue = document.querySelector('.sl-slider + .slider-value');
        const calcResult = document.querySelector('.calc-result');
        const entryInput = document.querySelector('.calc-input input');
        const outputValues = document.querySelectorAll('.output-value');

        // Update calculator when sliders change
        riskSlider.addEventListener('input', updateCalculator);
        slSlider.addEventListener('input', updateCalculator);
        entryInput.addEventListener('input', updateCalculator);

        function updateCalculator() {
            // Update displayed values
            riskValue.textContent = `${riskSlider.value}%`;
            slValue.textContent = `${slSlider.value}%`;

            // Calculate position size
            const accountSize = 10000; // In a real app, this would come from user account
            const riskPercent = parseFloat(riskSlider.value);
            const slPercent = parseFloat(slSlider.value);
            const entryPrice = parseFloat(entryInput.value.replace(/,/g, '')) || 42850.00;

            const riskAmount = accountSize * (riskPercent / 100);
            const stopPrice = entryPrice * (1 - (slPercent / 100));
            const positionSize = riskAmount / (entryPrice - stopPrice);

            // Update UI
            calcResult.textContent = `${riskPercent}% Risk / $${riskAmount.toFixed(0)}`;
            outputValues[0].textContent = `${positionSize.toFixed(3)} BTC`;
            outputValues[1].textContent = stopPrice.toFixed(2);
        }

        // Initial calculation
        updateCalculator();
    }

    // Tooltip Initialization
    function initTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        
        tooltips.forEach(tooltip => {
            const tip = document.createElement('div');
            tip.className = 'tooltip';
            tip.textContent = tooltip.dataset.tooltip;
            tooltip.appendChild(tip);
            
            tooltip.addEventListener('mouseenter', () => {
                tip.style.opacity = '1';
                tip.style.visibility = 'visible';
            });
            
            tooltip.addEventListener('mouseleave', () => {
                tip.style.opacity = '0';
                tip.style.visibility = 'hidden';
            });
        });
    }

    // Tool Card Interactions
    function initToolCards() {
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            // Add click handler for CTA buttons
            const cta = card.querySelector('.tool-cta');
            cta.addEventListener('click', function(e) {
                e.stopPropagation();
                const toolName = card.dataset.tool.replace(/-/g, ' ');
                alert(`Launching ${toolName} tool...`);
            });
            
            // Add hover effect to chart indicators
            if (card.dataset.tool === 'charting') {
                const indicators = card.querySelectorAll('.indicator');
                indicators.forEach(indicator => {
                    indicator.addEventListener('mouseenter', function() {
                        const chartLine = card.querySelector('.indicator-line');
                        if (indicator.textContent === 'MACD') {
                            chartLine.style.setProperty('--indicator-level', '45%');
                        } else if (indicator.textContent === 'RSI') {
                            chartLine.style.setProperty('--indicator-level', '70%');
                        } else {
                            chartLine.style.setProperty('--indicator-level', '30%');
                        }
                    });
                });
            }
            
            // Add click handler for symbol selector
            if (card.dataset.tool === 'charting') {
                const symbolSelector = card.querySelector('.symbol-selector');
                symbolSelector.addEventListener('click', function() {
                    alert('Symbol selector would open a dropdown with available trading pairs');
                });
            }
        });
    }

    // Animate pie chart segments on scroll
    function animateOnScroll() {
        const portfolioCard = document.querySelector('[data-tool="portfolio-analyzer"]');
        const pieSegments = portfolioCard.querySelectorAll('.pie-segment');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    pieSegments.forEach((segment, index) => {
                        segment.style.setProperty('--segment-start', index * 0.25);
                        segment.style.transition = `transform 0.5s ${index * 0.2}s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(portfolioCard);
    }

    animateOnScroll();
});