function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById(tabId+'-btn').classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    const url = new URL(window.location);
    url.searchParams.set('page', tabId);
    window.history.pushState({}, '', url);
}

if (window.location) {
    const url = new URL(window.location);
    const tab = url.searchParams.get('page');
    if (tab) {
        showTab(tab);
    } else {
        showTab('fundamentals');
    }
}

const scaleLi = document.querySelectorAll('.scale-li');
scaleLi.forEach(li => {
	li.addEventListener('click', async () => {
		const text = li.innerHTML.trim();
		const scaleAttr = li.getAttribute('data-scale');

		if (scaleAttr === "chromatic") {
			const baseFreq = 261.63; // C4
			for (let i = 0; i < 24; i++) {
				const freq = baseFreq * Math.pow(2, i / 24);
				AudioManager.playNoteWithDuration(freq, 0.2);
				await new Promise(resolve => setTimeout(resolve, 250));
			}
		} else {
		}
	});
});