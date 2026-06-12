/**
 * Common utility functions for the CSE Reviewer App.
 */

// Helper to check if the current page is in the root directory
function isRootDirectory() {
    return !window.location.pathname.includes('/pages/');
}

// Helper to fetch JSON files
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error(`Error fetching JSON from ${url}:`, e);
        return null;
    }
}

// Function to render the consistent navbar
function renderNavbar() {
    const isRoot = isRootDirectory();
    const basePath = isRoot ? '' : '../';
    const pagesPath = isRoot ? 'pages/' : '';
    
    // Get active page name from path
    const path = window.location.pathname;
    let activePage = 'home';
    if (path.includes('practice.html')) activePage = 'practice';
    else if (path.includes('exam.html')) activePage = 'exam';
    else if (path.includes('vocabulary.html') || path.includes('vocab-quiz.html')) activePage = 'vocabulary';
    else if (path.includes('dashboard.html')) activePage = 'dashboard';

    // Get daily streak from localStorage
    const streak = load('cse_streak', 1);
    
    const navbarHTML = `
    <nav class="bg-white border-b border-slate-200 sticky top-0 z-50 select-none">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <!-- Logo / Brand -->
                    <a href="${basePath}index.html" class="flex items-center space-x-2 sm:space-x-3 text-blue-600 font-extrabold text-xl sm:text-2xl tracking-tight">
                        <img src="${basePath}img/logo.png" alt="CSE Reviewer Logo" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-sm object-cover border border-slate-100">
                        <span class="hover:text-blue-700 transition-colors">CSE Reviewer</span>
                    </a>
                    
                    <!-- Navigation Links -->
                    <div class="hidden md:flex space-x-8 ml-10 h-full">
                        <a href="${basePath}index.html" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors h-full ${activePage === 'home' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}" data-page="home">Home</a>
                        <a href="${pagesPath}practice.html" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors h-full ${activePage === 'practice' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}" data-page="practice">Practice Quiz</a>
                        <a href="${pagesPath}exam.html" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors h-full ${activePage === 'exam' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}" data-page="exam">Exam Simulation</a>
                        <a href="${pagesPath}vocabulary.html" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors h-full ${activePage === 'vocabulary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}" data-page="vocabulary">Vocabulary Digest</a>
                        <a href="${pagesPath}dashboard.html" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors h-full ${activePage === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}" data-page="dashboard">Results</a>
                    </div>
                </div>
                
                <!-- Streak & Profile -->
                <div class="flex items-center space-x-2 sm:space-x-4">
                    <div class="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold border border-amber-200 shadow-sm transition-transform hover:scale-105" title="Study streak">
                        <!-- Flame outline SVG icon -->
                        <svg class="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
                        </svg>
                        <span class="hidden sm:inline">${streak} Day Streak</span>
                        <span class="sm:hidden">${streak}d</span>
                    </div>
                    
                    <div class="hidden sm:flex w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 items-center justify-center text-xs font-bold shadow-sm" title="User Profile">
                        RD
                    </div>
                    
                    <!-- Mobile Menu Trigger -->
                    <button id="mobile-menu-toggle" class="md:hidden p-1.5 text-slate-600 hover:text-slate-800 focus:outline-none cursor-pointer">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Dropdown Menu -->
        <div id="mobile-menu" class="hidden md:hidden border-b border-slate-200 bg-slate-50 px-4 pt-2 pb-4 space-y-1">
            <a href="${basePath}index.html" class="block px-3 py-2 rounded-md text-base font-medium ${activePage === 'home' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}" data-page="home">Home</a>
            <a href="${pagesPath}practice.html" class="block px-3 py-2 rounded-md text-base font-medium ${activePage === 'practice' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}" data-page="practice">Practice Quiz</a>
            <a href="${pagesPath}exam.html" class="block px-3 py-2 rounded-md text-base font-medium ${activePage === 'exam' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}" data-page="exam">Exam Simulation</a>
            <a href="${pagesPath}vocabulary.html" class="block px-3 py-2 rounded-md text-base font-medium ${activePage === 'vocabulary' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}" data-page="vocabulary">Vocabulary Digest</a>
            <a href="${pagesPath}dashboard.html" class="block px-3 py-2 rounded-md text-base font-medium ${activePage === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}" data-page="dashboard">Results</a>
        </div>
    </nav>
    `;
    
    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        placeholder.className = "sticky top-0 z-50";
        placeholder.innerHTML = navbarHTML;
        
        const toggle = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-menu');
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });
        }
    }
}

// Function to render the consistent footer
function renderFooter() {
    const footerHTML = `
    <footer class="bg-white border-t border-slate-200 mt-auto py-8 select-none">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:flex md:justify-between md:items-center">
            <p class="text-sm text-slate-500">&copy; 2026 CSE Reviewer.</p>
            <div class="flex justify-center space-x-6 mt-4 md:mt-0">
                <span class="text-xs text-slate-400">Light Mode Active</span>
                <span class="text-xs text-slate-400">Offline Study Ready</span>
            </div>
        </div>
    </footer>
    `;
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        placeholder.innerHTML = footerHTML;
    }
}

// Custom Toast Notification with SVG iconography instead of Emojis
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 transform translate-y-10 opacity-0 select-none`;
    
    let svgIcon = '';
    
    if (type === 'success') {
        toast.className += ' bg-emerald-50 text-emerald-800 border-emerald-250';
        svgIcon = `<svg class="w-4 h-4 text-emerald-600 flex-shrink-0 fill-none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>`;
    } else if (type === 'error') {
        toast.className += ' bg-rose-50 text-rose-800 border-rose-250';
        svgIcon = `<svg class="w-4 h-4 text-rose-600 flex-shrink-0 fill-none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    } else {
        toast.className += ' bg-blue-50 text-blue-800 border-blue-250';
        svgIcon = `<svg class="w-4 h-4 text-blue-600 flex-shrink-0 fill-none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.084-1.008l-.382 1.16a.75.75 0 001.077.942l.04-.02m-.03 2.502h.008v.008H12v-.008zM12 3a9 9 0 100 18 9 9 0 000-18z"></path></svg>`;
    }
    
    toast.innerHTML = `${svgIcon}<span>${message}</span>`;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Run layout builders immediately when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderFooter();
});
