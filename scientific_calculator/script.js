document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const historyPanel = document.getElementById('historyPanel');
    const historyList = document.getElementById('historyList');
    
    // Buttons
    const buttons = document.querySelectorAll('.btn[data-action]');
    const clearBtn = document.getElementById('clearBtn');
    const delBtn = document.getElementById('delBtn');
    const equalBtn = document.getElementById('equalBtn');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // State
    let currentInput = '';
    let isResultDisplayed = false;
    let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

    // Initialize
    updateHistoryUI();

    // Event Listeners for keypad
    buttons.forEach(btn => {
        btn.addEventListener('click', () => handleInput(btn.dataset.value));
    });

    clearBtn.addEventListener('click', clearAll);
    delBtn.addEventListener('click', deleteLast);
    equalBtn.addEventListener('click', calculate);

    // Toggle History
    toggleHistoryBtn.addEventListener('click', () => {
        historyPanel.classList.toggle('active');
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const isLight = root.getAttribute('data-theme') === 'light';
        root.setAttribute('data-theme', isLight ? 'dark' : 'light');
        themeToggleBtn.innerHTML = isLight ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
    });

    // Clear History
    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        localStorage.setItem('calcHistory', JSON.stringify(history));
        updateHistoryUI();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        
        if (/[0-9+\-*/.()]/.test(key)) {
            e.preventDefault();
            handleInput(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculate();
        } else if (key === 'Backspace') {
            e.preventDefault();
            deleteLast();
        } else if (key === 'Escape') {
            e.preventDefault();
            clearAll();
        }
    });

    // Core Logic
    function handleInput(val) {
        if (isResultDisplayed) {
            // If result is showing, and user types an operator, continue from result
            if (/[\+\-\*\/\^%]/.test(val)) {
                currentInput = resultEl.textContent + val;
            } else {
                currentInput = val;
            }
            isResultDisplayed = false;
            expressionEl.textContent = '';
        } else {
            currentInput += val;
        }
        updateDisplay();
    }

    function clearAll() {
        currentInput = '';
        isResultDisplayed = false;
        expressionEl.textContent = '';
        resultEl.textContent = '0';
    }

    function deleteLast() {
        if (isResultDisplayed) return;
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
    }

    function updateDisplay() {
        resultEl.textContent = currentInput || '0';
    }

    function calculate() {
        if (!currentInput) return;
        
        try {
            let expr = currentInput;
            
            // Format expression for JS eval or Math functions
            expr = expr.replace(/×/g, '*')
                       .replace(/÷/g, '/')
                       .replace(/π/g, 'Math.PI')
                       .replace(/e/g, 'Math.E')
                       .replace(/sin\(/g, 'Math.sin(')
                       .replace(/cos\(/g, 'Math.cos(')
                       .replace(/tan\(/g, 'Math.tan(')
                       .replace(/log\(/g, 'Math.log10(')
                       .replace(/ln\(/g, 'Math.log(')
                       .replace(/sqrt\(/g, 'Math.sqrt(');
            
            // Handle factorial
            if (expr.includes('!')) {
                // Simplified factorial replacement (not full parser)
                // Just as a proof of concept for basic n! at end of string
                expr = expr.replace(/(\d+)!/g, (match, n) => factorial(parseInt(n)));
            }
            
            // Handle power ^
            if (expr.includes('^')) {
                // A bit complex for simple eval, using regex
                expr = expr.replace(/([0-9\.]+)\^([0-9\.]+)/g, 'Math.pow($1, $2)');
            }

            // Using Function constructor instead of eval for slightly better security
            // Note: In a real production app, a proper math parser like math.js is recommended
            const result = new Function('return ' + expr)();
            
            // Format result
            let formattedResult = result;
            if (!Number.isInteger(result) && result !== undefined) {
                formattedResult = parseFloat(result.toFixed(8)); // Avoid JS float precision issues
            }
            
            if (isNaN(formattedResult) || !isFinite(formattedResult)) {
                throw new Error("Invalid calculation");
            }
            
            // Update History
            addToHistory(currentInput, formattedResult);
            
            // Update UI
            expressionEl.textContent = currentInput + ' =';
            resultEl.textContent = formattedResult;
            currentInput = formattedResult.toString();
            isResultDisplayed = true;
            
        } catch (error) {
            expressionEl.textContent = 'Error';
            resultEl.textContent = 'Invalid Input';
            isResultDisplayed = true;
            currentInput = '';
        }
    }

    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    function addToHistory(expr, res) {
        history.unshift({ expr, res });
        if (history.length > 20) history.pop(); // Keep only last 20
        localStorage.setItem('calcHistory', JSON.stringify(history));
        updateHistoryUI();
    }

    function updateHistoryUI() {
        if (history.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No history yet</div>';
            return;
        }
        
        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="hist-expr">${item.expr}</div>
                <div class="hist-res">${item.res}</div>
            </div>
        `).join('');

        // Add click listener to history items
        document.querySelectorAll('.history-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                currentInput = history[index].res.toString();
                isResultDisplayed = false;
                expressionEl.textContent = '';
                updateDisplay();
                if(window.innerWidth <= 850) {
                    historyPanel.classList.remove('active');
                }
            });
        });
    }
});
