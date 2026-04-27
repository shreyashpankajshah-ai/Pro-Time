// --- Advanced Loading Sequence ---
document.addEventListener("DOMContentLoaded", () => {
    const textElement = document.getElementById("loaderText");
    const text = textElement.innerText;
    textElement.innerHTML = "";
    
    // Split text into individual spans for letter-by-letter animation
    text.split("").forEach(char => {
        let span = document.createElement("span");
        span.innerText = char;
        textElement.appendChild(span);
    });

    // GSAP Timeline for pro transitions
    const tl = gsap.timeline();
    
    tl.to(".loader-text span", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "back.out(1.7)"
    })
    .to(".loader-text span", {
        opacity: 0,
        y: -50,
        filter: "blur(10px)",
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.inOut",
        delay: 0.5
    })
    .to("#loader", {
        yPercent: -100,
        duration: 0.8,
        ease: "expo.inOut"
    })
    .call(() => {
        document.body.style.overflow = "auto";
        document.getElementById("dashboard").classList.remove("hidden");
        // Animate elements entering the screen
        gsap.fromTo(".sidebar", {x: -100, opacity: 0}, {x: 0, opacity: 1, duration: 0.8, ease: "power3.out"});
        gsap.fromTo(".top-navbar", {y: -50, opacity: 0}, {y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out"});
        gsap.fromTo(".stat-card", {y: 50, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.4, ease: "back.out(1.5)"});
        gsap.fromTo(".panel", {y: 50, opacity: 0}, {y: 0, opacity: 1, duration: 0.8, stagger: 0.2, delay: 0.6, ease: "power3.out"});

        loadData();
    });

    // Start Live Clock
    setInterval(updateClock, 1000);
    updateClock();
});

// --- NEW: Real-Time Clock ---
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('systemClock').innerText = timeString;
}

// --- NEW: Dynamic Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    if (type === 'success') toast.style.borderLeftColor = '#2ed573';
    if (type === 'warning') toast.style.borderLeftColor = '#ffa502';
    
    toast.innerText = message;
    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        gsap.to(toast, {opacity: 0, x: 100, duration: 0.5, onComplete: () => toast.remove()});
    }, 3000);
}

// --- Logic Data Structures ---
let scheduleData = [];
let totalTasks = 0;
let completedTasks = 0;

// --- Core Functions ---

    // --- NEW: Local Storage Functions ---
function saveData() {
    localStorage.setItem('proTimeSchedule', JSON.stringify(scheduleData));
}

function loadData() {
    const saved = localStorage.getItem('proTimeSchedule');
    if (saved) {
        scheduleData = JSON.parse(saved);
        // Recalculate totals
        totalTasks = scheduleData.length;
        completedTasks = scheduleData.filter(t => t.status === 'completed').length;
        updateUI(); // Refresh the screen with saved data
    }
}
function injectTask() {
    const title = document.getElementById('taskTitle').value;
    const time = document.getElementById('taskTime').value;
    const priority = document.getElementById('taskPriority').value;

    if(!title || !time) {
        showToast("System Error: Incomplete Data Parameters.", "warning");
        return;
    }

    const taskObj = { id: Date.now(), title, time, priority, status: 'pending' };
    scheduleData.push(taskObj);
    
    // Sort chronologically
    scheduleData.sort((a, b) => a.time.localeCompare(b.time));
    
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskTime').value = '';
    
    totalTasks++;
    updateUI();
    saveData();
    showToast(`Node Initialized: ${title}`);
}

function toggleComplete(id) {
    const taskIndex = scheduleData.findIndex(t => t.id === id);
    if(taskIndex === -1) return;

    if(scheduleData[taskIndex].status === 'pending') {
        scheduleData[taskIndex].status = 'completed';
        completedTasks++;
        showToast(`Node Completed: ${scheduleData[taskIndex].title}`, 'success');
    } else {
        scheduleData[taskIndex].status = 'pending';
        completedTasks--;
    }
    updateUI();
    saveData();
}

function updateUI() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';

    // Update Top Stats
    document.getElementById('statTotal').innerText = totalTasks;
    document.getElementById('statCompleted').innerText = completedTasks;
    document.getElementById('statPending').innerText = totalTasks - completedTasks;

    // Render Timeline with GSAP animation
    scheduleData.forEach((task, index) => {
        const item = document.createElement('div');
        const isDone = task.status === 'completed' ? 'text-decoration: line-through; opacity: 0.5;' : '';
        
        item.className = `timeline-item ${task.priority}`;
        item.innerHTML = `
            <div style="${isDone}" onclick="toggleComplete(${task.id})">
                <strong style="color: var(--accent); font-size: 1.1rem;">${task.time}</strong> - <span style="font-size: 1.1rem; font-weight: 500;">${task.title}</span>
                <span style="float:right; font-size: 0.8rem; text-transform: uppercase; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">${task.priority}</span>
            </div>
        `;
        container.appendChild(item);

        gsap.from(item, { opacity: 0, x: -50, duration: 0.5, delay: index * 0.1, ease: "power2.out" });
    });

    // Update Progress Wheel
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    // Animate the percentage text
    gsap.to(document.getElementById('completionRate'), {
        innerHTML: percentage + "%",
        duration: 1,
        snap: { innerHTML: 1 }
    });
    
   const progressCircle = document.querySelector('.circular-progress');
    progressCircle.style.background = `conic-gradient(var(--accent) ${percentage * 3.6}deg, rgba(0,0,0,0.5) 0deg)`;

    // Call the new Pro Timeline render
    renderProTimeline();
}

// --- NEW: View Switching Logic ---
document.querySelectorAll('#navMenu li').forEach(item => {
    item.addEventListener('click', function() {
        // Highlight active sidebar item
        document.querySelectorAll('#navMenu li').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // Change Page Title
        document.getElementById('pageTitle').innerText = this.innerText.split(' ')[1] + " Overview";

        const targetViewId = this.getAttribute('data-target');
        
        // Find all views
        const views = document.querySelectorAll('.view-section');
        
        // Crossfade animation
        views.forEach(view => {
            if (view.id === targetViewId) {
                view.style.display = 'block';
                gsap.to(view, {opacity: 1, duration: 0.5, ease: "power2.out"});
                
                // If switching to timeline, animate the cards in
                if(targetViewId === 'timelineView') {
                    gsap.fromTo(".pro-timeline-item", 
                        {y: 50, opacity: 0}, 
                        {y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.5)"}
                    );
                }
            } else {
                gsap.to(view, {opacity: 0, duration: 0.2, onComplete: () => {
                    view.style.display = 'none';
                }});
            }
        });
    });
});


// --- NEW: Function to render the Pro Max Timeline ---
function renderProTimeline() {
    const container = document.getElementById('proTimelineContainer');
    const centerLine = document.querySelector('.center-line'); // Grab the glowing line
    
    if (scheduleData.length === 0) {
        container.innerHTML = '<div class="empty-state" style="position: relative; z-index: 10;">No nodes initialized. Switch to Dashboard to create tasks.</div>';
        if (centerLine) centerLine.style.display = 'none'; // HIDE the line when empty
        return;
    }

    if (centerLine) centerLine.style.display = 'block'; // SHOW the line when tasks exist
    container.innerHTML = ''; // Clear container

    scheduleData.forEach((task, index) => {
        const item = document.createElement('div');
        
        // Alternate left and right side based on even/odd index
        const sideClass = index % 2 === 0 ? 'pro-timeline-left' : 'pro-timeline-right';
        const statusClass = task.status === 'completed' ? 'pro-completed' : '';
        const priorityColor = task.priority === 'p1' ? '#ff4757' : task.priority === 'p2' ? '#ffa502' : '#2ed573';
        
        item.className = `pro-timeline-item ${sideClass} pro-${task.priority} ${statusClass}`;
        
        item.innerHTML = `
            <div onclick="toggleComplete(${task.id})">
                <span class="pro-time">${task.time}</span>
                <span class="pro-title" style="${task.status === 'completed' ? 'text-decoration: line-through;' : ''}">${task.title}</span>
                <span class="pro-badge" style="background: ${priorityColor}33; color: ${priorityColor}; border: 1px solid ${priorityColor};">
                    Priority: ${task.priority.toUpperCase()}
                </span>
                <span class="pro-badge" style="float: right; background: ${task.status === 'completed' ? '#2ed57333' : 'rgba(255,255,255,0.1)'}; color: ${task.status === 'completed' ? '#2ed573' : 'white'};">
                    ${task.status === 'completed' ? 'VERIFIED ✓' : 'PENDING ⏳'}
                </span>
            </div>
        `;
        container.appendChild(item);
    });
}