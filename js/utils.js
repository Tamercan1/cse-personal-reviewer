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
    else if (path.includes('vocabulary.html')) activePage = 'vocabulary';
    else if (path.includes('dashboard.html')) activePage = 'dashboard';

    // Get daily streak from localStorage
    const streak = load('cse_streak', 1);
    
    const navbarHTML = `
    <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <!-- Logo / Brand -->
                    <a href="${basePath}index.html" class="flex items-center space-x-2 text-blue-600 font-bold text-xl tracking-tight">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
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
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-200 shadow-sm transition-transform hover:scale-105" title="Study streak">
                        <span>🔥</span>
                        <span>${streak} Day Streak</span>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-bold shadow-sm" title="User Profile">
                        RD
                    </div>
                    <!-- Mobile Menu Trigger -->
                    <button id="mobile-menu-toggle" class="md:hidden p-2 text-slate-600 hover:text-slate-800 focus:outline-none">
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
        placeholder.innerHTML = navbarHTML;
        
        // Add mobile menu toggle logic
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
    <footer class="bg-white border-t border-slate-200 mt-auto py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:flex md:justify-between md:items-center">
            <p class="text-sm text-slate-500">&copy; 2026 CSE Reviewer.</p>
            <div class="flex justify-center space-x-6 mt-4 md:mt-0">
                <span class="text-xs text-slate-400">Light Mode Active</span>
            </div>
        </div>
    </footer>
    `;
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        placeholder.innerHTML = footerHTML;
    }
}

// Simple Custom Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-10 opacity-0`;
    
    if (type === 'success') {
        toast.className += ' bg-emerald-50 text-emerald-800 border-emerald-200';
        toast.innerHTML = `<span>✅</span><span>${message}</span>`;
    } else if (type === 'error') {
        toast.className += ' bg-rose-50 text-rose-800 border-rose-200';
        toast.innerHTML = `<span>❌</span><span>${message}</span>`;
    } else {
        toast.className += ' bg-blue-50 text-blue-800 border-blue-200';
        toast.innerHTML = `<span>ℹ️</span><span>${message}</span>`;
    }
    
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
