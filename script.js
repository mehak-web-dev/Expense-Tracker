
      const STORAGE_KEY = 'expense-tracker-items';
      const BUDGET_KEY = 'expense-tracker-budget';

      const expenseForm = document.getElementById('expenseForm');
      const transactionsContainer = document.getElementById('transactions');
      const totalSpentElement = document.getElementById('totalSpent');
      const remainingBudgetElement = document.getElementById('remainingBudget');
      const transactionCountElement = document.getElementById('transactionCount');
      const budgetInput = document.getElementById('budgetInput');
      const titleInput = document.getElementById('title');
      const amountInput = document.getElementById('amount');
      const categoryInput = document.getElementById('category');
      const dateInput = document.getElementById('date');

      let expenses = loadExpenses();
      let budget = loadBudget();

      document.addEventListener('DOMContentLoaded', () => {
        budgetInput.value = budget || '';
        dateInput.value = new Date().toISOString().split('T')[0];
        render();
      });

      budgetInput.addEventListener('input', (event) => {
        budget = parseFloat(event.target.value) || 0;
        localStorage.setItem(BUDGET_KEY, String(budget));
        renderSummary();
      });

      expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;

        if (!title || Number.isNaN(amount) || amount <= 0 || !date) {
          return;
        }

        expenses.push({
          id: Date.now().toString(),
          title,
          amount,
          category,
          date
        });

        saveExpenses();
        expenseForm.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        render();
      });

      function loadExpenses() {
        const items = localStorage.getItem(STORAGE_KEY);
        return items ? JSON.parse(items) : [];
      }

      function loadBudget() {
        const saved = localStorage.getItem(BUDGET_KEY);
        return saved ? Number(saved) : 0;
      }

      function saveExpenses() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      }

      function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value || 0);
      }

      function render() {
        renderSummary();
        renderTransactions();
      }

      function renderSummary() {
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        const remaining = budget - totalSpent;

        totalSpentElement.textContent = formatCurrency(totalSpent);
        remainingBudgetElement.textContent = formatCurrency(remaining);
        transactionCountElement.textContent = String(expenses.length);
      }

      function renderTransactions() {
        if (!expenses.length) {
          transactionsContainer.innerHTML = '<div class="empty-state">No expenses added yet.</div>';
          return;
        }

        const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        transactionsContainer.innerHTML = sorted
          .map(
            (item) => `
              <div class="transaction">
                <div class="transaction-main">
                  <span class="transaction-title">${escapeHtml(item.title)}</span>
                  <span class="transaction-meta">${escapeHtml(item.category)} • ${formatDate(item.date)}</span>
                </div>
                <span class="amount">${formatCurrency(item.amount)}</span>
                <button class="delete-btn" data-id="${item.id}" type="button">Delete</button>
              </div>
            `
          )
          .join('');

        transactionsContainer.querySelectorAll('.delete-btn').forEach((button) => {
          button.addEventListener('click', () => {
            const { id } = button.dataset;
            expenses = expenses.filter((item) => item.id !== id);
            saveExpenses();
            render();
          });
        });
      }

      function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
  