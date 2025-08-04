document.addEventListener('DOMContentLoaded', function() {
    // Stopwatch logic with user/task setup
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval;
    let running = false;
    let userName = '';
    let taskName = '';
    
    // Get DOM elements
    const display = document.getElementById('display');
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const resetBtn = document.getElementById('reset');
    const lapBtn = document.getElementById('lap');
    const lapList = document.getElementById('lapList');
    const setupForm = document.querySelector('.setup-form');
    const setupBtn = document.getElementById('setupBtn');
    const userNameInput = document.getElementById('userName');
    const taskNameInput = document.getElementById('taskName');
    const stopwatchDiv = document.querySelector('.stopwatch');
    const userDisplay = document.getElementById('userDisplay');
    const taskDisplay = document.getElementById('taskDisplay');

    function formatTime(ms) {
        let centiseconds = Math.floor((ms % 1000) / 10);
        let seconds = Math.floor((ms / 1000) % 60);
        let minutes = Math.floor((ms / (1000 * 60)) % 60);
        let hours = Math.floor(ms / (1000 * 60 * 60));
        return (
            (hours < 10 ? '0' : '') + hours + ':' +
            (minutes < 10 ? '0' : '') + minutes + ':' +
            (seconds < 10 ? '0' : '') + seconds + '.' +
            (centiseconds < 10 ? '0' : '') + centiseconds
        );
    }

    function updateDisplay() {
        display.textContent = formatTime(elapsedTime);
    }

    function startTimer() {
        if (!running) {
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(() => {
                elapsedTime = Date.now() - startTime;
                updateDisplay();
            }, 10);
            running = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            resetBtn.disabled = true;
            lapBtn.disabled = false;
        }
    }

    function stopTimer() {
        if (running) {
            clearInterval(timerInterval);
            running = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            resetBtn.disabled = false;
            lapBtn.disabled = true;
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        running = false;
        elapsedTime = 0;
        updateDisplay();
        lapList.innerHTML = '';
        resetBtn.disabled = true;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        lapBtn.disabled = true;
    }

    function addLap() {
        const li = document.createElement('li');
        const lapNumber = lapList.children.length + 1;
        li.textContent = `Lap ${lapNumber}: ${formatTime(elapsedTime)}`;
        lapList.appendChild(li);
    }

    // Event listeners for buttons
    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    lapBtn.addEventListener('click', addLap);

    // Setup form logic
    setupBtn.addEventListener('click', function() {
        const nameVal = userNameInput.value.trim();
        const taskVal = taskNameInput.value.trim();
        
        // Reset border colors
        userNameInput.style.borderColor = '';
        taskNameInput.style.borderColor = '';
        
        if (!nameVal) {
            userNameInput.focus();
            userNameInput.style.borderColor = '#ff4d4d';
            return;
        }
        if (!taskVal) {
            taskNameInput.focus();
            taskNameInput.style.borderColor = '#ff4d4d';
            return;
        }
        
        userName = nameVal;
        taskName = taskVal;
        
        // Update display elements
        userDisplay.textContent = `User: ${userName}`;
        taskDisplay.textContent = `Task: ${taskName}`;
        
        // Switch views
        setupForm.style.display = 'none';
        stopwatchDiv.style.display = 'block';
        updateDisplay();
    });

    // Reset border color on input
    userNameInput.addEventListener('input', function() {
        userNameInput.style.borderColor = '';
    });
    taskNameInput.addEventListener('input', function() {
        taskNameInput.style.borderColor = '';
    });

    // Allow Enter key to submit setup form
    userNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            taskNameInput.focus();
        }
    });
    taskNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            setupBtn.click();
        }
    });

    // Keyboard shortcuts for accessibility
    // Space: Start/Stop, R: Reset, L: Lap
    document.addEventListener('keydown', function(e) {
        if (setupForm.style.display !== 'none') return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            if (running) {
                stopTimer();
            } else {
                startTimer();
            }
        } else if (e.key.toLowerCase() === 'r' && !resetBtn.disabled) {
            e.preventDefault();
            resetTimer();
        } else if (e.key.toLowerCase() === 'l' && !lapBtn.disabled) {
            e.preventDefault();
            addLap();
        }
    });

    // Export laps as text (for pro functionality)
    function exportLaps() {
        const laps = Array.from(lapList.children).map(li => li.textContent).join('\n');
        const details = `Name: ${userName}\nTask: ${taskName}\nDate: ${new Date().toLocaleString()}\n\nLap Times:\n`;
        
        if (!laps) {
            alert('No laps to export!');
            return;
        }
        
        const blob = new Blob([details + laps], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${taskName.replace(/[^a-z0-9]/gi, '_')}_laps.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Add export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Laps';
    exportBtn.className = 'export-btn';
    exportBtn.onclick = exportLaps;
    
    // Place export button after the laps container
    const lapsContainer = document.getElementById('laps');
    lapsContainer.parentNode.insertBefore(exportBtn, lapsContainer.nextSibling);

    // Initial display
    updateDisplay();
});