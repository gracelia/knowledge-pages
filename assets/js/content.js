const treeRoot = document.getElementById('tree-root');
const contentBody = document.getElementById('content-body');

// Build sidebar tree
function renderTree(nodes, container) {
  nodes.forEach(node => {
    if (node.type === 'folder') {
      const wrapper = document.createElement('div');
      wrapper.className = 'tree-folder';

      const label = document.createElement('div');
      label.className = 'folder-label';
      label.innerHTML = `<span class="arrow">+</span> ${node.name}`;
      label.addEventListener('click', () => {
        const isOpen = label.classList.toggle('open');
        children.classList.toggle('open');
        label.querySelector('.arrow').textContent = isOpen ? '−' : '+';
      });

      const children = document.createElement('div');
      children.className = 'folder-children';
      renderTree(node.children || [], children);

      wrapper.appendChild(label);
      wrapper.appendChild(children);
      container.appendChild(wrapper);
    } else {
      const link = document.createElement('a');
      link.className = 'tree-file';
      link.textContent = node.name;
      link.dataset.path = node.path;
      link.addEventListener('click', () => loadFile(node.path, link));
      container.appendChild(link);
    }
  });
}

renderTree(treeData, treeRoot);

// Load file from URL param on page load
const params = new URLSearchParams(window.location.search);
const initialFile = params.get('file');
if (initialFile) {
  const decoded = decodeURIComponent(initialFile);
  // Find and activate the matching link
  const allLinks = treeRoot.querySelectorAll('.tree-file');
  allLinks.forEach(link => {
    if (decoded.endsWith(link.dataset.path)) {
      // Open parent folders
      let parent = link.parentElement;
      while (parent && parent !== treeRoot) {
        if (parent.classList.contains('folder-children')) {
          parent.classList.add('open');
          parent.previousElementSibling?.classList.add('open');
        }
        parent = parent.parentElement;
      }
      loadFile(link.dataset.path, link);
    }
  });
}

function loadFile(path, linkEl) {
  // Update active state
  treeRoot.querySelectorAll('.tree-file').forEach(l => l.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');

  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('file', path);
  window.history.pushState({}, '', url);

  // Fetch and render markdown
  const mdUrl = baseurl + '/contents/' + path + '.md';
  fetch(mdUrl)
    .then(r => {
      if (!r.ok) throw new Error('Not found');
      return r.text();
    })
    .then(md => {
      // Strip Jekyll front matter
      const stripped = md.replace(/^---[\s\S]*?---\n/, '');
      contentBody.innerHTML = `<div class="content-body">${marked.parse(stripped)}</div>`;
      contentBody.scrollTop = 0;
    })
    .catch(() => {
      contentBody.innerHTML = '<div class="empty-state"><div class="big-icon">⚠️</div><p>内容加载失败</p></div>';
    });
}
