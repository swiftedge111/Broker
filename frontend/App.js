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
document.querySelectorAll('.withdrawal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
      document.querySelectorAll('.withdrawal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const method = tab.dataset.method;
      document.querySelectorAll('.withdrawal-method').forEach(methodDiv => {
          methodDiv.style.display = methodDiv.id === `${method}-method` ? 'block' : 'none';
      });
  });
});


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
                    <p>Value: $${holding.value.toFixed(4)}</p>
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



// Enhanced handleWithdrawalSubmit function
async function handleWithdrawalSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const amount = parseFloat(form.querySelector('input[type="number"]').value);
  const method = form.closest('.withdrawal-method').id.includes('crypto') ? 'crypto' : 'bank';
  
  // Prepare details based on method
  const details = method === 'crypto' ? {
    type: form.querySelector('#crypto-type').value,
    wallet: form.querySelector('#crypto-wallet').value
  } : {
    bankName: form.querySelector('#bank-name').value,
    accountNumber: form.querySelector('#account-number').value,
    routingNumber: form.querySelector('#routing-number').value
  };

  try {
    // Verify PIN first
    const pinVerified = await verifyPin();
    if (!pinVerified) throw new Error('PIN verification failed');

    // Submit withdrawal request
    const response = await fetch(`${API_BASE_URL}/api/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ amount, method, details })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Withdrawal failed');
    }

    const transaction = await response.json();

    // Show success
    Swal.fire({
      icon: 'success',
      title: 'Withdrawal Submitted!',
      text: `Your $${amount} withdrawal is pending approval`,
      confirmButtonText: 'OK'
    });

    // Refresh transactions
    loadTransactions();
    updateUserBalance();

  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  }
}
// Load Real Transactions
async function loadTransactions() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    const transactions = await response.json();
    renderTransactions(transactions);
  } catch (error) {
    console.error('Failed to load transactions:', error);
  }
}


// Render Transactions
// Make sure your transaction rendering shows credit transactions
function renderTransactions(transactions) {
    const tbody = document.getElementById('transaction-list');
    tbody.innerHTML = '';

    transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.className = `transaction-${tx.type}`;
        row.innerHTML = `
            <td>${new Date(tx.createdAt).toLocaleString()}</td>
            <td class="type-${tx.type}">${tx.type.toUpperCase()}</td>
            <td>$${tx.amount.toFixed(2)}</td>
            <td class="status-${tx.status}">${tx.status.toUpperCase()}</td>
            <td>${getTransactionDescription(tx)}</td>
        `;
        tbody.appendChild(row);
    });
}

//Helper function to get transaction description
function getTransactionDescription(tx) {
    if (tx.type === 'credit') {
        if (tx.method === 'holding') {
            return `Funding: ${tx.details.assetName} (${tx.details.units} units)`;
        }
        return 'Account funding';
    }
    // ... rest of your withdrawal descriptions
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTransactions();
  
  // Attach form handlers
  document.querySelectorAll('.withdrawal-form').forEach(form => {
    form.addEventListener('submit', handleWithdrawalSubmit);
  });
});