// DOM Elements
const sidebar = document.getElementById('sidebar');
const hamburgerMenu = document.getElementById('hamburger-menu');
const closeSidebar = document.getElementById('close-sidebar');
const overlay = document.getElementById('overlay');
const body = document.body;

// Function to Toggle Sidebar and Overlay
function toggleSidebar(open) {
    if (open) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        body.classList.add('no-scroll');
    } else {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        body.classList.remove('no-scroll');
    }
}

// Event Listeners
hamburgerMenu.addEventListener('click', () => toggleSidebar(true));
closeSidebar.addEventListener('click', () => toggleSidebar(false));
overlay.addEventListener('click', () => toggleSidebar(false));


// Sidebar Navigation Functions


// Function to show the Portfolio section
function showPortfolio() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
      section.style.display = 'none';  
  });
  document.getElementById('portfolio').style.display = 'block'; // Show Portfolio
}

// Function to show the Market section
function showMarket() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
      section.style.display = 'none'; // Hide all sections
  });
  document.getElementById('market-data').style.display = 'block'; // Show Market Data
}

// Function to show the Trade section
function showTrade() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
      section.style.display = 'none'; // Hide all sections
  });
  document.getElementById('trade').style.display = 'block'; // Show Trade
}

// Function to show the Transactions section
function showTransactions() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
      section.style.display = 'none'; // Hide all sections
  });
  document.getElementById('transactions').style.display = 'block'; // Show Transactions
}

//function to show deposit method
function showDeposit() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById('deposit').style.display = 'block';
}

function showDepositBtn() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('deposit').style.display = 'block';
}

//function to show withdrawal

function showWithdrawal() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById('withdrawal').style.display = 'block';
}

function showWithdrawalBtn() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('withdrawal').style.display = 'block';
}

function showSettings() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
      section.style.display = 'none'; // Hide all sections
  });
  document.getElementById('settings').style.display = 'block'; // Show Settings
}

function showCalculator() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('calculator').style.display = 'block';
}

// Attach the functions to the sidebar menu items
document.getElementById('portfolio-menu').addEventListener('click', showPortfolio);
document.getElementById('market-menu').addEventListener('click', showMarket);
document.getElementById('trading-menu').addEventListener('click', showTrade);
document.getElementById('transaction-menu').addEventListener('click', showTransactions);
document.getElementById('settings-menu').addEventListener('click', showSettings);
document.getElementById('settings-menu').addEventListener('click', showSettings);
document.getElementById('deposit-menu').addEventListener('click', showDeposit);
document.getElementById('withdrawal-menu').addEventListener('click', showWithdrawal);
document.getElementById('calculator-menu').addEventListener('click', showCalculator);
document.getElementById('showwithdrawal-btn').addEventListener('click', showWithdrawalBtn);
document.getElementById('showDeposit-btn').addEventListener('click', showDepositBtn);





// Initialize the default section
showPortfolio();


// Fetch Market Data Functionality
async function fetchMarketData() {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=7&page=1&sparkline=false';

  try {
      const response = await fetch(url);
      const data = await response.json();

      const marketList = document.getElementById('market-list');
      marketList.innerHTML = ''; // Clear any existing data

      data.forEach(coin => {
          const marketItem = document.createElement('div');
          marketItem.classList.add('market-item');
          marketItem.innerHTML = `
              <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
              <p>Price: $${coin.current_price}</p>
              <button onclick="openTradeModal('${coin.id}', 'buy')">Buy</button>
              <button onclick="openTradeModal('${coin.id}', 'sell')">Sell</button>
          `;
          marketList.appendChild(marketItem);
      });
  } catch (error) {
      console.error("Error fetching market data:", error);
  }
}

fetchMarketData();


//code for custom drop down with icons


document.getElementById('deposit-method').addEventListener('change', function () {
  const method = this.value;
  // Hide all sections
  document.querySelectorAll('#deposit-method-sections .deposit-method-section').forEach(section => {
      section.style.display = 'none';
  });

  // Show the selected section
  if (method) {
      const section = document.getElementById(`${method}-section`);
      if (section) section.style.display = 'block';
  }
});

function copyToClipboard(elementId) {
  const copyText = document.getElementById(elementId);
  navigator.clipboard.writeText(copyText.value).then(() => {
      alert('Copied to clipboard!');
  });
}

// Js code for withdrawal toggle functionality
// document.querySelectorAll('.withdrawal-tab').forEach(tab => {
//   tab.addEventListener('click', () => {
//       document.querySelectorAll('.withdrawal-tab').forEach(t => t.classList.remove('active'));
//       tab.classList.add('active');

//       const method = tab.dataset.method;
//       document.querySelectorAll('.withdrawal-method').forEach(methodDiv => {
//           methodDiv.style.display = methodDiv.id === `${method}-method` ? 'block' : 'none';
//       });
//   });
// });


function copyToClipboard(elementId) {
  const input = document.getElementById(elementId);
  input.select();
  document.execCommand("copy");
  alert("Copied to clipboard: " + input.value);
}

// Redirect to Support Email Function
function redirectToSupportEmail() {
  const supportEmail = "swiftedgetrade@gmail.com";
  const subject = "Request for Credit/Debit Card Deposit Instructions";
  const body = `Hello,\n\nI would like to deposit funds using my credit or debit card. Please provide me with the necessary instructions to complete the transaction.\n\nThank you!`;

  // Construct the mailto link
  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Redirect to the mailto link
  window.location.href = mailtoLink;
}


// Redirect to Email Support Function this is for the email 
function redirectToEmailDepositSupport() {
  const supportEmail = "swiftedgetrade@gmail.com";
  const subject = "Request for Deposit Instructions via Email";
  const body = `Hello,\n\nI would like to deposit funds using the 'Deposit through Email' method. Please provide me with the necessary details to complete the transaction.\n\nThank you!`;

  // Construct the mailto link
  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Redirect to the mailto link
  window.location.href = mailtoLink;
}


// Fetch deposit details from the backend when the page loads
window.addEventListener('DOMContentLoaded', () => {
  fetch(`${API_BASE_URL}/api/deposit-details`)
      .then(response => response.json())
      .then(data => {
          if (data) {
              window.depositData = data;
          }
      })
      .catch(error => console.error('Error fetching deposit data:', error));
});

document.getElementById('deposit-method').addEventListener('change', function () {
const method = this.value;
const depositData = window.depositData;

// Hide all sections
document.querySelectorAll('#deposit-method-sections .deposit-method-section').forEach(section => {
    section.style.display = 'none';
});

// Show the selected section and populate with data
if (method) {
    const section = document.getElementById(`${method}-section`);
    if (section) {
        section.style.display = 'block';

        // Bank Transfer Details
        if (method === 'bank-transfer') {
            document.getElementById('bank-name').value = depositData.bankDetails.bankName || '';
            document.getElementById('routing-number').value = depositData.bankDetails.routingNumber || '';
            document.getElementById('account-number').value = depositData.bankDetails.accountNumber || '';
            document.getElementById('account-name').value = depositData.bankDetails.accountName || '';
            document.getElementById('swift-code').value = depositData.bankDetails.swiftCode || '';
        }

        // Cryptocurrency Details
        if (method === 'cryptocurrency') {
          const cryptoType = document.getElementById('crypto-type').value;
          const cryptoDetails = depositData.cryptoDetails.find(crypto => crypto.type === cryptoType);
      
          if (cryptoDetails) {
              document.getElementById('crypto-wallet').value = cryptoDetails.walletAddress;
              document.getElementById('crypto-network').value = cryptoDetails.network;
          } else {
              document.getElementById('crypto-wallet').value = 'Select a cryptocurrency to see the wallet address';
              document.getElementById('crypto-network').value = 'Select a cryptocurrency to see the network';
          }
      }
      

        // Digital Wallet Details
        if (method === 'digital-wallet') {
          const walletType = document.getElementById('wallet-type').value;
          const walletDetails = depositData.digitalWalletDetails.find(wallet => wallet.type === walletType);
      
          if (walletDetails) {
              document.getElementById('wallet-info').value = walletDetails.details;
          } else {
              document.getElementById('wallet-info').value = 'Select a wallet to see the details';
          }
      }
      
    }
}
});


// Function to fetch user information and update the DOM
async function fetchUserInfo() {
  try {
      // Fetch the user info using the GET route
      const response = await fetch(`${API_BASE_URL}/user-info`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,  
          }
      });

      if (!response.ok) {
          throw new Error('Failed to fetch user info');
      }

      const data = await response.json();

      // Update the DOM with the received user data
      document.getElementById('username').innerText = data.username;
      document.getElementById('UID').innerText = data.uid;
      document.getElementById('status').innerText = data.status;
      document.getElementById('last-login').innerText = data.lastLogin || 'N/A';  

  } catch (error) {
      console.error('Error fetching user info:', error);
  }
}


function fetchPortfolioData() {
    console.log('Fetching portfolio data...');
    
    fetch(`${API_BASE_URL}/portfolio`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        console.log('Response status:', response.status);

        if (!response.ok) {
            console.error('Failed to fetch portfolio data. Status:', response.status);
            throw new Error('Failed to fetch portfolio data');
        }
        return response.json();
    })
    .then(data => {
        console.log('Portfolio Data:', data);  
        updatePortfolioUI(data);  
    })
    .catch(error => {
        console.error('Error fetching portfolio data:', error);
        alert('Failed to fetch portfolio data. Please try again.');
    });
}

// Function to update UI with portfolio data
function updatePortfolioUI(data) {
    console.log('Updating portfolio UI with data:', data);

    // Update Total Balance
    const totalBalanceEl = document.getElementById('total-balance');
    if (totalBalanceEl) {
        totalBalanceEl.textContent = `$${data.totalBalance.toFixed(2)}`;
        console.log('Updated total balance:', data.totalBalance);
    }

    // Update Holdings
    const holdingsContainer = document.querySelector(".holdings");
    if (holdingsContainer) {
        holdingsContainer.innerHTML = "";

        if (data.holdings && data.holdings.length > 0) {
            console.log('Updating holdings:', data.holdings);

            data.holdings.forEach(holding => {
                const holdingElement = document.createElement("div");
                holdingElement.classList.add("holding");
                holdingElement.innerHTML = `
                    <h4>${holding.name} (${holding.symbol})</h4>
                    <p>Amount: ${holding.amount}</p>
                    <p>Value: $${holding.value.toFixed(2)}</p>
                `;
                holdingsContainer.appendChild(holdingElement);
            });
        } else {
            console.log('No holdings available');
            holdingsContainer.innerHTML = `<p>No holdings available.</p>`;
        }
    }
}


// window.onload = fetchPortfolioData;

window.onload = function () {
    fetchUserInfo();
    fetchPortfolioData();
    checkTokenExpiration();
};



//checking token expiration

function checkTokenExpiration() {
    const token = localStorage.getItem('authToken');  
    if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));  
        const expirationTime = decodedToken.exp;
        const currentTime = Math.floor(Date.now() / 1000);  

        if (currentTime >= expirationTime) {
            showSessionExpiredMessage();
        }
    }
}

setInterval(checkTokenExpiration, 60000);


function showSessionExpiredMessage() {
    let modal = document.getElementById('sessionExpiredModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sessionExpiredModal';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: #fff; padding: 30px 40px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); max-width: 400px; text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <h2 style="font-size: 18px; color: #333; margin-bottom: 20px;">Session Expired</h2>
                    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">Your session has expired. Please log in again to continue.</p>
                    <button id="loginButton" style="background-color: #007BFF; color: #fff; border: none; padding: 12px 20px; font-size: 16px; border-radius: 5px; cursor: pointer; transition: background-color 0.3s ease; width: 150px;">
                        Log In
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('loginButton').addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        });
    }

    modal.style.display = 'block';
}


// setTimeout(() => {
//     localStorage.removeItem('authToken');
//     window.location.href = '/login';
// }, 10000); 


document.getElementById('roi-calculator-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const investmentAmount = parseFloat(document.getElementById('investment-amount').value);
    const rateOfReturn = parseFloat(document.getElementById('rate-of-return').value) / 100;
    const investmentDuration = parseInt(document.getElementById('investment-duration').value, 10);

    if (isNaN(investmentAmount) || isNaN(rateOfReturn) || isNaN(investmentDuration)) {
        alert('Please fill out all fields with valid numbers.');
        return;
    }

    // Calculate ROI
    const totalReturn = investmentAmount * Math.pow(1 + rateOfReturn, investmentDuration);
    const roi = totalReturn - investmentAmount;

    // Display the result
    const resultDiv = document.getElementById('roi-result');
    document.getElementById('roi-output').innerText = `After ${investmentDuration} years, your total return will be $${totalReturn.toFixed(2)}, which is an ROI of $${roi.toFixed(2)}.`;
    resultDiv.style.display = 'block';
});


//Transaction History Functionality Integration

// Transaction History Management
let currentPage = 1;
const transactionsPerPage = 10;
let currentFilter = 'all';

// Initialize transaction history
function initTransactionHistory() {
    loadTransactions();
    setupFilterButtons();
    document.getElementById('load-more').addEventListener('click', loadMoreTransactions);
}

// Load transactions with current filter
async function loadTransactions(page = 1, filter = 'all') {
    try {
        const url = `${API_BASE_URL}/api/transactions?page=${page}&limit=${transactionsPerPage}${
            filter !== 'all' ? `&filter=${filter}` : ''
        }`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        if (!response.ok) throw new Error('Failed to load transactions');
        
        const { transactions, total, pages } = await response.json();
        
        renderTransactions(transactions, page === 1);
        updateTransactionCount(total);
        
        // Show/hide load more button
        document.getElementById('load-more').style.display = 
            page < pages ? 'block' : 'none';

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load transactions. Please try again.');
    }
}

// Render transactions to the table
function renderTransactions(transactions, clearExisting = true) {
    const tbody = document.getElementById('transaction-list');
    if (clearExisting) tbody.innerHTML = '';

    transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(tx.createdAt)}</td>
            <td class="type-${tx.type}">${tx.type === 'credit' ? 'Deposit' : 'Withdrawal'}</td>
            <td>${tx.type === 'credit' ? '+' : '-'}$${tx.amount.toFixed(2)}</td>
            <td><span class="status-${tx.status}">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span></td>
            <td>${getTransactionDetails(tx)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Helper function to format transaction details
function getTransactionDetails(tx) {
    if (tx.method === 'holding') {
        return `Received ${tx.details.units} ${tx.details.assetSymbol}`;
    }
    if (tx.method === 'withdrawal') {
        return `To ${tx.details.method}: ${tx.details.accountNumber?.slice(-4) || ''}`;
    }
    return tx.details.note || 'Transaction';
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Update transaction count display
function updateTransactionCount(total) {
    const displayedCount = document.getElementById('transaction-list').children.length;
    document.getElementById('transaction-count').textContent = 
        `${displayedCount} of ${total}`;
}

// Load more transactions
function loadMoreTransactions() {
    currentPage++;
    loadTransactions(currentPage, currentFilter);
}

// Setup filter buttons
function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            loadTransactions(currentPage, currentFilter);
        });
    });
}

// Initialize when transactions section loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if transactions section exists
    if (document.getElementById('transactions')) {
        initTransactionHistory();
    }
});

//Withdrawal section functionality

document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const withdrawalTabs = document.querySelectorAll('.withdrawal-tab');
  withdrawalTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const method = this.dataset.method;
      
      // Update active tab
      withdrawalTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding form
      document.querySelectorAll('.withdrawal-method').forEach(form => {
        form.style.display = 'none';
      });
      document.getElementById(`${method}-method`).style.display = 'block';
    });
  });
  
  // Form submission
  const cryptoForm = document.getElementById('crypto-method').querySelector('form');
  const bankForm = document.getElementById('bank-method').querySelector('form');
  
  cryptoForm.addEventListener('submit', handleWithdrawalSubmit);
  bankForm.addEventListener('submit', handleWithdrawalSubmit);
  
  function handleWithdrawalSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const withdrawalData = {};
    const isCrypto = form.closest('.withdrawal-method').id.includes('crypto');
    
    for (const [key, value] of formData.entries()) {
      withdrawalData[key] = value;
    }
    
    // Get the correct amount field based on method
    const amountField = isCrypto ? 'crypto-amount' : 'bank-amount';
    const amountInput = document.getElementById(amountField);
    const amount = parseFloat(withdrawalData[amountField]);
    
    // Validate amount
    if (!amountInput.value || isNaN(amount)) {
      amountInput.focus();
      alert('Please enter a valid amount');
      return;
    }
    
    if (amount <= 0) {
      amountInput.focus();
      alert('Amount must be greater than zero');
      return;
    }
    
    // Set withdrawal method
    withdrawalData.method = isCrypto ? 'crypto' : 'bank';
    
    // Calculate fee (1.5% for crypto, 1% for bank)
    const fee = isCrypto ? amount * 0.015 : amount * 0.01;
    const total = amount + fee;
    
    // Create currency formatter
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    
    // Update summary modal
    document.getElementById('summary-amount').textContent = formatter.format(amount);
    document.getElementById('summary-method').textContent = isCrypto 
      ? `Crypto (${withdrawalData['crypto-type']})` 
      : 'Bank Transfer';
      
    document.getElementById('summary-info').textContent = isCrypto
      ? withdrawalData['crypto-wallet']
      : `${withdrawalData['bank-name']} - ${withdrawalData['account-number']}`;
      
    document.getElementById('summary-fee').textContent = formatter.format(fee);
    document.getElementById('summary-total').textContent = formatter.format(total);
    
    // Store withdrawal data for later use
    document.getElementById('transaction-summary-modal').dataset.withdrawalData = JSON.stringify({
      ...withdrawalData,
      amount: amount,
      fee: fee,
      total: total
    });
    
    // Show summary modal
    document.getElementById('transaction-summary-modal').style.display = 'flex';
  }
  
  // Modal Controls
  document.querySelector('.modal-close').addEventListener('click', function() {
    document.getElementById('transaction-summary-modal').style.display = 'none';
  });
  
  document.getElementById('cancel-transaction').addEventListener('click', function() {
    document.getElementById('transaction-summary-modal').style.display = 'none';
  });
  
  document.getElementById('confirm-transaction').addEventListener('click', function() {
    document.getElementById('transaction-summary-modal').style.display = 'none';
    document.getElementById('withdrawal-pin-modal').style.display = 'flex';
  });
  
  // PIN Input Handling
  const pinInput = document.getElementById('hidden-pin-input');
  const pinDots = document.querySelectorAll('.pin-dot');
  
  document.querySelectorAll('.pin-key[data-key]').forEach(key => {
    key.addEventListener('click', function() {
      if (pinInput.value.length < 6) {
        pinInput.value += this.dataset.key;
        updatePinDots();
      }
    });
  });
  
  document.querySelector('.pin-key[data-action="clear"]').addEventListener('click', function() {
    pinInput.value = '';
    updatePinDots();
  });
  
  document.querySelector('.pin-key[data-action="submit"]').addEventListener('click', submitWithdrawal);
  
  function updatePinDots() {
    pinDots.forEach((dot, index) => {
      if (index < pinInput.value.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }
  
    async function submitWithdrawal() {
        if (pinInput.value.length < 4) {
            alert('Please enter at least 4 digits');
            return;
        }
        
        const pin = pinInput.value;
        const withdrawalData = JSON.parse(
            document.getElementById('transaction-summary-modal').dataset.withdrawalData
        );
        
        // Show loading state
        const submitBtn = document.querySelector('.pin-key[data-action="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        
        try {
            console.log('Starting withdrawal process...', { withdrawalData });
            
            // 1. First verify PIN
            console.log('Verifying PIN...');
            const pinResponse = await fetch(`${API_BASE_URL}/verify-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ pin })
            });
            
            const pinResponseText = await pinResponse.text();
            let pinResponseData;
            try {
                pinResponseData = JSON.parse(pinResponseText);
            } catch {
                pinResponseData = { message: pinResponseText };
            }
            
            console.log('PIN verification response:', {
                status: pinResponse.status,
                data: pinResponseData
            });

            if (!pinResponse.ok) {
                throw new Error(pinResponseData.message || 'PIN verification failed');
            }

            // 2. Submit withdrawal request
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('You need to be logged in to perform this action');
            }

            const withdrawalPayload = {
                amount: withdrawalData.amount,
                method: withdrawalData.method,
                cryptoType: withdrawalData['crypto-type'],
                walletAddress: withdrawalData['crypto-wallet'],
                bankDetails: withdrawalData.method === 'bank' ? {
                    bankName: withdrawalData['bank-name'],
                    accountNumber: withdrawalData['account-number'],
                    routingNumber: withdrawalData['routing-number']
                } : null
            };

            console.log('Submitting withdrawal with payload:', withdrawalPayload);

            const withdrawalResponse = await fetch(`${API_BASE_URL}/api/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(withdrawalPayload)
            });

            const withdrawalResponseText = await withdrawalResponse.text();
            let withdrawalResponseData;
            try {
                withdrawalResponseData = JSON.parse(withdrawalResponseText);
            } catch {
                withdrawalResponseData = { message: withdrawalResponseText };
            }

            console.log('Withdrawal response:', {
                status: withdrawalResponse.status,
                data: withdrawalResponseData
            });

            if (!withdrawalResponse.ok) {
                // Handle specific "User not found" error
                if (withdrawalResponse.status === 404 && withdrawalResponseData.error?.includes('User not found')) {
                    localStorage.removeItem('authToken');
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(
                    withdrawalResponseData.message || 
                    withdrawalResponseData.error || 
                    `Withdrawal failed with status ${withdrawalResponse.status}`
                );
            }

            // Show success
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Withdrawal Successful the money is on its way to your Bank.',
                timer: 3000
            });
            
            // Reset forms and close modals
            document.getElementById('withdrawal-pin-modal').style.display = 'none';
            document.getElementById('crypto-method').querySelector('form').reset();
            document.getElementById('bank-method').querySelector('form').reset();
            
        } catch (error) {
            console.error('Full withdrawal error:', {
                error: error,
                message: error.message,
                stack: error.stack
            });
            
            let errorMessage = error.message;
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('status 500')) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.message.includes('User not found') || error.message.includes('Session expired')) {
                errorMessage = 'Session expired. Please login again.';
                localStorage.removeItem('authToken');
                setTimeout(() => window.location.href = '/login', 2000);
            }

            Swal.fire({
                icon: 'error',
                title: 'Withdrawal Failed',
                text: errorMessage,
                timer: 3000
            });
        } finally {
            // Reset PIN input
            pinInput.value = '';
            updatePinDots();
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
        }
    }
  
});
