import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/plugins/autoloader/prism-autoloader.min';

// Configure marked options for markdown parsing
marked.setOptions({
  breaks: true,
  gfm: true,
  pedantic: false,
  headerIds: true,
  mangle: false,
  highlight: function (code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
});

// Initialize custom renderer for markdown
const renderer = new marked.Renderer();

// Custom renderer for headings - adds collapse functionality
renderer.heading = function (text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `
    </div></div></div>
    <div class="heading-section" data-level="${level}">
      <h${level} id="${escapedText}" class="collapse-trigger">
        <i class="fas fa-chevron-down collapse-arrow"></i>
        <span>${text}</span>
      </h${level}>
      <div class="collapse-content">
        <div class="section-content">
  `;
};

// Custom renderer for lists
renderer.list = function (body, ordered) {
  const type = ordered ? 'ol' : 'ul';
  return `<${type}>${body}</${type}>`;
};

// Custom renderer for list items
renderer.listitem = function (text) {
  return `<li>${text}</li>`;
};

// Set the custom renderer
marked.setOptions({ renderer });

// Function to process markdown with independent sections
export function processMarkdown(markdown) {
  // Add a wrapper to handle the first section
  let html = `
    <div class="heading-section" data-level="0">
      <div class="collapse-content">
        <div class="section-content">
  `;

  // Parse markdown
  html += marked(markdown);

  // Close the wrapper
  html += '</div></div></div>';

  // Clean up any adjacent closing/opening tags
  html = html.replace(/(<\/div><\/div><\/div>)\s*(<div class="heading-section")/g, '$1\n$2');

  // Create temporary element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Clean up empty sections
  tempDiv.querySelectorAll('.heading-section').forEach((section) => {
    const content = section.querySelector('.section-content');
    if (content && !content.textContent.trim()) {
      section.remove();
    }
  });

  return tempDiv.innerHTML;
}

// Initialize collapse functionality
export function initializeCollapse() {
  document.querySelectorAll('.collapse-trigger').forEach((trigger) => {
    if (!trigger.hasListener) {
      trigger.hasListener = true;
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();

        const headingSection = this.closest('.heading-section');
        const content = headingSection.querySelector('.collapse-content');

        if (content) {
          const isCollapsed = content.classList.contains('collapsed');

          if (isCollapsed) {
            expandSection(content);
            this.classList.remove('collapsed');
          } else {
            collapseSection(content);
            this.classList.add('collapsed');
          }
        }
      });
    }
  });
}

// Helper function to collapse a section
function collapseSection(content) {
  content.style.height = content.scrollHeight + 'px';
  content.offsetHeight; // Force reflow
  content.classList.add('collapsed');
  content.style.height = '0';
}

// Helper function to expand a section
function expandSection(content) {
  content.classList.remove('collapsed');
  const sectionHeight = content.scrollHeight;
  content.style.height = sectionHeight + 'px';

  setTimeout(() => {
    if (!content.classList.contains('collapsed')) {
      content.style.height = 'auto';
    }
  }, 300);
}

// Update preview
export function updatePreview(markdown) {
  try {
    const htmlContent = processMarkdown(markdown);
    const preview = document.getElementById('preview');
    preview.innerHTML = htmlContent;

    initializeCollapse();

    // Highlight code blocks
    document.querySelectorAll('#preview pre code').forEach((block) => {
      Prism.highlightElement(block);
    });
  } catch (error) {
    console.error('Error updating preview:', error);
  }
}

