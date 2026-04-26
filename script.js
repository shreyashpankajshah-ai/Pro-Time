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
        gsap.fromTo("#dashboard", {opacity: 0, scale: 0.95}, {opacity: 1, scale: 1, duration: 1, ease: "power3.out"});
    });
});

// --- Logic Data Structures ---
let scheduleData = [];
let totalTasks = 0;
let completedTasks = 0;

// --- Core Functions ---
function injectTask() {
    const title = document.getElementById('taskTitle').value;
    const time = document.getElementById('taskTime').value;
    const priority = document.getElementById('taskPriority').value;

    if(!title || !time) return alert("System Error: Incomplete Data Parameters.");

    const taskObj = { id: Date.now(), title, time, priority, status: 'pending' };
    scheduleData.push(taskObj);
    
    // Sort chronologically
    scheduleData.sort((a, b) => a.time.localeCompare(b.time));
    
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskTime').value = '';
    
    totalTasks++;
    updateUI();
}

function toggleComplete(id) {
    const taskIndex = scheduleData.findIndex(t => t.id === id);
    if(taskIndex === -1) return;

    if(scheduleData[taskIndex].status === 'pending') {
        scheduleData[taskIndex].status = 'completed';
        completedTasks++;
    } else {
        scheduleData[taskIndex].status = 'pending';
        completedTasks--;
    }
    updateUI();
}

function updateUI() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';

    // Render Timeline with GSAP animation
    scheduleData.forEach((task, index) => {
        const item = document.createElement('div');
        const isDone = task.status === 'completed' ? 'text-decoration: line-through; opacity: 0.5;' : '';
        
        item.className = `timeline-item ${task.priority}`;
        item.innerHTML = `
            <div style="${isDone}" onclick="toggleComplete(${task.id})">
                <strong>${task.time}</strong> - ${task.title} 
                <span style="float:right; font-size: 0.8rem; text-transform: uppercase;">${task.priority}</span>
            </div>
        `;
        container.appendChild(item);

        gsap.from(item, { opacity: 0, x: -50, duration: 0.5, delay: index * 0.1, ease: "power2.out" });
    });

    // Update Progress Wheel
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    document.getElementById('completionRate').innerText = `${percentage}%`;
    
    const progressCircle = document.querySelector('.circular-progress');
    progressCircle.style.background = `conic-gradient(var(--accent) ${percentage * 3.6}deg, var(--bg-dark) 0deg)`;
}