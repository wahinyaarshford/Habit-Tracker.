// ============================================
// HABIT TRACKER APP - JavaScript
// ============================================

// Data storage (using LocalStorage)
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.init();
    }

    // Initialize the app
    init() {
        this.setupEventListeners();
        this.render();
    }

    // Setup all event listeners
    setupEventListeners() {
        document.getElementById('addHabitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addHabit();
        });

        // Close modal
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('habitModal').style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('habitModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Add a new habit
    addHabit() {
        const name = document.getElementById('habitName').value.trim();
        const description = document.getElementById('habitDescription').value.trim();
        const category = document.getElementById('habitCategory').value;

        if (!name || !category) {
            alert('Please fill in all required fields');
            return;
        }

        const habit = {
            id: Date.now(),
            name: name,
            description: description,
            category: category,
            createdDate: new Date().toISOString().split('T')[0],
            completedDates: [],
            currentStreak: 0,
            longestStreak: 0
        };

        this.habits.push(habit);
        this.saveHabits();
        this.clearForm();
        this.render();
        
        alert(`✅ Habit "${name}" added successfully!`);
    }

    // Clear the form
    clearForm() {
        document.getElementById('addHabitForm').reset();
    }

    // Mark habit as completed for today
    completeHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];

        // Check if already completed today
        if (habit.completedDates.includes(today)) {
            alert('Already completed today! 🎉');
            return;
        }

        habit.completedDates.push(today);
        this.updateStreaks(habit);
        this.saveHabits();
        this.render();
        
        alert(`✅ Great job! "${habit.name}" completed for today!`);
    }

    // Update streaks
    updateStreaks(habit) {
        const completedDates = habit.completedDates
            .map(date => new Date(date))
            .sort((a, b) => a - b);

        if (completedDates.length === 0) {
            habit.currentStreak = 0;
            return;
        }

        // Calculate current streak
        let currentStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let lastDate = new Date(completedDates[completedDates.length - 1]);
        lastDate.setHours(0, 0, 0, 0);

        // Check if last completion was today or yesterday
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        if (daysDiff > 1) {
            currentStreak = 1;
        } else {
            currentStreak = 1;
            for (let i = completedDates.length - 2; i >= 0; i--) {
                let currentDate = new Date(completedDates[i]);
                let nextDate = new Date(completedDates[i + 1]);
                
                currentDate.setHours(0, 0, 0, 0);
                nextDate.setHours(0, 0, 0, 0);
                
                const diff = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));
                if (diff === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        habit.currentStreak = currentStreak;

        // Update longest streak
        if (currentStreak > habit.longestStreak) {
            habit.longestStreak = currentStreak;
        }
    }

    // Delete a habit
    deleteHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveHabits();
            this.render();
            alert('Habit deleted successfully');
        }
    }

    // Get completion percentage for today
    getCompletionRateToday() {
        if (this.habits.length === 0) return 0;

        const today = new Date().toISOString().split('T')[0];
        const completed = this.habits.filter(h => h.completedDates.includes(today)).length;

        return Math.round((completed / this.habits.length) * 100);
    }

    // Get habits completed today
    getCompletedToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.habits.filter(h => h.completedDates.includes(today)).length;
    }

    // Get best streak
    getBestStreak() {
        if (this.habits.length === 0) return 0;
        return Math.max(...this.habits.map(h => h.longestStreak));
    }

    // Render the UI
    render() {
        this.renderHabits();
        this.updateStats();
    }

    // Render habits list
    renderHabits() {
        const habitsList = document.getElementById('habitsList');
        
        if (this.habits.length === 0) {
            habitsList.innerHTML = '<p class="empty-state">No habits yet. Add one to get started! 🚀</p>';
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        habitsList.innerHTML = this.habits.map(habit => {
            const isCompletedToday = habit.completedDates.includes(today);
            
            return `
                <div class="habit-card ${habit.category}">
                    <div class="habit-header">
                        <h3 class="habit-name">${habit.name}</h3>
                        <span class="habit-category">${habit.category}</span>
                    </div>
                    
                    <p class="habit-description">${habit.description || 'No description'}</p>
                    
                    <div class="habit-stats">
                        <div class="stat">
                            <div class="stat-label">Current Streak</div>
                            <div class="stat-value">🔥 ${habit.currentStreak}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">Longest Streak</div>
                            <div class="stat-value">⭐ ${habit.longestStreak}</div>
                        </div>
                    </div>
                    
                    <div class="habit-actions">
                        <button class="habit-check-btn ${isCompletedToday ? 'completed' : ''}" 
                                onclick="app.completeHabit(${habit.id})">
                            ${isCompletedToday ? '✅ Done Today' : '✓ Mark Complete'}
                        </button>
                        <button class="habit-delete-btn" onclick="app.deleteHabit(${habit.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update statistics
    updateStats() {
        document.getElementById('totalHabits').textContent = this.habits.length;
        document.getElementById('completedToday').textContent = this.getCompletedToday();
        document.getElementById('bestStreak').textContent = this.getBestStreak();
        document.getElementById('completionRate').textContent = this.getCompletionRateToday() + '%';
    }

    // Save habits to LocalStorage
    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    // Load habits from LocalStorage
    loadHabits() {
        const stored = localStorage.getItem('habits');
        return stored ? JSON.parse(stored) : [];
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new HabitTracker();
});