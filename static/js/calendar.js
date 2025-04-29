/**
 * GDG X Programming Calendar
 * JavaScript for calendar functionality
 */

// DOM Elements
const monthYearElement = document.getElementById('monthYear');
const calendarGridElement = document.getElementById('calendarGrid');
const selectedDateElement = document.getElementById('selectedDate');
const tasksListElement = document.getElementById('tasksList');
const todayButton = document.getElementById('todayBtn');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const currentTimeElement = document.getElementById('current-time');

// Calendar State
const today = new Date();
const todayStr = formatDateStr(today);
let currentMonth = new Date();
let selectedDateStr = todayStr;

// Task Data
let taskMap = {};
let checkedTasks = {}; // Object to track checked tasks

// Fetch tasks from topics.json
async function fetchTasks() {
    try {
        const response = await fetch('static/topics.json');
        taskMap = await response.json();
        
        // Initialize checked state from task data
        for (const dateKey in taskMap) {
            if (!checkedTasks[dateKey]) {
                checkedTasks[dateKey] = {};
            }
            
            taskMap[dateKey].forEach((task, taskIndex) => {
                if (!checkedTasks[dateKey][taskIndex]) {
                    checkedTasks[dateKey][taskIndex] = {};
                }
                
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach((subtask, subtaskIndex) => {
                        // Initialize with completed status from JSON if available
                        checkedTasks[dateKey][taskIndex][subtaskIndex] = subtask.completed || false;
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        taskMap = {}; // Fallback to empty object
    }
}

// Format date as YYYY-MM-DD string
function formatDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Get month name
function getMonthName(month) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
}

// Format date as readable string
function formatReadableDate(date) {
    const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    };
    return date.toLocaleDateString('en-US', options);
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    currentTimeElement.textContent = now.toLocaleDateString('en-US', options);
}

// Render calendar month
function renderCalendar() {
    // Update header
    monthYearElement.textContent = `${getMonthName(currentMonth.getMonth())} ${currentMonth.getFullYear()}`;
    
    // Clear existing grid
    calendarGridElement.innerHTML = '';
    
    // Calculate first day and days in month
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const previousMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    
    // Create previous month placeholder days
    for (let i = 0; i < firstDay; i++) {
        const dayNumber = previousMonthDays - firstDay + i + 1;
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day calendar-day-disabled';
        dayElement.textContent = dayNumber;
        calendarGridElement.appendChild(dayElement);
    }
    
    // Create current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = formatDateStr(dateObj);
        
        const dayElement = document.createElement('button');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Add special classes
        if (dateStr === todayStr) {
            dayElement.classList.add('calendar-day-today');
        }
        
        if (dateStr === selectedDateStr) {
            dayElement.classList.add('calendar-day-active');
        }
        
        if (taskMap[dateStr] && taskMap[dateStr].length > 0) {
            dayElement.classList.add('calendar-day-has-task');
        }
        
        // Add click event
        dayElement.addEventListener('click', () => selectDate(dateStr));
        
        calendarGridElement.appendChild(dayElement);
    }
    
    // Calculate remaining cells for next month
    const totalCells = 42; // 6 rows of 7 days
    const remainingCells = totalCells - (firstDay + daysInMonth);
    
    // Create next month placeholder days
    for (let i = 1; i <= remainingCells; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day calendar-day-disabled';
        dayElement.textContent = i;
        calendarGridElement.appendChild(dayElement);
    }
}

function selectDate(dateStr) {
    const prevSelected = calendarGridElement.querySelector('.calendar-day-active');
    if (prevSelected) {
        prevSelected.classList.remove('calendar-day-active');
    }
    
    selectedDateStr = dateStr;
    
    const allDays = calendarGridElement.querySelectorAll('.calendar-day:not(.calendar-day-disabled)');
    const selectedDate = new Date(dateStr);
    const selectedDay = selectedDate.getDate();
    
    for (let i = 0; i < allDays.length; i++) {
        if (parseInt(allDays[i].textContent) === selectedDay) {
            allDays[i].classList.add('calendar-day-active');
            break;
        }
    }
    
    selectedDateElement.textContent = formatReadableDate(selectedDate);
    
    displayTasks(dateStr);
}

function displayTasks(dateStr) {
    // Show loading state
    tasksListElement.innerHTML = `
        <div class="loading">
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const tasks = taskMap[dateStr] || [];
        tasksListElement.innerHTML = '';
        
        if (tasks.length === 0) {
            tasksListElement.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No tasks scheduled for this day</p>
                    <p>Enjoy your free time!</p>
                </div>
            `;
            return;
        }
        
        // Initialize checked tasks for this date if not exists
        if (!checkedTasks[dateStr]) {
            checkedTasks[dateStr] = {};
        }
        
        tasks.forEach((task, taskIndex) => {
            // Initialize checked state for this task if not exists
            if (!checkedTasks[dateStr][taskIndex]) {
                checkedTasks[dateStr][taskIndex] = {};
            }
            
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item fade-in';
            taskElement.style.animationDelay = `${0.1 + (taskIndex * 0.05)}s`;
            
            const taskTitle = task.title || 'Untitled Task';
            let taskHTML = `<div class="task-header"><span class="task-text">${taskTitle}</span></div>`;
            
            // Handle subtasks
            if (task.subtasks && task.subtasks.length > 0) {
                taskHTML += `<div class="task-subtasks">`;
                
                task.subtasks.forEach((subtask, subtaskIndex) => {
                    // Initialize completed state from JSON if not already set
                    if (checkedTasks[dateStr][taskIndex][subtaskIndex] === undefined) {
                        checkedTasks[dateStr][taskIndex][subtaskIndex] = subtask.completed || false;
                    }
                    
                    const isChecked = checkedTasks[dateStr][taskIndex][subtaskIndex];
                    
                    taskHTML += `
                        <div class="task-subtask">
                            <input type="checkbox" class="task-checkbox" 
                                data-task-index="${taskIndex}" 
                                data-subtask-index="${subtaskIndex}" 
                                ${isChecked ? 'checked' : ''}>
                            <span class="task-text ${isChecked ? 'task-completed' : ''}">${subtask.description}</span>
                        </div>
                    `;
                });
                
                taskHTML += `</div>`;
            } else {
                // Fallback for tasks without subtasks
                taskHTML += `
                    <div class="task-subtask">
                        <input type="checkbox" class="task-checkbox" 
                            data-task-index="${taskIndex}" 
                            data-subtask-index="main">
                        <span class="task-text">${task.description || ''}</span>
                    </div>
                `;
            }
            
            taskElement.innerHTML = taskHTML;
            
            // Add event listeners for checkboxes
            taskElement.querySelectorAll('.task-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const taskIndex = checkbox.getAttribute('data-task-index');
                    const subtaskIndex = checkbox.getAttribute('data-subtask-index');
                    const textElement = checkbox.nextElementSibling;
                    
                    // Update checked state
                    if (subtaskIndex === 'main') {
                        // Handle main task checkbox
                        checkedTasks[dateStr][taskIndex].main = checkbox.checked;
                    } else {
                        // Handle subtask checkbox
                        checkedTasks[dateStr][taskIndex][subtaskIndex] = checkbox.checked;
                        
                        // Also update the completed status in the task data
                        if (taskMap[dateStr] && 
                            taskMap[dateStr][taskIndex] && 
                            taskMap[dateStr][taskIndex].subtasks) {
                            taskMap[dateStr][taskIndex].subtasks[subtaskIndex].completed = checkbox.checked;
                        }
                    }
                    
                    // Update text styling
                    if (checkbox.checked) {
                        textElement.classList.add('task-completed');
                    } else {
                        textElement.classList.remove('task-completed');
                    }
                });
            });
            
            tasksListElement.appendChild(taskElement);
        });
    }, 600);
}

function setupEventListeners() {
    prevMonthButton.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthButton.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });
    
    todayButton.addEventListener('click', () => {
        currentMonth = new Date(today);
        renderCalendar();
        selectDate(todayStr);
    });
}

async function initializeCalendar() {
    await fetchTasks();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    setupEventListeners();
    renderCalendar();
    selectDate(todayStr);
}

document.addEventListener('DOMContentLoaded', initializeCalendar);
